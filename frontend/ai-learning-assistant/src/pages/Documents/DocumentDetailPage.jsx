import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import documentService from "../../services/documentService";
import aiService from "../../services/aiService";
import flashcardService from "../../services/flashcardService";
import quizService from "../../services/quizService";
import Spinner from "../../components/common/Spinner";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Summary state
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // Generators state
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(5);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Existing generated sets
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const fetchDocumentDetails = async () => {
    try {
      const data = await documentService.getDocumentById(id);
      setDocument(data.data || data);

      // Fetch flashcard sets & quizzes
      try {
        const fcRes = await flashcardService.getFlashcardsForDocument(id);
        setFlashcardSets(fcRes.data || []);
      } catch (err) {
        console.log("No flashcards found yet");
      }

      try {
        const quizRes = await quizService.getQuizzesForDocument(id);
        setQuizzes(quizRes.data || []);
      } catch (err) {
        console.log("No quizzes found yet");
      }

    } catch (error) {
      toast.error("Failed to load document details.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const result = await aiService.generateSummary(id);
      setSummary(result?.summary || result);
      toast.success("AI Summary generated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setGeneratingFlashcards(true);
    try {
      await aiService.generateFlashcards(id, { count: flashcardCount });
      toast.success(`Generated ${flashcardCount} AI Flashcards!`);
      navigate(`/documents/${id}/flashcards`);
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards.");
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const quizRes = await aiService.generateQuiz(id, { numQuestions: quizQuestions });
      toast.success("Generated AI Quiz successfully!");
      const newQuizId = quizRes?.data?._id || quizRes?._id;
      if (newQuizId) {
        navigate(`/quizzes/${newQuizId}`);
      } else {
        fetchDocumentDetails();
      }
    } catch (error) {
      toast.error(error.message || "Failed to generate quiz.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userQ = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userQ }]);
    setSendingChat(true);

    try {
      const res = await aiService.chat(id, userQ);
      const botAnswer = res?.data?.answer || res?.answer || "No response received.";
      setChatMessages((prev) => [...prev, { role: "assistant", content: botAnswer }]);
    } catch (error) {
      toast.error(error.message || "Failed to get AI answer.");
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't answer that question right now." }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  if (loading) return <Spinner />;
  if (!document) return <div className="text-center text-slate-400 py-20">Document not found.</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Navigation & Title */}
      <div>
        <Link to="/documents" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-4">
          <ArrowLeft size={16} /> Back to Documents
        </Link>

        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <FileText size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">{document.title}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {document.status || "Ready"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {document.fileName} • Uploaded {new Date(document.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                activeTab === "flashcards"
                  ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30"
                  : "bg-slate-900/60 text-slate-300 border-slate-800 hover:text-white"
              }`}
            >
              <BookOpen size={16} /> Flashcards ({flashcardSets.length})
            </button>

            <button
              onClick={() => setActiveTab("quizzes")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                activeTab === "quizzes"
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30"
                  : "bg-slate-900/60 text-slate-300 border-slate-800 hover:text-white"
              }`}
            >
              <BrainCircuit size={16} /> Quizzes ({quizzes.length})
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                activeTab === "chat"
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/60 text-slate-300 border-slate-800 hover:text-white"
              }`}
            >
              <MessageSquare size={16} /> AI Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main Feature Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Flashcards Generator Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <BookOpen size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Generate AI Flashcards</h3>
            <p className="text-slate-400 text-xs mb-4">
              Extract key terms and definitions into 3D interactive flashcards.
            </p>

            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1">Number of Cards:</label>
              <select
                value={flashcardCount}
                onChange={(e) => setFlashcardCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value={5}>5 Cards</option>
                <option value={10}>10 Cards</option>
                <option value={15}>15 Cards</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generatingFlashcards}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generatingFlashcards ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {generatingFlashcards ? "Generating..." : "Generate Flashcards"}
          </button>
        </div>

        {/* Quiz Generator Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <BrainCircuit size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Generate AI Quiz</h3>
            <p className="text-slate-400 text-xs mb-4">
              Test your knowledge with multiple choice questions and instant explanations.
            </p>

            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1">Number of Questions:</label>
              <select
                value={quizQuestions}
                onChange={(e) => setQuizQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={generatingQuiz}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generatingQuiz ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {generatingQuiz ? "Generating..." : "Generate Quiz"}
          </button>
        </div>

        {/* AI Summary Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Document Summary</h3>
            <p className="text-slate-400 text-xs mb-4">
              Get an executive AI overview of key takeaways and bullet points.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveTab("overview");
              if (!summary) handleGenerateSummary();
            }}
            disabled={loadingSummary}
            className="w-full py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingSummary ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {loadingSummary ? "Summarizing..." : summary ? "View Summary" : "Generate Summary"}
          </button>
        </div>
      </div>

      {/* Tabs Content */}
      {activeTab === "overview" && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" /> AI Executive Summary
            </h2>
            {!summary && (
              <button
                onClick={handleGenerateSummary}
                disabled={loadingSummary}
                className="px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white disabled:opacity-50"
              >
                {loadingSummary ? "Generating..." : "Generate AI Summary"}
              </button>
            )}
          </div>

          {summary ? (
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">Click "Generate AI Summary" above to create an automated Markdown breakdown of this document.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "flashcards" && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-purple-400" /> Flashcard Sets
            </h2>
            <button
              onClick={() => navigate(`/documents/${id}/flashcards`)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
            >
              Open 3D Flashcard Deck
            </button>
          </div>

          {flashcardSets.length > 0 ? (
            <div className="space-y-3">
              {flashcardSets.map((set) => (
                <div key={set._id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{set.cards?.length || 0} Cards</p>
                    <p className="text-xs text-slate-500">Created: {new Date(set.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Link
                    to={`/documents/${id}/flashcards`}
                    className="px-4 py-2 rounded-xl bg-purple-600/30 text-purple-300 hover:bg-purple-600 text-xs font-bold"
                  >
                    Study Now
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No flashcard sets generated yet. Use the card above to generate set!</p>
          )}
        </div>
      )}

      {activeTab === "quizzes" && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BrainCircuit size={18} className="text-emerald-400" /> Generated Quizzes
            </h2>
          </div>

          {quizzes.length > 0 ? (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{quiz.title}</p>
                    <p className="text-xs text-slate-400">{quiz.totalQuestions} Questions • Score: {quiz.score}%</p>
                  </div>
                  <Link
                    to={quiz.completedAt ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    {quiz.completedAt ? "View Results" : "Take Quiz"}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No quizzes generated yet. Click Generate AI Quiz above to get started.</p>
          )}
        </div>
      )}

      {activeTab === "chat" && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col h-[500px]">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Document Study Assistant</h2>
              <p className="text-xs text-slate-400">Ask questions directly about this document</p>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 my-2">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <HelpCircle size={32} className="mx-auto mb-2 opacity-50" />
                Ask any question about this PDF document! E.g. "What are the main concepts in chapter 1?"
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white font-medium rounded-br-none"
                        : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {sendingChat && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-indigo-400" /> Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI anything about this document..."
              className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="px-4 py-2.5 rounded-xl gradient-btn text-white text-xs font-bold flex items-center gap-1 disabled:opacity-50"
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailPage;