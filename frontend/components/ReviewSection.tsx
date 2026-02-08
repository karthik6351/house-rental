'use client';

import { useState, useEffect } from 'react';
import { reviewAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

interface Review {
    _id: string;
    tenant: {
        _id: string;
        name: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

interface ReviewSectionProps {
    propertyId: string;
    averageRating: number;
    totalReviews: number;
}

export default function ReviewSection({ propertyId, averageRating, totalReviews }: ReviewSectionProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [myReview, setMyReview] = useState<Review | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [formData, setFormData] = useState({ rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
        if (user?.role === 'tenant') {
            fetchMyReview();
        }
    }, [propertyId]);

    const fetchReviews = async () => {
        try {
            const response = await reviewAPI.getPropertyReviews(propertyId, { page: 1, limit: 10 });
            setReviews(response.data.reviews);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMyReview = async () => {
        try {
            const response = await reviewAPI.getMyReview(propertyId);
            setMyReview(response.data.review);
            setFormData({
                rating: response.data.review.rating,
                comment: response.data.review.comment
            });
        } catch (error) {
            // No review yet, that's ok
            setMyReview(null);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (myReview) {
                // Update existing review
                await reviewAPI.update(myReview._id, formData);
                toast.success('Review updated successfully!');
            } else {
                // Create new review
                await reviewAPI.create({ propertyId, ...formData });
                toast.success('Review submitted successfully!');
            }

            setShowReviewForm(false);
            fetchReviews();
            fetchMyReview();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!myReview || !confirm('Are you sure you want to delete your review?')) return;

        try {
            await reviewAPI.delete(myReview._id);
            toast.success('Review deleted successfully');
            setMyReview(null);
            setFormData({ rating: 5, comment: '' });
            fetchReviews();
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Reviews {totalReviews > 0 && `(${totalReviews})`}
            </h2>

            {/* Average Rating Summary */}
            {totalReviews > 0 ? (
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-lg mb-6">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-5xl font-bold text-gray-900 dark:text-white">{averageRating.toFixed(1)}</p>
                            <StarRating rating={averageRating} readonly size="md" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                </div>
            )}

            {/* Write Review Button (Tenants Only) */}
            {user?.role === 'tenant' && (
                <div className="mb-6">
                    {myReview ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
                                        You've already reviewed this property
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                        You can edit or delete your review below
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                        className="btn-outline text-sm py-2"
                                    >
                                        {showReviewForm ? 'Cancel' : 'Edit Review'}
                                    </button>
                                    <button
                                        onClick={handleDeleteReview}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="btn-primary"
                        >
                            {showReviewForm ? 'Cancel' : 'Write a Review'}
                        </button>
                    )}
                </div>
            )}

            {/* Review Form */}
            {showReviewForm && user?.role === 'tenant' && (
                <form onSubmit={handleSubmitReview} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {myReview ? 'Edit Your Review' : 'Write Your Review'}
                    </h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rating
                        </label>
                        <StarRating
                            rating={formData.rating}
                            onRatingChange={(rating) => setFormData({ ...formData, rating })}
                            size="lg"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            required
                            minLength={10}
                            maxLength={500}
                            rows={4}
                            className="input-field resize-none"
                            placeholder="Share your experience with this property..."
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/500 characters</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                    </button>
                </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No reviews yet
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review._id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {review.tenant.name}
                                    </p>
                                    <StarRating rating={review.rating} readonly size="sm" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                            {review.updatedAt !== review.createdAt && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                    (Edited)
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
