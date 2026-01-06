import { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  Briefcase,
  Building,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function ResumeHelper() {
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("analyze"); // "analyze" or "cover-letter"
  const [output, setOutput] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Cover letter fields
  const [jobRole, setJobRole] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Please upload a PDF file");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a resume file first");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await axios.post(`${API_URL}/analyze-resume`, formData);

      setOutput(res.data.result);
    } catch (err) {
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!file) {
      setError("Please select a resume file first");
      return;
    }
    if (!jobRole.trim()) {
      setError("Please enter a job role");
      return;
    }
    if (!companyName.trim()) {
      setError("Please enter a company name");
      return;
    }

    setLoading(true);
    setError("");
    setCoverLetter("");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobRole", jobRole);
      formData.append("companyName", companyName);

      const res = await axios.post(`${API_URL}/generate-cover-letter`, formData);
      setCoverLetter(res.data.coverLetter);
    } catch (err) {
      setError(
        err.message || "Failed to generate cover letter. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Resume Helper
          </h1>
          <p className="text-gray-600">
            Analyze your resume and generate tailored cover letters
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setActiveTab("analyze");
              setError("");
            }}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "analyze"
                ? "bg-white text-blue-600 shadow-lg"
                : "bg-white/50 text-gray-600 hover:bg-white/80"
            }`}
          >
            <FileText className="w-5 h-5" />
            Resume Analysis
          </button>
          <button
            onClick={() => {
              setActiveTab("cover-letter");
              setError("");
            }}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "cover-letter"
                ? "bg-white text-blue-600 shadow-lg"
                : "bg-white/50 text-gray-600 hover:bg-white/80"
            }`}
          >
            <Mail className="w-5 h-5" />
            Cover Letter Generator
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div
            className={`relative border-3 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="file-upload"
            />

            <div className="pointer-events-none">
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setOutput("");
                      setCoverLetter("");
                    }}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium pointer-events-auto"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF files only, up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cover Letter Input Fields */}
          {activeTab === "cover-letter" && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4" />
                  Job Role
                </label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g., Full Stack Developer, Product Manager"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Building className="w-4 h-4" />
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Google, Microsoft, Amazon"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={
              activeTab === "analyze"
                ? handleAnalyze
                : handleGenerateCoverLetter
            }
            disabled={!file || loading}
            className={`w-full mt-6 py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              !file || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {activeTab === "analyze"
                  ? "Analyzing Resume..."
                  : "Generating Cover Letter..."}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {activeTab === "analyze"
                  ? "Analyze Resume"
                  : "Generate Cover Letter"}
              </>
            )}
          </button>
        </div>

        {/* Output Area - Resume Analysis */}
        {output && activeTab === "analyze" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-linear-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Analysis Results
              </h2>
            </div>

            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans bg-gray-50 p-6 rounded-xl border border-gray-200">
                {output}
              </pre>
            </div>

            <button
              onClick={() => copyToClipboard(output)}
              className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

        {/* Output Area - Cover Letter */}
        {coverLetter && activeTab === "cover-letter" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-linear-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Your Cover Letter
              </h2>
            </div>

            <div className="bg-linear-to-br from-gray-50 to-blue-50 p-8 rounded-xl border border-gray-200">
              <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">
                {coverLetter}
              </pre>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => copyToClipboard(coverLetter)}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Copy Cover Letter
              </button>
              <button
                onClick={() => {
                  setCoverLetter("");
                  setJobRole("");
                  setCompanyName("");
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Generate New
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
