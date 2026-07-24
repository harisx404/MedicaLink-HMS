import { LandingNavbar } from './components/LandingNavbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesGrid } from './components/FeaturesGrid';
import { ModuleShowcase } from './components/ModuleShowcase';
import { TechStack } from './components/TechStack';
import { AiHighlight } from './components/AiHighlight';
import { LandingFooter } from './components/LandingFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050B14] font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <LandingNavbar />
      
      <main>
        <HeroSection />
        <FeaturesGrid />
        <ModuleShowcase />
        <AiHighlight />
        <TechStack />
      </main>

      <LandingFooter />
    </div>
  );
}
