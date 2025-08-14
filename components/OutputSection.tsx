import React, { useState } from 'react';
import { AgentStep, AtsAnalysis } from '../types';
import Loader from './Loader';
import AtsReport from './AtsReport';
import DiffViewer from './DiffViewer';
import type { Change } from 'diff';

interface OutputSectionProps {
  isLoading: boolean;
  isImproving: boolean;
  tailoredResume: string;
  improvedResume: string | null;
  currentStep: AgentStep;
  atsResult: AtsAnalysis | null;
  finalAtsResult: AtsAnalysis | null;
  diff: Change[] | null;
  onIncorporateSuggestions: () => void;
}

const OutputSection: React.FC<OutputSectionProps> = ({ isLoading, isImproving, tailoredResume, improvedResume, currentStep, atsResult, finalAtsResult, diff, onIncorporateSuggestions }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = improvedResume || tailoredResume;
    if(!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || isImproving) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-10 p-4">
        <Loader message={currentStep} />
      </div>
    );
  }

  if (!tailoredResume && !atsResult) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-10 p-6 bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg text-center">
        <p className="text-slate-400">Your tailored resume and ATS report will appear here once generated.</p>
      </div>
    );
  }
  
  const reportToShow = finalAtsResult || atsResult;
  const resumeToShow = improvedResume || tailoredResume;

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Tailored Resume Section */}
        <div className="lg:col-span-3">
          <h2 className="text-3xl font-bold text-slate-100 mb-4 text-center">
            {diff ? 'Resume Changes (v1 vs. v2)' : 'Your Engineered Resume'}
          </h2>
          <div className="relative bg-slate-800 border border-slate-700 rounded-lg p-6 min-h-[400px]">
            {resumeToShow && (
              <>
                <button 
                  onClick={handleCopy}
                  className="absolute top-4 right-4 bg-slate-700 text-slate-300 hover:bg-slate-600 px-3 py-1 rounded-md text-sm transition-colors z-10"
                >
                  {copied ? 'Copied!' : 'Copy Final Resume'}
                </button>
                {diff ? <DiffViewer diff={diff} /> : (
                   <pre className="text-slate-300 whitespace-pre-wrap font-sans text-base">
                     {tailoredResume}
                   </pre>
                )}
              </>
            )}
          </div>
        </div>

        {/* ATS Report Section */}
        <div className="lg:col-span-2">
           {reportToShow && (
            <AtsReport 
              analysis={reportToShow}
              onIncorporateSuggestions={onIncorporateSuggestions}
              isImproving={isImproving}
              isImprovementDone={!!finalAtsResult}
            />
           )}
        </div>
      </div>
    </div>
  );
};

export default OutputSection;