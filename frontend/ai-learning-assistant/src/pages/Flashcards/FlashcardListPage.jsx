import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, ArrowRight, Calendar } from "lucide-react";
import flashcardService from "../../services/flashcardService";
import Spinner from "../../components/common/Spinner";

const FlashcardListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlashcardSets();
  }, []);

  const loadFlashcardSets = async () => {
    try {
      const data = await flashcardService.getAllFlashcardSets();
      setFlashcardSets(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">All Flashcard Sets</h1>
          <p className="text-slate-400 text-sm mt-1">Review AI-generated study decks from your documents.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
          <BookOpen size={24} />
        </div>
      </div>

      {flashcardSets.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 my-10 max-w-lg mx-auto">
          <BookOpen size={40} className="mx-auto mb-4 text-purple-400 opacity-60" />
          <h3 className="text-xl font-bold text-white mb-2">No flashcard sets yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Upload a document and click "Generate AI Flashcards" to create your first study set!
          </p>
          <Link to="/documents" className="px-6 py-3 rounded-xl gradient-btn text-xs font-bold text-white">
            Go to Documents
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => {
            const docId = set.documentId?._id || set.documentId;
            const docTitle = set.documentId?.title || "Study Document";

            return (
              <div key={set._id} className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                      <Sparkles size={20} />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {set.cards?.length || 0} Cards
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {docTitle}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <Calendar size={13} /> Created: {new Date(set.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Ready to study</span>
                  <Link
                    to={docId ? `/documents/${docId}/flashcards` : "#"}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold text-white shadow-md shadow-purple-600/20"
                  >
                    Start Study <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashcardListPage;