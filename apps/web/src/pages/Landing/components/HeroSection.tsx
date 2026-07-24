import { motion } from 'framer-motion';
import { ArrowRight, Code2, Database, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-teal-500/20 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          MedicaLink HMS v1.0 is now live
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-[1.1]"
        >
          The Future of Hospital Management <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
            AI-Powered & Cloud-Native.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          A revolutionary multi-tenant SaaS platform managing 25+ hospital modules with real-time analytics, RBAC, and seamless AI assistance.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            to="/portal/login" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
          >
            View Live Demo
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="https://github.com/harisx404/MedicaLink-HMS" 
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Explore on GitHub
          </a>
        </motion.div>

        {/* Dashboard Preview / Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 relative mx-auto max-w-5xl"
        >
          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl p-2 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent z-10 bottom-0 h-1/2 pointer-events-none" />
            <div className="rounded-xl overflow-hidden border border-white/5 bg-[#0F1C2E]">
              {/* Fake Browser Top */}
              <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <div className="mx-auto bg-white/5 border border-white/10 rounded-md h-6 w-1/3 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                  medicalink.app/dashboard
                </div>
              </div>
              {/* Fake UI Structure */}
              <div className="h-[400px] flex">
                <div className="w-48 border-r border-white/10 p-4 space-y-4 hidden sm:block">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 w-full bg-white/5 rounded" />
                  ))}
                </div>
                <div className="flex-1 p-6 space-y-6">
                  <div className="h-8 w-48 bg-white/10 rounded-lg" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-xl" />
                    ))}
                  </div>
                  <div className="h-48 w-full bg-white/5 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Badges */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute -left-12 top-24 hidden lg:flex items-center gap-2 bg-slate-800 border border-white/10 rounded-xl p-3 shadow-xl z-20">
            <Code2 className="h-5 w-5 text-teal-400" />
            <span className="text-sm font-semibold text-white">181+ Pages</span>
          </motion.div>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute -right-8 top-1/3 hidden lg:flex items-center gap-2 bg-slate-800 border border-white/10 rounded-xl p-3 shadow-xl z-20">
            <Database className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-semibold text-white">40+ Models</span>
          </motion.div>
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }} className="absolute -left-6 bottom-32 hidden lg:flex items-center gap-2 bg-slate-800 border border-white/10 rounded-xl p-3 shadow-xl z-20">
            <Zap className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-semibold text-white">AI Powered</span>
          </motion.div>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1.5 }} className="absolute -right-12 bottom-48 hidden lg:flex items-center gap-2 bg-slate-800 border border-white/10 rounded-xl p-3 shadow-xl z-20">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold text-white">15 Roles</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
