import React from 'react';
import { HeartIcon } from './icons';
import Logo from './Logo';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 relative z-10">
            <div className="max-w-7xl mx-auto py-6 px-4 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                    <Logo fillColor="#94a3b8" className="w-8 h-8" />
                    <div className="flex items-center justify-center gap-2 text-lg text-gray-400">
                        Built with <HeartIcon className="w-5 h-5 text-red-500" /> by
                        <a 
                            href="https://github.com/im-Mithun" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-semibold text-white hover:text-indigo-400 transition-colors"
                        >
                            Mithun
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;