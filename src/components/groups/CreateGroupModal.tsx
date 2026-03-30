import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useStore } from '../../store/useStore';
import { X, Users, Image as ImageIcon, Sparkles, Type, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';

interface CreateGroupModalProps {
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose }) => {
  const { user } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setLoading(true);
    try {
      const groupRef = await addDoc(collection(db, 'groups'), {
        name: name.trim(),
        description: description.trim(),
        created_by: user.uid,
        created_at: serverTimestamp(),
        avatar_url: avatarUrl.trim() || null,
      });

      await setDoc(doc(db, 'group_members', `${groupRef.id}_${user.uid}`), {
        group_id: groupRef.id,
        user_id: user.uid,
        role: 'admin',
        joined_at: serverTimestamp(),
      });

      toast.success('Group created successfully!');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create group.');
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
        className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[64px] shadow-2xl overflow-hidden border border-white/50"
      >
        <div className="flex items-center justify-between px-12 py-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-brand/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Group</h2>
              <p className="text-sm font-medium text-slate-500">Start splitting bills easily</p>
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

        <form onSubmit={handleSubmit} className="p-12 space-y-10">
          <div className="flex flex-col items-center justify-center mb-4">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="relative group"
            >
              <div className="w-32 h-32 bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-brand/30 transition-all cursor-pointer overflow-hidden shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Icon</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Group Name</label>
              <div className="relative">
                <Type className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50/50 border border-slate-100 rounded-[28px] focus:ring-4 focus:ring-brand/10 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                  placeholder="e.g., Trip to Goa, Flatmates"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Description (Optional)</label>
              <div className="relative">
                <AlignLeft className="absolute left-5 top-6 w-5 h-5 text-slate-400" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50/50 border border-slate-100 rounded-[28px] focus:ring-4 focus:ring-brand/10 focus:bg-white outline-none transition-all resize-none h-32 font-bold text-slate-900 placeholder:text-slate-300"
                  placeholder="What is this group for?"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Icon URL (Optional)</label>
              <div className="relative">
                <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50/50 border border-slate-100 rounded-[28px] focus:ring-4 focus:ring-brand/10 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                  placeholder="https://example.com/icon.png"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-10 border-t border-slate-100">
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
              disabled={isLoading || !name.trim()}
              className="flex-1 px-8 py-5 bg-brand text-white font-black rounded-[28px] hover:shadow-2xl hover:shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Group
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
