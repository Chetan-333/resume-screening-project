"use client";

import { useState, useRef } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { ScanSearch, UploadCloud, X, FileText, Loader2, AlertCircle, RefreshCw, Trophy, Briefcase, Building2 } from "lucide-react";
import { screenResumes } from "../../lib/api";

export default function ScreeningPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [weights, setWeights] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    setError(null);
    const validTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    const validFiles = newFiles.filter(file => {
      if (validTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
        return true;
      }
      return false;
    });

    if (validFiles.length < newFiles.length) {
      setError("Some files were rejected. Only PDF and DOCX files are supported.");
    }

    // prevent duplicates by name
    const existingNames = files.map(f => f.name);
    const uniqueValidFiles = validFiles.filter(f => !existingNames.includes(f.name));

    setFiles(prev => [...prev, ...uniqueValidFiles]);
  };

  const removeFile = (fileName) => {
    setFiles(files.filter(f => f.name !== fileName));
  };

  const handleSubmit = async () => {
    if (!jobDescription.trim() || files.length === 0) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setWeights(null);

    try {
      const data = await screenResumes(jobDescription, files);
      setResults(data.results);
      setWeights(data.weights);
    } catch (err) {
      setError(err.message || "An unexpected error occurred during screening.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJobDescription("");
    setFiles([]);
    setResults(null);
    setWeights(null);
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
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="pb-12">
      <PageHeader
        title="Resume Screening"
        subtitle="Screen and rank resumes against a job description."
        action={
          results && (
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              New Screening
            </button>
          )
        }
      />
      
      {!results ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Area */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Job Details</h3>
              <div>
                <label htmlFor="job-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  rows={8}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Resumes</h3>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 border-neutral-300 dark:border-neutral-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}
                onDragOver={handleDragOver}
                onDrop={loading ? undefined : handleDrop}
                onClick={() => !loading && fileInputRef.current?.click()}
              >
                <UploadCloud className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium mb-1">Click or drag files to upload</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Supported formats: PDF, DOCX</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  multiple 
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map(file => (
                    <div key={file.name} className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">{file.name}</span>
                      </div>
                      <button 
                        onClick={() => removeFile(file.name)}
                        disabled={loading}
                        className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !jobDescription.trim() || files.length === 0}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Screening Resumes...
                </>
              ) : (
                <>
                  <ScanSearch className="w-5 h-5" />
                  Screen Resumes
                </>
              )}
            </button>
          </div>

          {/* Guidelines / Info Area (Visible when not screening) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                <ScanSearch className="w-5 h-5" />
                How it works
              </h3>
              <ul className="space-y-4 text-sm text-blue-800/80 dark:text-blue-300/80">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800/50 flex items-center justify-center flex-shrink-0 font-medium text-blue-900 dark:text-blue-300">1</div>
                  <p>Paste the full job description. The AI extracts key requirements, skills, and experience levels.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800/50 flex items-center justify-center flex-shrink-0 font-medium text-blue-900 dark:text-blue-300">2</div>
                  <p>Upload one or more candidate resumes in PDF or DOCX format.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800/50 flex items-center justify-center flex-shrink-0 font-medium text-blue-900 dark:text-blue-300">3</div>
                  <p>Our system analyzes each resume for semantic similarity and evaluates past work experience tier.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800/50 flex items-center justify-center flex-shrink-0 font-medium text-blue-900 dark:text-blue-300">4</div>
                  <p>Review the ranked results to identify your top candidates instantly.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Results Area */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Screening Complete</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Ranked {results.length} candidate{results.length !== 1 ? 's' : ''} based on job requirements.
              </p>
            </div>
            {weights && (
              <div className="flex gap-4 text-sm bg-neutral-50 dark:bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div><span className="text-neutral-500 dark:text-neutral-400">Similarity:</span> <span className="font-medium text-neutral-900 dark:text-white">{weights.similarity * 100}%</span></div>
                <div><span className="text-neutral-500 dark:text-neutral-400">Experience:</span> <span className="font-medium text-neutral-900 dark:text-white">{weights.experience * 100}%</span></div>
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <EmptyState 
              title="No results returned" 
              description="The backend successfully processed the request but returned no candidates." 
            />
          ) : (
            <div className="grid gap-4">
              {results.map((candidate, index) => {
                const scorePercentage = (candidate.score * 100).toFixed(1);
                const hasExperience = candidate.experience && candidate.experience.status === "scored";
                
                return (
                  <div key={candidate.filename} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 relative overflow-hidden transition-all hover:border-blue-300 dark:hover:border-blue-700">
                    {index === 0 && (
                      <div className="absolute top-0 right-0 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Top Match
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center justify-center sm:w-28 sm:border-r sm:border-neutral-100 sm:dark:border-neutral-800 pr-0 sm:pr-6">
                      <div className="text-3xl font-bold text-neutral-900 dark:text-white">{scorePercentage}%</div>
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">Match</div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        {candidate.filename}
                      </h4>
                      
                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800">
                          <ScanSearch className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                          <span>Similarity: <span className="font-medium text-neutral-900 dark:text-white">{(candidate.similarity * 100).toFixed(1)}%</span></span>
                        </div>
                        
                        {hasExperience ? (
                          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800">
                            <Briefcase className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                            <span>Exp Score: <span className="font-medium text-neutral-900 dark:text-white">{candidate.experience.score}/10</span></span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-950 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800">
                            <Briefcase className="w-4 h-4" />
                            <span className="italic">No exp. scored</span>
                          </div>
                        )}
                      </div>

                      {hasExperience && candidate.experience.best && (
                        <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                Best Experience: {candidate.experience.best.company} ({candidate.experience.best.tier})
                              </p>
                              <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-1">
                                {candidate.experience.best.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
