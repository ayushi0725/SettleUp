import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useStore } from '../../store/useStore';
import { X, Users, ArrowRight, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';

interface JoinGroupModalProps {
  onClose: () => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ onClose }) => {
  const { user } = useStore();
  const [groupId, setGroupId] = useState('');
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupId.trim()) return;

    setLoading(true);
    try {
      const trimmedId = groupId.trim();
      const groupDoc = await getDoc(doc(db, 'groups', trimmedId));
      
      if (!groupDoc.exists()) {
        toast.error('Group not found. Please check the ID.');
        return;
      }

      const memberId = `${trimmedId}_${user.uid}`;
      const memberDoc = await getDoc(doc(db, 'group_members', memberId));
      
      if (memberDoc.exists()) {
        toast.info('You are already a member of this group.');
        navigate(`/groups/${trimmedId}`);
        onClose();
        return;
      }

      await setDoc(doc(db, 'group_members', memberId), {
        group_id: trimmedId,
        user_id: user.uid,
        role: 'member',
        joined_at: serverTimestamp(),
      });

      toast.success(`Joined ${groupDoc.data().name}!`);
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      navigate(`/groups/${trimmedId}`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to join group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[64px] shadow-2xl overflow-hidden border border-white/50"
      >
        <div className="flex items-center justify-between px-12 py-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-brand/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Join Group</h2>
              <p className="text-sm font-medium text-slate-500">Enter a group ID to join</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </motion.button>
        </div>

        <form onSubmit={handleJoin} className="p-12 space-y-10">
          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Group ID</label>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
              <input
                required
                type="text"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full pl-16 pr-6 py-6 bg-slate-50/50 border border-slate-100 rounded-[32px] focus:ring-4 focus:ring-brand/10 focus:bg-white outline-none transition-all font-mono text-lg font-bold tracking-wider text-slate-900 placeholder:text-slate-300"
                placeholder="Paste group ID..."
              />
            </div>
            <div className="flex items-start gap-3 px-2">
              <Sparkles className="w-4 h-4 text-brand mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Ask the group admin for the unique group ID to join their shared expenses.
              </p>
            </div>
          </div>

          <div className="flex gap-6 pt-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-8 py-5 border border-slate-100 text-slate-500 font-black rounded-[28px] hover:bg-slate-50 transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || !groupId.trim()}
              className="flex-[2] px-8 py-5 bg-brand text-white font-black rounded-[28px] hover:shadow-2xl hover:shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Join Group
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
