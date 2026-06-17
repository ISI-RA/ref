import React from 'react';
import { Portfolio, Resume, PortfolioSection } from '../types';
import { Mail, Github, Linkedin, ExternalLink, Globe, Award, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';

const DEFAULT_SECTIONS: PortfolioSection[] = [
  { id: 'skills', title: 'Skills & Expertise', visible: true, type: 'skills' },
  { id: 'experience', title: 'Professional Journey', visible: true, type: 'experience' },
  { id: 'education', title: 'Education & Foundations', visible: true, type: 'education' },
  { id: 'projects', title: 'Featured Creations', visible: true, type: 'projects' },
];

interface PreviewProps {
  portfolio: Portfolio;
  isPublic?: boolean;
}

// Map Tailwind colors dynamically for consistent custom themes
export const THEME_PALETTES = {
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    primaryText: 'text-emerald-700',
    border: 'border-emerald-200',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    accent: 'emerald',
    dot: 'bg-emerald-500'
  },
  'royal-indigo': {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    primaryText: 'text-indigo-700',
    border: 'border-indigo-200',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    accent: 'indigo',
    dot: 'bg-indigo-500'
  },
  'slate-graphite': {
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    primaryText: 'text-slate-900',
    border: 'border-slate-300',
    button: 'bg-slate-800 hover:bg-slate-900 text-white',
    accent: 'slate',
    dot: 'bg-slate-600'
  },
  'terracotta-warm': {
    badge: 'bg-orange-55 text-orange-800 border-orange-100',
    primaryText: 'text-orange-805',
    border: 'border-orange-200',
    button: 'bg-orange-700 hover:bg-orange-800 text-white',
    accent: 'orange',
    dot: 'bg-orange-600'
  },
  'nordic-sea': {
    badge: 'bg-cyan-50/70 text-cyan-705 border-cyan-100/70',
    primaryText: 'text-cyan-600',
    border: 'border-cyan-200',
    button: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    accent: 'cyan',
    dot: 'bg-cyan-550'
  },
  'cyber-neon': {
    badge: 'bg-purple-950/20 text-purple-400 border-purple-500/20',
    primaryText: 'text-purple-400',
    border: 'border-purple-500/30',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    accent: 'purple',
    dot: 'bg-purple-500'
  },
  'amber-gold': {
    badge: 'bg-amber-50 text-amber-705 border-amber-100',
    primaryText: 'text-amber-600',
    border: 'border-amber-200',
    button: 'bg-amber-500 hover:bg-amber-600 text-white',
    accent: 'amber',
    dot: 'bg-amber-500'
  }
};

export const PortfolioPreviews: React.FC<PreviewProps> = ({ portfolio, isPublic = false }) => {
  const { resumeData, templateId, themeColor } = portfolio;
  const sectionsConfig = portfolio.sectionsConfig || DEFAULT_SECTIONS;
  
  const isCustom = themeColor?.startsWith('#');
  const palette = isCustom
    ? {
        badge: '',
        primaryText: '',
        border: '',
        button: '',
        accent: 'custom',
        dot: '',
        isCustom: true,
        customColor: themeColor
      }
    : {
        ...(THEME_PALETTES[themeColor as keyof typeof THEME_PALETTES] || THEME_PALETTES.emerald),
        isCustom: false,
        customColor: ''
      };

  const renderLinks = () => {
    const { links } = resumeData;
    if (!links) return null;

    return (
      <div className="flex flex-wrap gap-4 mt-6 items-center">
        {links.email && (
          <a
            href={`mailto:${links.email}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>{links.email}</span>
          </a>
        )}
        {links.github && (
          <a
            href={links.github.startsWith('http') ? links.github : `https://${links.github}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        )}
        {links.linkedin && (
          <a
            href={links.linkedin.startsWith('http') ? links.linkedin : `https://${links.linkedin}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
        )}
        {links.portfolio && (
          <a
            href={links.portfolio.startsWith('http') ? links.portfolio : `https://${links.portfolio}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Previous Work</span>
          </a>
        )}
      </div>
    );
  };

  // Switch templates
  switch (templateId) {
    case 'slate-minimal': // Tech Minimalist
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12 selection:bg-slate-200">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <header className="border-b border-slate-200 pb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    {resumeData.name || 'Your Name'}
                  </h1>
                  <p className={`text-lg font-mono mt-2 ${palette.isCustom ? '' : palette.primaryText}`} style={palette.isCustom ? { color: palette.customColor } : undefined}>
                    // {resumeData.title || 'Your Title'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-800 uppercase tracking-widest font-mono">
                    ONLINE
                  </span>
                </div>
              </div>
              <p className="text-slate-600 mt-4 leading-relaxed max-w-2xl">
                {resumeData.summary || 'Write a brief professional summary here.'}
              </p>
              {renderLinks()}
            </header>

            {/* Dynamic Sections */}
            {sectionsConfig.map((sect) => {
              if (!sect.visible) return null;
              switch (sect.type) {
                case 'skills':
                  return (
                    <section key={sect.id} className="space-y-4">
                      <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 border-b border-slate-200 pb-2">
                        {sect.title}
                      </h2>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {resumeData.skills && resumeData.skills.map((skill) => (
                          <span
                            key={skill}
                            className={`px-3 py-1 text-xs font-mono border rounded ${palette.isCustom ? '' : palette.badge}`}
                            style={palette.isCustom ? { backgroundColor: `${palette.customColor}10`, color: palette.customColor, borderColor: `${palette.customColor}30` } : undefined}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  );
                case 'experience':
                  return (
                    <section key={sect.id} className="space-y-6">
                      <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 border-b border-slate-200 pb-2">
                        {sect.title}
                      </h2>
                      <div className="space-y-8">
                        {resumeData.experience && resumeData.experience.map((exp) => (
                          <div key={exp.id} className="group relative grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                              <span className="text-sm font-mono text-slate-500">
                                {exp.startDate} — {exp.endDate}
                              </span>
                            </div>
                            <div className="md:col-span-3 space-y-1">
                              <h3 className="text-base font-semibold text-slate-900">
                                {exp.role} <span className="text-slate-400">@</span> {exp.company}
                              </h3>
                              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                case 'education':
                  return (
                    <section key={sect.id} className="space-y-4">
                      <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 border-b border-slate-200 pb-2">
                        {sect.title}
                      </h2>
                      <div className="space-y-4">
                        {resumeData.education && resumeData.education.map((edu) => (
                          <div key={edu.id} className="flex justify-between text-sm">
                            <div>
                              <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                              <p className="text-slate-500">{edu.institution}</p>
                            </div>
                            <span className="font-mono text-slate-400">
                              {edu.startDate} — {edu.endDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                case 'projects':
                  return resumeData.projects && resumeData.projects.length > 0 ? (
                    <section key={sect.id} className="space-y-6">
                      <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 border-b border-slate-200 pb-2">
                        {sect.title}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id} className="border border-slate-200 p-4 rounded-lg hover:border-slate-400 transition-colors bg-white">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-slate-900">{proj.title}</h3>
                              {proj.url && (
                                <a
                                  href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-slate-400 hover:text-black"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{proj.description}</p>
                            {proj.techStack && proj.techStack.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {proj.techStack.map((tech) => (
                                  <span key={tech} className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null;
                case 'custom':
                  return (
                    <section key={sect.id} className="space-y-4">
                      <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 border-b border-slate-200 pb-2">
                        {sect.title}
                      </h2>
                      <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed bg-white border border-slate-100 p-6 rounded-2xl">
                        {sect.customContent || 'Add content using the custom sections editor.'}
                      </div>
                    </section>
                  );
                default:
                  return null;
              }
            })}

            {/* Branded Footer */}
            {!portfolio.brandingHidden && (
              <footer className="pt-12 text-center text-xs text-slate-400 border-t border-slate-200">
                Generated with{' '}
                <a href="/" target="_blank" className="font-bold hover:text-slate-600 underline">
                  Folio.so
                </a>{' '}
                – Turn your resume into a gorgeous website.
              </footer>
            )}
          </div>
        </div>
      );

    case 'modern-serif': // Elegant Editorial
      return (
        <div className="min-h-screen bg-[#faf8f5] text-stone-900 font-serif p-6 md:p-16 selection:bg-orange-100">
          <div className="max-w-3xl mx-auto space-y-16">
            {/* Header */}
            <header className="text-center space-y-6 pb-12 border-b border-stone-200">
              <h1 className="text-5xl md:text-6xl font-light tracking-tight text-stone-900 font-sans leading-tight">
                {resumeData.name || 'Your Name'}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <span className={`w-2 h-2 rounded-full ${palette.isCustom ? '' : palette.dot}`} style={palette.isCustom ? { backgroundColor: palette.customColor } : undefined} />
                <p className="text-stone-500 font-sans tracking-wide text-sm md:text-base uppercase">
                  {resumeData.title || 'Your Title'}
                </p>
                <span className={`w-2 h-2 rounded-full ${palette.isCustom ? '' : palette.dot}`} style={palette.isCustom ? { backgroundColor: palette.customColor } : undefined} />
              </div>
              <p className="text-stone-600 max-w-xl mx-auto italic text-lg leading-relaxed">
                "{resumeData.summary || 'Summary placeholder'}"
              </p>
              <div className="pt-2 flex justify-center">{renderLinks()}</div>
            </header>

            {/* Dynamic Sections */}
            {sectionsConfig.map((sect) => {
              if (!sect.visible) return null;
              switch (sect.type) {
                case 'skills':
                  return (
                    <section key={sect.id} className="space-y-6 bg-stone-100 p-8 rounded-xl animate-fade-in">
                      <div className="text-center">
                        <h2 className="font-sans text-xs uppercase tracking-widest text-stone-400">{sect.title}</h2>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {resumeData.skills && resumeData.skills.map((skill) => (
                          <span
                            key={skill}
                            className={`px-4 py-1.5 font-sans text-xs border rounded-full bg-white text-stone-800 shadow-sm`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  );
                case 'experience':
                  return (
                    <section key={sect.id} className="space-y-8">
                      <div className="text-center">
                        <h2 className="font-sans text-xs uppercase tracking-widest text-stone-400">{sect.title}</h2>
                        <div className="h-[1px] w-12 bg-stone-300 mx-auto mt-2"></div>
                      </div>

                      <div className="space-y-12">
                        {resumeData.experience && resumeData.experience.map((exp) => (
                          <div key={exp.id} className="space-y-2 text-left">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-baseline">
                              <h3 className="text-xl font-medium text-stone-900">
                                {exp.role} <span className="text-stone-400 font-light text-base">at</span> {exp.company}
                              </h3>
                              <span className="text-xs font-sans text-stone-400 uppercase tracking-wider">
                                {exp.startDate} &mdash; {exp.endDate}
                              </span>
                            </div>
                            <p className="text-stone-600 leading-relaxed text-base whitespace-pre-line font-sans">
                              {exp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                case 'education':
                  return (
                    <section key={sect.id} className="space-y-6">
                      <div className="text-center">
                        <h2 className="font-sans text-xs uppercase tracking-widest text-stone-400">{sect.title}</h2>
                        <div className="h-[1px] w-12 bg-stone-300 mx-auto mt-2"></div>
                      </div>
                      <div className="space-y-6 text-center">
                        {resumeData.education && resumeData.education.map((edu) => (
                          <div key={edu.id} className="space-y-1">
                            <h4 className="text-lg font-medium text-stone-900">{edu.degree}</h4>
                            <p className="text-sm font-sans text-stone-500">
                              {edu.institution} &bull; {edu.startDate} — {edu.endDate}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                case 'projects':
                  return resumeData.projects && resumeData.projects.length > 0 ? (
                    <section key={sect.id} className="space-y-8">
                      <div className="text-center">
                        <h2 className="font-sans text-xs uppercase tracking-widest text-stone-400">{sect.title}</h2>
                        <div className="h-[1px] w-12 bg-stone-300 mx-auto mt-2"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id} className="space-y-2 group">
                            <div className="flex justify-between items-center decoration-stone-400 group-hover:underline">
                              <h4 className="text-lg font-semibold text-stone-900 pr-2">{proj.title}</h4>
                              {proj.url && (
                                <a
                                  href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-stone-400 hover:text-black transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            <p className="text-stone-600 text-sm font-sans leading-relaxed">{proj.description}</p>
                            {proj.techStack && proj.techStack.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {proj.techStack.map((tech) => (
                                  <span key={tech} className="text-[10px] font-sans text-stone-500 uppercase tracking-widest bg-stone-200/50 px-2 py-0.5 rounded">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null;
                case 'custom':
                  return (
                    <section key={sect.id} className="space-y-6">
                      <div className="text-center">
                        <h2 className="font-sans text-xs uppercase tracking-widest text-stone-400">{sect.title}</h2>
                        <div className="h-[1px] w-12 bg-stone-300 mx-auto mt-2"></div>
                      </div>
                      <div className="text-stone-600 leading-relaxed text-base whitespace-pre-line font-sans text-center max-w-xl mx-auto rounded-xl bg-stone-50 p-6 border border-stone-200/40">
                        {sect.customContent || 'Add content using the custom sections editor.'}
                      </div>
                    </section>
                  );
                default:
                  return null;
              }
            })}

            {/* Branded Footer */}
            {!portfolio.brandingHidden && (
              <footer className="pt-12 text-center text-xs font-sans text-stone-400 border-t border-stone-200">
                Created using{' '}
                <a href="/" target="_blank" className="font-bold text-stone-600 hover:underline">
                  Folio
                </a>
              </footer>
            )}
          </div>
        </div>
      );

    case 'neo-brutalist': // Aggressive Quirky Bold
      return (
        <div className="min-h-screen bg-[#FFFDF2] text-black font-sans p-6 md:p-12 selection:bg-yellow-300">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Header / Hero block with offset 3d shadow */}
            <header className="border-4 border-black p-6 md:p-8 bg-yellow-100 shadow-[6px_6px_0px_0px_#000] space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
                    {resumeData.name || 'YOUR NAME'}
                  </h1>
                  <span className="inline-block bg-black text-white px-3 py-1 font-mono text-sm uppercase font-bold tracking-wider mt-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.73)]">
                    {resumeData.title || 'YOUR TITLE'}
                  </span>
                </div>
                <span className="bg-[#FF6B6B] border-2 border-black px-4 py-1.5 font-black uppercase font-mono shadow-[3px_3px_0px_0px_#000] text-xs">
                  ⚡ INSTANT SITE
                </span>
              </div>
              <p className="text-lg font-medium border-t-2 border-black pt-4 whitespace-pre-line leading-relaxed max-w-4xl">
                {resumeData.summary || 'Summary text goes here.'}
              </p>
              {renderLinks()}
            </header>

            {/* Dynamic Sections */}
            {sectionsConfig.map((sect) => {
              if (!sect.visible) return null;
              switch (sect.type) {
                case 'skills':
                  return (
                    <section key={sect.id} className="space-y-4">
                      <h2 className="text-xl font-black uppercase bg-[#FFD93D] text-black px-4 py-2 inline-block border-4 border-black shadow-[3px_3px_0px_0px_#000]">
                        {sect.title}
                      </h2>
                      <div className="flex flex-wrap gap-2.5">
                        {resumeData.skills && resumeData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="border-2 border-black bg-white px-3.5 py-1.5 font-bold font-mono text-sm shadow-[2px_2px_0px_0px_#000] hover:bg-yellow-50 transition-colors cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  );
                case 'experience':
                  return (
                    <section key={sect.id} className="space-y-6">
                      <h2 className="text-2xl font-black uppercase bg-[#4D96FF] text-black px-4 py-2 inline-block border-4 border-black shadow-[3px_3px_0px_0px_#000]">
                        {sect.title}
                      </h2>
                      <div className="space-y-6">
                        {resumeData.experience && resumeData.experience.map((exp) => (
                          <div
                            key={exp.id}
                            className="border-4 border-black p-5 bg-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform text-left"
                          >
                            <div className="flex flex-col md:flex-row md:justify-between mb-2">
                              <h3 className="text-xl font-bold uppercase">
                                {exp.role} <span className="text-gray-500 font-medium">@</span> {exp.company}
                              </h3>
                              <span className="bg-[#6BCB77] border-2 border-black px-2 py-0.5 text-xs font-mono font-bold self-start mt-1 md:mt-0">
                                {exp.startDate} &mdash; {exp.endDate}
                              </span>
                            </div>
                            <p className="text-sm font-medium border-t border-black/10 pt-2 leading-relaxed whitespace-pre-line">
                              {exp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                case 'education':
                  return (
                    <section key={sect.id} className="space-y-4">
                      <h2 className="text-xl font-black uppercase bg-black text-white px-4 py-2 inline-block shadow-[3px_3px_0px_0px_#FFD93D]">
                        {sect.title}
                      </h2>
                      <div className="space-y-4 text-left">
                        {resumeData.education && resumeData.education.map((edu) => (
                          <div key={edu.id} className="border-4 border-black p-4 bg-white shadow-[3px_3px_0px_0px_#000] flex justify-between items-center">
                            <div>
                              <h4 className="font-extrabold text-base uppercase">{edu.degree}</h4>
                              <p className="text-sm text-gray-600 font-semibold">{edu.institution}</p>
                            </div>
                            <span className="font-mono text-sm font-bold bg-[#FFD93D] border-2 border-black px-2 py-1">
                              {edu.startDate} — {edu.endDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                case 'projects':
                  return resumeData.projects && resumeData.projects.length > 0 ? (
                    <section key={sect.id} className="space-y-6">
                      <h2 className="text-xl font-black uppercase bg-[#6BCB77] text-black px-4 py-2 inline-block border-4 border-black shadow-[3px_3px_0px_0px_#000]">
                        {sect.title}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id} className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-extrabold uppercase">{proj.title}</h3>
                                {proj.url && (
                                  <a
                                    href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="border-2 border-black bg-black text-white p-1 hover:bg-white hover:text-black transition-all"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed font-semibold">{proj.description}</p>
                            </div>
                            {proj.techStack && proj.techStack.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-4">
                                {proj.techStack.map((tech) => (
                                  <span key={tech} className="bg-yellow-100 border border-black px-2 py-0.5 text-xs font-mono font-bold">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null;
                case 'custom':
                  return (
                    <section key={sect.id} className="space-y-4">
                      <h2 className="text-xl font-black uppercase bg-[#FF6B6B] text-black px-4 py-2 inline-block border-4 border-black shadow-[3px_3px_0px_0px_#000]">
                        {sect.title}
                      </h2>
                      <div className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_#000] whitespace-pre-line font-mono text-sm leading-relaxed text-left">
                        {sect.customContent || 'Add content using the custom sections editor.'}
                      </div>
                    </section>
                  );
                default:
                  return null;
              }
            })}

            {/* Branded Footer */}
            {!portfolio.brandingHidden && (
              <footer className="pt-8 text-center">
                <a
                  href="/"
                  target="_blank"
                  className="inline-block bg-black text-white font-black hover:bg-yellow-100 hover:text-black border-4 border-black py-2.5 px-6 uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]"
                >
                  MADE ON FOLIO.SO 🔥🚀
                </a>
              </footer>
            )}
          </div>
        </div>
      );

    case 'nordic-sky': // Nordic Minimal
      return (
        <div className="min-h-screen bg-gradient-to-tr from-[#f3f7fa] to-[#eef4f9] text-[#2c3e50] font-sans p-6 md:p-12 selection:bg-cyan-100">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <header className="bg-white/85 backdrop-blur-sm border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-100`}>
                Available for collaboration
              </span>
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-850 leading-tight">
                  {resumeData.name || 'Your Name'}
                </h1>
                <p className={`text-base font-bold ${palette.isCustom ? '' : palette.primaryText}`} style={palette.isCustom ? { color: palette.customColor } : undefined}>
                  // {resumeData.title || 'Your Title'}
                </p>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm max-w-2xl">
                {resumeData.summary}
              </p>
              {renderLinks()}
            </header>

            {/* Split Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left sidebar info card */}
              <div className="space-y-6">
                {sectionsConfig.map((sect) => {
                  if (!sect.visible) return null;
                  if (sect.type === 'skills') {
                    return (
                      <div key={sect.id} className="bg-white/80 backdrop-blur-sm border border-slate-100 p-6 rounded-2xl space-y-4 text-left">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#7f8c8d]">{sect.title}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.skills && resumeData.skills.map((skill) => (
                            <span key={skill} className="bg-slate-50 border border-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-xl font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (sect.type === 'education') {
                    return (
                      <div key={sect.id} className="bg-white/80 backdrop-blur-sm border border-slate-100 p-6 rounded-2xl space-y-4 text-left">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#7f8c8d]">{sect.title}</h3>
                        <div className="space-y-4">
                          {resumeData.education && resumeData.education.map((edu) => (
                            <div key={edu.id} className="text-xs space-y-1.5">
                              <p className="font-bold text-slate-800">{edu.degree}</p>
                              <p className="text-slate-500">{edu.institution}</p>
                              <p className="font-mono text-slate-400 text-[10px]">{edu.startDate} &mdash; {edu.endDate}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Right Work History Area */}
              <div className="md:col-span-2 space-y-6">
                {sectionsConfig.map((sect) => {
                  if (!sect.visible) return null;
                  if (sect.type === 'experience') {
                    return (
                      <div key={sect.id} className="bg-white/85 border border-slate-100 p-6 rounded-2xl space-y-6 text-left">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#7f8c8d] border-b pb-2 border-slate-100">{sect.title}</h3>
                        <div className="space-y-6">
                          {resumeData.experience && resumeData.experience.map((exp) => (
                            <div key={exp.id} className="space-y-2 border-l-2 border-cyan-100 pl-4 relative">
                              <div className="absolute w-2.5 h-2.5 bg-cyan-400 rounded-full -left-[6px] top-[6px] border border-white" />
                              <div className="flex flex-col md:flex-row md:justify-between items-baseline gap-1">
                                <h4 className="font-bold text-slate-800 text-md">{exp.role}</h4>
                                <span className="text-[10px] text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-lg font-bold">
                                  {exp.startDate} &mdash; {exp.endDate}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-semibold">{exp.company}</p>
                              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (sect.type === 'projects') {
                    return resumeData.projects && resumeData.projects.length > 0 ? (
                      <div key={sect.id} className="bg-white/85 border border-slate-100 p-6 rounded-2xl space-y-6 text-left">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#7f8c8d] border-b pb-2 border-slate-100">{sect.title}</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {resumeData.projects.map((proj) => (
                            <div key={proj.id} className="border border-slate-100 p-4 rounded-xl hover:border-cyan-200 transition-all flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{proj.title}</h4>
                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{proj.description}</p>
                                {proj.techStack && proj.techStack.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2.5">
                                    {proj.techStack.map((tech) => (
                                      <span key={tech} className="text-[9px] font-mono text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {proj.url && (
                                <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-cyan-500 transition-colors">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  }
                  if (sect.type === 'custom') {
                    return (
                      <div key={sect.id} className="bg-white/85 border border-slate-100 p-6 rounded-2xl space-y-4 text-left">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#7f8c8d] border-b pb-2 border-slate-100">{sect.title}</h3>
                        <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                          {sect.customContent || 'Add content using the custom sections editor.'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Branded Footer */}
            {!portfolio.brandingHidden && (
              <footer className="pt-8 text-center text-[10px] text-slate-400">
                Created with <a href="/" target="_blank" className="font-semibold text-slate-500 hover:underline">Folio.so</a>
              </footer>
            )}
          </div>
        </div>
      );

    case 'cyber-future': // Cyberpunk Monospace Terminal
      return (
        <div className="min-h-screen bg-[#070b13] text-[#a0aec0] font-mono p-6 md:p-12 selection:bg-emerald-500 selection:text-black">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Header Block */}
            <header className="border-2 border-[#10b981]/30 bg-[#0c1220]/80 p-6 rounded-xl relative overflow-hidden shadow-lg shadow-emerald-950/20">
              <div className="absolute top-0 right-0 p-3 text-[10px] opacity-60 tracking-widest font-bold text-emerald-400">
                SHELL_v2.0
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <div className="border-b border-[#10b981]/20 pb-4 space-y-2">
                <h1 className="text-3xl font-black text-white tracking-widest uppercase">
                  &gt; {resumeData.name || 'YOUR_NAME'}
                </h1>
                <p className="text-xs text-emerald-400 font-bold tracking-wider">
                  $ cat profile.json | title == "{resumeData.title || 'TALENT'}"
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed whitespace-pre-wrap">
                "{resumeData.summary || 'Summary placeholder'}"
              </p>
              {renderLinks()}
            </header>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {sectionsConfig.map((sect) => {
                  if (!sect.visible) return null;
                  if (sect.type === 'skills') {
                    return (
                      <div key={sect.id} className="border border-slate-800 bg-[#0c1220]/50 p-5 rounded-lg space-y-3 text-left">
                        <h3 className="text-xs font-bold text-white uppercase border-b border-slate-800 pb-1.5">
                          // {sect.title}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.skills && resumeData.skills.map((skill) => (
                            <span key={skill} className="bg-[#10b981]/10 text-emerald-400 text-[10px] border border-emerald-500/20 px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (sect.type === 'education') {
                    return (
                      <div key={sect.id} className="border border-slate-800 bg-[#0c1220]/50 p-5 rounded-lg space-y-3 text-left">
                        <h3 className="text-xs font-bold text-white uppercase border-b border-slate-800 pb-1.5">
                          // {sect.title}
                        </h3>
                        <div className="space-y-4">
                          {resumeData.education && resumeData.education.map((edu) => (
                            <div key={edu.id} className="text-[11px] space-y-1">
                              <p className="font-bold text-[#e2e8f0]">{edu.degree}</p>
                              <p className="text-slate-400">{edu.institution}</p>
                              <p className="text-slate-500 text-[10px]">{edu.startDate} // {edu.endDate}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Right Column */}
              <div className="md:col-span-2 space-y-6">
                {sectionsConfig.map((sect) => {
                  if (!sect.visible) return null;
                  if (sect.type === 'experience') {
                    return (
                      <div key={sect.id} className="border border-slate-800 bg-[#0c121f]/90 p-5 rounded-lg space-y-4 text-left">
                        <h3 className="text-xs font-bold text-white uppercase border-b border-slate-800 pb-2">
                          // {sect.title}
                        </h3>
                        <div className="space-y-6">
                          {resumeData.experience && resumeData.experience.map((exp) => (
                            <div key={exp.id} className="text-xs space-y-1 relative pl-4 border-l border-[#10b981]/20">
                              <div className="absolute w-1.5 h-1.5 bg-emerald-500 rounded-full -left-[3.5px] top-[4px]" />
                              <div className="flex justify-between items-baseline flex-wrap gap-1">
                                <h4 className="font-bold text-white">{exp.role}</h4>
                                <span className="text-[10px] text-emerald-400 font-semibold bg-[#10b981]/10 border border-[#10b981]/20 px-1.5 py-0.5 rounded">
                                  {exp.startDate} - {exp.endDate}
                                </span>
                              </div>
                              <p className="text-slate-400 text-[11px] font-bold">{exp.company}</p>
                              <p className="text-slate-500 leading-relaxed text-[11px] whitespace-pre-line mt-1.5">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (sect.type === 'projects') {
                    return resumeData.projects && resumeData.projects.length > 0 ? (
                      <div key={sect.id} className="border border-slate-800 bg-[#0c121f]/90 p-5 rounded-lg space-y-4 text-left">
                        <h3 className="text-xs font-bold text-white uppercase border-b border-slate-800 pb-2 flex justify-between">
                          <span>// {sect.title}</span>
                          <span className="text-[10px] text-emerald-400 animate-pulse">● LIVE</span>
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {resumeData.projects.map((proj) => (
                            <div key={proj.id} className="border border-slate-800 p-4 rounded bg-[#070b13] hover:border-[#10b981]/40 transition-colors flex justify-between items-start">
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-white">&gt;_ {proj.title}</h4>
                                <p className="text-[11px] text-slate-400 leading-normal">{proj.description}</p>
                                {proj.techStack && proj.techStack.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {proj.techStack.map((tech) => (
                                      <span key={tech} className="bg-slate-900 border border-slate-800 text-[9px] text-[#a0aec0] px-1.5 py-0.5 rounded">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {proj.url && (
                                <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#10b981]">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  }
                  if (sect.type === 'custom') {
                    return (
                      <div key={sect.id} className="border border-slate-800 bg-[#0c121f]/90 p-5 rounded-lg space-y-4 text-left">
                        <h3 className="text-xs font-bold text-white uppercase border-b border-slate-800 pb-2">
                          // {sect.title}
                        </h3>
                        <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                          {sect.customContent || 'Add content using the custom sections editor.'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Branded Footer */}
            {!portfolio.brandingHidden && (
              <footer className="pt-8 text-center text-[10px] text-slate-600">
                SYSTEM_GENERATION: <a href="/" target="_blank" className="font-bold underline hover:text-[#10b981]">FOLIO_V2</a>
              </footer>
            )}
          </div>
        </div>
      );

    case 'creators-warmth': // Creators Warmth (Organic Creative)
    default:
      return (
        <div className="min-h-screen bg-[#FFF9F5] text-stone-800 font-sans p-6 md:p-12 selection:bg-orange-200">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#FEF1E6] to-[#FFE7D1] border border-[#F5D5B8] p-8 rounded-3xl shadow-sm space-y-4">
              <div className="space-y-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${palette.isCustom ? '' : palette.badge}`} style={palette.isCustom ? { backgroundColor: `${palette.customColor}15`, color: palette.customColor, borderColor: `${palette.customColor}35` } : undefined}>
                  Available for new contracts
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight">
                  {resumeData.name || 'Your Name'}
                </h1>
                <p className="text-xl md:text-2xl font-medium text-stone-600">
                  {resumeData.title || 'Your Title'}
                </p>
              </div>
              <p className="text-stone-700 text-base leading-relaxed max-w-2xl font-medium">
                {resumeData.summary || 'Summary placeholder'}
              </p>
              <div className="border-t border-[#F5D5B8] pt-4">{renderLinks()}</div>
            </header>

            {/* Core log */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Brief details & skills */}
              <div className="md:col-span-1 space-y-8">
                {sectionsConfig.map((sect) => {
                  if (!sect.visible) return null;
                  if (sect.type === 'skills') {
                    return (
                      <div key={sect.id} className="bg-white border border-[#F0D0B5]/50 p-6 rounded-2xl shadow-sm space-y-4 text-left">
                        <h3 className="font-bold text-stone-950 uppercase tracking-wider text-xs">
                          {sect.title}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.skills && resumeData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="bg-orange-50 border border-orange-100 text-orange-950 px-2.5 py-1 text-xs rounded-full font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (sect.type === 'education') {
                    return (
                      <div key={sect.id} className="bg-[#FEF6F0] p-6 rounded-2xl shadow-sm space-y-4 border border-[#F5D5B8]/50 text-left">
                        <h3 className="font-bold text-stone-950 uppercase tracking-wider text-xs">
                          {sect.title}
                        </h3>
                        <div className="space-y-4">
                          {resumeData.education && resumeData.education.map((edu) => (
                            <div key={edu.id} className="text-xs space-y-1">
                              <p className="font-bold text-stone-900">{edu.degree}</p>
                              <p className="text-stone-505">{edu.institution}</p>
                              <p className="font-mono text-stone-400">{edu.startDate} &mdash; {edu.endDate}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Right Column: Work Log and Projects */}
              <div className="md:col-span-2 space-y-8">
                {sectionsConfig.map((sect) => {
                  if (!sect.visible) return null;
                  if (sect.type === 'experience') {
                    return (
                      <div key={sect.id} className="space-y-6 text-left">
                        <h3 className="font-black text-stone-850 text-lg uppercase tracking-wider">
                          {sect.title}
                        </h3>
                        <div className="space-y-6">
                          {resumeData.experience && resumeData.experience.map((exp) => (
                            <div key={exp.id} className="space-y-1 border-l-2 border-[#E7D6C6] pl-4 relative">
                              <div className="absolute w-3 h-3 bg-orange-400 rounded-full -left-[7px] top-[6px] border-2 border-white" />
                              <div className="flex flex-col md:flex-row md:justify-between items-baseline">
                                <h4 className="font-bold text-stone-950 text-base">{exp.role}</h4>
                                <span className="text-xs text-orange-600 font-semibold bg-orange-100 px-2 py-0.5 rounded-full">
                                  {exp.startDate} &mdash; {exp.endDate}
                                </span>
                              </div>
                              <p className="text-stone-500 text-sm font-semibold">{exp.company}</p>
                              <p className="text-stone-605 text-xs mt-1.5 whitespace-pre-line leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (sect.type === 'projects') {
                    return resumeData.projects && resumeData.projects.length > 0 ? (
                      <div key={sect.id} className="space-y-6 pt-4 text-left">
                        <h3 className="font-black text-stone-850 text-lg uppercase tracking-wider">
                          {sect.title}
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {resumeData.projects.map((proj) => (
                            <div key={proj.id} className="bg-white border border-[#F0D0B5]/40 p-5 rounded-2xl hover:border-orange-200 transition-colors shadow-sm flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-stone-950">{proj.title}</h4>
                                <p className="text-xs text-stone-600 mt-1 max-w-xl">{proj.description}</p>
                                {proj.techStack && proj.techStack.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {proj.techStack.map((tech) => (
                                      <span key={tech} className="text-[10px] font-mono text-stone-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-md">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {proj.url && (
                                <a
                                  href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-stone-400 hover:text-orange-500 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  }
                  if (sect.type === 'custom') {
                    return (
                      <div key={sect.id} className="space-y-6 pt-4 text-left">
                        <h3 className="font-black text-stone-850 text-lg uppercase tracking-wider">
                          {sect.title}
                        </h3>
                        <div className="bg-white border border-[#F0D0B5]/40 p-5 rounded-2xl whitespace-pre-line text-xs text-stone-600 leading-relaxed font-sans">
                          {sect.customContent || 'Add content using the custom sections editor.'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            </div>

            {/* Branded Footer */}
            {!portfolio.brandingHidden && (
              <footer className="pt-12 text-center text-xs text-stone-400">
                Crafted in{' '}
                <a href="/" target="_blank" className="font-bold text-stone-600 hover:underline">
                  Folio.so
                </a>{' '}
                – Resume transformation engine.
              </footer>
            )}
          </div>
        );
    }
};
