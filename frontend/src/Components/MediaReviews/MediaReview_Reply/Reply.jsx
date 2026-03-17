import React, { useState } from "react";
import "./Reply.css";
import { CircleUser, ThumbsUp, MessageCircle, Ellipsis } from "lucide-react";

export default function Reply({ replies }) {
  const [newReply, setNewReply] = useState("");

  const handlePostReply = () => {
    if (!newReply.trim()) return;
    console.log("Reply:", newReply);
    setNewReply("");
  };

  return (
    <div className="reply-section">
      <div className="reply-container">
        <div className="left-review">
          <div className="review-reply-header">
            <CircleUser size={40} />
            <div>
              <h3>{replies.User?.User_Name}</h3>
              <p>{new Date(replies.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="review-text">{replies.comment}</div>
        </div>

        <div className="right-replies">
          <div className="replies-list">
            {replies.replies?.map((reply) => (
              <div key={reply._id} className="reply-card">
                <CircleUser size={30} />

                <div className="reply-body">
                  <div className="reply-top">
                    <h4>{reply.User?.User_Name}</h4>
                    <span>
                      {new Date(reply.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <p>{reply.comment}</p>

                  <div className="reply-actions">
                    <button>
                      <ThumbsUp size={16} /> {reply.likes || 0}
                    </button>
                    <button>Reply</button>
                    <Ellipsis size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="reply-input">
            <CircleUser size={35} />

            <input
              type="text"
              placeholder="Add a comment..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
            />

            <button onClick={handlePostReply}>Post</button>
          </div>
        </div>
      </div>
    </div>
  );
}
