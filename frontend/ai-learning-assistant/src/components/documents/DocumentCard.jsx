import React from "react";
import { Link } from "react-router-dom";
import { FileText, Trash2, Sparkles, BookOpen, BrainCircuit, ArrowRight } from "lucide-react";

const DocumentCard = ({ document, onDelete }) => {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>

      <div>
        {/* Header: Icon & Status */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <FileText size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                {document.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {document.fileName || "PDF Document"}
              </p>
            </div>
          </div>

          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            document.status === 'ready' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : document.status === 'failed'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
          }`}>
            {document.status ? document.status.toUpperCase() : 'READY'}
          </span>
        </div>

        {/* Info badges */}
        <div className="flex items-center gap-3 my-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <BookOpen size={14} className="text-purple-400" />
            {document.flashcardsCount || 0} Flashcard sets
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <BrainCircuit size={14} className="text-emerald-400" />
            {document.quizzesCount || 0} Quizzes
          </span>
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-2">
        <p className="text-xs text-slate-500">
          Uploaded: {new Date(document.createdAt || Date.now()).toLocaleDateString()}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete?.(document)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-all"
            title="Delete document"
          >
            <Trash2 size={16} />
          </button>

          <Link
            to={`/documents/${document._id}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white shadow-md shadow-indigo-600/20"
          >
            Open Hub <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;