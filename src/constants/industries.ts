import { Cpu, Stethoscope, TrendingUp, Megaphone, Palette, Wrench, GraduationCap } from 'lucide-react';

export const INDUSTRY_CATEGORIES = [
  { id: 'tech', label: 'Tech & Software', icon: Cpu, color: 'text-cyan-500', desc: 'Software, Data Science, AI/ML, DevOps & Cloud' },
  { id: 'healthcare', label: 'Healthcare & Nursing', icon: Stethoscope, color: 'text-emerald-500', desc: 'Clinical, Nursing, Medical Research, Pharmacy' },
  { id: 'finance', label: 'Business & Finance', icon: TrendingUp, color: 'text-amber-500', desc: 'Accounting, Financial Analysis, Risk & HR' },
  { id: 'marketing', label: 'Marketing & Sales', icon: Megaphone, color: 'text-purple-500', desc: 'Digital Growth, SEO, B2B Sales & Brand Strategy' },
  { id: 'design', label: 'Creative & Design', icon: Palette, color: 'text-rose-500', desc: 'UI/UX Design, Product Design & Multimedia' },
  { id: 'trades', label: 'Skilled Trades & Ops', icon: Wrench, color: 'text-orange-500', desc: 'HVAC, Logistics, Supply Chain & Construction' },
  { id: 'education', label: 'Education & Training', icon: GraduationCap, color: 'text-blue-500', desc: 'Instructional Design, E-Learning & Teaching' },
];
