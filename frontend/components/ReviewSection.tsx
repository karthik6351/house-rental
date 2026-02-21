'use client';

import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { reviewAPI } from '@/lib/api';
import StarRating from './StarRating';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Review {
    _id: string;
    user: { _id: string; name: string };
    rating: number;
    comment: string;
    createdAt: string;
}

interface ReviewSectionProps {
    propertyId: string;
    ownerId: string;
}

export default function ReviewSection({ propertyId, ownerId }: ReviewSectionProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { fetchReviews(); }, [propertyId]);

    const fetchReviews = async () => {
        try {
            const response = await reviewAPI.getPropertyReviews(propertyId);
            setReviews(response.data.reviews);
        } catch (error) { console.error('Failed to fetch reviews:', error); }
        finally { setIsLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) { toast.error('Please select a rating'); return; }
        setIsSubmitting(true);
        try {
            await reviewAPI.create({ propertyId, rating, comment });
            toast.success('Review submitted!');
            setRating(0);
            setComment('');
            setShowForm(false);
            fetchReviews();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally { setIsSubmitting(false); }
    };

    const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const canReview = user && user._id !== ownerId && user.role === 'tenant';
    const hasReviewed = reviews.some(r => r.user._id === user?._id);

    // Rating breakdown
    const breakdown = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percent: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
    }));

    return (
        <div className="space-y-6">
            {/* Summary Header */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                {/* Average Rating */}
                <div className="text-center md:text-left shrink-0">
                    <div className="text-5xl font-extrabold text-gray-900 dark:text-white">{avg.toFixed(1)}</div>
                    <div className="flex items-center justify-center md:justify-start gap-0.5 my-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={16} className={i <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700'} />
                        ))}
                    </div>
                    <p className="text-sm text-gray-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Breakdown */}
                {reviews.length > 0 && (
                    <div className="flex-1 space-y-1.5 w-full max-w-xs">
                        {breakdown.map(b => (
                            <div key={b.star} className="flex items-center gap-2.5">
                                <span className="text-xs text-gray-500 w-3 text-right">{b.star}</span>
                                <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${b.percent}%` }} />
                                </div>
                                <span className="text-[11px] text-gray-400 w-5 text-right">{b.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Write Review */}
            {canReview && !hasReviewed && (
                <div>
                    {!showForm ? (
                        <button onClick={() => setShowForm(true)} className="btn-secondary text-sm flex items-center gap-2">
                            <Star size={16} /> Write a Review
                        </button>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="card p-5 sm:p-6 space-y-4"
                        >
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Your Rating</label>
                                <StarRating value={rating} onChange={setRating} size={28} />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Comment (optional)</label>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    className="input-field resize-none h-24"
                                    placeholder="Share your experience..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={isSubmitting || rating === 0} className="btn-primary text-sm disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">
                                    Cancel
                                </button>
                            </div>
                        </motion.form>
                    )}
                </div>
            )}

            {/* Reviews List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="skeleton w-10 h-10 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-4 w-24" />
                                <div className="skeleton h-3 w-48" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                    <Star className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No reviews yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review, i) => (
                        <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex gap-3.5"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {review.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{review.user.name}</span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex gap-0.5 mb-1.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} size={13} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700'} />
                                    ))}
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
