import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus, Trash2, GlassWater, Waves } from 'lucide-react';

export default function WaterTracker() {
  const { user } = useAuth();
  const [waterEntries, setWaterEntries] = useState([]);
  const [amount, setAmount] = useState(250);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const getToken = async () => {
    const { data } = await (await import('../lib/supabase')).default.auth.getSession();
    return data.session?.access_token;
  };

  const fetchWater = async () => {
    setLoading(true);
    const token = await getToken();
    try {
      const res = await fetch(`/api/water_intake?date=${selectedDate}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setWaterEntries(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchWater(); }, [selectedDate]);

  const addWater = async () => {
    const token = await getToken();
    await fetch('/api/water_intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ date: selectedDate, amount_ml: amount }),
    });
    fetchWater();
  };

  const removeWater = async (id) => {
    const token = await getToken();
    await fetch('/api/water_intake', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    fetchWater();
  };

  const totalWater = waterEntries.reduce((s, w) => s + (w.amount_ml || 0), 0);
  const targetWater = 2500;
  const percentage = Math.min((totalWater / targetWater) * 100, 100);

  const quickAdd = [100, 250, 500, 750, 1000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2"><Droplets className="w-8 h-8 text-blue-500" /> Water Tracker</h1>
        <p className="text-gray-600 mb-8">Stay hydrated by tracking your daily water intake</p>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-blue-100">
            <div className="text-center mb-6">
              <div className="relative w-48 h-48 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e0f2fe" strokeWidth="8" />
                  <motion.circle cx="50" cy="50" r="45" fill="none" stroke="url(#waterGrad)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                  <defs><linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Waves className="w-8 h-8 text-blue-500 mb-1" />
                  <div className="text-3xl font-bold text-gray-900">{totalWater}<span className="text-lg font-normal text-gray-500">ml</span></div>
                  <div className="text-xs text-gray-500">of {targetWater}ml goal</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-400 outline-none bg-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ml)</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setAmount(Math.max(50, amount - 50))} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"><Minus className="w-4 h-4" /></button>
                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-400 outline-none bg-white text-center font-semibold" />
                <button onClick={() => setAmount(amount + 50)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2 mt-3">
                {quickAdd.map(a => (
                  <button key={a} onClick={() => setAmount(a)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${amount === a ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>{a}ml</button>
                ))}
              </div>
            </div>

            <button onClick={addWater} className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
              <GlassWater className="w-4 h-4" /> Add Water
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-blue-100">
            <h3 className="font-bold text-gray-900 mb-4">Today's Entries</h3>
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : waterEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Droplets className="w-12 h-12 mx-auto mb-3 text-blue-200" />
                <p>No water logged yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {waterEntries.map(w => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><GlassWater className="w-4 h-4" /></div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{w.amount_ml}ml</div>
                        <div className="text-xs text-gray-500">{new Date(w.created_at).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <button onClick={() => removeWater(w.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
