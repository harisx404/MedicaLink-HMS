import { Activity, Heart, Globe, MessageSquare, Briefcase } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-[#050B14] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-gradient-to-tr from-indigo-500 to-teal-400 p-1.5 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">MedicaLink<span className="text-indigo-400">HMS</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              The future of hospital management. A cloud-native, multi-tenant SaaS platform bridging the gap between clinical excellence and operational efficiency.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <MessageSquare className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Briefcase className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Features</a></li>
              <li><a href="#modules" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Modules</a></li>
              <li><a href="#tech" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Tech Stack</a></li>
              <li><a href="#ai" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">AI Capabilities</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="https://github.com/harisx404/MedicaLink-HMS" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Documentation</a></li>
              <li><a href="https://github.com/harisx404/MedicaLink-HMS" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">API Reference</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm flex items-center gap-1.5">
            Built with <Heart className="h-4 w-4 text-rose-500" /> for enterprise healthcare.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">React</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">Node.js</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
