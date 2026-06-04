import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion } from 'framer-motion';

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // In Phase 1, we will uncomment this to enforce authentication
  /*
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  */

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <motion.div
        initial={false}
        animate={{ marginLeft: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-h-screen relative"
      >
        <Header />
        <main className="flex-1 overflow-x-hidden bg-muted/10">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
