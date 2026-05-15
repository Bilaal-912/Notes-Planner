require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend (Vite will run on 5173)
    credentials: true,
  })
);
app.use(express.json()); // to read JSON body
app.use(morgan("dev"));

// Serve uploaded files (PDFs) from /uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
