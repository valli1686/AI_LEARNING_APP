import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  Clock,
  TrendingUp,
  Award,
  Flame,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await progressService.getDashboardData();
        setDashboardData(response.data);
      } catch (error) {
        toast.error("Failed to fetch dashboard statistics.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  const overview = dashboardData?.overview || {
    totalDocuments: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
    averageScore: 0,
    studyStreak: 5
  };

  const stats = [
    {
      label: "Total Documents",
      value: overview.totalDocuments || 0,
      icon: FileText,
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
      link: "/documents"
    },
    {
      label: "Flashcard Decks",
      value: overview.totalFlashcardSets ?? 0,
      icon: BookOpen,
      gradient: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/20",
      link: "/flashcards"
    },
    {
      label: "Quizzes Completed",
      value: overview.completedQuizzes ?? 0,
      icon: BrainCircuit,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
      link: "/documents"
    },
    {
      label: "Average Quiz Score",
      value: `${overview.averageScore || 0}%`,
      icon: Award,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
      link: "/documents"
    }
  ];

  const recentDocs = dashboardData?.recentActivity?.documents || [];
  const recentQuizzes = dashboardData?.recentActivity?.quizzes || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-card border border-slate-800 p-6 md:p-8">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <BookOpen size={14} /> Smart Study Hub
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Welcome back to your Study Hub
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl">
              Upload course PDFs, create instant flashcards and practice quizzes, and get answers to your document questions.
            </p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800/80 block group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-extrabold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} ${stat.shadow} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110`}>
                  <Icon size={22} strokeWidth={2.2} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileText size={18} />
              </div>
              <h2 className="text-lg font-bold text-white">Recent Documents</h2>
            </div>
            <Link to="/documents" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentDocs.length > 0 ? (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/documents/${doc._id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-indigo-500/40 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {doc.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(doc.createdAt || doc.lastAccessed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {doc.status || "Ready"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No documents uploaded yet.</p>
              <Link to="/documents" className="inline-block mt-3 px-4 py-2 rounded-xl gradient-btn text-xs font-semibold text-white">
                Upload First PDF
              </Link>
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BrainCircuit size={18} />
              </div>
              <h2 className="text-lg font-bold text-white">Recent Quizzes</h2>
            </div>
            <Link to="/documents" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Take Quiz <ArrowRight size={14} />
            </Link>
          </div>

          {recentQuizzes.length > 0 ? (
            <div className="space-y-3">
              {recentQuizzes.map((quiz) => (
                <Link
                  key={quiz._id}
                  to={quiz.completedAt ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/40 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                        {quiz.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {quiz.documentId?.title ? `Document: ${quiz.documentId.title}` : 'AI Generated Quiz'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{quiz.score}%</p>
                    <p className="text-xs text-slate-500">{quiz.totalQuestions} Questions</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <BrainCircuit size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No quizzes taken yet.</p>
              <p className="text-xs text-slate-400 mt-1">Generate a quiz from any PDF document to test yourself!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;