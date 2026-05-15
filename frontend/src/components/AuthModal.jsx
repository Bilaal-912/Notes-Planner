// src/components/AuthModal.jsx
import { useState, useEffect } from "react";
import api from "../api";

const AuthModal = ({ isOpen, mode, onClose, onAuthSuccess }) => {
  const [formMode, setFormMode] = useState(mode || "login"); // "login" or "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync mode prop if parent changes it
  useEffect(() => {
    if (mode) setFormMode(mode);
  }, [mode]);

  if (!isOpen) return null;

  const toggleMode = () => {
    setFormMode((prev) => (prev === "login" ? "register" : "login"));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formMode === "register") {
        // include inviteCode only if provided
        const registerPayload = { name, email, password };
        if (inviteCode) registerPayload.inviteCode = inviteCode;

        await api.post("/auth/register", registerPayload);
        // After successful register we continue to log the user in automatically
      }

      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      // Save token
      if (token) {
        localStorage.setItem("token", token);
      }

      // Normalize user shape so frontend always uses `id`
      const normalizedUser = {
        id: user?.id || user?._id || user?._id?.toString?.(),
        name: user?.name,
        email: user?.email,
        role: user?.role || "student",
      };

      onAuthSuccess && onAuthSuccess(normalizedUser);
      onClose && onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const title =
    formMode === "login" ? "Login to CampusNotes" : "Create an account";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          {formMode === "register" && (
            <div className="space-y-1">
              <label className="block text-slate-700">Name</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-slate-700">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-700">Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Invite code (optional) shown only on register */}
          {formMode === "register" && (
            <div className="space-y-1">
              <label className="block text-slate-700">Invite code (teachers only)</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code if you're a teacher"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white font-medium py-2.5 text-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : formMode === "login"
              ? "Login"
              : "Register & Login"}
          </button>
        </form>

        <div className="mt-4 text-xs text-center text-slate-500">
          {formMode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button onClick={toggleMode} className="text-indigo-600 hover:underline">
                Register
              </button>
            </>
          ) : (
            <>
              Already registered?{" "}
              <button onClick={toggleMode} className="text-indigo-600 hover:underline">
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
