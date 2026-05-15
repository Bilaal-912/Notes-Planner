// src/components/NotesList.jsx
import { useEffect, useState } from "react";
import api from "../api";

const semesterOptions = [
  "All",
  "Sem 1",
  "Sem 2",
  "Sem 3",
  "Sem 4",
  "Sem 5",
  "Sem 6",
  "Sem 7",
  "Sem 8",
];
const categoryOptions = ["All", "IA-1", "IA-2", "End Sem", "Assignment", "Other"];

const NotesList = ({ currentUser }) => {
  const [notes, setNotes] = useState([]);
  const [semester, setSemester] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    // If your app requires login-first, you can keep this guard.
    // If you want public browsing without login, remove this check.
    if (!currentUser) {
      setNotes([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {};
      if (semester !== "All") params.semester = semester;
      if (category !== "All") params.category = category;
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/notes", { params });
      // assume backend returns an array of notes
      setNotes(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes when filters / search / user changes
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, semester, category, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting note. Please try again.");
    }
  };

const getFileUrl = (note) => {
  if (!note?.filePath) return "#";

  // Clean Windows slashes, remove leading /, and remove accidental "api/"
  let cleanPath = note.filePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^api\//, ""); // ← FIX

  // Always serve from the real backend root (not /api)
  const base = "http://localhost:5000";

  return `${base}/${cleanPath}`;
};


  const isOwner = (note) => {
    if (!currentUser) return false;

    // Normalize owner id in several possible shapes:
    // - note.owner could be a plain string id
    // - note.owner could be an object like { _id: "...", name: "..." }
    // - currentUser could have id or _id
    const ownerId =
      (typeof note.owner === "string" && note.owner) ||
      (note.owner && (note.owner._id || note.owner.id)) ||
      null;

    const currentId = currentUser.id || currentUser._id || null;

    if (!ownerId || !currentId) return false;

    // compare as strings
    return ownerId.toString() === currentId.toString();
  };

  if (!currentUser) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-sm text-slate-600">
        <p className="font-medium text-slate-800 mb-1">Notes library</p>
        <p>Please login to view and search notes.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Notes library</h3>
          <p className="text-xs text-slate-500">
            Filter by semester, exam type, or search by subject / tags.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            className="border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            {semesterOptions.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by subject, topic, tag..."
            className="border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <p className="text-xs text-slate-500">Loading notes...</p>}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!loading && notes.length === 0 && (
        <p className="text-xs text-slate-500">No notes found for the selected filters.</p>
      )}

      <div className="space-y-2">
        {notes.map((note) => (
          <div
            key={note._id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-2 border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white hover:bg-slate-50 shadow-sm hover:shadow-md transition"
          >
            <div className="space-y-0.5">
              <p className="font-medium text-slate-900">{note.title}</p>
              <p className="text-[11px] text-slate-500">
                {note.subject} • {note.semester} • {note.category}
              </p>
              {note.tags && note.tags.length > 0 && (
                <p className="text-[11px] text-slate-400">Tags: {note.tags.join(", ")}</p>
              )}
              <p className="text-[11px] text-slate-400">
                Visibility: <span className="font-medium">{note.isPublic ? "Public" : "Private"}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <a
                href={getFileUrl(note)}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-full border border-indigo-200 text-[11px] text-indigo-700 hover:bg-indigo-50"
              >
                View file
              </a>

              {isOwner(note) && (
                <button
                  onClick={() => handleDelete(note._id)}
                  className="px-2.5 py-1.5 rounded-full border border-red-200 text-[11px] text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;
