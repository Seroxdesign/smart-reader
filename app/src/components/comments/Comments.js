import { Heading, List, Stack, Flex, Avatar, Input, Button, Box, useToast } from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import React, { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Comment } from './Comment';
import { formatDistanceToNow } from 'date-fns';
import jwtDecode from 'jwt-decode';
import useLogin from '../../hooks/useLogin';
import { ConnectButton } from '../ConnectButton';
import { lowercaseAddress } from '../../utils/helpers';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const Comments = ({ chainId, contractAddress }) => {
  const [comment, setComment] = useState(''); // Initial state
  const [comments, setComments] = useState([]); // Initial state
  const {
    address: userAddress,
    isConnected,
    isDisconnected,
  } = useAccount();
  const [addr, setAddressFromButton] = useState('');
  const { isLoggedIn, supabase, setIsLoggedIn, checkLoggedIn } = useLogin();
  const toast = useToast();
  // function to make username from wallet address after removing the 0x
  function makeUsername(address) {
    let username = address.slice(2);
    username = lowercaseAddress(username);
    return username;
  }

  const username = userAddress && makeUsername(userAddress);

  const getComments = useCallback(async () => {
    //   async function getComments() {
    if (!contractAddress || !chainId || contractAddress.length === 0) return;
    let { data: commentData, error } = await supabase
      .from('comments') // replace with your table name
      .select('*')
      .eq('contract_id', chainId + '-' + contractAddress)
      .is('parent', null);
    if (error) console.log('Error: ', error);
    if (!commentData) return;
    // Map the data into the desired format
    const commentsNew = [];
    for (const comment of commentData) {
      const timeAgo = formatDistanceToNow(new Date(comment.timestamp), {
        addSuffix: true,
      });
      // const upvotes = await getUpvotes(comment.comment_id);
      commentsNew.push({
        id: comment.comment_id,
        name: comment.user_address,
        address: contractAddress,
        // upvotes: upvotes,
        isParent: true,
        message: comment.comment,
        ref: comment.ref,
        timeAgo: timeAgo,
        isLoggedIn: isLoggedIn,
      });
    }
    setComments(commentsNew);
  }, [contractAddress, chainId]);

  useEffect(() => {
    getComments();
    checkLoggedIn();
  }, [chainId, contractAddress]);

 const addComment = useCallback(async () => {
    const token = Cookies.get('supabasetoken');
    if (!comment || comment.length === 0) {
      return;
    }

    setComment('')

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const options = {
      headers,
    };
    const newSupabase = await createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      options
    );
    newSupabase.headers['Authorization'] = `Bearer ${token}`; // for some reason this is what worked, needs cleaning
    const decodedToken = jwtDecode(token);

    // Check if it's expired
    const currentTime = Date.now() / 1000; // in seconds
    if (decodedToken.exp < currentTime) {
      setIsLoggedIn(false);
      return;
    }
    const commentToUpload = {
      contract_id: chainId + '-' + contractAddress,
      user_address: decodedToken.address,
      comment: comment,
    };
    const { data: insertedData, error: insertError } = await newSupabase
      .from('comments')
      .insert([commentToUpload]);
    if (insertError && !insertedData) {
      return;
    }
    toast({
      title: 'Comment added',
      description: 'Your comment has been added.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
  
    getComments();
  }, [comment])


  return (
    <>
      {isDisconnected && (
        <Box p="xl" bg="blackAlpha.300" w="full" textAlign="left" borderRadius="lg">
          <p>In order to leave a comment, you need to <ConnectButton address={userAddress} setAddress={setAddressFromButton} cta="connect wallet" isSimple /> first.</p>
        </Box>
      )}
      <Stack gap={4}>
        <Heading as="h1" size="md" fontWeight={600} noOfLines={1}>
          COMMENTS ({comments.length})
        </Heading>
        {isConnected && (
          <Flex
            alignItems="center"
            background="#FFFFFF1A"
            borderRadius="lg"
            w="full"
            py={4}
            px={6}
            gap={4}
          >
            <Avatar name={username} />
            <Input
              value={comment} // Bind the value of the input field to the comment state
              onChange={(e) => setComment(e.target.value)}
              variant="filled"
              placeholder="Add a comment"
              background="#00000026"
              _hover={{ background: '#00000026' }}
              _placeholder={{ color: '#ADADAD' }}
              borderRadius="lg"
              isDisabled={!isConnected}
            />
            <Button
              borderRadius="full"
              background="white"
              color="#101D42"
              fontWeight={400}
              onClick={addComment}
              isDisabled={!isConnected}
            >
              Send
            </Button>
          </Flex>
        )}
        <List spacing={4}>
          {comments.map((com, i) => (
            <Comment key={`id-comments-${i}-${chainId}-${contractAddress}`} comment={com} />
          ))}
        </List>
      </Stack>
    </>
  );
};
