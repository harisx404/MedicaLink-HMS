import { motion } from 'framer-motion';

const TECHNOLOGIES = [
  { name: 'React', category: 'Frontend', color: 'bg-sky-500' },
  { name: 'TypeScript', category: 'Language', color: 'bg-blue-600' },
  { name: 'Node.js', category: 'Backend', color: 'bg-green-600' },
  { name: 'Express', category: 'Server', color: 'bg-slate-400' },
  { name: 'MongoDB', category: 'Database', color: 'bg-emerald-500' },
  { name: 'Redis', category: 'Caching', color: 'bg-rose-600' },
  { name: 'Socket.io', category: 'Real-time', color: 'bg-slate-100' },
  { name: 'Turborepo', category: 'Monorepo', color: 'bg-rose-500' },
  { name: 'Docker', category: 'DevOps', color: 'bg-blue-500' },
  { name: 'Tailwind CSS', category: 'Styling', color: 'bg-cyan-500' },
  { name: 'OpenAI', category: 'AI Services', color: 'bg-emerald-400' },
  { name: 'AWS S3', category: 'Storage', color: 'bg-amber-500' },
];

export function TechStack() {
  return (
    <section id="tech" className="py-24 bg-[#0A1628] relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Battle-Tested Enterprise Stack</h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              MedicaLink HMS is built on a modern, highly scalable technology stack designed for performance, security, and developer ergonomics. 
              Utilizing a Turborepo monorepo structure guarantees code sharing and ultra-fast build times across API, Web, and Mobile environments.
            </p>
            <div className="flex gap-4">
              <div className="flex-1 bg-[#0F1C2E] rounded-xl p-6 border border-white/5">
                <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                <div className="text-sm text-slate-400">Target Uptime</div>
              </div>
              <div className="flex-1 bg-[#0F1C2E] rounded-xl p-6 border border-white/5">
                <div className="text-3xl font-bold text-white mb-1">&lt;50ms</div>
                <div className="text-sm text-slate-400">API Response</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {TECHNOLOGIES.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-[#0F1C2E] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:border-white/20 transition-colors group relative"
              >
                <div className={`h-10 w-10 rounded-lg ${tech.color} bg-opacity-20 flex items-center justify-center relative overflow-hidden`}>
                  <div className={`absolute inset-0 ${tech.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                  <span className={`text-xl font-bold ${tech.color.replace('bg-', 'text-')}`}>{tech.name.charAt(0)}</span>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-white">{tech.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{tech.category}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
