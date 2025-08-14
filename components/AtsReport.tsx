import React from 'react';
import { AtsAnalysis } from '../types';

interface AtsReportProps {
  analysis: AtsAnalysis;
  onIncorporateSuggestions: () => void;
  isImproving: boolean;
  isImprovementDone: boolean;
}

const AtsReport: React.FC<AtsReportProps> = ({ analysis, onIncorporateSuggestions, isImproving, isImprovementDone }) => {
  const { score, matchedKeywords, missingKeywords, suggestions } = analysis;

  const circumference = 2 * Math.PI * 54; // 2 * pi * r where r=54
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 85) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-500';
  };

  const scoreColor = getScoreColor();

  const KeywordPill: React.FC<{ keyword: string }> = ({ keyword }) => (
    <span className="inline-block bg-slate-600/50 rounded-full px-3 py-1 text-sm font-medium text-slate-300 mr-2 mb-2">
      {keyword}
    </span>
  );

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 h-full flex flex-col">
      <h3 className="text-2xl font-bold text-slate-100 mb-4 text-center">ATS Alignment Report</h3>
      
      <div className="flex justify-center items-center my-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle
              className="text-slate-700"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
              r="54"
              cx="60"
              cy="60"
            />
            <circle
              className={`${scoreColor} transition-all duration-1000 ease-in-out`}
              style={{ strokeDashoffset: offset }}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="54"
              cx="60"
              cy="60"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
            <span className="text-xl font-bold text-slate-400">%</span>
          </div>
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="mb-4">
          <h4 className="font-semibold text-lg text-green-400 mb-2">Matched Keywords</h4>
          <div className="flex flex-wrap">
            {matchedKeywords.length > 0 ? matchedKeywords.map((kw, i) => <KeywordPill key={`m-${i}`} keyword={kw} />) : <p className="text-sm text-slate-400">No strong keyword matches found.</p>}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg text-yellow-400 mb-2">Missing Keywords</h4>
          <div className="flex flex-wrap">
            {missingKeywords.length > 0 ? missingKeywords.map((kw, i) => <KeywordPill key={`miss-${i}`} keyword={kw} />) : <p className="text-sm text-slate-400">Great job! No critical keywords seem to be missing.</p>}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg text-blue-400 mb-2">Suggestions</h4>
          <p className="text-slate-300 text-sm whitespace-pre-wrap font-sans">{suggestions}</p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
            onClick={onIncorporateSuggestions}
            disabled={isImproving || isImprovementDone}
            className="w-full px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
            {isImproving ? 'Improving...' : isImprovementDone ? 'Improvement Applied' : 'Incorporate Suggestions'}
        </button>
      </div>
    </div>
  );
};

export default AtsReport;