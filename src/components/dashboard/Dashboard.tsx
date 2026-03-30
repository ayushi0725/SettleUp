import React, { useState } from 'react';
import { useGroups } from '../../hooks/useGroups';
import { Plus, Users, ArrowRight, Wallet, TrendingUp, TrendingDown, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CreateGroupModal } from '../groups/CreateGroupModal';
import { JoinGroupModal } from '../groups/JoinGroupModal';
import { motion, AnimatePresence } from 'motion/react';

const SkeletonCard = () => (
  <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[40px] border border-white/20 shadow-sm animate-pulse">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
      <div className="h-4 w-24 bg-slate-200 rounded-full"></div>
    </div>
    <div className="h-12 w-32 bg-slate-200 rounded-2xl mb-4"></div>
    <div className="h-3 w-40 bg-slate-200 rounded-full"></div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { data: groups, isLoading } = useGroups();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-12 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="h-12 w-64 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-6 w-96 bg-slate-100 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/50 rounded-3xl border border-slate-100 animate-pulse"></div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-64 bg-white/50 rounded-[40px] border border-slate-100 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-16 pb-20"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand/5 text-brand rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Sparkles className="w-4 h-4" />
            Overview
          </motion.div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none">
            Welcome back!
          </h1>
          <p className="text-slate-500 text-xl font-medium max-w-2xl">
            Your finances are looking sharp. Here's a quick look at your shared balances.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setJoinModalOpen(true)}
            className="px-8 py-5 border border-slate-200 text-slate-600 font-black rounded-[28px] hover:bg-slate-50 transition-all shadow-xl shadow-slate-100"
          >
            Join Group
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateModalOpen(true)}
            className="group relative flex items-center justify-center gap-3 bg-brand text-white font-black py-5 px-10 rounded-[28px] transition-all shadow-2xl shadow-brand/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-start to-primary-end opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Plus className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Create Group</span>
          </motion.button>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Balance', value: '₹0.00', icon: Wallet, color: 'slate', sub: 'Across all groups', gradient: 'from-slate-500/10 to-slate-500/5' },
          { label: 'You are owed', value: '₹0.00', icon: TrendingUp, color: 'emerald', sub: 'From 0 people', gradient: 'from-emerald-500/10 to-emerald-500/5' },
          { label: 'You owe', value: '₹0.00', icon: TrendingDown, color: 'rose', sub: 'To 0 people', gradient: 'from-rose-500/10 to-rose-500/5' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            whileHover={{ translateY: -8, scale: 1.02 }}
            className="glass p-10 rounded-[48px] border border-white/50 shadow-2xl shadow-slate-200/20 relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className="flex items-center gap-4 text-slate-400 mb-8">
                <div className={`p-4 bg-${stat.color}-50 rounded-[20px] text-${stat.color}-500 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">{stat.label}</span>
              </div>
              <div className={`text-5xl font-black tracking-tighter text-slate-900 group-hover:text-${stat.color}-600 transition-colors duration-500`}>
                {stat.value}
              </div>
              <p className="text-slate-400 text-sm mt-6 font-bold uppercase tracking-widest opacity-60">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Quick Groups */}
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-brand shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-4xl font-black tracking-tight text-brand">Your Groups</h2>
            </div>
            <Link to="/groups" className="group text-xs font-black text-slate-400 hover:text-accent transition-all uppercase tracking-[0.2em] flex items-center gap-3">
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {groups && groups.length > 0 ? (
                groups.slice(0, 3).map((group: any, i: number) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Link
                      to={`/groups/${group.id}`}
                      className="flex items-center justify-between p-8 bg-white rounded-[32px] border border-slate-100 hover:border-accent/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-400 overflow-hidden border border-slate-100 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                          {group.avatar_url ? (
                            <img src={group.avatar_url} alt={group.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-10 h-10" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-brand mb-1 group-hover:text-accent transition-colors">{group.name}</h3>
                          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest opacity-60">Active recently</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-brand group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-20 text-center bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-200"
                >
                  <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-8">
                    <Users className="w-12 h-12 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-brand mb-3">No groups yet</h3>
                  <p className="text-slate-400 mb-10 max-w-[280px] mx-auto font-medium text-lg leading-relaxed">Create a group to start splitting expenses with your circle.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCreateModalOpen(true)}
                    className="px-10 py-5 bg-brand text-white font-black rounded-[24px] hover:bg-slate-800 transition-all shadow-2xl shadow-brand/20"
                  >
                    Create your first group
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {groups && groups.length > 3 && (
              <Link to="/groups" className="block w-full py-6 text-center bg-slate-50 rounded-[32px] text-xs font-black text-slate-400 hover:bg-slate-100 hover:text-brand transition-all uppercase tracking-[0.2em]">
                And {groups.length - 3} more groups
              </Link>
            )}
          </div>
        </section>

        {/* Recent Activity Placeholder */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-brand shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-brand">Recent Activity</h2>
          </div>
          
          <div className="glass rounded-[48px] border border-white/40 shadow-sm overflow-hidden">
            <div className="p-24 text-center">
              <div className="w-28 h-28 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <Plus className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-3xl font-black text-brand mb-4">No recent activity</h3>
              <p className="text-slate-400 text-xl font-medium max-w-xs mx-auto leading-relaxed">Expenses you add will show up here in real-time.</p>
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateGroupModal onClose={() => setCreateModalOpen(false)} />
        )}
        {isJoinModalOpen && (
          <JoinGroupModal onClose={() => setJoinModalOpen(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
