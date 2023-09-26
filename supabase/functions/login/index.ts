import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "https://esm.sh/ethers@6.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../../lib/database.types.ts";
import {
    Header,
    Payload,
    create,
    getNumericDate,
} from "https://deno.land/x/djwt@v2.9.1/mod.ts";

const SUPABASE_TABLE_USERS = "users";

function createErrorResponse(
    errorMessage: string,
    headers: Headers,
    statusCode = 400
) {
    console.log(errorMessage);
    headers.append("Content-Type", "application/json");
    return new Response(
        JSON.stringify({
            error: errorMessage,
        }),
        {
            headers: headers,
            status: statusCode,
        }
    );
}

serve(async (req) => {
    const { method, headers: reqHeaders } = req;
    const origin = reqHeaders.get("Origin") || "";

    // List of trusted origins
    const allowedOrigins = [
        "https://localhost:3000", // TODO delete this once deployed
        "https://smart-reader-kappa.vercel.app", //
    ];

    const headers = new Headers();
    if (allowedOrigins.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
    }
    headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Allow-Credentials", "true");

    if (method === "OPTIONS") {
        // Respond to CORS preflight requests
        return new Response(null, { headers });
    }
    const { address, signed, nonce } = await req.json();

    //1. verify the signed message matches the requested address
    const message = `I am signing this message to authenticate my address with my account on Smart Reader.`;

    const signerAddress = ethers.verifyMessage(message, signed);

    // now you can compare the signer's address to the expected address
    if (signerAddress === address) {
        console.log("The message was signed by the expected address.");
    } else {
        return createErrorResponse(
            "The message was NOT signed by the expected address.",
            headers
        );
    }
    //2. select * from public.user table where address matches
    const supabase = createClient<Database>(
        Deno.env.get("SUPABASE_URL") as string,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string // service role key required for row creation/editing
    );
    const { data } = await supabase
        .from(SUPABASE_TABLE_USERS)
        .select()
        .eq("address", address)
        .single();

    if (data == null) {
        return createErrorResponse("The public user does not exist.", headers);
    }
    //3. verify the nonce included in the request matches what's already in public.users table for that address
    if (data?.auth.genNonce !== nonce) {
        return createErrorResponse(
            `The nonce does not match. ${nonce} ${data?.auth.genNonce} ${
                data?.auth.genNonce === nonce
            }`,
            headers
        );
    }
    // 4. if there's no public.users.id for that address, then you need to create a user in the auth.users table
    let authUser;
    if (!data?.id) {
        const { data: userData, error } = await supabase.auth.admin.createUser({
            email: `${address}@email.com`, // we have to have this.. or a phone
            user_metadata: { address: address },
        });
        if (error) {
            console.log("error creating user", error.status, error.message);
            return createErrorResponse(error.message, headers);
        }
        authUser = userData.user;
    } else {
        const { data: userData, error } = await supabase.auth.admin.getUserById(
            data.id
        );

        if (error) {
            return createErrorResponse(error.message, headers);
        }
        authUser = userData.user;
    }

    // 5. insert response into public.users table with id
    let newNonce = Math.floor(Math.random() * 1000000);
    while (newNonce === nonce) {
        newNonce = Math.floor(Math.random() * 1000000);
    }

    await supabase
        .from(SUPABASE_TABLE_USERS)
        .update({
            auth: {
                genNonce: newNonce, // update the nonce, so it can't be reused
                lastAuth: new Date().toISOString(),
                lastAuthStatus: "success",
            },
            id: authUser?.id, // same uuid as auth.users table
        })
        .eq("address", address); // primary key

    // 6. lastly, we sign the token, then return it to clienta
    const jwtSecret = Deno.env.get("JWT_SECRET");

    if (!jwtSecret) {
        throw new Error("Please set the JWT_SECRET environment variable.");
    }

    const encoder = new TextEncoder();
    const jwtSecretUint8Array = encoder.encode(jwtSecret);

    // Generate the crypto key
    console.log("creating key");
    const key = await crypto.subtle.importKey(
        "raw", // raw format; the secret is a string
        jwtSecretUint8Array, //  JWT secret
        { name: "HMAC", hash: "SHA-512" }, // algorithm details
        false, // whether the key is extractable
        ["sign", "verify"] // key usages
    );
    const payload: Payload = {
        // iss: "joe",
        address: address,
        sub: authUser?.id,
        exp: getNumericDate(3600),
    };
    const header: Header = {
        alg: "HS512",
        typ: "JWT",
    };
    console.log("creating token");
    const token = await create(header, payload, key);

    return new Response(JSON.stringify({ token: token }), {
        headers: headers,
    });
});
