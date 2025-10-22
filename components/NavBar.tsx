import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface NavBarProps {
    onLogoClick: () => void;
    onGetStarted: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onLogoClick, onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    const navBarClass = scrolled
        ? 'bg-slate-900/80 backdrop-blur-md border-b border-slate-700 shadow-lg'
        : 'bg-transparent border-b border-transparent';

    return (
        <header className={`w-full sticky top-0 z-30 transition-all duration-300 ${navBarClass}`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    <div 
                        onClick={onLogoClick}
                        className="flex items-center gap-3 cursor-pointer group"
                        aria-label="Back to homepage"
                    >
                        <Logo fillColor="#e2e8f0" className="w-10 h-10 transition-transform duration-300 group-hover:rotate-12" />
                        <h1 className={`text-2xl font-bold text-slate-200 hidden sm:block transition-colors duration-300`}>
                            QuizMaster
                        </h1>
                    </div>
                    <button 
                        onClick={onGetStarted}
                        className="px-5 py-2.5 font-semibold rounded-full transition-all duration-200 ease-in-out text-sm bg-white text-indigo-600 hover:bg-slate-200 transform hover:scale-105"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </header>
    );
};

export default NavBar;