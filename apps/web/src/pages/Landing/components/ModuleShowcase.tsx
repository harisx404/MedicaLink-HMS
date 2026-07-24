import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, ActivitySquare, Pill, FlaskConical, CreditCard, Stethoscope, Video } from 'lucide-react';

const MODULES = [
  { id: 'patient', name: 'Patient Management', icon: Users, color: 'text-blue-400', desc: 'Complete demographic, demographic, and historical records tracking.' },
  { id: 'ehr', name: 'Electronic Health Records', icon: ActivitySquare, color: 'text-emerald-400', desc: 'Secure, structured clinical documentation and treatment plans.' },
  { id: 'pharmacy', name: 'Pharmacy', icon: Pill, color: 'text-indigo-400', desc: 'Prescription dispensing, batch tracking, and inventory control.' },
  { id: 'lab', name: 'Laboratory', icon: FlaskConical, color: 'text-purple-400', desc: 'LIS integration, test catalogs, and automated result reporting.' },
  { id: 'billing', name: 'Billing & Insurance', icon: CreditCard, color: 'text-emerald-400', desc: 'Automated claim generation, invoicing, and revenue cycle management.' },
  { id: 'emergency', name: 'Emergency (ER)', icon: Stethoscope, color: 'text-rose-400', desc: 'Triage prioritization, ambulance tracking, and rapid response coordination.' },
  { id: 'telemedicine', name: 'Telemedicine', icon: Video, color: 'text-sky-400', desc: 'WebRTC video consultations with built-in screen sharing and AI notes.' },
  { id: 'analytics', name: 'Executive Analytics', icon: LayoutDashboard, color: 'text-amber-400', desc: 'Real-time hospital-wide KPIs, financial reporting, and predictive trends.' },
];

export function ModuleShowcase() {
  const [activeTab, setActiveTab] = useState(MODULES[0].id);

  return (
    <section id="modules" className="py-24 bg-[#050B14] relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">25+ Integrated Modules</h2>
          <p className="text-lg text-slate-400">
            A comprehensive suite of interconnected modules that eliminate data silos and streamline every aspect of hospital operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {MODULES.map((mod) => {
              const isActive = activeTab === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveTab(mod.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl text-left transition-all whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink w-64 lg:w-full ${
                    isActive ? 'bg-[#0F1C2E] border border-white/10 shadow-lg' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-white/5 ${isActive ? mod.color : 'text-slate-500'}`}>
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={`font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>{mod.name}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8">
            <div className="bg-[#0A1628] rounded-2xl border border-white/10 p-2 md:p-4 aspect-video relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-teal-500/5" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 w-full h-full border border-white/10 rounded-xl overflow-hidden bg-[#0F1C2E] shadow-2xl flex flex-col"
                >
                  {/* Fake Header */}
                  <div className="h-12 border-b border-white/5 bg-black/20 flex items-center px-4 gap-4">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="text-xs text-slate-500 font-mono tracking-wider">
                      {MODULES.find(m => m.id === activeTab)?.desc}
                    </div>
                  </div>
                  
                  {/* Fake Body based on activeTab */}
                  <div className="flex-1 p-6 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse" />
                      <div className="h-8 w-24 bg-indigo-500/20 rounded-lg" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                      <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                      <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                    </div>
                    
                    <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col gap-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-8 w-full bg-white/5 rounded-md flex items-center px-4 justify-between">
                          <div className="h-2 w-1/4 bg-white/10 rounded" />
                          <div className="h-2 w-1/6 bg-white/10 rounded" />
                          <div className="h-2 w-1/6 bg-white/10 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
