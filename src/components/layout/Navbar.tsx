import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { useStore } from '../../store/useStore';
import { LogOut, Users, LayoutDashboard, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('Failed to log out.');
    }
  };

  if (!user) return null;

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/groups', label: 'Groups', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-gradient-to-br from-primary-start to-primary-end rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-accent/20"
              >
                S
              </motion.div>
              <span className="text-2xl font-black tracking-tighter text-brand group-hover:text-accent transition-colors">Settleup</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-2.5 py-2 text-sm font-bold transition-all duration-300 ${
                      isActive ? 'text-accent' : 'text-slate-500 hover:text-brand'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-slate-400'}`} />
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-xl shadow-sm" />
              ) : (
                <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                  <span className="text-xs font-bold">{user.displayName?.[0] || 'U'}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-bold text-brand leading-none mb-1">{user.displayName || 'User'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Premium</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300 group"
              title="Logout"
            >
              <LogOut className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>

            <button className="md:hidden p-3 text-slate-400 hover:text-brand hover:bg-slate-50 rounded-2xl transition-all">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
