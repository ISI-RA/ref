import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Sparkles, Check, RefreshCw } from 'lucide-react';
import { Resume } from '../types';
import { GoogleDriveLoader } from './GoogleDriveLoader';

interface UploaderProps {
  onParsed: (resume: Resume) => void;
}

export const ResumeUploader: React.FC<UploaderProps> = ({ onParsed }) => {
  const [activeImportTab, setActiveImportTab] = useState<'manual' | 'drive'>('manual');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    setLoading(true);

    try {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.txt')) {
        throw new Error('Only PDF and .txt files are supported directly. Please copy-paste your text resume using the direct input block below.');
      }

      setLoadingStep('Reading file data...');
      
      const fileReader = new FileReader();

      if (file.name.endsWith('.txt')) {
        fileReader.onload = async (e) => {
          const text = e.target?.result as string;
          await sendParseRequest({ rawText: text });
        };
        fileReader.readAsText(file);
      } else {
        // PDF: Convert to base64 for Gemini multimodal input!
        fileReader.onload = async (e) => {
          const result = e.target?.result as string;
          // Extract base64 part
          const base64Data = result.split(',')[1];
          await sendParseRequest({ fileType: 'pdf', fileData: base64Data });
        };
        fileReader.readAsDataURL(file);
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading. Please copy-paste your text resume instead.');
      setLoading(false);
    }
  };

  const sendParseRequest = async (payload: { fileType?: string; fileData?: string; rawText?: string }) => {
    try {
      setLoadingStep('Contacting Gemini AI parsing model...');
      
      // Artificial slight delay for dramatic and polished UX state transitions (0.5s each)
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoadingStep('Gemini AI extracting structured JSON entities (Experience, Education, Skills)...');
      
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server parsing request failed.');
      }

      const data = await response.json();
      
      setLoadingStep('Synthesizing professional styles...');
      await new Promise(resolve => setTimeout(resolve, 600));

      if (data.parsed) {
        onParsed(data.parsed);
      } else {
        throw new Error('Could not parse resume format. Try copy-pasting your resume text description.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'The parser encountered an issue. Copy-pasting your resume text inside the text block usually fits beautifully.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    setLoading(true);
    await sendParseRequest({ rawText: rawText.trim() });
  };

  const triggerSearchSample = () => {
    // Fill sample structure to let them test instantly if they don't have a resume nearby!
    const sampleResume: Resume = {
      name: "Sophia Rodriguez",
      title: "Senior Product Designer",
      summary: "I build responsive, beautiful, and accessible web experiences. Guided by a decade of deep user experience strategy, design systems, and rapid interactive prototyping for SaaS architectures.",
      experience: [
        {
          id: "exp1",
          company: "Vortex Labs",
          role: "Senior UX Architect",
          startDate: "Jan 2023",
          endDate: "Present",
          description: "Led a design team of 4 to overhaul standard workflow metrics dashboards. Converted custom dashboards to standard Tailwind CSS units, elevating usability benchmarks by 32%."
        },
        {
          id: "exp2",
          company: "CloudVibe",
          role: "Lead Software Designer",
          startDate: "Aug 2020",
          endDate: "Dec 2022",
          description: "Created collaborative canvas utilities enabling fluid design-to-production pipelines, achieving a 45% decrease in developer handoff timelines."
        }
      ],
      education: [
        {
          id: "edu1",
          institution: "Savannah College of Art and Design",
          degree: "B.F.A. in Interactive Design & Game Development",
          startDate: "2016",
          endDate: "2020"
        }
      ],
      skills: ["Figma", "React", "State Machines", "Tailwind CSS", "A/B Testing", "CSS Grid", "Interactions"],
      links: {
        email: "sophia.rod@example.com",
        github: "github.com/sophia-codes",
        linkedin: "linkedin.com/in/sophia-rod",
        portfolio: "sophia.design"
      },
      projects: [
        {
          id: "p1",
          title: "Sunder UI Kit",
          description: "An open-source accessible design token library built for React designers, currently logging 2,500 monthly downloads.",
          url: "sunderui.example.com",
          techStack: ["React", "Typescript", "Tailwind", "CSS Grid"]
        }
      ]
    };
    onParsed(sampleResume);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Tab Selectors */}
      <div className="flex justify-center bg-slate-900/60 p-1 rounded-2xl max-w-xs mx-auto border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveImportTab('manual')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeImportTab === 'manual'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          File / Text Paste
        </button>
        <button
          type="button"
          onClick={() => setActiveImportTab('drive')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeImportTab === 'drive'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-3.5 h-3.5 shrink-0 block">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          <span>Drive Import</span>
        </button>
      </div>

      {activeImportTab === 'drive' ? (
        <GoogleDriveLoader onParsed={onParsed} />
      ) : (
        <>
          {/* Upload card container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white shadow-sm ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/40'
                : 'border-slate-200 hover:border-slate-400'
            } ${loading ? 'opacity-80 pointer-events-none' : ''}`}
          >
            <input
              type="file"
              id="resume-file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              disabled={loading}
            />

            {loading ? (
              <div className="py-8 space-y-4 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <Sparkles className="w-5 h-5 text-indigo-500 absolute -top-1.5 -right-1.5 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-slate-800 animate-pulse">Processing Resume</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-mono bg-slate-50 border px-3 py-1.5 rounded-lg">
                    {loadingStep}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">Upload your Resume</h3>
                  <p className="text-sm text-slate-500">
                    Drag & drop your <span className="font-semibold text-slate-700">PDF</span> or <span className="font-semibold text-slate-700">TXT</span> file here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold underline transition-colors"
                    >
                      browse files
                    </button>
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  For security, files are parsed server-side using Gemini AI and are never shared publicly.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-left text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <div className="space-y-1">
                  <p className="font-bold">Parsing failed</p>
                  <p className="text-xs leading-relaxed text-red-600/90">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Alternative or Pasting block */}
          {!loading && (
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowPasteArea(!showPasteArea)}
                  className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 hover:text-slate-800 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {showPasteArea ? 'Hide Text Input' : 'Or Paste LinkedIn Profile / Docx Text Directly'}
                </button>

                <button
                  type="button"
                  onClick={triggerSearchSample}
                  className="text-xs bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-100 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Build instantly with Demo Resume
                </button>
              </div>

              {showPasteArea && (
                <form onSubmit={handlePasteSubmit} className="space-y-3 pt-2">
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste whole sections of your resume, LinkedIn summary, or TXT contents here..."
                    rows={6}
                    required
                    className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!rawText.trim()}
                    className="w-full text-xs bg-slate-900 text-white font-bold py-2 rounded-xl hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    Parse Clipboard Text with Gemini
                  </button>
                </form>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
