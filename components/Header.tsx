import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center p-6 bg-slate-900 text-white">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-sky-500">
                Data Engineer Resume Specialist
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
                Leverage a specialized AI agent team to re-engineer your resume for a specific Data Engineering role and analyze its ATS alignment.
            </p>
        </header>
    );
};

export default Header;