const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    semester: { type: String, required: true }, // e.g. "Sem 3"
    category: { type: String, required: true }, // "IA1", "IA2", "EndSem"
    subject: { type: String, required: true },
    tags: [{ type: String }],

    filePath: { type: String, required: true },       // local path in uploads/
    originalFileName: { type: String, required: true },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublic: { type: Boolean, default: true }, // sharing permission
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
