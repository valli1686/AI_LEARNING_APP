import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BrainCircuit,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Award
} from "lucide-react";
import toast from "react-hot-toast";
import quizService from "../../services/quizService";
import Spinner from "../../components/common/Spinner";

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIndex]: selectedOptionString }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await quizService.getQuizById(quizId);
      const quizData = response.data || response;
      setQuiz(quizData);

      // If quiz is already completed, redirect to results page
      if (quizData.completedAt) {
        navigate(`/quizzes/${quizId}/results`, { replace: true });
      }
    } catch (error) {
      toast.error("Failed to load quiz.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionStr) => {
    setUserAnswers((prev) => ({
      ...prev,
      [current]: optionStr
    }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;

    // Format answers array
    const formattedAnswers = Object.entries(userAnswers).map(([indexStr, selectedOption]) => ({
      questionIndex: parseInt(indexStr),
      selectedOption
    }));

    if (formattedAnswers.length < (quiz?.questions?.length || 0)) {
      if (!window.confirm("You have un-answered questions. Are you sure you want to submit?")) {
        return;
      }
    }

    setSubmitting(true);

    try {
      await quizService.submitQuiz(quizId, formattedAnswers);
      toast.success("Quiz submitted successfully!");
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error(error.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center border border-slate-800 my-10 max-w-lg mx-auto">
        <BrainCircuit size={40} className="mx-auto mb-4 text-emerald-400 opacity-60" />
        <h2 className="text-xl font-bold text-white mb-2">Quiz Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">This quiz is unavailable or has expired.</p>
        <Link to="/documents" className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white">
          Back to Documents
        </Link>
      </div>
    );
  }

  const q = quiz.questions[current];
  const isLastQuestion = current === quiz.questions.length - 1;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/documents/${quiz.documentId?._id || quiz.documentId || ''}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} /> Document Hub
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Answered: {answeredCount} / {quiz.questions.length}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 transition-all duration-300 rounded-full"
          style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
            <Sparkles size={14} /> Question {current + 1} of {quiz.questions.length}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 capitalize">
            {q.difficulty || "medium"}
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
          {q.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {q.options.map((option, idx) => {
            const isSelected = userAnswers[current] === option;
            const optionLetters = ["A", "B", "C", "D"];

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                className={`w-full p-4 rounded-2xl text-left text-sm font-medium transition-all duration-200 flex items-center justify-between border ${
                  isSelected
                    ? "bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-600/10"
                    : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center border ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 border-emerald-400"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    {optionLetters[idx] || idx + 1}
                  </span>
                  <span>{option}</span>
                </div>

                {isSelected && <CheckCircle2 size={18} className="text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          disabled={current === 0}
          onClick={() => setCurrent((prev) => prev - 1)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40"
        >
          <ChevronLeft size={18} /> Previous Question
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : (
          <button
            onClick={() => setCurrent((prev) => prev + 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
          >
            Next Question <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTakePage;