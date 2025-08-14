import React from 'react';
import type { Change } from 'diff';

interface DiffViewerProps {
  diff: Change[];
}

const DiffViewer: React.FC<DiffViewerProps> = ({ diff }) => {
  return (
    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-base leading-relaxed">
      {diff.map((part, index) => {
        const style: React.CSSProperties = {
            backgroundColor: part.added ? 'rgba(52, 211, 153, 0.15)' : part.removed ? 'rgba(251, 113, 133, 0.1)' : 'transparent',
            color: part.removed ? '#fda4af' : 'inherit', // Use a lighter red color for removed text
            textDecoration: part.removed ? 'line-through' : 'none',
            padding: '2px 0',
            borderRadius: '3px'
        };
        
        return (
          <span key={index} style={style}>
            {part.value}
          </span>
        );
      })}
    </pre>
  );
};

export default DiffViewer;
