import React from "react";

export default function Reply({ replies }) {
  if (!replies || replies.length === 0) {
    return <div className="review_reply">No replies yet</div>;
  }

  return (
    <div className="review_reply">
      {replies.map((reply) => (
        <div key={reply._id} className="reply-item">
          <h4>{reply.User?.User_Name}</h4>
          <p>{new Date(reply.createdAt).toLocaleDateString()}</p>
          <p>{reply.comment}</p>
        </div>
      ))}
    </div>
  );
}
