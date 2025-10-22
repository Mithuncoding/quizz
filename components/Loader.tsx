import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
      <p className="mt-4 text-lg font-semibold text-slate-300">{message}</p>
    </div>
  );
};

export default Loader;