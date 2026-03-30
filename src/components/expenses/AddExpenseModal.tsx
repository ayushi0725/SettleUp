import React, { useState } from 'react';
import { collection, serverTimestamp, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { useStore } from '../../store/useStore';
import { X, Calculator, Sparkles, Camera, Check, Receipt, CreditCard, PieChart, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

interface AddExpenseModalProps {
  groupId: string;
  members: any[];
  onClose: () => void;
}

type SplitMode = 'equal' | 'custom' | 'percent' | 'shares';

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ groupId, members, onClose }) => {
  const { user } = useStore();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paidBy, setPaidBy] = useState(user?.uid || '');
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(members.map(m => m.user_id));
  const [splitValues, setSplitValues] = useState<{ [key: string]: number }>({});
  const [isAiLoading, setAiLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleAiCategorize = async () => {
    if (!description.trim()) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Categorize this expense description into one of these 8 categories: Food, Travel, Accommodation, Entertainment, Utilities, Shopping, Health, Other. Description: "${description}"`,
      });
      const category = response.text?.trim() || 'Other';
      toast.info(`AI suggested category: ${category}`);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleReceiptOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { text: 'Extract the merchant name, total amount, and date from this receipt. Return as JSON: { "merchant": string, "total": number, "date": string }' },
              { inlineData: { data: base64Data, mimeType: file.type } }
            ]
          }
        });

        try {
          const result = JSON.parse(response.text?.replace(/```json|```/g, '') || '{}');
          if (result.merchant) setDescription(result.merchant);
          if (result.total) setAmount(result.total);
          toast.success('Receipt details extracted!');
        } catch (err) {
          console.error('Failed to parse AI response', err);
          toast.error('Could not parse receipt details.');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error('OCR failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const calculateSplits = () => {
    let splits: { userId: string; amount: number }[] = [];
    
    if (splitMode === 'equal') {
      const splitAmount = amount / selectedParticipants.length;
      splits = selectedParticipants.map(id => ({ userId: id, amount: splitAmount }));
    } else if (splitMode === 'custom') {
      splits = selectedParticipants.map(id => ({ userId: id, amount: splitValues[id] || 0 }));
    } else if (splitMode === 'percent') {
      splits = selectedParticipants.map(id => ({ userId: id, amount: (amount * (splitValues[id] || 0)) / 100 }));
    } else if (splitMode === 'shares') {
      const totalShares = selectedParticipants.reduce((sum, id) => sum + (splitValues[id] || 0), 0);
      splits = selectedParticipants.map(id => ({ 
        userId: id, 
        amount: totalShares > 0 ? (amount * (splitValues[id] || 0)) / totalShares : 0 
      }));
    }
    return splits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !description.trim() || amount <= 0) return;

    const splits = calculateSplits();
    const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
    
    if (Math.abs(totalSplit - amount) > 0.01) {
      toast.error(`Total split (₹${totalSplit.toFixed(2)}) must equal total amount (₹${amount.toFixed(2)})`);
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const expenseRef = doc(collection(db, 'groups', groupId, 'expenses'));
      const expenseData = {
        group_id: groupId,
        paid_by: paidBy,
        paid_by_name: members.find(m => m.user_id === paidBy)?.user?.name || 'Member',
        description: description.trim(),
        amount: Number(amount),
        currency: 'INR',
        category: 'General',
        split_type: splitMode,
        date: new Date().toISOString(),
        created_at: serverTimestamp(),
      };
      batch.set(expenseRef, expenseData);

      splits.forEach(split => {
        const splitRef = doc(collection(db, 'groups', groupId, 'expenses', expenseRef.id, 'splits'));
        batch.set(splitRef, {
          expense_id: expenseRef.id,
          user_id: split.userId,
          amount_owed: split.amount,
          is_settled: false,
        });
      });

      await batch.commit();
      toast.success('Expense added!');
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleSplitValueChange = (userId: string, value: string) => {
    setSplitValues(prev => ({ ...prev, [userId]: Number(value) }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[64px] shadow-2xl overflow-hidden border border-white/50 my-8"
      >
        <div className="flex items-center justify-between px-12 py-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-brand/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Expense</h2>
              <p className="text-sm font-medium text-slate-500">Split bills with your friends</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                <div className="relative flex gap-3">
                  <div className="relative flex-1">
                    <Receipt className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={handleAiCategorize}
                      className="w-full pl-14 pr-5 py-5 bg-slate-50/50 border border-slate-100 rounded-[28px] focus:ring-4 focus:ring-brand/10 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                      placeholder="e.g., Dinner at Swiggy"
                    />
                  </div>
                  <label className="p-5 bg-slate-50/50 border border-slate-100 rounded-[28px] cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center justify-center group">
                    <Camera className="w-6 h-6 text-slate-400 group-hover:text-brand transition-colors" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleReceiptOcr} disabled={isAiLoading} />
                  </label>
                  {isAiLoading && (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute right-20 top-1/2 -translate-y-1/2"
                    >
                      <Sparkles className="w-5 h-5 text-brand/30" />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">₹</span>
                  <input
                    required
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-14 pr-6 py-6 bg-slate-50/50 border border-slate-100 rounded-[32px] text-4xl font-black focus:ring-4 focus:ring-brand/10 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Paid By</label>
                <div className="relative">
                  <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full pl-14 pr-10 py-5 bg-slate-50/50 border border-slate-100 rounded-[28px] focus:ring-4 focus:ring-brand/10 focus:bg-white outline-none transition-all appearance-none font-bold text-slate-900"
                  >
                    {members.map(m => (
                      <option key={m.user_id} value={m.user_id}>{m.user?.name || 'Member'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Split Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['equal', 'custom', 'percent', 'shares'] as SplitMode[]).map(mode => (
                    <motion.button
                      key={mode}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSplitMode(mode)}
                      className={`px-4 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all border ${
                        splitMode === mode 
                          ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {mode}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Participants</label>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    onClick={() => setSelectedParticipants(members.map(m => m.user_id))}
                    className="text-[10px] font-black text-brand uppercase tracking-widest hover:opacity-70"
                  >
                    Select All
                  </motion.button>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {members.map((member, i) => (
                      <motion.div 
                        key={member.user_id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="space-y-3"
                      >
                        <motion.button
                          type="button"
                          whileHover={{ x: 5 }}
                          onClick={() => {
                            if (selectedParticipants.includes(member.user_id)) {
                              setSelectedParticipants(selectedParticipants.filter(id => id !== member.user_id));
                            } else {
                              setSelectedParticipants([...selectedParticipants, member.user_id]);
                            }
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-[24px] border transition-all ${
                            selectedParticipants.includes(member.user_id)
                              ? 'bg-brand/5 border-brand shadow-sm'
                              : 'bg-white border-slate-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[14px] bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                              {member.user?.name?.[0] || 'U'}
                            </div>
                            <span className="text-sm font-black text-slate-900">{member.user?.name || 'Member'}</span>
                          </div>
                          {selectedParticipants.includes(member.user_id) && (
                            <div className="w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </motion.button>
                        
                        {selectedParticipants.includes(member.user_id) && splitMode !== 'equal' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-3 px-4 pb-2"
                          >
                            <div className="p-2 bg-slate-100 rounded-lg">
                              {splitMode === 'custom' ? <Calculator className="w-3 h-3 text-slate-400" /> : 
                               splitMode === 'percent' ? <PieChart className="w-3 h-3 text-slate-400" /> : 
                               <Users className="w-3 h-3 text-slate-400" />}
                            </div>
                            <input
                              type="number"
                              value={splitValues[member.user_id] || ''}
                              onChange={(e) => handleSplitValueChange(member.user_id, e.target.value)}
                              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all"
                              placeholder={splitMode === 'custom' ? 'Amount' : splitMode === 'percent' ? '%' : 'Shares'}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
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
              disabled={isLoading || amount <= 0 || selectedParticipants.length === 0}
              className="flex-1 px-8 py-5 bg-brand text-white font-black rounded-[28px] hover:shadow-2xl hover:shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
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
                  Save Expense
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
