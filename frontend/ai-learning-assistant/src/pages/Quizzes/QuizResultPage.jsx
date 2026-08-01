import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen
} from "lucide-react";
import toast from "react-hot-toast";
import quizService from "../../services/quizService";
import Spinner from "../../components/common/Spinner";

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      const response = await quizService.getQuizResults(quizId);
      setResultData(response.data || response);
    } catch (error) {
      toast.error("Failed to load quiz results.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  if (!resultData) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center border border-slate-800 my-10 max-w-lg mx-auto">
        <p className="text-slate-400 text-sm">No result data available.</p>
        <Link to="/documents" className="inline-block mt-4 px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white">
          Back to Documents
        </Link>
      </div>
    );
  }

  const { title, score, totalQuestions, correctCount, results, document } = resultData;

  const isPassed = score >= 60;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={document?._id ? `/documents/${document._id}` : "/documents"}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} /> Return to Document Hub
        </Link>
      </div>

      {/* Score Summary Card */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 text-center relative overflow-hidden">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl"></div>

        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
            <Award size={32} />
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{title || "Quiz Results"}</h1>

          <div className="py-2">
            <span className="text-5xl md:text-6xl font-extrabold gradient-text">
              {score}%
            </span>
            <p className="text-sm font-semibold text-slate-400 mt-2">
              {correctCount} out of {totalQuestions} questions correct
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-800 bg-slate-900">
            {isPassed ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={15} /> Excellent Mastery!
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5">
                <HelpCircle size={15} /> Keep Practicing!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-400" /> Detailed Question Analysis
        </h2>

        {results && results.length > 0 ? (
          results.map((q, idx) => (
            <div
              key={idx}
              className={`glass-card rounded-2xl p-6 border ${
                q.isCorrect ? "border-emerald-500/30 bg-emerald-950/10" : "border-rose-500/30 bg-rose-950/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-base font-bold text-white leading-snug">
                  {idx + 1}. {q.questionText}
                </h3>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                  q.isCorrect ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}>
                  {q.isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {q.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>

              {/* Options display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-3">
                {q.options?.map((opt, optIdx) => {
                  const isCorrectAnswer = opt === q.correctAnswer;
                  const isUserSelection = opt === q.selectedOption;

                  let optionStyle = "bg-slate-900/60 border-slate-800 text-slate-400";
                  if (isCorrectAnswer) {
                    optionStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
                  } else if (isUserSelection && !q.isCorrect) {
                    optionStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold";
                  }

                  return (
                    <div key={optIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optionStyle}`}>
                      <span>{opt}</span>
                      {isCorrectAnswer && <span className="text-[10px] uppercase font-bold text-emerald-400">Correct Answer</span>}
                      {isUserSelection && !isCorrectAnswer && <span className="text-[10px] uppercase font-bold text-rose-400">Your Answer</span>}
                    </div>
                  );
                })}
              </div>

              {/* AI Explanation */}
              {q.explanation && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-indigo-400 flex items-center gap-1.5 mb-1">
                    <Sparkles size={14} /> AI Explanation:
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-xs">No detailed breakdown available.</p>
        )}
      </div>

      <div className="text-center pt-4">
        <Link
          to={document?._id ? `/documents/${document._id}` : "/documents"}
          className="px-6 py-3 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg"
        >
          Return to Document Hub
        </Link>
      </div>
    </div>
  );
};

export default QuizResultPage;