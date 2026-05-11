import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, Chrome, ShieldAlert, Loader2 } from 'lucide-react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'google' | 'password'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminConfig, setAdminConfig] = useState<any>({
    adminEmail: 'mehrabhossain211@gmail.com',
    cmsTitle: 'ADMIN PANEL'
  });

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const docRef = doc(db, 'config', 'admin');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdminConfig(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching admin config:", err);
      }
    };
    fetchAdmin();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email === adminConfig.adminEmail) {
        navigate('/admin');
      } else {
        await auth.signOut();
        setError(`Access Denied: ${result.user.email} is not authorized.`);
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields');
    
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.email === adminConfig.adminEmail) {
        navigate('/admin');
      } else {
        const userEmail = result.user.email;
        await auth.signOut();
        setError(`Unauthorized: The email "${userEmail}" is not listed as the Authorized Admin in settings. Please use ${adminConfig.adminEmail} or update settings.`);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase Console.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-surface flex items-center justify-center p-6 bg-grid-pattern relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-pink/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-red/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass p-10 rounded-[3rem] border border-white/10 shadow-2xl relative bg-black/40 backdrop-blur-3xl overflow-hidden"
      >
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="text-3xl font-display font-black italic text-gradient tracking-tight uppercase">
              {adminConfig.cmsTitle || 'ADMIN PANEL'}
            </div>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
              System Authentication
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl text-brand-red text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
              >
                <ShieldAlert size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            {/* Method Toggle */}
            <div className="flex p-1.5 bg-black/60 rounded-2xl border border-white/10 shadow-inner">
              <button 
                onClick={() => setMethod('google')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${method === 'google' ? 'bg-gradient-to-r from-brand-pink to-brand-red text-white shadow-xl scale-100' : 'text-gray-500 hover:text-white scale-95 opacity-70'}`}
              >
                <Chrome size={14} />
                Google Auth
              </button>
              <button 
                onClick={() => setMethod('password')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${method === 'password' ? 'bg-gradient-to-r from-brand-pink to-brand-red text-white shadow-xl scale-100' : 'text-gray-500 hover:text-white scale-95 opacity-70'}`}
              >
                <Lock size={14} />
                Credentials
              </button>
            </div>

            {method === 'google' ? (
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Chrome size={24} />}
                {loading ? 'Verifying...' : 'Sign in with Google'}
              </button>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-pink transition-colors" size={20} />
                  <input 
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ADMIN EMAIL"
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 text-xs outline-none focus:border-brand-pink transition-all text-white font-bold tracking-wider"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-pink transition-colors" size={20} />
                  <input 
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="SECURITY KEY"
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 text-xs outline-none focus:border-brand-pink transition-all text-white font-bold tracking-wider"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-gradient-to-r from-brand-pink to-brand-red text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <LogIn size={24} />}
                  {loading ? 'Accessing...' : 'Enter Dashboard'}
                </button>
              </form>
            )}
          </div>
          
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black leading-relaxed pt-4">
            Authorized Personnel only. <br /> all access attempts are logged.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
