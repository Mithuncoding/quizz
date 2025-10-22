import React from 'react';

const Logo: React.FC<{ className?: string, fillColor?: string }> = ({ className = 'w-10 h-10', fillColor = '#4f46e5' }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke={fillColor} strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5C12 2.5 6.5 6.5 6.5 12C6.5 17.5 12 21.5 12 21.5C12 21.5 17.5 17.5 17.5 12C17.5 6.5 12 2.5 12 2.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5V21.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.1961 6.80386C14.6335 8.41163 9.36651 8.41163 6.80386 6.80386" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.1961 17.1961C14.6335 15.5884 9.36651 15.5884 6.80386 17.1961" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 2.70005C9.5 5.5 12 7 12 7C12 7 14.5 5.5 14.5 2.70005" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 21.3C9.5 18.5 12 17 12 17C12 17 14.5 18.5 14.5 21.3" />
    <line x1="12" y1="12" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </svg>
);

export default Logo;