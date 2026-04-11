"use client";

import { Star, User, MessageSquare } from "lucide-react";

interface ReviewsSectionProps {
  productId: string;
  reviews: any[];
  stats: any;
}

export default function ReviewsSection({ productId, reviews, stats }: ReviewsSectionProps) {
  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Rating Breakdown */}
        <div className="lg:w-1/3 space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Customer Reviews</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-black text-white">{stats.average}</div>
              <div className="flex items-center justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(stats.average) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-slate-600 fill-slate-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase mt-2">{stats.total} ratings</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{rating}★</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.breakdown[rating] / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 w-8">
                    {stats.total > 0 ? Math.round((stats.breakdown[rating] / stats.total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all">
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-400" />
              Latest Feedback
            </h3>
          </div>
          
          {reviews.length === 0 ? (
            <div className="p-12 text-center bg-white/[0.02] border border-white/10 rounded-3xl">
              <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
                        <User className="h-5 w-5 text-violet-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{review.userName}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Verified Purchase</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-slate-600 fill-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
