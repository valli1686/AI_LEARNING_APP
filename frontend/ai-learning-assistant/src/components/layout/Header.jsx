import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, User, Menu, Sparkles, Flame, CheckCircle, BookOpen, X } from "lucide-react";
import { Link } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const displayName = user?.name || user?.username || "User";
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Study Streak Active! 🔥",
      description: "Keep your daily study momentum going! Complete a quiz or review flashcards.",
      time: "Just now",
      unread: true,
      icon: Flame,
      color: "text-orange-400 bg-orange-500/10 border-orange-500/20"
    },
    {
      id: 2,
      title: "Smart Assistant Engine Ready ⚡",
      description: "Automated quiz and flashcard generator ready for your documents.",
      time: "10 mins ago",
      unread: true,
      icon: Sparkles,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      id: 3,
      title: "Study Recommendation 📚",
      description: "Review your starred flashcards to maximize retention before your next quiz.",
      time: "1 hour ago",
      unread: false,
      icon: BookOpen,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 glass-card border-b border-slate-800 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200"
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <BookOpen size={13} /> Study Engine Active
          </span>
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative inline-flex items-center justify-center w-10 h-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200 group"
              aria-label="Notifications"
            >
              <Bell size={19} className="group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-card border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Mark read
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div 
                        key={n.id}
                        className={`p-3 rounded-xl border transition-all ${
                          n.unread 
                            ? 'bg-slate-900/90 border-slate-700/70' 
                            : 'bg-slate-950/50 border-slate-800/40 opacity-75'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${n.color}`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-white truncate">{n.title}</p>
                              <span className="text-[10px] text-slate-500">{n.time}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 text-center">
                  <Link 
                    to="/profile"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-slate-400 hover:text-white inline-flex items-center gap-1"
                  >
                    View Study Profile & Progress →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-slate-800 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white leading-snug group-hover:text-indigo-300 transition-colors">
                {displayName}
              </p>
              <p className="text-xs text-slate-400 leading-none">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </Link>

        </div>
      </div>
    </header>
  );
};

export default Header;