import React from 'react';

const LoadingSpinner = ({ size = 'medium', fullScreen = false, text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`animate-spin rounded-full border-cyan-500 border-t-transparent ${sizeClasses[size]}`}></div>
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;