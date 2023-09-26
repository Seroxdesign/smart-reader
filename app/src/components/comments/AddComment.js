import { Avatar, Button, Flex, Input } from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import { useState } from 'react';
import { useNetwork } from 'wagmi';
import useLogin from '../../hooks/useLogin';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const AddComment = ({
  commentId,
  contractId,
  setShowReply,
  getReplies,
}) => {
  const { chain } = useNetwork();
  const { setIsLoggedIn } = useLogin();
  const [comment, setComment] = useState(''); // Initial state

  async function addComment() {
    const token = Cookies.get('supabasetoken');
    if (!comment || comment.length === 0) {
      return;
    }

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
      parent: commentId,
      contract_id: chain?.id + '-' + contractId,
      user_address: decodedToken.address,
      comment: comment,
    };
    const { data: insertedData, error: insertError } = await newSupabase
      .from('comments')
      .insert([commentToUpload]);
    if (insertError && !insertedData) {
      return;
    }
    setShowReply(false);
    getReplies();
  }

  return (
    <Flex
      alignItems="center"
      background="#FFFFFF1A"
      borderRadius="lg"
      w="full"
      py={4}
      px={6}
      gap={4}
    >
      <Avatar name="Dan Abramov" />
      <Input
        value={comment} // Bind the value of the input field to the comment state
        onChange={(e) => setComment(e.target.value)}
        variant="filled"
        placeholder="Add a comment"
        background="#00000026"
        _hover={{ background: '#00000026' }}
        _placeholder={{ color: '#ADADAD' }}
        borderRadius="lg"
      />
      <Button
        borderRadius="full"
        background="white"
        color="#101D42"
        fontWeight={400}
        onClick={addComment}
      >
        Send
      </Button>
    </Flex>
  );
};
