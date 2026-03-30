import React, { useState } from 'react';
import { useGroups } from '../../hooks/useGroups';
import { Plus, Users, ArrowRight, Search, Sparkles, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CreateGroupModal } from './CreateGroupModal';
import { JoinGroupModal } from './JoinGroupModal';
import { motion, AnimatePresence } from 'motion/react';

export const GroupsPage: React.FC = () => {
  const { data: groups, isLoading } = useGroups();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups?.filter((group: any) => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <div className="h-12 w-64 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="h-6 w-96 bg-slate-100 rounded-full animate-pulse"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-14 w-40 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="h-14 w-48 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
        <div className="h-20 w-full bg-slate-100 rounded-[32px] animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-white/50 rounded-[40px] border border-slate-100 animate-pulse"></div>
          ))}
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 text-accent rounded-full text-xs font-black uppercase tracking-[0.2em]"
          >
            <Sparkles className="w-4 h-4" />
            Your Circles
          </motion.div>
          <h1 className="text-6xl font-black tracking-tighter text-brand leading-none">Your Groups</h1>
          <p className="text-slate-500 text-xl font-medium max-w-xl">Manage and split expenses with your favorite people.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setJoinModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-white text-brand font-black py-5 px-10 rounded-[28px] border-2 border-slate-100 hover:border-accent hover:text-accent transition-all shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-6 h-6 rotate-45" />
            Join Group
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateModalOpen(true)}
            className="group relative flex items-center justify-center gap-3 bg-brand text-white font-black py-5 px-10 rounded-[28px] transition-all shadow-2xl shadow-brand/20 overflow-hidden w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-start to-primary-end opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Plus className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Create New Group</span>
          </motion.button>
        </div>
      </header>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative group"
      >
        <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-slate-300 group-focus-within:text-accent transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search your groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-20 pr-10 py-8 bg-white border-2 border-slate-50 rounded-[40px] focus:outline-none focus:border-accent focus:ring-8 focus:ring-accent/5 text-2xl font-medium transition-all shadow-sm placeholder:text-slate-200"
        />
      </motion.div>

      <section>
        <AnimatePresence mode="popLayout">
          {groups && groups.length > 0 ? (
            filteredGroups && filteredGroups.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
              >
                {filteredGroups.map((group: any, i: number) => (
                  <motion.div
                    key={group.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/groups/${group.id}`}
                      className="group flex flex-col h-full bg-white rounded-[48px] border border-slate-100 p-10 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-3 transition-all duration-500"
                    >
                      <div className="flex items-start justify-between mb-10">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 overflow-hidden border border-slate-100 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                          {group.avatar_url ? (
                            <img src={group.avatar_url} alt={group.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-12 h-12" />
                          )}
                        </div>
                        <div className="px-5 py-2.5 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-inner">
                          {group.members?.length || 0} Members
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-3xl font-black text-brand mb-4 group-hover:text-accent transition-colors leading-tight">
                          {group.name}
                        </h3>
                        <p className="text-slate-400 text-lg line-clamp-2 mb-10 font-medium leading-relaxed opacity-80">
                          {group.description || 'No description provided for this group.'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-10 border-t border-slate-50 mt-auto">
                        <div>
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 opacity-60">Your Balance</span>
                          <span className="text-3xl font-black text-brand tracking-tighter">₹0.00</span>
                        </div>
                        <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-300 group-hover:bg-brand group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                          <ArrowRight className="w-7 h-7" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-40 bg-white rounded-[64px] border border-slate-100 shadow-sm"
              >
                <div className="w-40 h-40 bg-slate-50 rounded-[56px] flex items-center justify-center mx-auto mb-12 shadow-inner">
                  <Search className="w-20 h-20 text-slate-200" />
                </div>
                <h3 className="text-4xl font-black text-brand mb-6">No matches found</h3>
                <p className="text-slate-400 text-2xl max-w-md mx-auto mb-16 font-medium leading-relaxed">We couldn't find any groups matching "{searchQuery}"</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery('')}
                  className="px-16 py-6 bg-slate-100 text-brand font-black rounded-[32px] hover:bg-slate-200 transition-all uppercase tracking-widest text-sm"
                >
                  Clear search
                </motion.button>
              </motion.div>
            )
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-40 bg-white rounded-[64px] border border-slate-100 shadow-sm"
            >
              <div className="w-40 h-40 bg-slate-50 rounded-[56px] flex items-center justify-center mx-auto mb-12 shadow-inner">
                <Users className="w-20 h-20 text-slate-200" />
              </div>
              <h3 className="text-4xl font-black text-brand mb-6">Start a new group</h3>
              <p className="text-slate-400 text-2xl max-w-lg mx-auto mb-16 font-medium leading-relaxed">
                Groups are the best way to track shared expenses with friends, family, and roommates.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCreateModalOpen(true)}
                className="group relative px-16 py-6 bg-brand text-white font-black rounded-[32px] transition-all shadow-2xl shadow-brand/20 flex items-center gap-4 mx-auto overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-start to-primary-end opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Plus className="w-7 h-7 relative z-10" />
                <span className="relative z-10">Create Your First Group</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {isCreateModalOpen && <CreateGroupModal onClose={() => setCreateModalOpen(false)} />}
        {isJoinModalOpen && <JoinGroupModal onClose={() => setJoinModalOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};
