import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showValue = false,
  className = ''
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-medium text-namsan-text">{label}</span>}
          {showValue && <span className="text-sm font-semibold text-namsan-blue">{normalizedProgress}%</span>}
        </div>
      )}
      <div className="w-full bg-namsan-bg-alt rounded-full h-2.5 overflow-hidden">
        {/* Using the combination of Yellow and Blue as requested for Progress */}
        <div 
          className="h-2.5 rounded-full transition-all duration-500 ease-in-out bg-gradient-to-r from-namsan-primary to-namsan-blue"
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
};
