// src/App.jsx
import "./index.css";
import { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";
import UploadNoteForm from "./components/UploadNoteForm";
import NotesList from "./components/NotesList";
import api from "./api";

function App() {
  // Open auth modal by default if no token is present
  const [authOpen, setAuthOpen] = useState(() => !localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);
  const [notes, setNotes] = useState([]); // still here if you want to use later

  // Helper to normalize user objects from various sources
  const normalizeUser = (user) => {
    if (!user) return null;
    return {
      id: user?.id || user?._id || (user?._id && user._id.toString && user._id.toString()),
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "student",
    };
  };

  // On first load, check if there is a token and fetch user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/auth/me")
      .then((res) => {
        const normalized = normalizeUser(res.data);
        setCurrentUser(normalized);
        setAuthOpen(false); // close modal if token is valid
      })
      .catch(() => {
        localStorage.removeItem("token");
        setCurrentUser(null);
        setAuthOpen(true); // show login again if token invalid/expired
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setAuthOpen(true); // go back to login screen
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Main UI is only visible after login */}
      {currentUser && (
        <>
          {/* Top Navbar */}
          <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              {/* Logo + title */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                  N
                </div>
                <div>
                  <h1 className="font-semibold text-lg">CampusNotes</h1>
                  <p className="text-xs text-slate-500">
                    Secure and Collaborative Smart Notes Planner
                  </p>
                </div>
              </div>

              {/* Center nav links */}
              <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600">
                <button
                  onClick={() => scrollToSection("upload")}
                  className="px-3 py-1.5 rounded-full hover:bg-slate-100 transition"
                >
                  Upload
                </button>
                <button
                  onClick={() => scrollToSection("library")}
                  className="px-3 py-1.5 rounded-full hover:bg-slate-100 transition"
                >
                  Library
                </button>
              </nav>

              {/* Auth area */}
              <div className="flex items-center gap-3 text-xs">
                <div className="text-right">
                  <p className="font-medium text-slate-800">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* (Optional) small heading section – pure text, no preview cards */}
            <section className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Manage your semester notes in one place
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl">
                Upload PDFs, organize by semester and exam type, and quickly
                search your notes using subject and tags.
              </p>
            </section>

            {/* Upload notes section */}
            <section id="upload" className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                  Upload notes
                </h3>
              </div>

              <UploadNoteForm
                currentUser={currentUser}
                onNewNote={(note) => setNotes((prev) => [note, ...prev])}
              />
            </section>

            {/* Notes list / search section */}
            <section id="library" className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                  Notes library
                </h3>
                <p className="text-[11px] text-slate-500">
                  Browse all public notes and your own uploads.
                </p>
              </div>

              <NotesList currentUser={currentUser} />
            </section>
          </main>

          {/* Footer */}
          <footer className="border-t bg-white">
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <p>
                © {new Date().getFullYear()} CampusNotes &mdash; Academic Notes
                Management System.
              </p>
              <p>
                Built with{" "}
                <span className="font-medium text-slate-700">
                  React, Tailwind, Node.js, Express, MongoDB
                </span>
              </p>
            </div>
          </footer>
        </>
      )}

      {/* Auth Modal – shown first when not logged in */}
      <AuthModal
        isOpen={authOpen && !currentUser}
        mode="login"
        // Prevent closing modal if no user is logged in
        onClose={() => {
          if (!currentUser) return;
          setAuthOpen(false);
        }}
        onAuthSuccess={(user) => {
          // Normalize just in case
          const normalized = normalizeUser(user);
          setCurrentUser(normalized);
          setAuthOpen(false);
        }}
      />
    </div>
  );
}

export default App;

