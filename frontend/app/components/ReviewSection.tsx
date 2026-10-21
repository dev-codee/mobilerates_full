"use client";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from "react";
import { Review, getReviews, postReview } from "@/app/lib/api";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import AppIcon from "./AppIcon";

export default function ReviewSection({ phoneId }: { phoneId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews(1);
  }, [phoneId]);

  const fetchReviews = async (pageToFetch: number) => {
    if (pageToFetch === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await getReviews(phoneId, pageToFetch, 6);
      if (pageToFetch === 1) {
        setReviews(data.reviews);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating === 0) {
      notify("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      notify("Please write a comment.");
      return;
    }

    setSubmitting(true);
    try {
      const newRev = await postReview({
        phoneId,
        rating,
        comment: comment.trim(),
      });
      setReviews([newRev, ...reviews]);
      setComment("");
      setRating(0);
      notify("Review submitted successfully!");
    } catch (err: any) {
      console.error(err);
      notify(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm mt-[15px]">
      <div className="p-6 border-b border-border-subtle bg-surface-container-low/30">
        <h2 className="font-headline-md text-xl font-bold text-text-main flex items-center gap-2">
          <AppIcon name="star" size={20} fill="#FF9800" className="text-yellow-500" />
          User Reviews
        </h2>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Write a Review Form */}
        <div className="md:col-span-1 bg-surface-container-lowest p-5 rounded-lg border border-border-subtle h-fit">
          <h3 className="font-bold text-lg text-text-main mb-4">Write a Review</h3>
          {user ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1">Your Name</label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full p-2 border border-border-subtle rounded-md bg-surface-container-low text-text-muted cursor-not-allowed"
                />
              </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <button
                      type="button"
                      key={star}
                      className="text-yellow-500 hover:scale-110 transition-transform cursor-pointer"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <AppIcon
                        name="star"
                        size={22}
                        fill={isFilled ? "#FF9800" : "none"}
                        className="text-yellow-500"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike about this phone?"
                rows={4}
                className="w-full p-2 border border-border-subtle rounded-md bg-surface-white focus:outline-none focus:border-primary text-sm resize-none"
              ></textarea>
            </div>

              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="bg-primary hover:bg-on-primary-fixed-variant text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-surface-container-low/50 rounded-lg border border-border-subtle/50 text-center">
              <AppIcon name="lock" size={36} className="text-text-muted mb-2" />
              <p className="text-text-main font-medium mb-4">You must be logged in to write a review.</p>
              <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-md font-semibold hover:bg-on-primary-fixed-variant transition-colors">
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <AppIcon name="progress_activity" size={32} className="animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-10">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-text-muted flex flex-col items-center">
              <AppIcon name="rate_review" size={36} className="mb-2 opacity-60" />
              <p>No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reviews.map((review) => (
                  <div key={review._id} className="border border-border-subtle rounded-lg p-3 bg-surface-container-lowest">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 text-primary font-bold flex items-center justify-center rounded-full uppercase text-sm">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-text-main text-sm leading-tight">{review.userName}</h4>
                          <span className="text-[11px] text-text-muted">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <AppIcon
                            key={star}
                            name="star"
                            size={14}
                            fill={star <= review.rating ? "#FF9800" : "none"}
                            className="text-yellow-500"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-text-main text-xs mt-1.5 line-clamp-3">{review.comment}</p>
                  </div>
                ))}
              </div>
              
              {page < totalPages && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => fetchReviews(page + 1)}
                    disabled={loadingMore}
                    className="px-6 py-2 border border-border-subtle rounded-full text-text-main hover:bg-surface-container-low transition-colors disabled:opacity-50 flex items-center gap-2 font-medium text-sm cursor-pointer"
                  >
                    {loadingMore && <AppIcon name="progress_activity" size={16} className="animate-spin" />}
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
