// src/components/UploadNoteForm.jsx
import { useState } from "react";
import api from "../api";

const semesters = [
  "Sem 1",
  "Sem 2",
  "Sem 3",
  "Sem 4",
  "Sem 5",
  "Sem 6",
  "Sem 7",
  "Sem 8",
];

const categories = ["IA-1", "IA-2", "End Sem", "Assignment", "Other"];

const subjects = ["OS", "DBMS", "CN", "DAA", "SPM", "Maths", "Other"];

const UploadNoteForm = ({ currentUser, onNewNote }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [semester, setSemester] = useState("Sem 1");
  const [category, setCategory] = useState("IA-1");
  const [subject, setSubject] = useState("OS");
  const [otherSubject, setOtherSubject] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // If not logged in — ask to login (existing behavior)
  if (!currentUser) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-sm text-slate-600 shadow-sm">
        <p className="font-medium text-slate-800 mb-1">Upload notes</p>
        <p>Please login to upload notes.</p>
      </div>
    );
  }

  // If logged in but not a teacher — show friendly message (new)
  if (currentUser.role !== "teacher") {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-sm text-slate-600 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-slate-800 mb-1">Upload notes</p>
            <p>
              Only <span className="font-medium">teachers</span> can upload notes.
              If you're a teacher, register using the invite code. If you need
              access, ask an admin or your instructor for the invite code.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Students can still browse and download public notes from the
              library.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a file to upload.");
      setLoading(false);
      return;
    }

    const finalSubject =
      subject === "Other" ? (otherSubject || "").trim() : subject;
    if (!finalSubject) {
      setError("Please enter a subject.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("semester", semester);
      formData.append("category", category);
      formData.append("subject", finalSubject);
      formData.append("tags", tags);
      formData.append("isPublic", isPublic);
      formData.append("file", file);

      const res = await api.post("/notes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Note uploaded successfully ✅");
      setTitle("");
      setDescription("");
      setTags("");
      setFile(null);
      setCategory("IA-1");
      setSemester("Sem 1");
      setSubject("OS");
      setOtherSubject("");
      setIsPublic(true);

      if (onNewNote) {
        // Some backends return the created note directly; adjust if your API uses a different shape
        onNewNote(res.data.note || res.data);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Error uploading note. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Upload a new note
        </h3>
        <p className="text-[11px] text-slate-500">
          Logged in as <span className="font-medium">{currentUser.name}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-slate-700">Title</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Eg: OS - Deadlocks Notes"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-700">Subject</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            {subject === "Other" && (
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter subject name"
                value={otherSubject}
                onChange={(e) => setOtherSubject(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-slate-700">Description (optional)</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description about what this note contains"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-slate-700">Semester</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-700">Category</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-700">Tags</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Eg: deadlocks, bankers, OS"
            />
            <p className="text-[11px] text-slate-400">
              Separate tags with commas.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 items-center">
          <div className="space-y-1">
            <label className="block text-slate-700">File (PDF / image)</label>
            <input
              type="file"
              className="w-full text-sm"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-7">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
            />
            <label htmlFor="isPublic" className="text-xs text-slate-700">
              Make this note public (visible to other students)
            </label>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white font-medium px-4 py-2.5 text-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload Note"}
        </button>
      </form>
    </div>
  );
};

export default UploadNoteForm;
