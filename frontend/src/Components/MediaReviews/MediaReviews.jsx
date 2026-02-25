import React, { useEffect } from "react";
import { useMediaReviews } from "../../Context/MediaReviewsContext";
import { useSelector } from "react-redux";

export default function MediaReviews({ mediaID }) {
  const { reviews, loading, error, fetchReviews } = useMediaReviews();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (mediaID) {
      fetchReviews(mediaID);
    }
  }, [mediaID]);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>Error loading reviews</p>;

  return (
    <div className="Review-container">
      <div className="writing-reviews">Logged in as: {user?.User_Name}</div>

      {reviews.map((review) => (
        <div key={review._id} className="review-card">
          <h4>{review.User?.User_Name}</h4>
          <p>{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
