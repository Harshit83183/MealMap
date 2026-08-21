import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Save, Ruler, Weight, Target, Activity, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ age: 25, gender: 'Male', height_cm: 170, weight_kg: 70, activity_level: 'moderate', goal: 'maintain', dietary_preference: 'none', calorie_target: 2000 });
  const [bmiRecords, setBmiRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showBmi, setShowBmi] = useState(false);

  const getToken = async () => {
    const { data } = await (await import('../lib/supabase')).default.auth.getSession();
    return data.session?.access_token;
  };

  const fetchData = async () => {
    setLoading(true);
    const token = await getToken();
    try {
      const [profRes, bmiRes] = await Promise.all([
        fetch('/api/user_profiles', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/bmi_records', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      if (profRes.ok) {
        const p = await profRes.json();
        if (p && p.id) setProfile(p);
      }
      if (bmiRes.ok) setBmiRecords(await bmiRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const saveProfile = async () => {
    setSaving(true);
    const token = await getToken();
    try {
      const res = await fetch('/api/user_profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const calculateBMI = async () => {
    const h = profile.height_cm / 100;
    const bmi = (profile.weight_kg / (h * h)).toFixed(1);
    let category = 'Normal';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    const token = await getToken();
    await fetch('/api/bmi_records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ height_cm: profile.height_cm, weight_kg: profile.weight_kg, bmi: Number(bmi), category }),
    });
    fetchData();
  };

  const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const goalAdjustments = { lose: -500, maintain: 0, gain: 500 };
  const estimatedCalories = Math.round((profile.weight_kg * 10 + profile.height_cm * 6.25 - (profile.gender === 'Male' ? 5 * profile.age + 5 : 5 * profile.age - 161)) * (activityMultipliers[profile.activity_level] || 1.55) + (goalAdjustments[profile.goal] || 0));

  const bmi = profile.height_cm ? (profile.weight_kg / ((profile.height_cm / 100) ** 2)).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2"><User className="w-8 h-8 text-orange-500" /> Your Profile</h1>
        <p className="text-gray-600 mb-8">Manage your health data and personalized goals</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-orange-500" /> Personal Info</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" value={profile.age} onChange={e => setProfile({ ...profile, age: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Ruler className="w-3 h-3" /> Height (cm)</label>
                  <input type="number" value={profile.height_cm} onChange={e => setProfile({ ...profile, height_cm: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Weight className="w-3 h-3" /> Weight (kg)</label>
                  <input type="number" value={profile.weight_kg} onChange={e => setProfile({ ...profile, weight_kg: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                <select value={profile.activity_level} onChange={e => setProfile({ ...profile, activity_level: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white">
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="very_active">Very Active (2x/day)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                <select value={profile.goal} onChange={e => setProfile({ ...profile, goal: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white">
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Preference</label>
                <select value={profile.dietary_preference} onChange={e => setProfile({ ...profile, dietary_preference: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white">
                  <option value="none">No Preference</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="jain">Jain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Daily Calorie Target</label>
                <input type="number" value={profile.calorie_target || estimatedCalories} onChange={e => setProfile({ ...profile, calorie_target: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white" />
                <div className="text-xs text-gray-500 mt-1">Recommended: ~{estimatedCalories} kcal based on your stats</div>
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
            </button>
            {saved && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center text-sm text-green-600 bg-green-50 py-2 rounded-xl">Profile saved successfully!</motion.div>}
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-100">
              <h3 className="font-bold text-gray-900 mb-4">BMI Calculator</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 rounded-xl bg-orange-50">
                  <div className="text-3xl font-bold text-orange-700">{bmi}</div>
                  <div className="text-xs text-gray-500">BMI</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-amber-50">
                  <div className="text-lg font-bold text-amber-700">{bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}</div>
                  <div className="text-xs text-gray-500">Category</div>
                </div>
              </div>
              <button onClick={calculateBMI} className="w-full py-2.5 rounded-xl bg-orange-100 text-orange-700 font-medium hover:bg-orange-200 transition">Calculate & Save BMI</button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-100">
              <button onClick={() => setShowBmi(!showBmi)} className="flex items-center justify-between w-full">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500" /> BMI History</h3>
                {showBmi ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {showBmi && (
                <div className="mt-4 space-y-2">
                  {bmiRecords.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">No BMI records yet</div>
                  ) : (
                    bmiRecords.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <div className="font-medium text-sm text-gray-900">BMI: {r.bmi}</div>
                          <div className="text-xs text-gray-500">{r.category}</div>
                        </div>
                        <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Diet Recommendation</h3>
              <p className="text-sm text-white/90 mb-3">
                Based on your goal of <span className="font-semibold">{profile.goal === 'lose' ? 'losing weight' : profile.goal === 'gain' ? 'gaining weight' : 'maintaining weight'}</span>,
                aim for <span className="font-bold">{estimatedCalories}</span> kcal/day.
              </p>
              <div className="text-xs text-white/80 bg-white/10 rounded-xl p-3">
                {profile.dietary_preference === 'vegetarian' ? 'Focus on legumes, paneer, and dairy for protein.' : 
                 profile.dietary_preference === 'vegan' ? 'Include lentils, tofu, nuts, and seeds for protein.' :
                 profile.dietary_preference === 'keto' ? 'Keep carbs under 50g and focus on healthy fats.' :
                 'Balance your plate with proteins, carbs, and vegetables.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
