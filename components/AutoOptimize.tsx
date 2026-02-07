'use client';

import { useState } from 'react';
import { FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiZap, FiTarget, FiEdit3 } from 'react-icons/fi';
import type { CVEnhancementResult, OptimizeSuggestion, EnhancedSection } from '@/types/universal-ats';

interface AutoOptimizeProps {
  suggestions: OptimizeSuggestion[];
  cvEnhancement?: CVEnhancementResult;
}

export default function AutoOptimize({ suggestions, cvEnhancement }: AutoOptimizeProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'bullets' | 'keywords' | 'sections'>('bullets');

  // Combine all suggestions for display
  const bulletRewrites = cvEnhancement?.bulletRewrites || [];
  const keywordIntegrations = cvEnhancement?.keywordIntegrations || [];
  const enhancedSections = cvEnhancement?.enhancedSections || [];
  const overallImprovement = cvEnhancement?.overallImprovement || 0;

  // Use cvEnhancement bullet rewrites if available, otherwise fall back to legacy suggestions
  const displayBullets = bulletRewrites.length > 0 ? bulletRewrites : suggestions;

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getImpactBadge = (impact: 'high' | 'medium' | 'low' | number) => {
    if (typeof impact === 'number') {
      if (impact >= 10) return { label: 'HIGH', className: 'bg-red-100 text-red-700 border-red-200' };
      if (impact >= 5) return { label: 'MEDIUM', className: 'bg-amber-100 text-amber-700 border-amber-200' };
      return { label: 'LOW', className: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
    if (impact === 'high') return { label: 'HIGH', className: 'bg-red-100 text-red-700 border-red-200' };
    if (impact === 'medium') return { label: 'MEDIUM', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'LOW', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  const noData = displayBullets.length === 0 && keywordIntegrations.length === 0 && enhancedSections.length === 0;

  if (noData) {
    return (
      <div className="text-center py-12">
        <FiZap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-400 font-medium">No optimization suggestions available</p>
        <p className="text-slate-400 text-sm mt-1">Your resume looks well-optimized!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Improvement Score */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">CV Enhancement</h3>
          <p className="text-sm text-slate-500">AI-powered suggestions to boost your match rate</p>
        </div>
        {overallImprovement > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Potential Improvement</p>
            <p className="text-2xl font-black text-green-700">+{overallImprovement}%</p>
          </div>
        )}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSection('bullets')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeSection === 'bullets'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
        >
          <FiEdit3 className="w-4 h-4" />
          Bullet Rewrites ({displayBullets.length})
        </button>
        <button
          onClick={() => setActiveSection('keywords')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeSection === 'keywords'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
        >
          <FiTarget className="w-4 h-4" />
          Add Keywords ({keywordIntegrations.length})
        </button>
        {enhancedSections.length > 0 && (
          <button
            onClick={() => setActiveSection('sections')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeSection === 'sections'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
          >
            <FiZap className="w-4 h-4" />
            Enhanced Sections ({enhancedSections.length})
          </button>
        )}
      </div>

      {/* Bullet Rewrites Section */}
      {activeSection === 'bullets' && (
        <div className="space-y-3">
          {displayBullets.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No bullet point improvements needed</p>
          ) : (
            displayBullets.map((suggestion, i) => {
              const impact = getImpactBadge(suggestion.impact);
              return (
                <div key={`bullet-${i}`} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${impact.className}`}>
                        {impact.label}
                      </span>
                      <span className="text-sm text-slate-600 truncate">{suggestion.reason}</span>
                    </div>
                    {expandedIndex === i
                      ? <FiChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      : <FiChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    }
                  </button>

                  {expandedIndex === i && (
                    <div className="p-4 space-y-4 border-t border-slate-100 bg-white">
                      {suggestion.original && (
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Original</p>
                          <p className="text-sm text-slate-500 bg-red-50 p-3 rounded-lg border border-red-100 line-through">
                            {suggestion.original}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Optimized Version</p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start justify-between gap-3">
                          <p className="text-sm text-slate-800 font-medium">{suggestion.suggested}</p>
                          <button
                            onClick={() => handleCopy(suggestion.suggested, `bullet-${i}`)}
                            className="flex-shrink-0 p-2 text-slate-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === `bullet-${i}`
                              ? <FiCheck className="w-4 h-4 text-green-500" />
                              : <FiCopy className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Keywords Integration Section */}
      {activeSection === 'keywords' && (
        <div className="space-y-3">
          {keywordIntegrations.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No missing keywords to add</p>
          ) : (
            keywordIntegrations.map((keyword, i) => {
              const impact = getImpactBadge(keyword.impact);
              return (
                <div key={`keyword-${i}`} className="border border-blue-100 bg-blue-50/30 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${impact.className}`}>
                          {impact.label}
                        </span>
                        <span className="text-xs text-blue-600 font-bold uppercase">{keyword.reason}</span>
                      </div>
                      <p className="text-sm text-slate-800 font-medium bg-white p-3 rounded border border-blue-100">
                        {keyword.suggested}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(keyword.suggested, `keyword-${i}`)}
                      className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === `keyword-${i}`
                        ? <FiCheck className="w-4 h-4 text-green-500" />
                        : <FiCopy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Enhanced Sections */}
      {activeSection === 'sections' && (
        <div className="space-y-4">
          {enhancedSections.map((section, i) => (
            <div key={`section-${i}`} className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between">
                <h4 className="text-white font-bold">{section.sectionName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300">Improvement:</span>
                  <span className="text-sm font-bold text-green-400">+{section.improvementScore}%</span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Original</p>
                  <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border">
                    {section.original || 'No original content'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Optimized</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start justify-between gap-3">
                    <p className="text-sm text-slate-800 font-medium">{section.optimized}</p>
                    <button
                      onClick={() => handleCopy(section.optimized, `section-${i}`)}
                      className="flex-shrink-0 p-2 text-slate-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === `section-${i}`
                        ? <FiCheck className="w-4 h-4 text-green-500" />
                        : <FiCopy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
                {section.keywordsAdded.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Keywords Added</p>
                    <div className="flex flex-wrap gap-2">
                      {section.keywordsAdded.map((kw, j) => (
                        <span key={j} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
