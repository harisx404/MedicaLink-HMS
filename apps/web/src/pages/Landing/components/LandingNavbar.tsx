import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0A1628]/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-gradient-to-tr from-indigo-500 to-teal-400 p-2 rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MedicaLink<span className="text-indigo-400">HMS</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#modules" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Modules</a>
            <a href="#tech" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Tech Stack</a>
            <a href="#ai" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">AI Capabilities</a>
            
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
              <a href="https://github.com/harisx404/MedicaLink-HMS" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <Link 
                to="/portal/login" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
              >
                Launch App
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0A1628] border-b border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-white text-base font-medium">Features</a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-white text-base font-medium">Modules</a>
              <a href="#tech" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-white text-base font-medium">Tech Stack</a>
              <a href="#ai" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-white text-base font-medium">AI Capabilities</a>
              <div className="pt-4 flex flex-col gap-3">
                <a href="https://github.com/harisx404/MedicaLink-HMS" className="flex items-center justify-center gap-2 text-slate-300 border border-white/10 rounded-lg py-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> View on GitHub
                </a>
                <Link to="/portal/login" className="bg-indigo-600 text-white text-center py-2.5 rounded-lg font-medium">
                  Launch App
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
