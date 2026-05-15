const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Note = require("../models/Note");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole"); // FIXED

const router = express.Router();

// Multer config for local file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// UPLOAD NOTE (teacher only)
router.post(
  "/",
  auth,                  // FIXED name
  requireRole("teacher"), 
  upload.single("file"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        semester,
        category,
        subject,
        tags,
        isPublic,
      } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const note = await Note.create({
        title,
        description,
        semester,
        category,
        subject,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        isPublic: isPublic === "false" ? false : true,
        filePath: req.file.path,
        originalFileName: req.file.originalname,
        owner: req.user.id,           // USE normalized id
      });

      res.status(201).json({ message: "Note uploaded", note });
    } catch (err) {
      console.error("Upload note error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// GET NOTES WITH FILTERS
router.get("/", auth, async (req, res) => {
  try {
    const { semester, category, subject, search } = req.query;

    const baseQuery = {
      $or: [
        { owner: req.user.id },  // user's own notes
        { isPublic: true },      // AND public notes
      ],
    };

    const filter = { ...baseQuery };

    if (semester) filter.semester = semester;
    if (category) filter.category = category;
    if (subject) filter.subject = subject;

    if (search) {
      filter.$and = [
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error("Get notes error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE NOTE (owner-only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ message: "Note not found" });

    // Compare with normalized id
    if (note.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Delete local file
    try {
      if (note.filePath) {
        fs.unlinkSync(note.filePath);
      }
    } catch (err) {
      console.warn("File deletion failed:", err.message);
    }

    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error("Delete note error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
