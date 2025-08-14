import React from 'react';

interface InputSectionProps {
  resume: string;
  setResume: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  handleTailor: () => void;
  isLoading: boolean;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resumeFileName: string;
  setResumeFileName: (value: string) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ resume, setResume, jobDescription, setJobDescription, handleTailor, isLoading, handleFileChange, resumeFileName, setResumeFileName }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="resume" className="block text-lg font-medium text-slate-200">
              Your Resume
            </label>
            <label htmlFor="resume-upload" className="cursor-pointer text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
              {resumeFileName ? `${resumeFileName}` : 'Upload File (.pdf, .docx, .txt)'}
              <input 
                id="resume-upload" 
                type="file" 
                className="hidden" 
                onChange={handleFileChange} 
                accept=".txt,.md,.pdf,.doc,.docx" 
                disabled={isLoading}
              />
            </label>
          </div>
          <textarea
            id="resume"
            rows={15}
            className="w-full p-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none font-mono text-sm"
            placeholder="Paste your full resume here or upload a file..."
            value={resume}
            onChange={(e) => {
              setResume(e.target.value);
              if (resumeFileName) setResumeFileName(''); // Clear file name if user types
            }}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="job-description" className="block text-lg font-medium text-slate-200 mb-2">
            Job Description
          </label>
          <textarea
            id="job-description"
            rows={15}
            className="w-full p-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none font-mono text-sm"
            placeholder="Paste the target job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="text-center mt-8">
        <button
          onClick={handleTailor}
          disabled={isLoading || !resume || !jobDescription}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {isLoading ? 'Agents at Work...' : 'Engineer My Resume'}
        </button>
      </div>
    </div>
  );
};

export default InputSection;