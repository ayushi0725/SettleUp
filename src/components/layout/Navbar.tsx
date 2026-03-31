import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { useStore } from '../../store/useStore';
import { LogOut, Users, LayoutDashboard, Menu, User, Mail, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);

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
                className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-accent/20 bg-white border border-slate-100 flex items-center justify-center"
              >
                <img 
                  src="public/logo.png" 
                  alt="Settleup Logo" 
                  className="w-full h-full object-contain p-1.5"
                  referrerPolicy="no-referrer"
                />
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
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfile(!showProfile)}
                className="hidden sm:flex items-center gap-4 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 cursor-pointer transition-colors"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-xl shadow-sm" />
                ) : (
                  <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                    <span className="text-xs font-bold">{user.displayName?.[0] || 'U'}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-brand leading-none">{user.displayName || 'User'}</span>
                </div>
              </motion.div>

              <AnimatePresence>
                {showProfile && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowProfile(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl shadow-brand/10 border border-slate-100 p-6 z-50 overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-black text-brand tracking-tight">Profile Details</h3>
                        <button 
                          onClick={() => setShowProfile(false)}
                          className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Full Name</span>
                            <span className="text-sm font-bold text-brand">{user.displayName || 'Not set'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Email Address</span>
                            <span className="text-sm font-bold text-brand truncate max-w-[160px]">{user.email}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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
