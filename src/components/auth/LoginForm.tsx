import React, { useState, useEffect } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { LogIn, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useStore();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Logged in successfully!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error(error);
      toast.error('Failed to log in with Google.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      // Try to sign in first
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError: any) {
        // If user doesn't exist, try to create an account
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw signInError;
        }
      }
      toast.success('Logged in successfully!');
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to log in with email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-slide-up">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-12 border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-brand"></div>
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-[32px] overflow-hidden mx-auto mb-6 shadow-2xl shadow-brand/20 border-4 border-white">
            <img 
              src="public/logo.png" 
              alt="Settleup Logo" 
              className="w-full h-full object-contain p-2"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-brand mb-3">Settleup</h1>
          <p className="text-slate-400 font-medium tracking-tight">Smart expenses, simplified settlements.</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 text-slate-700 font-bold py-5 px-6 rounded-3xl hover:border-brand hover:bg-slate-50 transition-all mb-6 shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
          Continue with Google
        </button>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-slate-50"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
            <span className="px-4 bg-white text-slate-300">Or continue with email</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleEmailAuth}>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-brand focus:bg-white outline-none transition-all font-medium"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-brand focus:bg-white outline-none transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-bold py-5 px-6 rounded-3xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In / Sign Up
              </>
            )}
          </button>
        </form>
        
        <p className="mt-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Enter your details to access your account.
        </p>
      </div>
    </div>
  );
};
