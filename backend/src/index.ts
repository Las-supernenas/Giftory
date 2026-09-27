import express from "express";

const api = express();
const PORT = 3000;

api.use(express.json());

api.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

api.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

api.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
