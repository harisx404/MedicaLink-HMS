import { motion } from 'framer-motion';
import { Database, Zap, Brain, ShieldCheck, Smartphone, Users } from 'lucide-react';

const FEATURES = [
  {
    icon: Database,
    title: 'Multi-Tenant Architecture',
    description: 'Built from the ground up to securely isolate data across different hospital branches and independent clinics on the same infrastructure.'
  },
  {
    icon: Zap,
    title: 'Real-Time Everything',
    description: 'Powered by Socket.io and Redis, experience instant updates across dashboards, from patient vitals to inventory tracking and emergency alerts.'
  },
  {
    icon: Brain,
    title: 'AI-Powered Clinical Decisions',
    description: 'Integrated directly with GPT-4o for differential diagnosis generation, natural language querying, and voice-to-SOAP note dictation.'
  },
  {
    icon: ShieldCheck,
    title: 'HIPAA-Ready Compliance',
    description: 'Automated audit logs, end-to-end encryption, and regulatory tracking dashboards to ensure you always meet the latest compliance standards.'
  },
  {
    icon: Users,
    title: 'Complete RBAC',
    description: 'Granular access control featuring 15 pre-configured roles. Restrict data access down to the individual module and action level.'
  },
  {
    icon: Smartphone,
    title: 'Native Mobile Apps',
    description: 'Empower doctors with clinical summaries on the go, and give patients full control over their appointments via dedicated React Native apps.'
  }
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-[#0A1628] border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for the Modern Hospital</h2>
          <p className="text-lg text-slate-400">
            MedicaLink HMS replaces fragmented legacy software with a unified, high-performance platform that just works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative bg-[#0F1C2E] rounded-2xl p-8 border border-white/5 hover:border-indigo-500/50 transition-colors overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feat.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
