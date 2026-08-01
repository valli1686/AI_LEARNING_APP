import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Star,
  BookOpen,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import flashcardService from "../../services/flashcardService";
import Spinner from "../../components/common/Spinner";

const FlashcardPage = () => {
  const { id } = useParams();

  const [flashcardsSet, setFlashcardsSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlashcards();
  }, [id]);

  const loadFlashcards = async () => {
    try {
      const response = await flashcardService.getFlashcardsForDocument(id);
      const setData = response.data?.[0] || response.data;
      setFlashcardsSet(setData);
      setCards(setData?.cards || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load flashcards.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setCards((prev) =>
        prev.map((c) => (c._id === cardId ? { ...c, isStarred: !c.isStarred } : c))
      );
      toast.success("Card updated!");
    } catch (error) {
      toast.error("Failed to update star.");
    }
  };

  if (loading) return <Spinner />;

  if (!cards.length) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 my-10 max-w-lg mx-auto">
        <BookOpen size={40} className="mx-auto mb-4 text-purple-400 opacity-60" />
        <h2 className="text-xl font-bold text-white mb-2">No Flashcards Available</h2>
        <p className="text-slate-400 text-sm mb-6">
          Generate flashcards for this document from the Document Hub!
        </p>
        <Link
          to={`/documents/${id}`}
          className="px-6 py-3 rounded-xl gradient-btn text-xs font-bold text-white"
        >
          Return to Document Hub
        </Link>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/documents/${id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} /> Document Hub
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        ></div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 w-full min-h-[360px] cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
        <div
          className={`relative w-full h-full min-h-[360px] duration-500 transform-style-3d transition-transform ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front of Card */}
          <div className="absolute inset-0 w-full h-full glass-card rounded-3xl p-8 border border-slate-800 flex flex-col justify-between backface-hidden shadow-2xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                <Sparkles size={13} /> QUESTION
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStar(currentCard._id);
                }}
                className={`p-2 rounded-xl transition-all ${
                  currentCard.isStarred ? "text-amber-400 bg-amber-400/10" : "text-slate-500 hover:text-white"
                }`}
              >
                <Star size={18} fill={currentCard.isStarred ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="my-auto text-center px-4">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                {currentCard.question}
              </h2>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="capitalize px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                Difficulty: {currentCard.difficulty || "medium"}
              </span>
              <span className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                <RotateCw size={14} /> Click to reveal answer
              </span>
            </div>
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 w-full h-full glass-card rounded-3xl p-8 border border-purple-500/30 flex flex-col justify-between backface-hidden rotate-y-180 bg-slate-900/90 shadow-2xl">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={13} /> ANSWER
              </span>
              <span className="text-slate-500">Card #{currentIndex + 1}</span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
              <RotateCw size={14} /> Click to return to question
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          disabled={currentIndex === 0}
          onClick={() => {
            setCurrentIndex((prev) => prev - 1);
            setIsFlipped(false);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-indigo-500/40 disabled:opacity-40 transition-all"
        >
          <ChevronLeft size={18} /> Previous Card
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-600/30 transition-all"
        >
          Flip Card
        </button>

        <button
          disabled={currentIndex === cards.length - 1}
          onClick={() => {
            setCurrentIndex((prev) => prev + 1);
            setIsFlipped(false);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all"
        >
          Next Card <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardPage;