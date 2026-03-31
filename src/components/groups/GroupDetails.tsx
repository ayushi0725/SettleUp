import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGroupDetails } from '../../hooks/useGroupDetails';
import { Plus, Users, ArrowLeft, Receipt, Wallet, TrendingUp, TrendingDown, MoreVertical, Share2, Calculator, CheckCircle2, Sparkles, History, MessageSquare, X, Settings, Search, ArrowUpRight, ArrowDownLeft, Lightbulb } from 'lucide-react';
import { EditGroupModal } from './EditGroupModal';
import { aiService } from '../../services/aiService';
import { toast } from 'sonner';
import { AddExpenseModal } from '../expenses/AddExpenseModal';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { calculateSettlements, UserBalance, Transaction } from '../../lib/settlement-engine';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

export const GroupDetails: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user: currentUser } = useStore();
  const { data: group, isLoading, error } = useGroupDetails(groupId);
  const [isAddExpenseOpen, setAddExpenseOpen] = useState(false);
  const [isEditGroupOpen, setEditGroupOpen] = useState(false);
  const [showInviteQR, setShowInviteQR] = useState(false);
  const [isTripSummaryLoading, setTripSummaryLoading] = useState(false);
  const [tripSummary, setTripSummary] = useState<string | null>(null);
  const [isInsightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<Transaction | null>(null);
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');

  const handleGenerateTripSummary = async () => {
    if (!group?.expenses || group.expenses.length === 0) {
      toast.error('No expenses to summarize!');
      return;
    }
    setTripSummaryLoading(true);
    try {
      const summary = await aiService.generateGroupSummary(group.expenses, group.members);
      setTripSummary(summary);
      toast.success('Trip summary generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate summary.');
    } finally {
      setTripSummaryLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!group?.expenses || group.expenses.length === 0) {
      toast.error('No expenses for insights!');
      return;
    }
    setInsightsLoading(true);
    try {
      const result = await aiService.generateSpendingInsights(group.expenses);
      setInsights(result);
      toast.success('Spending insights generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate insights.');
    } finally {
      setInsightsLoading(false);
    }
  };

  // Calculate Balances
  const balances: UserBalance[] = group?.members.map((member: any) => {
    let net = 0;
    group.expenses.forEach((expense: any) => {
      if (expense.paid_by === member.user_id) {
        net += expense.amount;
      }
    });
    group.expenses.forEach((expense: any) => {
      const userSplit = expense.splits?.find((s: any) => s.user_id === member.user_id);
      if (userSplit) {
        net -= userSplit.amount_owed;
      }
    });
    return { userId: member.user_id, balance: net };
  }) || [];

  const settlements = calculateSettlements([...balances]);

  if (isLoading) return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-6">
        <div className="h-14 w-14 bg-slate-200 rounded-2xl animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-10 w-64 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-6 w-96 bg-slate-100 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="h-20 w-full bg-slate-100 rounded-[32px] animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-[40px] border border-slate-100 animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="space-y-10">
          <div className="h-96 bg-white rounded-[48px] border border-slate-100 animate-pulse"></div>
          <div className="h-64 bg-slate-900 rounded-[48px] animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  if (error || !group) return (
    <div className="text-center py-40 bg-white rounded-[64px] border border-slate-100 shadow-sm max-w-2xl mx-auto">
      <div className="w-40 h-40 bg-slate-50 rounded-[56px] flex items-center justify-center mx-auto mb-12 shadow-inner">
        <X className="w-20 h-20 text-slate-200" />
      </div>
      <h2 className="text-4xl font-black text-brand mb-6 tracking-tighter">Group not found</h2>
      <Link to="/" className="inline-flex items-center gap-2 px-12 py-5 bg-brand text-white font-black rounded-[28px] hover:bg-slate-800 transition-all shadow-xl shadow-brand/20">
        <ArrowLeft className="w-6 h-6" />
        Back to Dashboard
      </Link>
    </div>
  );

  const groupData = group as any;
  const inviteUrl = `${window.location.origin}/join/${groupId}`;

  const filteredExpenses = group.expenses?.filter((expense: any) =>
    expense.description.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
    expense.category?.toLowerCase().includes(expenseSearchQuery.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    try {
      if (date && typeof date.toDate === 'function') {
        return format(date.toDate(), 'MMM d, yyyy');
      }
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Invalid date';
      return format(d, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (date: any) => {
    if (!date) return 'Just now';
    try {
      if (date && typeof date.toDate === 'function') {
        return format(date.toDate(), 'MMM d, HH:mm');
      }
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Invalid date';
      return format(d, 'MMM d, HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-16 pb-20"
    >
      <AnimatePresence>
        {selectedSettlement && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-[56px] shadow-2xl p-12 text-center"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-brand tracking-tighter">Settle Up</h3>
                <button onClick={() => setSelectedSettlement(null)} className="p-4 hover:bg-slate-50 rounded-[24px] transition-all">
                  <X className="w-8 h-8 text-slate-400" />
                </button>
              </div>
              
              <div className="mb-12">
                <p className="text-slate-400 text-xl font-medium mb-4">You are paying</p>
                <div className="text-7xl font-black text-brand mb-4 tracking-tighter">₹{selectedSettlement.amount.toFixed(2)}</div>
                <p className="text-slate-500 text-xl font-medium">to <span className="font-black text-accent">{group.members.find((m: any) => m.user_id === selectedSettlement.to)?.user?.name}</span></p>
              </div>

              <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 mb-12 flex flex-col items-center shadow-inner">
                <QRCodeSVG 
                  value={`upi://pay?pa=${group.members.find((m: any) => m.user_id === selectedSettlement.to)?.user?.email?.split('@')[0]}@upi&pn=${encodeURIComponent(group.members.find((m: any) => m.user_id === selectedSettlement.to)?.user?.name || '')}&am=${selectedSettlement.amount}&cu=INR`} 
                  size={240} 
                  className="rounded-3xl"
                />
                <p className="mt-8 text-[11px] text-slate-400 font-black uppercase tracking-[0.3em]">Scan to pay via UPI</p>
              </div>

              <motion.a 
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                href={`upi://pay?pa=${group.members.find((m: any) => m.user_id === selectedSettlement.to)?.user?.email?.split('@')[0]}@upi&pn=${encodeURIComponent(group.members.find((m: any) => m.user_id === selectedSettlement.to)?.user?.name || '')}&am=${selectedSettlement.amount}&cu=INR`}
                className="w-full bg-brand text-white font-black py-6 rounded-[28px] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand/20 text-lg"
              >
                <Wallet className="w-7 h-7" />
                Open UPI App
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="flex items-start gap-8">
          <Link to="/" className="mt-2 p-4 bg-white hover:bg-slate-50 rounded-[24px] border border-slate-100 shadow-sm transition-all group">
            <ArrowLeft className="w-7 h-7 text-slate-400 group-hover:text-accent" />
          </Link>
          <div className="flex items-center gap-8">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center text-slate-300 border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50"
            >
              {groupData.avatar_url ? (
                <img src={groupData.avatar_url} alt={groupData.name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-16 h-16" />
              )}
            </motion.div>
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-6xl font-black tracking-tighter text-brand leading-none">{groupData.name}</h1>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  onClick={() => setEditGroupOpen(true)}
                  className="p-3 hover:bg-slate-100 rounded-2xl text-slate-300 hover:text-accent transition-all"
                >
                  <Settings className="w-7 h-7" />
                </motion.button>
              </div>
              <p className="text-slate-500 text-2xl font-medium opacity-70">{groupData.description || 'Shared expenses group'}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateTripSummary}
            disabled={isTripSummaryLoading}
            className="flex items-center gap-3 bg-white border-2 border-slate-100 text-slate-700 font-black py-5 px-8 rounded-[28px] hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`w-6 h-6 ${isTripSummaryLoading ? 'animate-spin' : 'text-orange-500'}`} />
            AI Summary
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowInviteQR(!showInviteQR)}
            className="flex items-center gap-3 bg-white border-2 border-slate-100 text-slate-700 font-black py-5 px-8 rounded-[28px] hover:border-accent hover:text-accent transition-all shadow-sm"
          >
            <Share2 className="w-6 h-6" />
            Invite
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateInsights}
            disabled={isInsightsLoading}
            className="flex items-center gap-3 bg-white border-2 border-slate-100 text-slate-700 font-black py-5 px-8 rounded-[28px] hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
          >
            <Lightbulb className={`w-6 h-6 ${isInsightsLoading ? 'animate-spin' : 'text-blue-500'}`} />
            Insights
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAddExpenseOpen(true)}
            className="group relative flex items-center gap-3 bg-brand text-white font-black py-5 px-10 rounded-[28px] transition-all shadow-2xl shadow-brand/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-start to-primary-end opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Plus className="w-7 h-7 relative z-10" />
            <span className="relative z-10">Add Expense</span>
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {tripSummary && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-orange-50 p-12 rounded-[56px] border border-orange-100 shadow-2xl shadow-orange-100/20"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-sm">
                  <Sparkles className="w-9 h-9 text-orange-500" />
                </div>
                <h3 className="text-3xl font-black text-brand tracking-tighter">AI Trip Insights</h3>
              </div>
              <button onClick={() => setTripSummary(null)} className="p-4 hover:bg-orange-100 rounded-[24px] text-orange-400 hover:text-orange-600 transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="prose prose-slate max-w-none text-slate-700 text-2xl leading-relaxed italic font-display opacity-90">
              {tripSummary}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {insights.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-blue-50 p-12 rounded-[56px] border border-blue-100 shadow-2xl shadow-blue-100/20"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-sm">
                  <Lightbulb className="w-9 h-9 text-blue-500" />
                </div>
                <h3 className="text-3xl font-black text-brand tracking-tighter">Smart Spending Insights</h3>
              </div>
              <button onClick={() => setInsights([])} className="p-4 hover:bg-blue-100 rounded-[24px] text-blue-400 hover:text-blue-600 transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[32px] border border-blue-50 shadow-sm">
                  <p className="text-slate-700 font-bold leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInviteQR && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white p-16 rounded-[64px] border border-slate-100 shadow-2xl flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-4xl font-black text-brand mb-4 tracking-tighter">Invite Members</h3>
            <p className="text-slate-500 text-xl mb-12 max-w-md font-medium opacity-70">Scan this QR code or share the link to invite friends to this group.</p>
            <div className="p-12 bg-slate-50 rounded-[56px] shadow-inner mb-12 border border-slate-100">
              <QRCodeSVG value={inviteUrl} size={280} className="rounded-3xl" />
            </div>
            <div className="w-full max-w-xl bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex items-center justify-between gap-8 shadow-inner">
              <code className="text-lg font-mono text-slate-400 truncate opacity-80">{inviteUrl}</code>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  toast.success('Link copied to clipboard!');
                }}
                className="px-10 py-4 bg-brand text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-brand/20"
              >
                Copy
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content: Expenses */}
        <div className="lg:col-span-2 space-y-16">
          <section className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-[20px] flex items-center justify-center text-brand shadow-inner">
                  <Receipt className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black text-brand tracking-tighter">Recent Expenses</h2>
              </div>
              
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={expenseSearchQuery}
                  onChange={(e) => setExpenseSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-50 rounded-[32px] focus:outline-none focus:border-accent focus:ring-8 focus:ring-accent/5 transition-all text-lg font-medium shadow-sm placeholder:text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredExpenses && filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense: any, i: number) => (
                    <motion.div 
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 10 }}
                      className="group bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 group-hover:bg-brand group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-6">
                          <Calculator className="w-10 h-10" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-brand mb-2 group-hover:text-accent transition-colors leading-tight">{expense.description}</h4>
                          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                            <span className="px-3 py-1.5 bg-slate-50 rounded-xl shadow-inner">{formatDate(expense.date)}</span>
                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                            <span className="px-3 py-1.5 bg-accent/5 text-accent rounded-xl shadow-inner">{expense.category || 'General'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black text-brand mb-2 tracking-tighter">₹{expense.amount.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-60">Paid by <span className="text-brand">{expense.paid_by_name || 'Member'}</span></div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-40 bg-slate-50/50 rounded-[64px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-32 h-32 bg-white rounded-[40px] shadow-sm flex items-center justify-center text-slate-200 mb-10">
                      <Receipt className="w-16 h-16" />
                    </div>
                    <h3 className="text-3xl font-black text-brand mb-4 tracking-tighter">No expenses yet</h3>
                    <p className="text-slate-400 text-xl mb-12 max-w-xs mx-auto font-medium opacity-70">Start tracking shared costs in this group to see them here.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAddExpenseOpen(true)}
                      className="bg-brand text-white font-black py-6 px-12 rounded-[32px] hover:bg-slate-800 transition-all shadow-2xl shadow-brand/20 uppercase tracking-widest text-sm"
                    >
                      Add First Expense
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-[16px] flex items-center justify-center text-brand shadow-inner">
                <History className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-black text-brand tracking-tighter">Activity Feed</h2>
            </div>
            <div className="space-y-10 relative pl-8">
              <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-slate-100 rounded-full" />
              {group.expenses.slice(0, 5).map((expense: any, i: number) => (
                <motion.div 
                  key={`activity-${expense.id}`} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -left-[37px] top-1.5 w-4 h-4 bg-white border-4 border-accent rounded-full shadow-sm" />
                  <div className="space-y-2">
                    <p className="text-xl text-slate-600 font-medium leading-relaxed">
                      <span className="font-black text-brand">{expense.paid_by_name}</span> added 
                      <span className="font-black text-accent"> "{expense.description}"</span>
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black opacity-60">
                      {formatDateTime(expense.date)}
                    </span>
                  </div>
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="relative"
              >
                <div className="absolute -left-[37px] top-1.5 w-4 h-4 bg-white border-4 border-brand rounded-full shadow-sm" />
                <div className="space-y-2">
                  <p className="text-xl text-slate-600 font-medium leading-relaxed">
                    Group <span className="font-black text-brand">"{groupData.name}"</span> was created
                  </p>
                  <span className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black opacity-60">
                    {formatDateTime(groupData.created_at || Date.now())}
                  </span>
                </div>
              </motion.div>
            </div>
          </section>
        </div>

        {/* Sidebar: Members & Balances */}
        <div className="space-y-12">
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-brand tracking-tighter">Members</h3>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-accent transition-all"
              >
                <Plus className="w-6 h-6" />
              </motion.button>
            </div>
            <div className="space-y-8">
              {group.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between group/member">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-300 font-black border border-slate-100 overflow-hidden shadow-inner group-hover/member:scale-110 transition-transform">
                      {member.user?.avatar_url ? (
                        <img src={member.user.avatar_url} alt={member.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{member.user?.name?.[0] || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-black text-brand leading-tight">{member.user?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-60">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const balance = balances.find(b => b.userId === member.user_id)?.balance || 0;
                      const isPositive = balance >= 0;
                      return (
                        <div className={`flex flex-col items-end`}>
                          <div className={`text-lg font-black tracking-tighter flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            ₹{Math.abs(balance).toFixed(2)}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                            {isPositive ? 'Owed' : 'Owes'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-brand text-white p-10 rounded-[56px] shadow-2xl shadow-brand/30 relative overflow-hidden group/settle"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover/settle:scale-150 transition-transform duration-1000" />
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter">Settlements</h3>
            </div>
            
            <div className="space-y-6 mb-12 relative z-10">
              {settlements.length > 0 ? (
                settlements.map((s, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-sm group/item"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-black">
                        {group.members.find((m: any) => m.user_id === s.from)?.user?.name || 'Member'} owes
                      </span>
                      <span className="text-lg font-black leading-tight">
                        {group.members.find((m: any) => m.user_id === s.to)?.user?.name || 'Member'}
                      </span>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="text-2xl font-black text-emerald-400 tracking-tighter">₹{s.amount.toFixed(2)}</div>
                      {s.from === currentUser?.uid && (
                        <motion.button 
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedSettlement(s)}
                          className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-900/40 hover:bg-emerald-400 transition-all"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-xl text-white/40 italic font-display py-6 text-center">All settled up! No payments needed. ✨</div>
              )}
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={settlements.length === 0}
              className="w-full bg-white text-brand font-black py-6 px-8 rounded-[28px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-30 relative z-10 shadow-xl"
            >
              <Calculator className="w-6 h-6" />
              Simplify Debts
            </motion.button>
          </motion.section>
        </div>
      </div>

      <AnimatePresence>
        {isAddExpenseOpen && (
          <AddExpenseModal 
            groupId={groupId!} 
            members={group.members} 
            lastExpenses={group.expenses}
            onClose={() => setAddExpenseOpen(false)} 
          />
        )}
        {isEditGroupOpen && (
          <EditGroupModal 
            group={groupData} 
            onClose={() => setEditGroupOpen(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
