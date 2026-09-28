"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "../../components/PageHeader";
import { 
  FilePlus2, 
  Loader2, 
  AlertCircle, 
  Download,
  LayoutTemplate,
  Wand2,
  ChevronRight
} from "lucide-react";
import { getTemplates, generateResume } from "../../lib/api";

export default function BuildPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setLoading(true);
        const data = await getTemplates();
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          setSelectedTemplate(data.templates[0]);
          
          // Initialize answers state
          const initialAnswers = {};
          data.templates[0].questions.forEach(q => {
            initialAnswers[q.key] = "";
          });
          setAnswers(initialAnswers);
        }
      } catch (err) {
        setError("Failed to load resume templates. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    // Keep existing answers, but add missing keys
    const newAnswers = { ...answers };
    template.questions.forEach(q => {
      if (!(q.key in newAnswers)) {
        newAnswers[q.key] = "";
      }
    });
    setAnswers(newAnswers);
  };

  const handleInputChange = (key, value) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setGenerating(true);
    setError(null);

    try {
      const blob = await generateResume(selectedTemplate.id, answers);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      setError(err.message || "Failed to generate resume.");
    } finally {
      setGenerating(false);
    }
  };

  const renderInput = (question) => {
    const value = answers[question.key] || "";
    const commonClasses = "w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow";
    
    switch(question.type) {
      case "textarea":
        return (
          <textarea
            id={question.key}
            rows={4}
            required={question.required}
            placeholder={question.placeholder || ""}
            className={`${commonClasses} resize-none`}
            value={value}
            onChange={(e) => handleInputChange(question.key, e.target.value)}
          />
        );
      case "list":
        return (
          <textarea
            id={question.key}
            rows={5}
            required={question.required}
            placeholder={question.placeholder || "One entry per line..."}
            className={`${commonClasses} resize-none font-mono text-xs`}
            value={value}
            onChange={(e) => handleInputChange(question.key, e.target.value)}
          />
        );
      case "text":
      default:
        return (
          <input
            id={question.key}
            type="text"
            required={question.required}
            placeholder={question.placeholder || ""}
            className={commonClasses}
            value={value}
            onChange={(e) => handleInputChange(question.key, e.target.value)}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-neutral-500">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 h-full flex flex-col">
      <PageHeader
        title="Build Resume"
        subtitle="Create a professional resume with AI-assisted generation."
        action={
          pdfUrl && (
            <a 
              href={pdfUrl}
              download="resume.pdf"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          )
        }
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start flex-1 min-h-0">
        
        {/* Left Side: Form */}
        <div className="xl:col-span-5 flex flex-col gap-6 h-full">
          
          {/* Template Selector */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-neutral-500" />
              Select Template
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateChange(template)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border text-left transition-all ${
                    selectedTemplate?.id === template.id
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300 ring-1 ring-blue-600"
                      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
            {selectedTemplate && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 pl-1">
                {selectedTemplate.description}
              </p>
            )}
          </div>

          {/* Questions Form */}
          <form id="resume-form" onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm overflow-y-auto flex-1 max-h-[800px]">
            <div className="space-y-6">
              {selectedTemplate?.questions.map((question) => (
                <div key={question.key}>
                  <label htmlFor={question.key} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 flex justify-between items-end">
                    <span>{question.label} {question.required && <span className="text-red-500">*</span>}</span>
                    {!question.required && <span className="text-xs text-neutral-400 font-normal">Optional</span>}
                  </label>
                  {renderInput(question)}
                </div>
              ))}
            </div>
          </form>

          {/* Submit Button */}
          <button
            type="submit"
            form="resume-form"
            disabled={generating || !selectedTemplate}
            className="w-full py-3.5 px-4 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Resume...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Resume
              </>
            )}
          </button>
        </div>

        {/* Right Side: Preview */}
        <div className="xl:col-span-7 h-full min-h-[600px] xl:min-h-0 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col relative shadow-inner">
          {pdfUrl ? (
            <iframe 
              src={`${pdfUrl}#toolbar=0`} 
              className="w-full h-full min-h-[800px] border-none bg-neutral-200 dark:bg-neutral-800"
              title="Resume Preview"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 dark:text-neutral-500">
              <FilePlus2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">No Preview Available</p>
              <p className="text-sm mt-2 max-w-sm">
                Fill out the form on the left and click "Generate Resume" to see your AI-crafted PDF here.
              </p>
            </div>
          )}
          
          {generating && (
            <div className="absolute inset-0 bg-white/60 dark:bg-neutral-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="text-neutral-900 dark:text-white font-medium">Crafting your resume...</p>
              <p className="text-sm text-neutral-500 mt-1 max-w-xs text-center">AI is structuring and formatting your responses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
