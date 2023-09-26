import { ListItem } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { useSupabase } from '../../utils/supabaseContext';
import { AddComment } from './AddComment';
import CommentItem from './CommentItem';

export const Comment = ({ comment }) => {
  const [showReply, setShowReply] = useState(false);
  const [replies, setReplies] = useState([]);
  const { supabase } = useSupabase();
  const { chain } = useNetwork();

  useEffect(() => {
    getReplies();
  }, []);

  const getReplies = useCallback(async () => {
    //   async function getComments() {
    if (!comment?.address || !chain?.id || comment?.address.length === 0)
      return;
    let { data: replyData, error } = await supabase
      .from('comments') // replace with your table name
      .select('*')
      .eq('parent', comment?.id);
    if (!replyData) return;
    // Map the data into the desired format
    const repliesNew = [];
    for (const comment of replyData) {
      const timeAgo = formatDistanceToNow(new Date(comment.timestamp), {
        addSuffix: true,
      });
      // const upvotes = await getUpvotes(comment.comment_id);
      repliesNew.push({
        id: comment.comment_id,
        name: comment?.user_address,
        address: comment?.address,
        // upvotes: upvotes,
        isParent: false,
        message: comment.comment,
        ref: comment.ref,
        timeAgo: timeAgo,
        isLoggedIn: comment?.isLoggedIn,
      });
    }
    setReplies(repliesNew);
  }, [comment?.address, comment?.id, chain?.id]);

  return (
    <>
      <CommentItem
        comment={comment}
        showReply={showReply}
        setShowReply={setShowReply}
        type={'comment'}
      />
      {replies.map((reply, i) => (
        <CommentItem key={`reply-${i}-${comment?.id}`} comment={reply} type={'reply'}/>
      ))}
      {showReply && (
        <ListItem>
          <AddComment
            commentId={comment?.id}
            contractId={comment?.address}
            setShowReply={setShowReply}
            getReplies={getReplies}
          />
        </ListItem>
      )}
    </>
  );
};
