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

app.post("/generate-cover-letter", upload.single("resume"), async (req, res) => {
  try {
    const { jobRole, companyName } = req.body;

    const data = await pdfExtract.extractBuffer(req.file.buffer);
    const resumeText = data.pages
      .map((page) => page.content.map((item) => item.str).join(" "))
      .join("\n");

    const prompt = `
You are a professional career assistant.

Using the resume below, generate a concise and professional cover letter.

Guidelines:
- Tailor the letter to the given job role and company
- Highlight relevant skills and experience from the resume
- Keep it within 3–4 short paragraphs
- Use a confident but natural tone

Job Role: ${jobRole}
Company: ${companyName}

Resume:
${resumeText}
`;

    const response = await axios.post(
      process.env.GROQ_API_URL,
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      coverLetter: response.data.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cover letter generation failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
