import { motion } from 'framer-motion';
import { Bot, Mic, Sparkles, Activity } from 'lucide-react';

export function AiHighlight() {
  return (
    <section id="ai" className="py-24 bg-[#050B14] relative z-10 border-t border-white/5 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-400 rounded-3xl blur shadow-[0_0_50px_rgba(79,70,229,0.3)] opacity-50" />
            <div className="relative bg-[#0A1628] rounded-3xl border border-white/10 p-6 md:p-8">
              
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Bot className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">MedicaLink Assistant</h3>
                    <p className="text-xs text-indigo-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                    </p>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-teal-400" />
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">ML</div>
                  <div className="bg-[#0F1C2E] border border-white/5 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300">
                    <p className="mb-2">I've analyzed the patient's symptoms and recent lab results. Here is the differential diagnosis:</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      <li>Acute Appendicitis (85% probability)</li>
                      <li>Gastroenteritis (10% probability)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-4 flex-row-reverse">
                  <div className="h-8 w-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">DR</div>
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-none p-4 text-sm text-white">
                    Draft a SOAP note for this encounter based on my dictation.
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                  <Mic className="h-3 w-3" /> Processing voice dictation via Whisper API...
                </div>
              </div>

            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Healthcare Meets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">Artificial Intelligence</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              We've natively integrated OpenAI's GPT-4o and Whisper models directly into the clinical workflow. Reduce administrative burden and enhance diagnostic accuracy seamlessly.
            </p>
            
            <ul className="space-y-5">
              {[
                { title: 'Voice-to-SOAP Notes', desc: 'Dictate notes and watch AI automatically structure them into Subjective, Objective, Assessment, and Plan.' },
                { title: 'Differential Diagnosis', desc: 'Real-time contextual suggestions based on EHR history, vitals, and lab results.' },
                { title: 'Drug Interaction Checking', desc: 'Instant warnings for adverse reactions or counter-indications when prescribing medications.' }
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="mt-1 h-6 w-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-3 w-3 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                    <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
