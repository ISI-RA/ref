import React, { useState } from 'react';
import { Portfolio, Resume, ExperienceItem, EducationItem, ProjectItem, ThemeColorId, TemplateId } from '../types';
import {
  Sparkles, Check, ChevronUp, ChevronDown, Plus, Trash2, ArrowLeft, Eye, EyeOff, GripVertical, Layers, Monitor, Smartphone, Tablet, Paintbrush, FileCode, CheckCircle, Lock, Edit3
} from 'lucide-react';
import { THEME_PALETTES } from './PortfolioPreviews';

interface EditorProps {
  portfolio: Portfolio;
  onChange: (updated: Portfolio) => void;
  onPublish: () => void;
  onBack: () => void;
  onUpgradeRequest?: () => void;
}

const COLOR_OPTIONS: { id: ThemeColorId; name: string; color: string }[] = [
  { id: 'slate-graphite', name: 'Slate Graphite', color: 'bg-slate-800' },
  { id: 'royal-indigo', name: 'Royal Indigo', color: 'bg-indigo-600' },
  { id: 'emerald', name: 'Emerald Forest', color: 'bg-emerald-600' },
  { id: 'terracotta-warm', name: 'Terracotta Warm', color: 'bg-orange-750' },
  { id: 'nordic-sea', name: 'Nordic Sea', color: 'bg-cyan-500' },
  { id: 'cyber-neon', name: 'Cyber Neon', color: 'bg-indigo-900 border border-purple-500 shadow-md shadow-purple-500/10' },
  { id: 'amber-gold', name: 'Solar Gold', color: 'bg-amber-500' },
];

const TEMPLATE_OPTIONS: { id: TemplateId; name: string; desc: string; premium: boolean }[] = [
  { id: 'creators-warmth', name: "Creator's Warmth", desc: "Warm elements, modern curves & rich sidebar stack", premium: false },
  { id: 'slate-minimal', name: 'Slate Minimal', desc: 'Monospace touches, high grid lines, developer-friendly', premium: false },
  { id: 'nordic-sky', name: 'Nordic Serene', desc: 'Serene slate-cyan accents, minimal clean layout', premium: false },
  { id: 'modern-serif', name: 'Modern Serif', desc: 'Georgia-styled elegant display headings & editorial flow', premium: false },
  { id: 'neo-brutalist', name: 'Neo-Brutalist', desc: 'Offset solids, thick black grids, witty interactive frames', premium: true },
  { id: 'cyber-future', name: 'Cyberpunk Terminal', desc: 'Hacker typography, glowing matrix terminal details', premium: true },
];

export const PortfolioEditor: React.FC<EditorProps> = ({ portfolio, onChange, onPublish, onBack, onUpgradeRequest }) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'publishing'>('content');
  const [enhancing, setEnhancing] = useState(false);
  const [aiDirective, setAiDirective] = useState('');
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Supabase Status State variables
  const [supabaseStatus, setSupabaseStatus] = useState<{
    configured: boolean;
    connected: boolean;
    tableExists: boolean;
    error?: string;
    sql?: string;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchSupabaseStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/supabase-status');
      const data = await res.json();
      setSupabaseStatus(data);
    } catch (e) {
      console.error("Failed to load Supabase status", e);
    } finally {
      setLoadingStatus(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'publishing') {
      fetchSupabaseStatus();
    }
  }, [activeTab]);

  const { resumeData, themeColor, templateId } = portfolio;
  const isPremiumTemplate = TEMPLATE_OPTIONS.find((t) => t.id === templateId)?.premium || false;

  // Handle nested updates for safety
  const updateResumeField = (updater: (prev: Resume) => Resume) => {
    onChange({
      ...portfolio,
      resumeData: updater(resumeData),
    });
  };

  const handleTextChange = (field: keyof Resume, value: any) => {
    updateResumeField((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLinksChange = (key: string, value: string) => {
    updateResumeField((prev) => ({
      ...prev,
      links: { ...prev.links, [key]: value },
    }));
  };

  // List operations
  const moveItem = (field: 'experience' | 'education' | 'projects', index: number, direction: 'up' | 'down') => {
    updateResumeField((prev) => {
      const list = [...(prev[field] as any[])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;

      // Swap
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;

      return { ...prev, [field]: list };
    });
  };

  const deleteItem = (field: 'experience' | 'education' | 'projects', index: number) => {
    updateResumeField((prev) => {
      const list = [...(prev[field] as any[])];
      list.splice(index, 1);
      return { ...prev, [field]: list };
    });
  };

  const addExperience = () => {
    updateResumeField((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: `exp_${Date.now()}`,
          company: 'New Company',
          role: 'Professional Role',
          startDate: '2024',
          endDate: 'Present',
          description: 'Type details of accomplishments...',
        },
      ],
    }));
  };

  const addEducation = () => {
    updateResumeField((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: `edu_${Date.now()}`,
          institution: 'Institution Name',
          degree: 'Degree / Certificate',
          startDate: '2020',
          endDate: '2024',
        },
      ],
    }));
  };

  const addProject = () => {
    updateResumeField((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: `proj_${Date.now()}`,
          title: 'Awesome Side Initiative',
          description: 'Explain what you constructed, engineered, or designed.',
          url: '',
          techStack: ['React', 'TypeScript'],
        },
      ],
    }));
  };

  const handleSkillChange = (index: number, val: string) => {
    updateResumeField((prev) => {
      const s = [...prev.skills];
      s[index] = val;
      return { ...prev, skills: s };
    });
  };

  const addSkill = () => {
    updateResumeField((prev) => ({
      ...prev,
      skills: [...prev.skills, 'New Skill'],
    }));
  };

  const removeSkill = (index: number) => {
    updateResumeField((prev) => {
      const s = [...prev.skills];
      s.splice(index, 1);
      return { ...prev, skills: s };
    });
  };

  // Get sectionsConfig or fall back to default
  const sectionsConfig = portfolio.sectionsConfig || [
    { id: 'skills', title: 'Technical Stack', visible: true, type: 'skills' },
    { id: 'experience', title: 'Work History', visible: true, type: 'experience' },
    { id: 'projects', title: 'Featured Projects', visible: true, type: 'projects' },
    { id: 'education', title: 'Education', visible: true, type: 'education' },
  ];

  const updateSectionsConfig = (newConfig: typeof sectionsConfig) => {
    onChange({
      ...portfolio,
      sectionsConfig: newConfig,
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sectionsConfig.length) return;
    const newConfig = [...sectionsConfig];
    const temp = newConfig[index];
    newConfig[index] = newConfig[nextIndex];
    newConfig[nextIndex] = temp;
    updateSectionsConfig(newConfig);
  };

  const toggleSectionVisibility = (id: string) => {
    const newConfig = sectionsConfig.map((sect) =>
      sect.id === id ? { ...sect, visible: !sect.visible } : sect
    );
    updateSectionsConfig(newConfig);
  };

  const changeSectionTitle = (id: string, newTitle: string) => {
    const newConfig = sectionsConfig.map((sect) =>
      sect.id === id ? { ...sect, title: newTitle } : sect
    );
    updateSectionsConfig(newConfig);
  };

  const changeCustomSectionContent = (id: string, newContent: string) => {
    const newConfig = sectionsConfig.map((sect) =>
      sect.id === id ? { ...sect, customContent: newContent } : sect
    );
    updateSectionsConfig(newConfig);
  };

  const addCustomSection = () => {
    const id = `custom_${Date.now()}`;
    const newSect = {
      id,
      title: 'New Custom Section',
      visible: true,
      type: 'custom' as const,
      customContent: 'Write your custom content here...',
    };
    updateSectionsConfig([...sectionsConfig, newSect]);
  };

  const deleteCustomSection = (id: string) => {
    const newConfig = sectionsConfig.filter((sect) => sect.id !== id);
    updateSectionsConfig(newConfig);
  };

  // AI copywriting enhance trigger
  const triggerAiEnhancement = async () => {
    setEnhancing(true);
    setAiSuccessMessage(null);
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resumeData,
          specInstruction: aiDirective,
        }),
      });

      if (!response.ok) {
        throw new Error('AI enhancement network call failed.');
      }

      const resData = await response.json();
      if (resData.enhanced) {
        // Update
        onChange({
          ...portfolio,
          resumeData: resData.enhanced,
        });
        setAiSuccessMessage('Gemini AI successfully refined and polished your copywriting!');
        setAiDirective('');
        setTimeout(() => setAiSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error(err);
      alert('AI rewriting failed. Please ensure GEMINI_API_KEY is configured.');
    } finally {
      setEnhancing(false);
    }
  };

  // Premium guard helper
  const selectTemplate = (tid: TemplateId, isPremium: boolean) => {
    // Allow free users to select premium templates as a live DEMO!
    onChange({
      ...portfolio,
      templateId: tid,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Workspace Header */}
      <header className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 sticky top-0 z-40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all shadow"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>Builder Workspace</span>
              {portfolio.isPro && (
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-sans text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                  Pro Active
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-xs font-mono">folio.so/{portfolio.username}</p>
          </div>
        </div>

        {/* Top interactive device selector */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-lg transition-all ${
              device === 'desktop' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded-lg transition-all ${
              device === 'tablet' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-lg transition-all ${
              device === 'mobile' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!portfolio.isPro && (
            <button
              onClick={() => {
                if (onUpgradeRequest) {
                  onUpgradeRequest();
                } else {
                  onChange({ ...portfolio, isPro: true });
                }
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all text-center flex items-center gap-1"
            >
              <Lock className="w-3 h-3 fill-slate-950" />
              Go Pro
            </button>
          )}

          <button
            onClick={() => {
              const selectedTpl = TEMPLATE_OPTIONS.find((t) => t.id === portfolio.templateId);
              if (selectedTpl?.premium && !portfolio.isPro) {
                if (onUpgradeRequest) {
                  onUpgradeRequest();
                } else {
                  alert('This style is premium. Please upgrade to Pro to publish live with this template.');
                }
              } else {
                onPublish();
              }
            }}
            className="px-5 py-2 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95 transition-all outline-none"
          >
            Publish Live
          </button>
        </div>
      </header>

      {/* Main split work-desk */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Control Board: Col 5 */}
        <div className="lg:col-span-5 border-r border-slate-800 bg-slate-950/80 flex flex-col h-full z-10 overflow-y-auto lg:max-h-[calc(100vh-73px)]">
          {/* Sub Navigation Panel tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950 sticky top-0 z-20">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-3 text-center text-xs font-extrabold border-b-2 transition-all ${
                activeTab === 'content'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Content Fields
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`flex-1 py-3 text-center text-xs font-extrabold border-b-2 transition-all ${
                activeTab === 'design'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Theme & Style
            </button>
            <button
              onClick={() => setActiveTab('publishing')}
              className={`flex-1 py-3 text-center text-xs font-extrabold border-b-2 transition-all ${
                activeTab === 'publishing'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Hosting Domain
            </button>
          </div>

          <div className="p-6 space-y-8 flex-1">
            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <div className="space-y-8">
                {/* AI Copywriting Center block */}
                <div className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-indigo-900 p-4 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 p-3 opacity-15">
                    <Sparkles className="w-16 h-16 text-indigo-300 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                      Generative AI
                    </span>
                    <h3 className="text-sm font-black text-white">AI Copywriting Enhancer</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Let Gemini rewrite bullet points into metric accomplishments, create headline tags, or change wording style.
                  </p>

                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={aiDirective}
                      onChange={(e) => setAiDirective(e.target.value)}
                      placeholder='E.g. "Focus on technical depth and cloud metrics" or "Keep it startup-focused"'
                      className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={triggerAiEnhancement}
                      disabled={enhancing}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      {enhancing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Polishing copy...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                          <span>Rewrite Resume with Gemini</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiSuccessMessage && (
                    <div className="mt-2 text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2 rounded-lg flex items-center gap-2">
                       <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                       <span>{aiSuccessMessage}</span>
                    </div>
                  )}
                </div>

                {/* Custom Sections Layout & Drag Sort Manager */}
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        <span>Interactive Section Manager</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Design section stack. Rearrange index weights, toggle eyes, or insert custom blocks.</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {sectionsConfig.map((sect, index) => {
                      return (
                        <div key={sect.id} className="flex flex-col gap-2 p-3 bg-slate-950 border border-slate-850 rounded-xl hover:border-slate-800 transition-colors">
                          <div className="flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {/* Grip Indicator handle */}
                              <div className="flex flex-col text-slate-500 hover:text-slate-300">
                                <button
                                  type="button"
                                  onClick={() => moveSection(index, 'up')}
                                  disabled={index === 0}
                                  className="p-0.5 rounded hover:bg-slate-900 disabled:opacity-20 text-slate-500 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveSection(index, 'down')}
                                  disabled={index === sectionsConfig.length - 1}
                                  className="p-0.5 rounded hover:bg-slate-900 disabled:opacity-20 text-slate-500 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-slate-400 font-mono text-xs font-bold leading-none shrink-0 w-4">
                                #{index + 1}
                              </div>

                              {/* Section Title Input */}
                              <input
                                type="text"
                                value={sect.title}
                                onChange={(e) => changeSectionTitle(sect.id, e.target.value)}
                                className="bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded px-2.5 py-1 text-xs text-white font-bold w-full max-w-[140px] sm:max-w-[200px]"
                                placeholder="Section Display Title"
                              />

                              <span className="text-[9px] font-mono font-semibold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded uppercase hidden sm:inline-block shrink-0">
                                {sect.type}
                              </span>
                            </div>

                            {/* Actions: Visibility & Delete */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleSectionVisibility(sect.id)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  sect.visible
                                    ? 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400'
                                    : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
                                }`}
                                title={sect.visible ? 'Hide section' : 'Show section'}
                              >
                                {sect.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>

                              {sect.type === 'custom' && (
                                <button
                                  type="button"
                                  onClick={() => deleteCustomSection(sect.id)}
                                  className="p-1.5 rounded-lg border border-red-950/40 bg-red-950/20 text-red-400 hover:bg-red-950/50 hover:text-white transition-all cursor-pointer"
                                  title="Delete Section"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Custom section body */}
                          {sect.type === 'custom' && (
                            <div className="mt-1 space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">Custom Content Body</label>
                              <textarea
                                value={sect.customContent || ''}
                                onChange={(e) => changeCustomSectionContent(sect.id, e.target.value)}
                                placeholder="Write extra qualifications, hobbies, certificates, custom bio, etc..."
                                rows={3}
                                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-850 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={addCustomSection}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-dashed border-slate-800 hover:border-indigo-500/50 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Custom Section</span>
                  </button>
                </div>

                {/* General Header Fields */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                    Header Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.name}
                        onChange={(e) => handleTextChange('name', e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-850 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Title headline</label>
                      <input
                        type="text"
                        value={resumeData.title}
                        onChange={(e) => handleTextChange('title', e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-850 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Summary & Bio</label>
                    </div>
                    <textarea
                      value={resumeData.summary}
                      onChange={(e) => handleTextChange('summary', e.target.value)}
                      rows={4}
                      className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-850 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Professional Links */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                    Links & Profiles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono">Email Address</span>
                      <input
                        type="text"
                        value={resumeData.links?.email || ''}
                        onChange={(e) => handleLinksChange('email', e.target.value)}
                        className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-850 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono">GitHub Link</span>
                      <input
                        type="text"
                        value={resumeData.links?.github || ''}
                        onChange={(e) => handleLinksChange('github', e.target.value)}
                        className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-850 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono">LinkedIn Profile</span>
                      <input
                        type="text"
                        value={resumeData.links?.linkedin || ''}
                        onChange={(e) => handleLinksChange('linkedin', e.target.value)}
                        className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-850 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono">Website</span>
                      <input
                        type="text"
                        value={resumeData.links?.portfolio || ''}
                        onChange={(e) => handleLinksChange('portfolio', e.target.value)}
                        className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-850 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Experience array list editor */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                      Employment Log
                    </h4>
                    <button
                      onClick={addExperience}
                      className="text-xs text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  <div className="space-y-4">
                    {resumeData.experience.map((exp, index) => (
                      <div key={exp.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 relative group">
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveItem('experience', index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveItem('experience', index, 'down')}
                            disabled={index === resumeData.experience.length - 1}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteItem('experience', index)}
                            className="p-1 rounded bg-red-950/40 text-red-400 hover:bg-red-950 hover:text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 pt-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono">Company</span>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => {
                                const list = [...resumeData.experience];
                                list[index].company = e.target.value;
                                handleTextChange('experience', list);
                              }}
                              className="w-full text-xs p-2 bg-slate-950 rounded text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono">Role</span>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => {
                                const list = [...resumeData.experience];
                                list[index].role = e.target.value;
                                handleTextChange('experience', list);
                              }}
                              className="w-full text-xs p-2 bg-slate-950 rounded text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono">Start Date</span>
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => {
                                const list = [...resumeData.experience];
                                list[index].startDate = e.target.value;
                                handleTextChange('experience', list);
                              }}
                              className="w-full text-xs p-2 bg-slate-950 rounded text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono">End Date</span>
                            <input
                              type="text"
                              value={exp.endDate}
                              onChange={(e) => {
                                const list = [...resumeData.experience];
                                list[index].endDate = e.target.value;
                                handleTextChange('experience', list);
                              }}
                              className="w-full text-xs p-2 bg-slate-950 rounded text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-mono">Activity summary / description</span>
                          <textarea
                            value={exp.description}
                            rows={3}
                            onChange={(e) => {
                              const list = [...resumeData.experience];
                              list[index].description = e.target.value;
                              handleTextChange('experience', list);
                            }}
                            className="w-full text-xs p-2 bg-slate-950 rounded text-slate-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills configuration with badge tag style */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                      Tech Skills
                    </h4>
                    <button
                      onClick={addSkill}
                      className="text-xs text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Core
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1 bg-slate-900 border border-slate-800 pl-2 pr-1 py-1 rounded-lg">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => handleSkillChange(index, e.target.value)}
                          className="w-20 bg-transparent text-xs text-white border-none outline-none focus:ring-0 p-0"
                        />
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-slate-500 hover:text-red-400 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                      Key Projects
                    </h4>
                    <button
                      onClick={addProject}
                      className="text-xs text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Project
                    </button>
                  </div>

                  <div className="space-y-4">
                    {resumeData.projects && resumeData.projects.map((proj, index) => (
                      <div key={proj.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 relative group">
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveItem('projects', index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded bg-slate-800 text-slate-400"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveItem('projects', index, 'down')}
                            disabled={index === resumeData.projects.length - 1}
                            className="p-1 rounded bg-slate-800 text-slate-400"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteItem('projects', index)}
                            className="p-1 rounded bg-red-950/40 text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3 pt-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 font-mono">Project Name</span>
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => {
                                  const list = [...resumeData.projects];
                                  list[index].title = e.target.value;
                                  handleTextChange('projects', list);
                                }}
                                className="w-full text-xs p-2 bg-slate-950 rounded text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 font-mono">Demo URL / Repository</span>
                              <input
                                type="text"
                                value={proj.url || ''}
                                onChange={(e) => {
                                  const list = [...resumeData.projects];
                                  list[index].url = e.target.value;
                                  handleTextChange('projects', list);
                                }}
                                className="w-full text-xs p-2 bg-slate-950 rounded text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono">Elevator Pitch</span>
                            <textarea
                              value={proj.description}
                              rows={2}
                              onChange={(e) => {
                                const list = [...resumeData.projects];
                                list[index].description = e.target.value;
                                handleTextChange('projects', list);
                              }}
                              className="w-full text-xs p-2 bg-slate-950 rounded text-slate-300"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono">Tools used (comma separated)</span>
                            <input
                              type="text"
                              value={proj.techStack?.join(', ') || ''}
                              onChange={(e) => {
                                const list = [...resumeData.projects];
                                list[index].techStack = e.target.value.split(',').map((x) => x.trim()).filter(Boolean);
                                handleTextChange('projects', list);
                              }}
                              className="w-full text-xs p-2 bg-slate-950 rounded text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                      Credentials / Education
                    </h4>
                    <button
                      onClick={addEducation}
                      className="text-xs text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  <div className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 relative group">
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => deleteItem('education', index)}
                            className="p-1 rounded bg-red-950/40 text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3 pt-3">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono">Institution / School</span>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => {
                                const list = [...resumeData.education];
                                list[index].institution = e.target.value;
                                handleTextChange('education', list);
                              }}
                              className="w-full text-xs p-2 bg-slate-950 rounded text-white"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2 space-y-1">
                              <span className="text-[10px] text-slate-400 font-mono">Degree</span>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => {
                                  const list = [...resumeData.education];
                                  list[index].degree = e.target.value;
                                  handleTextChange('education', list);
                                }}
                                className="w-full text-xs p-2 bg-slate-950 rounded text-white"
                              />
                            </div>
                            <div className="col-span-1 space-y-1">
                              <span className="text-[10px] text-slate-400 font-mono">Timeline</span>
                              <input
                                type="text"
                                value={`${edu.startDate}-${edu.endDate}`}
                                onChange={(e) => {
                                  const list = [...resumeData.education];
                                  const parts = e.target.value.split('-');
                                  list[index].startDate = parts[0]?.trim() || '';
                                  list[index].endDate = parts[1]?.trim() || '';
                                  handleTextChange('education', list);
                                }}
                                className="w-full text-xs p-2 bg-slate-950 rounded text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                {/* Visual template selector */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-xs font-mono uppercase tracking-widest border-b border-slate-800 pb-2">
                    Visual Templates
                  </h4>
                  <div className="grid grid-cols-1 gap-3.5">
                    {TEMPLATE_OPTIONS.map((tpl) => {
                      const isSelected = templateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          onClick={() => selectTemplate(tpl.id, tpl.premium)}
                          className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden flex justify-between items-center bg-slate-900 ${
                            isSelected
                              ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-white font-sans">{tpl.name}</span>
                              {tpl.premium ? (
                                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-sans font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                  PRO Sandbox Demo
                                </span>
                              ) : (
                                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Free Live Tier
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed max-w-sm">{tpl.desc}</p>
                          </div>

                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Color Palette picker */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-xs font-mono uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>Accent Themes</span>
                    <Paintbrush className="w-3.5 h-3.5 text-slate-500" />
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      {COLOR_OPTIONS.map((opt) => {
                        const isSelected = themeColor === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => onChange({ ...portfolio, themeColor: opt.id })}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-left bg-slate-900/40 transition-colors ${
                              isSelected ? 'border-indigo-500' : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full ${opt.color} shrink-0`} />
                            <span className="text-xs font-semibold text-slate-300 font-sans truncate">{opt.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Highly-Polished Custom Theme Color Card */}
                    <div 
                      className={`p-3 rounded-xl border bg-slate-900/50 backdrop-blur-sm space-y-3 transition-all ${
                        themeColor.startsWith('#') ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-800 hover:border-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative flex items-center">
                            <input
                              type="color"
                              id="custom-accent-color"
                              value={themeColor.startsWith('#') ? themeColor : '#4f46e5'}
                              onChange={(e) => onChange({ ...portfolio, themeColor: e.target.value })}
                              className="w-7 h-7 rounded-lg border-0 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-lg"
                            />
                          </div>
                          <div>
                            <label htmlFor="custom-accent-color" className="text-xs font-bold text-slate-200 cursor-pointer hover:text-white transition-colors block">
                              Custom Hue Accent
                            </label>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {themeColor.startsWith('#') ? themeColor.toUpperCase() : 'Not activated'}
                            </p>
                          </div>
                        </div>

                        {themeColor.startsWith('#') ? (
                          <span className="text-[9px] font-mono font-black bg-indigo-500/10 text-indigo-400 p-0.5 px-2 rounded-full border border-indigo-500/10 uppercase tracking-wider">
                            ACTIVE
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onChange({ ...portfolio, themeColor: '#4f46e5' })}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Activate ➔
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Watermark branding trigger */}
                <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white">Hide Watermarks</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Remove the watermark footer at the bottom of templates</p>
                    </div>
                    {portfolio.isPro ? (
                      <input
                        type="checkbox"
                        checked={portfolio.brandingHidden}
                        onChange={(e) => onChange({ ...portfolio, brandingHidden: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800"
                      />
                    ) : (
                      <span className="text-[9px] font-black bg-amber-400/90 text-slate-950 p-1 px-2.5 rounded-full uppercase flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> PRO
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PUBLISHING TAB */}
            {activeTab === 'publishing' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-xs font-mono uppercase tracking-widest border-b border-slate-800 pb-2">
                    Hosting Subdomain
                  </h4>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold">Choose your unique subdomain path</label>
                    <div className="flex items-center bg-slate-900 border border-slate-850 rounded-xl p-2.5">
                      <span className="text-xs font-mono text-slate-500 pr-1 select-none font-bold">folio.so/p/</span>
                      <input
                        type="text"
                        value={portfolio.username}
                        onChange={(e) =>
                          onChange({
                            ...portfolio,
                            username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                          })
                        }
                        className="flex-1 bg-transparent text-xs text-white border-none outline-none p-0 focus:ring-0 font-bold font-mono"
                        placeholder="username"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      This establishes the live static location of your profile view immediately. All changes sync in true real-time.
                    </p>
                  </div>
                </div>

                {/* SUPABASE STATUS CARD */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 px-2 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[9px] font-black uppercase border border-indigo-500/20">
                        Database
                      </span>
                      <h4 className="text-xs font-bold text-white font-sans">Supabase Integration</h4>
                    </div>

                    <button
                      onClick={fetchSupabaseStatus}
                      disabled={loadingStatus}
                      className="p-1 px-2.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] text-slate-400 hover:text-white font-mono font-bold transition-all cursor-pointer"
                    >
                      {loadingStatus ? 'Checking...' : 'Check Status'}
                    </button>
                  </div>

                  {supabaseStatus ? (
                    <div className="space-y-3">
                      {/* Configuration check */}
                      {!supabaseStatus.configured ? (
                        <div className="p-3.5 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-xs space-y-1.5 animate-fade-in">
                          <p className="font-bold">Credentials Missing</p>
                          <p className="text-[11px] leading-relaxed text-red-300">
                            Please set up <code className="bg-slate-950 p-0.5 px-1 font-mono text-white rounded">SUPABASE_URL</code> and <code className="bg-slate-950 p-0.5 px-1 font-mono text-white rounded">SUPABASE_ANON_KEY</code> inside your environment variable settings or <code className="text-white">.env</code>.
                          </p>
                        </div>
                      ) : !supabaseStatus.tableExists ? (
                        <div className="space-y-3 animate-fade-in">
                          <div className="p-3.5 bg-amber-950/20 border border-amber-900/30 text-amber-400 rounded-xl text-xs space-y-1.5">
                            <p className="font-bold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                              Connected, Table Setup Required
                            </p>
                            <p className="text-[11px] leading-relaxed text-amber-300">
                              Connected to Supabase correctly! However, the <code className="bg-slate-950 p-0.5 px-1 font-mono text-white rounded">portfolios</code> table does not exist yet. Please run the setup code below in your Supabase SQL Editor.
                            </p>
                            {supabaseStatus.error && (
                              <p className="text-[10px] text-amber-500/90 font-mono">
                                Details: {supabaseStatus.error}
                              </p>
                            )}
                          </div>

                          {supabaseStatus.sql && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-widest pl-1">
                                  Run in SQL Editor:
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(supabaseStatus.sql || '');
                                    setCopiedSql(true);
                                    setTimeout(() => setCopiedSql(false), 2000);
                                  }}
                                  className="text-[10px] bg-slate-950 hover:bg-slate-850 p-1 px-2.5 border border-slate-800 hover:border-slate-700 text-white font-bold font-mono rounded transition-colors cursor-pointer"
                                >
                                  {copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}
                                </button>
                              </div>
                              <pre className="p-3 bg-slate-950 text-slate-400 text-[10px] font-mono rounded-lg overflow-x-auto max-h-48 border border-slate-850 scrollbar-thin">
                                {supabaseStatus.sql}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-xl text-xs space-y-1.5 animate-fade-in">
                          <p className="font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Supabase Connected & Active
                          </p>
                          <p className="text-[11px] leading-relaxed text-emerald-350">
                            Replication synchronized successfully. All drafts and published portfolios will now persist dynamically to your Supabase cloud instance.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 animate-pulse text-center py-2">
                      Measuring integration parity latency...
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-dashed border-indigo-950/80 bg-slate-950/50 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white font-sans">Self-Hosted Static Generation</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Optimized statically on Node Vercel server caching</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-900 pt-3 flex justify-between text-[11px]">
                    <span className="text-slate-500">Cache Control Lifetime</span>
                    <span className="font-mono font-semibold text-slate-300">Edge S-MaxAge: 3600</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Global DNS Propagator</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active Edge
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Shell: Col 7 */}
        <div className="lg:col-span-7 bg-slate-900 relative p-4 flex flex-col items-center justify-center min-h-[400px] lg:max-h-[calc(100vh-73px)] overflow-hidden">
          {/* Backplate grid design */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1.5px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          {/* Interactive Responsive Shell Frame */}
          <div
            className={`w-full h-full max-w-5xl rounded-2xl bg-white shadow-2xl transition-all relative overflow-y-auto flex flex-col border border-slate-200 ${
              device === 'tablet' ? 'max-w-[768px] max-h-[90%]' : device === 'mobile' ? 'max-w-[390px] max-h-[90%]' : 'max-h-full'
            }`}
          >
            {/* Browser top pill */}
            <div className="h-11 bg-slate-100 border-b border-slate-200/60 px-4 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/90" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/90" />
                <span className="w-3 h-3 rounded-full bg-green-400/90" />
              </div>

              <div className="bg-white/80 border border-slate-200/50 rounded-lg text-[10px] text-slate-500 font-mono py-1 px-4 w-1/2 text-center truncate tracking-tight">
                https://folio.so/p/{portfolio.username}
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase font-mono">
                LIVE FRAME
              </div>
            </div>

            {/* Simulated Live Renderer */}
            <div className="flex-1 overflow-y-auto min-w-0 min-h-0 bg-white relative">
              {isPremiumTemplate && !portfolio.isPro && (
                <div className="absolute top-4 left-4 right-4 z-30 bg-gradient-to-r from-amber-500/95 via-yellow-500/95 to-amber-650/95 backdrop-blur-xs border border-amber-400 text-slate-950 px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-xl font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👑</span>
                    <div>
                      <h5 className="text-xs font-black tracking-wide">Premium Theme &bull; Demo Preview</h5>
                      <p className="text-[10px] text-slate-900 font-semibold leading-normal mt-0.5">Customize and style with your content. Upgrade to Pro to publish live!</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onUpgradeRequest}
                    className="bg-slate-950 hover:bg-slate-900 text-amber-400 text-[10px] font-black px-3 py-1.5 rounded-xl transition-all uppercase tracking-wider cursor-pointer shrink-0 ml-2"
                  >
                    Unlock Template
                  </button>
                </div>
              )}
              {/* Load appropriate preview */}
              <iframe
                id="simulated-iframe"
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <script src="https://cdn.tailwindcss.com"></script>
                      <link rel="preconnect" href="https://fonts.googleapis.com">
                      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono&family=Inter:wght@400;500;605;700&display=swap" rel="stylesheet">
                      <style>
                        body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
                        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
                        .font-mono { font-family: 'JetBrains Mono', monospace; }
                        .font-sans { font-family: 'Space Grotesk', 'Inter', sans-serif; }
                      </style>
                    </head>
                    <body class="bg-slate-50">
                      <div id="root"></div>
                      <script>
                        // Directly inject serialized dynamic portfolio renderer 
                        window.portfolio = ${JSON.stringify(portfolio)};
                        
                        function renderContent() {
                          const p = window.portfolio;
                          const resume = p.resumeData;
                          const tid = p.templateId;
                          const colorId = p.themeColor;
                          
                          // Get dynamic styling classes helper inside embedded frame
                          const palettes = {
                            emerald: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', text: 'text-emerald-700', activeBg: 'bg-emerald-600 hover:bg-emerald-700 text-white', dot: 'bg-emerald-500' },
                            'royal-indigo': { badge: 'bg-indigo-50 text-indigo-700 border-indigo-100', text: 'text-indigo-700', activeBg: 'bg-indigo-600 hover:bg-indigo-700 text-white', dot: 'bg-indigo-500' },
                            'slate-graphite': { badge: 'bg-slate-100 text-slate-850 border-slate-200', text: 'text-slate-900', activeBg: 'bg-slate-800 hover:bg-slate-900 text-white', dot: 'bg-slate-600' },
                            'terracotta-warm': { badge: 'bg-orange-50 text-orange-850 border-orange-100', text: 'text-orange-800', activeBg: 'bg-orange-700 hover:bg-orange-800 text-white', dot: 'bg-orange-600' },
                            'nordic-sea': { badge: 'bg-cyan-50 text-cyan-700 border-cyan-100', text: 'text-cyan-600', activeBg: 'bg-cyan-600 hover:bg-cyan-700 text-white', dot: 'bg-cyan-500' },
                            'cyber-neon': { badge: 'bg-purple-950/25 text-purple-400 border-purple-500/25', text: 'text-purple-400', activeBg: 'bg-purple-600 hover:bg-purple-700 text-white', dot: 'bg-purple-500' },
                            'amber-gold': { badge: 'bg-amber-50 text-amber-700 border-amber-100', text: 'text-amber-600', activeBg: 'bg-amber-500 hover:bg-amber-600 text-white', dot: 'bg-amber-500' }
                          };
                          
                          const activePalette = palettes[colorId] || palettes.emerald;
                          const root = document.getElementById('root');
                          
                          let linksHtml = '';
                          if (resume.links) {
                            if (resume.links.email) {
                              linksHtml += '<a href="mailto:' + resume.links.email + '" class="flex items-center gap-1 text-sm text-gray-500 hover:text-black mt-2">✉ ' + resume.links.email + '</a>';
                            }
                            if (resume.links.github) {
                              linksHtml += '<a href="' + resume.links.github + '" target="_blank" class="flex items-center gap-1 text-sm text-gray-500 hover:text-black mt-2">⚙ GitHub</a>';
                            }
                            if (resume.links.linkedin) {
                              linksHtml += '<a href="' + resume.links.linkedin + '" target="_blank" class="flex items-center gap-1 text-sm text-gray-500 hover:text-black mt-2">◆ LinkedIn</a>';
                            }
                          }
                          
                          let skillsHtml = '';
                          if (resume.skills) {
                            resume.skills.forEach(function(s) {
                              skillsHtml += '<span class="px-2.5 py-1 text-xs font-mono border rounded ' + activePalette.badge + '">' + s + '</span>';
                            });
                          }
                          
                          let expHtml = '';
                          if (resume.experience) {
                            resume.experience.forEach(function(e) {
                              expHtml += '<div class="space-y-1 relative pl-4 border-l border-gray-200 mb-6">';
                              expHtml += '  <div class="absolute w-2 h-2 rounded-full bg-slate-350 -left-[4.5px] top-[7px]"></div>';
                              expHtml += '  <div class="flex justify-between items-baseline flex-wrap">';
                              expHtml += '    <h4 class="font-bold text-slate-900 text-[15px]">' + e.role + ' at ' + e.company + '</h4>';
                              expHtml += '    <span class="text-xs font-mono text-slate-400">' + e.startDate + ' — ' + e.endDate + '</span>';
                              expHtml += '  </div>';
                              expHtml += '  <p class="text-xs text-slate-600 whitespace-pre-line leading-relaxed mt-1">' + e.description + '</p>';
                              expHtml += '</div>';
                            });
                          }
                          
                          let projHtml = '';
                          if (resume.projects && resume.projects.length > 0) {
                            resume.projects.forEach(function(pr) {
                              let stackHtml = '';
                              if (pr.techStack) {
                                pr.techStack.forEach(function(st) {
                                  stackHtml += '<span class="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">' + st + '</span>';
                                });
                              }
                              projHtml += '<div class="border border-slate-200/70 p-4 rounded-xl bg-white">';
                              projHtml += '  <h4 class="font-bold text-sm text-slate-900 flex justify-between items-center">' + pr.title + '</h4>';
                              projHtml += '  <p class="text-xs text-slate-650 mt-1.5 leading-relaxed">' + pr.description + '</p>';
                              projHtml += '  <div class="flex flex-wrap gap-1 mt-3">' + stackHtml + '</div>';
                              projHtml += '</div>';
                            });
                          }
                          
                          let eduHtml = '';
                          if (resume.education) {
                            resume.education.forEach(function(ed) {
                              eduHtml += '<div class="flex justify-between items-center text-xs mb-3">';
                              eduHtml += '  <div>';
                              eduHtml += '    <p class="font-bold text-slate-900">' + ed.degree + '</p>';
                              eduHtml += '    <p class="text-slate-500">' + ed.institution + '</p>';
                              eduHtml += '  </div>';
                              eduHtml += '  <span class="text-slate-400 font-mono">' + ed.startDate + ' — ' + ed.endDate + '</span>';
                              eduHtml += '</div>';
                            });
                          }
                          
                          let footerHtml = '';
                          if (!p.brandingHidden) {
                            footerHtml = '<footer class="pt-12 text-center text-[11px] text-slate-400 mt-12 border-t border-slate-200/80">Made on <a href="#" class="font-bold underline text-slate-650">Folio.so</a> – Turn resumes into lovely websites.</footer>';
                          }

                          // 1. SELECT TEMPLATE RENDER PIPELINE
                          if (tid === 'slate-minimal') {
                            root.innerHTML = \`
                              <div class="p-6 md:p-12 max-w-3xl mx-auto space-y-10 text-slate-905 bg-slate-50/20 font-sans">
                                <header class="border-b border-slate-200 pb-6">
                                  <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">\${resume.name}</h1>
                                  <p class="text-base font-mono mt-1.5 \${activePalette.text}">// \${resume.title}</p>
                                  <p class="text-xs text-slate-600 mt-4 leading-relaxed max-w-xl">\${resume.summary}</p>
                                  <div class="flex flex-wrap gap-4 mt-4">\${linksHtml}</div>
                                </header>
                                
                                <section class="space-y-4">
                                  <h3 class="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 border-b border-slate-100 pb-1.5">Employment</h3>
                                  <div class="space-y-4">\${expHtml}</div>
                                </section>
                                
                                <section class="space-y-3">
                                  <h3 class="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 border-b border-slate-100 pb-1.5">Technical Stack</h3>
                                  <div class="flex flex-wrap gap-1.5 pt-1.5">\${skillsHtml}</div>
                                </section>
                                
                                \${projHtml ? \`<section class="space-y-4">
                                  <h3 class="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 border-b border-slate-100 pb-1.5">Projects</h3>
                                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">\${projHtml}</div>
                                </section>\` : ''}
                                
                                <section class="space-y-3">
                                  <h3 class="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 border-b border-slate-100 pb-1.5">Education</h3>
                                  <div class="pt-1.5">\${eduHtml}</div>
                                </section>
                                
                                \${footerHtml}
                              </div>
                            \`;
                          } else if (tid === 'modern-serif') {
                            root.innerHTML = \`
                              <div class="p-6 md:p-12 max-w-2xl mx-auto space-y-12 text-stone-900 font-serif bg-[#fbfaf8]">
                                <header class="text-center space-y-4 pb-8 border-b border-stone-200">
                                  <h1 class="text-4xl font-light tracking-tight text-stone-900 font-sans">\${resume.name}</h1>
                                  <div class="flex items-center justify-center gap-2">
                                    <span class="w-1.5 h-1.5 rounded-full \${activePalette.dot}"></span>
                                    <p class="text-stone-500 font-sans text-xs uppercase tracking-widest">\${resume.title}</p>
                                    <span class="w-1.5 h-1.5 rounded-full \${activePalette.dot}"></span>
                                  </div>
                                  <p class="text-stone-600 max-w-md mx-auto italic text-sm leading-relaxed">"\${resume.summary}"</p>
                                </header>
                                
                                <section class="space-y-6">
                                  <h3 class="font-sans text-center text-xs uppercase tracking-widest text-stone-400">Path log</h3>
                                  <div class="space-y-6">\${expHtml}</div>
                                </section>
                                
                                <section class="space-y-4 bg-stone-100/50 p-6 rounded-2xl">
                                  <h3 class="font-sans text-center text-xs uppercase tracking-widest text-stone-400">Proficiencies</h3>
                                  <div class="flex flex-wrap gap-1.5 justify-center">\${skillsHtml}</div>
                                </section>
                                
                                \${projHtml ? \`<section class="space-y-6">
                                  <h3 class="font-sans text-center text-xs uppercase tracking-widest text-stone-400">Exhibits</h3>
                                  <div class="grid grid-cols-1 gap-4">\${projHtml}</div>
                                </section>\` : ''}
                                
                                <section class="space-y-4">
                                  <h3 class="font-sans text-center text-xs uppercase tracking-widest text-stone-400">Education</h3>
                                  <div class="space-y-4 text-center">\${eduHtml}</div>
                                </section>
                                
                                \${footerHtml}
                              </div>
                            \`;
                          } else if (tid === 'neo-brutalist') {
                            root.innerHTML = \`
                              <div class="p-6 max-w-3xl mx-auto space-y-8 text-black bg-[#FFFDF2] font-sans">
                                <header class="border-4 border-black p-5 bg-yellow-100 shadow-[4px_4px_0px_0px_#000] space-y-3">
                                  <h1 class="text-3xl font-black uppercase tracking-tight">\${resume.name}</h1>
                                  <span class="inline-block bg-black text-white px-2 py-0.5 font-mono text-xs uppercase font-bold">\${resume.title}</span>
                                  <p class="text-xs font-semibold leading-relaxed border-t-2 border-black pt-3">\${resume.summary}</p>
                                </header>
                                
                                <section class="space-y-4">
                                  <h3 class="text-sm font-black uppercase bg-[#4D96FF] px-2 py-1 inline-block border-2 border-black shadow-[2px_2px_0px_0px_#000]">Employment history</h3>
                                  <div class="space-y-4">\${expHtml}</div>
                                </section>
                                
                                <section class="space-y-3">
                                  <h3 class="text-sm font-black uppercase bg-[#FFD93D] px-2 py-1 inline-block border-2 border-black shadow-[2px_2px_0px_0px_#000]">Skills</h3>
                                  <div class="flex flex-wrap gap-2 pt-1">\${skillsHtml}</div>
                                </section>

                                \${projHtml ? \`<section class="space-y-4">
                                  <h3 class="text-sm font-black uppercase bg-[#6BCB77] px-2 py-1 inline-block border-2 border-black shadow-[2px_2px_0px_0px_#000]">Initiatives</h3>
                                  <div class="grid grid-cols-1 gap-4">\${projHtml}</div>
                                </section>\` : ''}
                                
                                \${footerHtml}
                              </div>
                            \`;
                          } else if (tid === 'nordic-sky') {
                            root.innerHTML = \`
                              <div class="p-6 md:p-12 max-w-4xl mx-auto space-y-10 text-[#2c3e50] bg-gradient-to-tr from-[#f3f7fa] to-[#eef4f9] font-sans">
                                <header class="bg-white/90 backdrop-blur-sm border border-slate-100 p-8 rounded-3xl shadow-sm space-y-4">
                                  <span class="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-705 border border-cyan-100">
                                    Available for collaboration
                                  </span>
                                  <div class="space-y-1">
                                    <h1 class="text-3xl font-extrabold tracking-tight text-slate-850 leading-tight">\${resume.name}</h1>
                                    <p class="text-base font-bold \${activePalette.text}">// \${resume.title}</p>
                                  </div>
                                  <p class="text-sm text-slate-600 leading-relaxed mt-4">\${resume.summary}</p>
                                  <div class="flex flex-wrap gap-3 mt-4">\${linksHtml}</div>
                                </header>

                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div class="space-y-6">
                                    <div class="bg-white/80 border border-slate-100 p-6 rounded-2xl space-y-3">
                                      <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2">Expertise</h4>
                                      <div class="flex flex-wrap gap-1.5 pt-1">\${skillsHtml}</div>
                                    </div>
                                    <div class="bg-white/80 border border-slate-100 p-6 rounded-2xl space-y-3">
                                      <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2">Education</h4>
                                      <div class="pt-1">\${eduHtml}</div>
                                    </div>
                                  </div>

                                  <div class="md:col-span-2 space-y-6">
                                    <div class="bg-white/90 border border-slate-100 p-6 rounded-2xl space-y-4">
                                      <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2">Experience</h4>
                                      <div class="space-y-4 pt-1">\${expHtml}</div>
                                    </div>

                                    \${projHtml ? \`<div class="bg-white/90 border border-slate-100 p-6 rounded-2xl space-y-4">
                                      <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2">Creations</h4>
                                      <div class="grid grid-cols-1 gap-4 pt-1">\${projHtml}</div>
                                    </div>\` : ''}
                                  </div>
                                </div>

                                \${footerHtml}
                              </div>
                            \`;
                          } else if (tid === 'cyber-future') {
                            root.innerHTML = \`
                              <div class="p-6 max-w-4xl mx-auto space-y-8 text-[#a0aec0] bg-[#070b13] font-mono">
                                <header class="border-2 border-[#10b981]/30 bg-[#0c1220]/80 p-6 rounded-xl relative overflow-hidden shadow-lg">
                                  <div class="absolute top-0 right-0 p-3 text-[9px] opacity-65 text-emerald-400">SHELL_v2.0</div>
                                  <div class="flex items-center gap-1.5 mb-2">
                                    <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    <span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  </div>
                                  <div class="border-b border-[#10b981]/20 pb-4">
                                    <h1 class="text-2xl font-black text-white tracking-widest uppercase">&gt; \${resume.name}</h1>
                                    <p class="text-xs text-emerald-400 font-bold mt-1">$ cat profile.json | title == "\${resume.title}"</p>
                                  </div>
                                  <p class="text-xs text-slate-400 mt-4 leading-relaxed font-mono">"\${resume.summary}"</p>
                                  <div class="flex flex-wrap gap-3 mt-4">\${linksHtml}</div>
                                </header>

                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div class="space-y-6">
                                    <div class="border border-slate-800 bg-[#0c1220]/50 p-5 rounded-lg space-y-3">
                                      <h4 class="text-xs font-bold text-white uppercase border-b border-slate-800 pb-1.5">[0x01] TECH_STACK</h4>
                                      <div class="flex flex-wrap gap-1.5 pt-1">\${skillsHtml}</div>
                                    </div>
                                    <div class="border border-slate-800 bg-[#0c1220]/50 p-5 rounded-lg space-y-3">
                                      <h4 class="text-xs font-bold text-white uppercase border-b border-slate-800 pb-1.5">[0x02] DEGREES</h4>
                                      <div class="pt-1">\${eduHtml}</div>
                                    </div>
                                  </div>

                                  <div class="md:col-span-2 space-y-6">
                                    <div class="border border-slate-800 bg-[#0c121f]/90 p-5 rounded-lg space-y-4">
                                      <h4 class="text-xs font-bold text-white uppercase border-b border-slate-800 pb-1.5">[0x03] HISTORY_DUMP</h4>
                                      <div class="space-y-4 pt-1">\${expHtml}</div>
                                    </div>

                                    \${projHtml ? \`<div class="border border-slate-800 bg-[#0c121f]/90 p-5 rounded-lg space-y-4">
                                      <h4 class="text-xs font-bold text-white uppercase border-b border-slate-800 pb-1.5">[0x04] INITIATIVES_LOG</h4>
                                      <div class="grid grid-cols-1 gap-4 pt-1">\${projHtml}</div>
                                    </div>\` : ''}
                                  </div>
                                </div>

                                \${footerHtml}
                              </div>
                            \`;
                          } else {
                            // Creators Warmth Default
                            root.innerHTML = \`
                              <div class="p-5 max-w-3xl mx-auto space-y-10 text-stone-850 bg-[#FFF9F5] font-sans">
                                <header class="bg-gradient-to-br from-[#FEF1E6] to-[#FFE7D1] border border-[#F5D5B8] p-6 rounded-3xl space-y-3">
                                  <h1 class="text-3xl font-black text-stone-900 leading-tight">\${resume.name}</h1>
                                  <p class="text-md font-semibold text-stone-605">\${resume.title}</p>
                                  <p class="text-xs text-stone-701 mt-2.5 leading-relaxed">\${resume.summary}</p>
                                  <div class="flex flex-wrap gap-3 mt-3">\${linksHtml}</div>
                                </header>
                                
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div class="space-y-6">
                                    <div class="bg-white border border-[#F0D0B5]/50 p-4 rounded-xl">
                                      <h4 class="text-xs font-bold uppercase text-stone-400 pb-2">Skills</h4>
                                      <div class="flex flex-wrap gap-1">\${skillsHtml}</div>
                                    </div>
                                    <div class="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                                      <h4 class="text-xs font-bold uppercase text-stone-400 pb-2">Degrees</h4>
                                      <div class="space-y-2">\${eduHtml}</div>
                                    </div>
                                  </div>
                                  
                                  <div class="md:col-span-2 space-y-6">
                                    <div class="space-y-4">
                                      <h4 class="text-xs font-black uppercase text-stone-550 border-b pb-1">Path Log</h4>
                                      <div class="space-y-4">\${expHtml}</div>
                                    </div>
                                    
                                    \${projHtml ? \`<div class="space-y-4">
                                      <h4 class="text-xs font-black uppercase text-stone-550 border-b pb-1 font-sans">Featured Works</h4>
                                      <div class="grid grid-cols-1 gap-3.5">\${projHtml}</div>
                                    </div>\` : ''}
                                  </div>
                                </div>
                                
                                \${footerHtml}
                              </div>
                            \`;
                          }
                        }
                        
                        // Initial Call
                        renderContent();
                      </script>
                    </body>
                  </html>
                `}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
