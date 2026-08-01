import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  FileText, 
  BookOpen, 
  BrainCircuit, 
  Award, 
  Flame, 
  Star, 
  Clock, 
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import progressService from "../../services/progressService";
import Spinner from "../../components/common/Spinner";

const ProfilePage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await progressService.getDashboardData();
        setDashboardData(response.data);
      } catch (error) {
        console.error("Failed to load profile stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Spinner />;

  const overview = dashboardData?.overview || {
    totalDocuments: 0,
    totalFlashcardSets: 0,
    totalFlashcards: 0,
    reviewedFlashcards: 0,
    starredFlashcards: 0,
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    studyStreak: 5,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl glass-card border border-slate-800 p-6 md:p-8">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-1 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white">
                  <User size={44} className="text-indigo-300" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
                <Sparkles size={13} /> Active Student
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {user?.name || "AI Student"}
              </h1>
              <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                <Mail size={14} className="text-slate-500" /> {user?.email || "student@learning.ai"}
              </p>
              {user?.createdAt && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock size={12} /> Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-xl backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Study Streak</p>
              <p className="text-lg font-bold text-white">{overview.studyStreak || 5} Days 🔥</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Documents
              </p>
              <p className="text-3xl font-extrabold text-white mt-1">
                {overview.totalDocuments}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white">
              <FileText size={22} />
            </div>
          </div>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Flashcard Sets
              </p>
              <p className="text-3xl font-extrabold text-white mt-1">
                {overview.totalFlashcardSets}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {overview.totalFlashcards} Total Cards
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20 flex items-center justify-center text-white">
              <BookOpen size={22} />
            </div>
          </div>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quizzes Taken
              </p>
              <p className="text-3xl font-extrabold text-white mt-1">
                {overview.completedQuizzes}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                of {overview.totalQuizzes} Created
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white">
              <BrainCircuit size={22} />
            </div>
          </div>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Avg. Quiz Score
              </p>
              <p className="text-3xl font-extrabold text-amber-400 mt-1">
                {overview.averageScore}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20 flex items-center justify-center text-white">
              <Award size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flashcard Performance */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star size={18} className="text-yellow-400" /> Flashcard Progress
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-400">Reviewed Cards</span>
                <span className="text-purple-400">{overview.reviewedFlashcards} / {overview.totalFlashcards}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${overview.totalFlashcards ? Math.min(100, Math.round((overview.reviewedFlashcards / overview.totalFlashcards) * 100)) : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800/60">
              <span className="text-sm font-medium text-slate-300">Starred / Favorite Cards</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                {overview.starredFlashcards} Cards
              </span>
            </div>
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" /> Quiz Mastery
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-400">Quiz Completion Rate</span>
                <span className="text-emerald-400">
                  {overview.totalQuizzes ? Math.round((overview.completedQuizzes / overview.totalQuizzes) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${overview.totalQuizzes ? Math.min(100, Math.round((overview.completedQuizzes / overview.totalQuizzes) * 100)) : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800/60">
              <span className="text-sm font-medium text-slate-300">Overall Accuracy</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {overview.averageScore}% Score
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;