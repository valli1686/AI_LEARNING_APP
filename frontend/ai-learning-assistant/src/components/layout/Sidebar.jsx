import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  Sparkles,
  BookOpen,
  X,
  HelpCircle
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/documents", icon: FileText, text: "Documents" },
    { to: "/flashcards", icon: BookOpen, text: "Flashcards" },
    { to: "/profile", icon: User, text: "Profile" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 glass-card border-r border-slate-800 z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 flex flex-col justify-between`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <BookOpen size={22} />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-wide">StudyHub</h1>
                <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">Learning Platform</span>
              </div>
            </div>

            <button onClick={toggleSidebar} className="text-slate-400 hover:text-white md:hidden">
              <X size={22} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => isSidebarOpen && toggleSidebar()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-600/30 text-white border border-indigo-500/40 shadow-lg shadow-indigo-600/20 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`
                  }
                >
                  <Icon size={19} className="transition-transform group-hover:scale-110" />
                  {link.text}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Logout */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="mb-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300">
            <p className="font-semibold text-indigo-400 flex items-center gap-1.5 mb-1">
              <BookOpen size={14} /> Smart Study Engine
            </p>
            <p className="text-slate-400">Upload PDF documents to automatically create Flashcards, Practice Quizzes & Summaries.</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/30 transition-all duration-200"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;