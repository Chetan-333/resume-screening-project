"use client";

import { useState, useRef } from "react";
import { PageHeader } from "../../components/PageHeader";
import { 
  Sparkles, 
  UploadCloud, 
  X, 
  FileText, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  ArrowUpCircle,
  Lightbulb
} from "lucide-react";
import { analyzeResume } from "../../lib/api";

export default function ImprovePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    setError(null);
    const validTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.pdf') || selectedFile.name.endsWith('.docx')) {
      setFile(selectedFile);
    } else {
      setError("Unsupported file format. Only PDF and DOCX files are accepted.");
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!jobDescription.trim() || !file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeResume(jobDescription, file);
      setResult(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJobDescription("");
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="pb-12">
      <PageHeader
        title="Improve Resume"
        subtitle="Analyze your resume against a job description to identify areas for improvement."
        action={
          result && (
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Analyze Another
            </button>
          )
        }
      />
      
      {!result ? (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-sm">
            
            <div className="space-y-6">
              <div>
                <label htmlFor="job-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  rows={6}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow"
                  placeholder="Paste the target job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Your Resume
                </label>
                
                {!file ? (
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 border-neutral-300 dark:border-neutral-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}
                    onDragOver={handleDragOver}
                    onDrop={loading ? undefined : handleDrop}
                    onClick={() => !loading && fileInputRef.current?.click()}
                  >
                    <UploadCloud className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium mb-1">Click or drag a file to upload</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Supported formats: PDF, DOCX (Max 1 file)</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">{file.name}</p>
                        <p className="text-xs text-blue-700/70 dark:text-blue-400/70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={removeFile}
                      disabled={loading}
                      className="text-blue-400 hover:text-red-500 transition-colors p-2"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={handleSubmit}
                disabled={loading || !jobDescription.trim() || !file}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Resume
                  </>
                )}
              </button>
              {loading && (
                <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                  This may take a few seconds as the AI reads and evaluates your resume.
                </p>
              )}
            </div>
            
          </div>
        </div>
      ) : (
        /* Results Area */
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 border-4 border-blue-100 dark:border-blue-900/50">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {(result.score * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Overall Match</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
                {result.summary}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Strengths
              </h4>
              {result.strengths && result.strengths.length > 0 ? (
                <ul className="space-y-3">
                  {result.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500 italic">No specific strengths highlighted.</p>
              )}
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                <ArrowUpCircle className="w-5 h-5 text-orange-500" />
                Improvements
              </h4>
              {result.improvements && result.improvements.length > 0 ? (
                <ul className="space-y-3">
                  {result.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500 italic">No specific improvements highlighted.</p>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6 flex items-start gap-4">
            <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">Next Steps</h4>
              <p className="text-sm text-blue-800/80 dark:text-blue-300/80 mt-1">
                Apply these actionable improvements to your resume document to increase your match percentage and stand out to recruiters. Once updated, you can analyze it again to check your progress.
              </p>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
