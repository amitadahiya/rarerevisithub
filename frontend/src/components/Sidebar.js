import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Sparkles, Calendar, MessageSquare, BarChart3, Settings } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Sparkles, label: 'Content Studio', path: '/content' },
    { icon: Calendar, label: 'Scheduler', path: '/scheduler' },
    { icon: MessageSquare, label: 'Social Inbox', path: '/inbox' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 backdrop-blur-xl bg-black/40 border-r border-white/10 p-6 z-40">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-[#D4AF37] tracking-tight">Rare Revisit</h1>
        <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">Automation Hub</p>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 ${
                isActive
                  ? 'bg-[#D4AF37] text-black font-medium'
                  : 'text-white/70 hover:text-[#D4AF37] hover:bg-white/5'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* AI Avatar */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="glass-card rounded-sm p-4 border border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <img 
              src="https://www.rarerevisit.com/lovable-uploads/product_images/avatar.png" 
              alt="AI Assistant"
              className="w-10 h-10 rounded-full float-animation"
            />
            <div>
              <p className="text-sm font-medium text-white">AI Assistant</p>
              <p className="text-xs text-white/50">Ready to help</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};