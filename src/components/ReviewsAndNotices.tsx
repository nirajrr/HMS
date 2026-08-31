import React, { useState } from 'react';
import { Review, Notice } from '../types';
import { 
  Star, MessageSquare, ThumbsUp, Bell, Plus, ShieldCheck, 
  Calendar, CheckCircle2, User, AlertCircle, Pin
} from 'lucide-react';

interface ReviewsAndNoticesProps {
  reviews?: Review[];
  notices?: Notice[];
  isAdmin?: boolean;
  onAddReview?: (review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => void;
  onUpvoteReview?: (reviewId: string) => void;
  onAddNotice?: (notice: Omit<Notice, 'id' | 'postedAt'>) => void;
}

export const ReviewsAndNotices: React.FC<ReviewsAndNoticesProps> = ({
  reviews = [],
  notices = [],
  isAdmin = true,
  onAddReview,
  onUpvoteReview,
  onAddNotice,
}) => {
  const [activeTab, setActiveTab] = useState<'REVIEWS' | 'NOTICES'>('REVIEWS');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  // Review Form
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewUserType, setReviewUserType] = useState<'STUDENT' | 'PARENT' | 'VISITOR' | 'ALUMNI'>('STUDENT');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Notice Form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'GENERAL' | 'MESS' | 'MAINTENANCE' | 'EMERGENCY'>('GENERAL');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');

  const averageRating = ((reviews || []).reduce((sum, r) => sum + r.rating, 0) / ((reviews || []).length || 1)).toFixed(1);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor || !reviewComment) return;
    onAddReview?.({
      authorName: reviewAuthor,
      userType: reviewUserType,
      rating: reviewRating,
      comment: reviewComment,
      isVerifiedStay: true,
    });
    setShowReviewModal(false);
    setReviewAuthor('');
    setReviewComment('');
  };

  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    onAddNotice?.({
      title: noticeTitle,
      category: noticeCategory,
      content: noticeContent,
      postedBy: 'Chief Warden & Administration',
      priority: noticePriority,
      isPinned: true,
    });
    setShowNoticeModal(false);
    setNoticeTitle('');
    setNoticeContent('');
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('REVIEWS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'REVIEWS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          Resident &amp; Visitor Reviews ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('NOTICES')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'NOTICES'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Bell className="w-4 h-4 text-indigo-400" />
          Official Bulletin &amp; Notices ({notices.length})
        </button>
      </div>

      {activeTab === 'REVIEWS' ? (
        <div className="space-y-6">
          {/* Review Score Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-amber-400">
                <span className="text-2xl font-black">{averageRating}</span>
                <div className="flex text-[10px]">
                  {'★'.repeat(Math.round(Number(averageRating)))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">Hostel Satisfaction &amp; Feedback Rating</h3>
                <p className="text-xs text-slate-400">
                  Aggregated from verified residents, parents during visiting hours, and alumni
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Submit Resident Feedback
            </button>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                        {r.authorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{r.authorName}</h4>
                        <span className="text-[10px] text-slate-400">{r.userType}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{r.comment}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Stay Resident
                  </div>

                  <button
                    onClick={() => onUpvoteReview(r.id)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Helpful ({r.helpfulCount})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Official Hostel Bulletin &amp; Security Circulars
            </h3>

            {isAdmin && (
              <button
                onClick={() => setShowNoticeModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Publish New Notice
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {n.isPinned && <Pin className="w-4 h-4 text-amber-400 fill-amber-400" />}
                    <h4 className="text-sm font-bold text-slate-100">{n.title}</h4>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    n.priority === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : n.priority === 'HIGH'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {n.category} • {n.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{n.content}</p>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Issued by: {n.postedBy}</span>
                  <span>{n.postedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Write Review */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Write Resident Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Your Name *</label>
                <input
                  type="text"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  placeholder="e.g. Siddharth Verma"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Affiliation</label>
                  <select
                    value={reviewUserType}
                    onChange={(e) => setReviewUserType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="STUDENT">Resident Student</option>
                    <option value="PARENT">Parent / Guardian</option>
                    <option value="VISITOR">Guest / Visitor</option>
                    <option value="ALUMNI">Alumni Resident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Rating (Stars)</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value={5}>5 Stars - Outstanding</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Needs Improvement</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Feedback *</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details on mess hygiene, Wi-Fi connectivity, room acoustics..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Publish Notice */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Broadcast Warden Circular</h3>
              <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleNoticeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Notice Title *</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Mandatory Hostel Curfew Revision"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="GENERAL">General Announcement</option>
                    <option value="MESS">Mess &amp; Dining</option>
                    <option value="MAINTENANCE">Water/Power Maintenance</option>
                    <option value="EMERGENCY">Emergency / Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority</label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="LOW">Routine</option>
                    <option value="MEDIUM">Important</option>
                    <option value="HIGH">Urgent Notice</option>
                    <option value="CRITICAL">Critical Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Circular Content *</label>
                <textarea
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Draft the circular message..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
