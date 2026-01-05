import express from "express";
import multer from "multer";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { PDFExtract } from "pdf.js-extract";

dotenv.config();

const app = express();
app.use(cors());
const upload = multer();
const pdfExtract = new PDFExtract();

app.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    const data = await pdfExtract.extractBuffer(req.file.buffer);
    const resumeText = data.pages
      .map((page) => page.content.map((item) => item.str).join(" "))
      .join("\n");
    const prompt = `You are an expert interview coach.

From the resume below:
1. Write a concise skills summary.
2. Generate 5 technical interview questions.
3. Generate 2 HR questions.

Resume:
${resumeText}`;

    const response = await axios.post(
      process.env.GROQ_API_URL,
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({
      result: response.data.choices[0].message.content,
    });
  } catch (err) {
    res.status(500).json({
      error: "Resume processing failed",
      details: err.response?.data || err.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
