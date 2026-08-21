import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../lib/supabase';
import { Utensils, Smartphone, ArrowRight, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';

export default function LoginOTP() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentOtp, setSentOtp] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setSentOtp(data.otp || '');
      setStep(2);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone, otp }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');
      // For demo, create a dummy sign-in with phone
      const email = `phone_${phone}@mealmap.app`;
      const password = `otp_${phone}_${otp}`;
      // Try sign in first, if not exists sign up
      let { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { phone, full_name: `User ${phone}` } } });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        // Sign in after signup
        await supabase.auth.signInWithPassword({ email, password });
      }
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-orange-100">
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">MealMap</span>
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Phone Login</h2>
              <p className="text-center text-gray-500 mb-6 text-sm">Enter your phone number to receive an OTP</p>
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                  {error}
                </motion.div>
              )}
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white/50" placeholder="+91 9876543210" minLength={10} maxLength={15} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-70">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Send OTP</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Verify OTP</h2>
              <p className="text-center text-gray-500 mb-6 text-sm">Enter the 6-digit code sent to +{phone}</p>
              {sentOtp && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Demo OTP: {sentOtp}
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                  {error}
                </motion.div>
              )}
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white/50 text-center tracking-[0.5em] font-mono text-lg" placeholder="000000" maxLength={6} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-70">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Verify & Login</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Prefer email? <Link to="/login" className="text-orange-600 font-medium hover:underline">Sign in with email</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
