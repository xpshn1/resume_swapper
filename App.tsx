import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import { AgentStep, AtsAnalysis } from './types';
import { tailorResume, checkAtsAlignment, incorporateSuggestions } from './services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';
import { diffChars, type Change } from 'diff';

// Set worker source for pdf.js, loaded via importmap
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs';

// Global declaration for mammoth.js from CDN script in index.html
declare var mammoth: any;

const App: React.FC = () => {
  const [resume, setResume] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeFileName, setResumeFileName] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImproving, setIsImproving] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<AgentStep>(AgentStep.IDLE);
  
  const [tailoredResume, setTailoredResume] = useState<string>('');
  const [improvedResume, setImprovedResume] = useState<string | null>(null);
  const [atsResult, setAtsResult] = useState<AtsAnalysis | null>(null);
  const [finalAtsResult, setFinalAtsResult] = useState<AtsAnalysis | null>(null);
  const [diff, setDiff] = useState<Change[] | null>(null);

  const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

  const clearResults = () => {
    setTailoredResume('');
    setImprovedResume(null);
    setAtsResult(null);
    setFinalAtsResult(null);
    setDiff(null);
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = ''; // Reset file input

    setResumeFileName(`Parsing ${file.name}...`);
    setIsLoading(true);
    setResume('');
    clearResults();
    setCurrentStep(AgentStep.IDLE);

    try {
        const extension = file.name.split('.').pop()?.toLowerCase();
        let text = '';

        const reader = new FileReader();

        if (extension === 'pdf') {
            text = await new Promise<string>((resolve, reject) => {
                reader.onload = async (event) => {
                    if (!event.target?.result) return reject(new Error("File reader error."));
                    try {
                        const pdf = await pdfjsLib.getDocument({data: event.target.result as ArrayBuffer}).promise;
                        let fullText = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            fullText += textContent.items.map(item => 'text' in item ? item.text : '').join(' ') + '\n';
                        }
                        resolve(fullText);
                    } catch (error) {
                        reject(new Error(`PDF parsing failed: ${(error as Error).message}`));
                    }
                };
                reader.onerror = () => reject(new Error('Error reading file.'));
                reader.readAsArrayBuffer(file);
            });
        } else if (extension === 'docx' || extension === 'doc') {
            text = await new Promise<string>((resolve, reject) => {
                reader.onload = async (event) => {
                    if (!event.target?.result) return reject(new Error("File reader error."));
                    try {
                        const result = await mammoth.extractRawText({ arrayBuffer: event.target.result as ArrayBuffer });
                        resolve(result.value);
                    } catch (error) {
                         reject(new Error(`Word document parsing failed: ${(error as Error).message}`));
                    }
                };
                reader.onerror = () => reject(new Error('Error reading file.'));
                reader.readAsArrayBuffer(file);
            });
        } else if (extension === 'txt' || extension === 'md') {
            text = await new Promise<string>((resolve, reject) => {
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.onerror = () => reject(new Error('Error reading file.'));
                reader.readAsText(file);
            });
        } else {
            throw new Error('Unsupported file type. Please upload a .pdf, .docx, .doc, .txt, or .md file.');
        }

        setResume(text);
        setResumeFileName(file.name);

    } catch (error) {
        console.error("Error parsing file:", error);
        setTailoredResume(`// Error parsing file: ${(error as Error).message}`);
        setCurrentStep(AgentStep.ERROR);
        setResumeFileName('');
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  const handleTailorResume = useCallback(async () => {
    if (!resume || !jobDescription) return;

    setIsLoading(true);
    clearResults();
    setCurrentStep(AgentStep.ANALYZING_RESUME);

    try {
      await sleep(1500);
      setCurrentStep(AgentStep.ANALYZING_JOB);
      
      await sleep(1500);
      setCurrentStep(AgentStep.TAILORING_EXPERIENCE);
      const tailored = await tailorResume(resume, jobDescription);

      setCurrentStep(AgentStep.CHECKING_ATS);
      const ats = await checkAtsAlignment(tailored, jobDescription);

      await sleep(1000);
      setCurrentStep(AgentStep.ASSEMBLING_RESUME);
      
      await sleep(1500);
      setTailoredResume(tailored);
      setAtsResult(ats);
      setCurrentStep(AgentStep.DONE);

    } catch (error) {
      console.error(error);
      const errorMessage = `// An error occurred while communicating with the AI. Please check the console for details and ensure your API key is configured correctly. \n\n${(error as Error).message}`;
      setTailoredResume(errorMessage);
      setCurrentStep(AgentStep.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [resume, jobDescription]);

  const handleIncorporateSuggestions = useCallback(async () => {
    if (!tailoredResume || !atsResult || !jobDescription) return;
    
    setIsImproving(true);
    setCurrentStep(AgentStep.IMPROVING_RESUME);

    try {
        const improved = await incorporateSuggestions(tailoredResume, jobDescription, atsResult);
        setImprovedResume(improved);

        const finalAts = await checkAtsAlignment(improved, jobDescription);
        setFinalAtsResult(finalAts);

        const changes = diffChars(tailoredResume, improved);
        setDiff(changes);
        
        setCurrentStep(AgentStep.DONE);

    } catch (error) {
        console.error(error);
        const errorMessage = `// An error occurred during the improvement phase. \n\n${(error as Error).message}`;
        setImprovedResume(errorMessage);
        setCurrentStep(AgentStep.ERROR);
    } finally {
        setIsImproving(false);
    }
  }, [tailoredResume, atsResult, jobDescription]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="py-8">
        <InputSection 
          resume={resume}
          setResume={setResume}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          handleTailor={handleTailorResume}
          isLoading={isLoading || isImproving}
          handleFileChange={handleFileChange}
          resumeFileName={resumeFileName}
          setResumeFileName={setResumeFileName}
        />
        <OutputSection 
          isLoading={isLoading}
          isImproving={isImproving}
          tailoredResume={tailoredResume}
          improvedResume={improvedResume}
          currentStep={currentStep}
          atsResult={atsResult}
          finalAtsResult={finalAtsResult}
          diff={diff}
          onIncorporateSuggestions={handleIncorporateSuggestions}
        />
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Powered by Google Gemini. Designed for demonstration purposes.</p>
      </footer>
    </div>
  );
};

export default App;