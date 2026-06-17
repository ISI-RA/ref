import React, { useState, useEffect } from 'react';
import {
  Sparkles, Globe, FileText, CheckCircle, ArrowRight, Layers, Lock, Cpu, Star, ExternalLink, RefreshCw, Eye, ArrowLeft, Trash2, Mail
} from 'lucide-react';
import { Portfolio, Resume } from './types';
import { ResumeUploader } from './components/ResumeUploader';
import { PortfolioEditor } from './components/PortfolioEditor';
import { PortfolioPreviews } from './components/PortfolioPreviews';
import { MockBillingAndAuth } from './components/MockBillingAndAuth';

export default function App() {
  const [activePortfolio, setActivePortfolio] = useState<Portfolio | null>(null);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [billingInitialPlan, setBillingInitialPlan] = useState<'free' | 'pro' | 'studio'>('pro');

  const openBilling = (plan: 'free' | 'pro' | 'studio' = 'pro') => {
    setBillingInitialPlan(plan);
    setIsBillingOpen(true);
  };

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [savedDraft, setSavedDraft] = useState<Portfolio | null>(null);
  const [publicPortfolio, setPublicPortfolio] = useState<Portfolio | null>(null);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  const [publishSuccessUrl, setPublishSuccessUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Check URL pathname to determine if this is a Public Portfolio Route (e.g. /p/john-doe)
  useEffect(() => {
    const handleRoute = async () => {
      const match = window.location.pathname.match(/^\/p\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const username = match[1];
        setLoadingPublic(true);
        setPublicError(null);
        try {
          const res = await fetch(`/api/portfolios/${username}`);
          if (!res.ok) {
            throw new Error(`The portfolio for user "${username}" could not be retrieved.`);
          }
          const data = await res.json();
          setPublicPortfolio(data);
        } catch (err: any) {
          setPublicError(err.message || 'Error occurred loading this page.');
        } finally {
          setLoadingPublic(false);
        }
      }
    };
    handleRoute();
  }, []);

  // On first load, check if they have a saved session in LocalStorage
  useEffect(() => {
    // Only check if not on public route
    const isPublic = window.location.pathname.match(/^\/p\/([a-zA-Z0-9_-]+)/);
    if (!isPublic) {
      const saved = localStorage.getItem('folio_current_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setActivePortfolio(parsed);
          setSavedDraft(parsed);
        } catch (e) {
          localStorage.removeItem('folio_current_draft');
        }
      }
    }
  }, []);

  // Save draft whenever changes occur in workspace
  const handlePortfolioChange = (updated: Portfolio) => {
    setActivePortfolio(updated);
    setSavedDraft(updated);
    localStorage.setItem('folio_current_draft', JSON.stringify(updated));
  };

  // Callback once resume parsing finishes
  const handleResumeParsed = (parsedResume: Resume) => {
    // Generate simple slug name
    const slug = parsedResume.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const newPortfolio: Portfolio = {
      id: `port_${Date.now()}`,
      username: slug || 'creative-talent',
      resumeData: parsedResume,
      templateId: 'creators-warmth',
      themeColor: 'royal-indigo',
      published: false,
      isPro: false,
      brandingHidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setActivePortfolio(newPortfolio);
    setSavedDraft(newPortfolio);
    localStorage.setItem('folio_current_draft', JSON.stringify(newPortfolio));
  };

  // Publish to database persistence
  const handlePublish = async () => {
    if (!activePortfolio) return;

    try {
      const res = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ portfolio: activePortfolio })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server rejected publish action.');
      }

      const data = await res.json();
      if (data.success) {
        // Form the absolute development link correctly
        const url = `${window.location.origin}/p/${activePortfolio.username}`;
        setPublishSuccessUrl(url);
      }
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    }
  };

  const handleCopyUrl = () => {
    if (!publishSuccessUrl) return;
    navigator.clipboard.writeText(publishSuccessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetBuilder = () => {
    setIsExitModalOpen(true);
  };

  // --- RENDERING ROUTER ---

  // A. LOADING PUBLIC SITE STATE
  if (loadingPublic) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans select-none">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-mono text-slate-400 animate-pulse">Resolving static edge domain caching...</p>
        </div>
      </div>
    );
  }

  // B. PUBLIC ROUTE ERROR (e.g. 404 portfolio not found)
  if (publicError) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="text-indigo-400 text-6xl font-black">// 404</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Portfolio is not live</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              We couldn't locate a published portfolio website matching this URL. It might have been deleted, or renamed by the creator.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Build your own live Portfolio Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  // C. STANDALONE PUBLIC VIEW STATE
  if (publicPortfolio) {
    return (
      <div className="bg-white min-h-screen">
        <PortfolioPreviews portfolio={publicPortfolio} isPublic={true} />
      </div>
    );
  }

  // D. BUILDER WORKSPACE VIEW STATE
  if (activePortfolio) {
    return (
      <div className="relative">
        <PortfolioEditor
          portfolio={activePortfolio}
          onChange={handlePortfolioChange}
          onPublish={handlePublish}
          onBack={resetBuilder}
          onUpgradeRequest={() => openBilling('pro')}
        />

        {/* Modal: stripe & billing simulation */}
        <MockBillingAndAuth
          isOpen={isBillingOpen}
          initialPlan={billingInitialPlan}
          onClose={() => setIsBillingOpen(false)}
          onUpgradeSuccess={() => handlePortfolioChange({ ...activePortfolio, isPro: true })}
        />

        {/* Custom Exit Dialog Modal instead of blocked window.confirm */}
        {isExitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in font-sans">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                <ArrowLeft className="w-5 h-5 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white tracking-tight">Exit Draft Editor?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your draft portfolio is saved on this device. Would you like to preserve your progress or discard this draft entirely?
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsExitModalOpen(false);
                    setActivePortfolio(null);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  💾 Save Draft & Exit to Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExitModalOpen(false);
                    setActivePortfolio(null);
                    setSavedDraft(null);
                    localStorage.removeItem('folio_current_draft');
                  }}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-850 text-red-400 hover:text-red-350 border border-red-950/40 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  🗑️ Discard Draft & Start Fresh
                </button>
                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-755 text-slate-350 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Keep Customizing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay block for successful publish hosting */}
        {publishSuccessUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in font-sans">
            <div className="bg-slate-900 border border-indigo-950 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white tracking-tight">Your Portfolio Website is Live!</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We've constructed a beautifully optimized, fast, caching-enabled static website for your profile. Send this link to employers, peers, or recruiters:
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                <input
                  type="text"
                  readOnly
                  value={publishSuccessUrl}
                  className="flex-1 bg-transparent text-xs text-indigo-400 font-mono font-semibold border-none focus:outline-none px-2 shrink-0 select-all"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shrink-0"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={publishSuccessUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  View live website <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                </a>
                <button
                  onClick={() => setPublishSuccessUrl(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-755 text-slate-350 rounded-xl text-xs font-semibold"
                >
                  Keep editing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // E. GENERAL MARKETING LANDING & ONBOARDING PAGE
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {/* Decorative accent gradients */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Global Landing Navigation Header */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-900 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-md flex items-center justify-center font-black text-white text-base">F</div>
          <span className="text-base font-extrabold text-white tracking-tight">Folio</span>
        </div>

        <div className="flex items-center gap-5">
          <a href="#pricing" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Pricing model</a>
          <button
            onClick={() => setIsBillingOpen(true)}
            className="text-xs bg-slate-905 border border-slate-800 text-slate-300 font-bold px-4 py-2 rounded-full hover:bg-slate-800/60 transition-colors"
          >
            Access console
          </button>
        </div>
      </nav>

      {/* Hero section */}
      <section className="max-w-4xl mx-auto px-6 pt-16 md:pt-24 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-extrabold select-none">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Generates statically-hosted sites instantly</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none max-w-3xl mx-auto">
          Turn your resume into a <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">beautiful website</span> in 10 seconds.
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Upload PDF or TXT resume. Our trained Gemini multimodal parser scans contact records, experiences, and projects to compile customizable portfolio websites.
        </p>

        {/* Saved draft resumption slot */}
        {savedDraft && (
          <div className="max-w-xl mx-auto mt-6 p-4 bg-slate-900/90 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-4 animate-fade-in text-left shadow-xl shadow-indigo-950/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                <FileText className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-extrabold text-indigo-400 uppercase tracking-widest leading-none block">
                  Found active local draft
                </span>
                <h4 className="text-xs font-bold text-white mt-1">
                  {savedDraft.resumeData.name || 'Creative Talent'}'s Portfolio
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('folio_current_draft');
                  setSavedDraft(null);
                }}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-red-400 border border-slate-850 transition-all cursor-pointer"
                title="Discard draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActivePortfolio(savedDraft)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/20 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
              >
                Resume Layout ➔
              </button>
            </div>
          </div>
        )}

        {/* Integrated interactive resume parsing field / Uploader zone directly inside hero */}
        <div className="pt-8 max-w-2xl mx-auto">
          <ResumeUploader onParsed={handleResumeParsed} />
        </div>
      </section>

      {/* Features showcase section */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-slate-900/60 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-3 shadow-inner">
          <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base">Gemini Engine Mapping</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multimodal deep parsing ingests PDF structures cleanly, saving experience timeline items, skill taxonomy, and side projects without manual rewrites.
          </p>
        </div>

        <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-3 shadow-inner">
          <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base">4 Designer Layouts</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Choose between Editorial Georgia layout formats, bold 3D Neo-Brutalism boxes, clean Slate Monospace styles, or elegant warm organic sidebars.
          </p>
        </div>

        <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-3 shadow-inner">
          <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base">Edge CDN Hosting</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sites publish statically with fully customized routes, fast caching pipelines, and responsive mobile rendering out of the box.
          </p>
        </div>
      </section>

      {/* Pricing options schema section */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16 text-center space-y-12 border-t border-slate-901/40 relative z-10">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-white">Choose your Pricing Tier</h2>
          <p className="text-xs text-slate-400">Simple freemium packaging with predictable flat-rate updates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
          {/* Free Tier */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-3xl flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-extrabold tracking-widest bg-slate-900/50 p-1 px-2.5 rounded-full">
                Tier - Basic
              </span>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white">$0</h4>
                <p className="text-xs text-slate-400">Always free, branded</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-350 border-t border-slate-900 pt-4">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> 1 Published Website</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> Standard Template Layouts</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> Real-time Builder Sync</li>
                <li className="opacity-40 flex items-center gap-2"><Lock className="w-3 h-3 text-slate-500" /> Premium Templates</li>
              </ul>
            </div>
            <button
              onClick={() => openBilling('free')}
              className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-250 hover:text-white rounded-xl text-xs font-bold text-center border border-slate-700"
            >
              Get Basic Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-6 bg-slate-900/40 border-2 border-indigo-500 rounded-3xl flex flex-col justify-between relative shadow-xl shadow-indigo-900/10">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-500 text-slate-950 font-sans text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow">
              RECOMMENDED
            </div>
            <div className="space-y-4">
              <span className="text-[10px] text-indigo-400 uppercase font-mono font-extrabold tracking-widest bg-indigo-500/10 p-1 px-2.5 rounded-full">
                Tier - Professional
              </span>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white">$9<span className="text-xs font-semibold text-slate-500">/mo</span></h4>
                <p className="text-xs text-slate-400">Fully custom premium developer toolkit</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-350 border-t border-slate-900 pt-4">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> Unlock Georgia & neo-brutalist</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> Remove watermarks fully</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> Unlimited subdomains</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> Multi-part Gemini enhancements</li>
              </ul>
            </div>
            <button
              onClick={() => openBilling('pro')}
              className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow text-center"
            >
              Get Professional Plan
            </button>
          </div>

          {/* Teams Tier */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-3xl flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-extrabold tracking-widest bg-slate-900/50 p-1 px-2.5 rounded-full">
                Tier - Enterprise
              </span>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white">$29<span className="text-xs font-semibold text-slate-500">/mo</span></h4>
                <p className="text-xs text-slate-400">Bulk generation for design spaces</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-350 border-t border-slate-900 pt-4">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> Team-wide single portfolios</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> Direct CSV resume bulk parsing</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> High quota API access tokens</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> Dedicated SLA SLA Support</li>
              </ul>
            </div>
            <button
              onClick={() => openBilling('studio')}
              className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-255 hover:text-white rounded-xl text-xs font-bold text-center border border-slate-700"
            >
              Get Enterprise Plan
            </button>
          </div>
        </div>
      </section>

      {/* Global Watermark Footer */}
      <footer className="border-t border-slate-900 py-12 text-center text-xs text-slate-500 space-y-2 relative z-10">
        <p>&copy; 2026 Folio SaaS. Built as a high-fidelity fully integrated preview platform.</p>
        <p className="text-[11px] text-slate-600">Powered by server-side Gemini 3.5 Flash models for resume parsing and positioning copywriting.</p>
      </footer>

      {/* Global modal auth trigger outside workspace */}
      <MockBillingAndAuth
        isOpen={isBillingOpen}
        initialPlan={billingInitialPlan}
        onClose={() => setIsBillingOpen(false)}
        onUpgradeSuccess={() => alert('✨ Congratulations! You upgraded successfully.')}
      />

    </div>
  );
}
