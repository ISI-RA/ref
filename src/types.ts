/**
 * Types for Folio Core Domain Model
 */

export interface Resume {
  name: string;
  title: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  links: ResumeLinks;
  projects: ProjectItem[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface ResumeLinks {
  email?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  portfolio?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  techStack?: string[];
}

export interface PortfolioSection {
  id: string;
  title: string;
  visible: boolean;
  type: 'skills' | 'experience' | 'education' | 'projects' | 'custom';
  customContent?: string;
}

export interface Portfolio {
  id: string;
  username: string;
  resumeData: Resume;
  templateId: string; // 'slate-minimal' | 'modern-serif' | 'neo-brutalist' | 'creators-warmth'
  themeColor: string; // 'emerald' | 'royal-indigo' | 'slate-graphite' | 'terracotta-warm'
  published: boolean;
  isPro: boolean;
  brandingHidden: boolean;
  createdAt: string;
  updatedAt: string;
  sectionsConfig?: PortfolioSection[];
}

export type TemplateId = 'slate-minimal' | 'modern-serif' | 'neo-brutalist' | 'creators-warmth' | 'nordic-sky' | 'cyber-future';
export type ThemeColorId = 'emerald' | 'royal-indigo' | 'slate-graphite' | 'terracotta-warm' | 'nordic-sea' | 'cyber-neon' | 'amber-gold';

export interface ThemeConfig {
  id: ThemeColorId;
  name: string;
  primary: string;
  bgGrad: string;
  cardBg: string;
  text: string;
  accent: string;
  secondary: string;
}
