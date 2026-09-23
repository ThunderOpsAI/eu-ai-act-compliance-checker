'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Scale,
  Clock,
  ShieldAlert,
  Cpu,
  FileCheck,
  Globe2,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'timeline' | 'penalties' | 'classification' | 'technical' | 'scope';
  question: string;
  articleCitation: string;
  answer: string;
  keyTakeaways: string[];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'timeline',
    category: 'timeline',
    question: 'When do EU AI Act statutory deadlines and obligations take effect?',
    articleCitation: 'Article 113',
    answer:
      'Regulation (EU) 2024/1689 entered into force on August 1, 2024, with a phased enforcement timeline across four primary statutory milestones:',
    keyTakeaways: [
      'February 2, 2025: Absolute ban on Prohibited AI practices (Article 5).',
      'August 2, 2025: Governance rules and systemic risk duties for General-Purpose AI (GPAI) models.',
      'August 2, 2026: Full enforcement for Annex III High-Risk AI systems (employment, biometrics, critical infrastructure).',
      'August 2, 2027: Mandatory conformity for High-Risk AI embedded in regulated Annex I products (medical devices, machinery, aviation).',
    ],
  },
  {
    id: 'penalties',
    category: 'penalties',
    question: 'What are the financial penalties and statutory sanctions for non-compliance?',
    articleCitation: 'Article 71',
    answer:
      'The EU AI Act establishes tiered administrative fines enforced by national market surveillance authorities and the European AI Office:',
    keyTakeaways: [
      'Prohibited Practices (Art. 5): Up to €35,000,000 or 7% of worldwide annual turnover, whichever is higher.',
      'High-Risk Obligations (Arts. 9–15): Up to €15,000,000 or 3% of worldwide annual turnover.',
      'Supplying False / Incomplete Information: Up to €7,500,000 or 1.5% of worldwide annual turnover.',
      'Proportionality safeguards: For SMEs and startups, statutory fines consider turnover percentage caps rather than flat maximums.',
    ],
  },
  {
    id: 'classification',
    category: 'classification',
    question: 'How does the Act distinguish High-Risk (Annex III) from Limited-Risk (Article 50)?',
    articleCitation: 'Articles 6, 50 & Annex III',
    answer:
      'Classification depends on intended purpose, domain deployment, and risk to health, safety, and fundamental rights:',
    keyTakeaways: [
      'High-Risk (Annex III): Standalone systems used in employment & recruitment, biometric identification, critical infrastructure, credit scoring, law enforcement, or education evaluation.',
      'Limited-Risk (Article 50): Customer-facing chatbots, synthetic media (deepfakes), and emotion recognition require clear user disclosure ("You are interacting with AI") without full conformity dossiers.',
      'Minimal / Zero Risk: Routine AI such as video game logic, spam filtering, and internal ERP optimizers operate freely under voluntary codes of conduct.',
    ],
  },
  {
    id: 'technical',
    category: 'technical',
    question: 'What technical documentation must engineering teams maintain for High-Risk systems?',
    articleCitation: 'Articles 9–15 & Annex IV',
    answer:
      'High-Risk AI systems require an end-to-end statutory compliance lifecycle documented before market release:',
    keyTakeaways: [
      'Risk Management System (Art. 9): Continuous identification, testing, and residual risk mitigation.',
      'Data Governance (Art. 10): Training, validation, and testing dataset auditing for statistical bias and provenance.',
      'Technical Documentation (Art. 11): Comprehensive design architecture, prompt engineering schemas, and version logs.',
      'Automated Logging & Traceability (Art. 12): System logs recording outputs, errors, and operational events throughout lifecycle.',
      'Human Oversight & Cyber Resilience (Arts. 14 & 15): "Human-in-the-loop" override controls and penetration robustness testing.',
    ],
  },
  {
    id: 'scope',
    category: 'scope',
    question: 'Does the EU AI Act apply to companies and developers outside the European Union?',
    articleCitation: 'Article 2(1)',
    answer:
      'Yes. The EU AI Act features extraterritorial reach similar to the GDPR. It binds non-EU organizations under multiple scenarios:',
    keyTakeaways: [
      'Providers placing AI systems or GPAI models on the EU market, regardless of headquarters location.',
      'Deployers of AI systems established or located inside the EU.',
      'Non-EU providers and deployers where the output produced by the AI system is intended to be used in the European Union.',
      'Exemption: AI developed purely for scientific research, military/defense, or non-professional personal use is excluded.',
    ],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: HelpCircle },
  { id: 'timeline', label: 'Deadlines', icon: Clock },
  { id: 'penalties', label: 'Fines & Fines', icon: ShieldAlert },
  { id: 'classification', label: 'Risk Tiers', icon: Scale },
  { id: 'technical', label: 'Engineering', icon: Cpu },
  { id: 'scope', label: 'Global Scope', icon: Globe2 },
] as const;

export function FaqSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['timeline', 'classification']));

  const toggleItem = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(FAQ_ITEMS.map((item) => item.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const filteredItems =
    selectedCategory === 'all'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all">
      {/* Master Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Frequently Asked Regulatory Questions (FAQ)
              </h3>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {FAQ_ITEMS.length} Questions
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Statutory deadlines, liability risks, and engineering compliance guidelines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hidden sm:inline">
            {isOpen ? 'Hide FAQ' : 'Show FAQ'}
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-5 sm:p-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-5 animate-fade-in">
          {/* Controls Bar: Category Filters & Expand/Collapse All */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <cat.icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Expand / Collapse All Actions */}
            <div className="flex items-center gap-3 text-xs font-semibold shrink-0 text-slate-500">
              <button
                type="button"
                onClick={expandAll}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3 pt-1">
            {filteredItems.map((item) => {
              const isExpanded = expandedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-950/40 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    aria-expanded={isExpanded}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/60">
                          {item.articleCitation}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.question}
                      </h4>
                    </div>
                    <div className="pt-1 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-200/40 dark:border-slate-800/50 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <p className="leading-relaxed">{item.answer}</p>
                      <div className="space-y-1.5 pl-2 border-l-2 border-blue-500/40 dark:border-blue-400/40">
                        {item.keyTakeaways.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <FileCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                              {point}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
