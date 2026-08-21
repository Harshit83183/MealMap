import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, Droplets, TrendingUp, Activity, ChefHat, Target, Utensils, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayMeals, setTodayMeals] = useState([]);
  const [waterIntake, setWaterIntake] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });

  const today = new Date().toISOString().split('T')[0];

  const getToken = async () => {
    const { data } = await (await import('../lib/supabase')).default.auth.getSession();
    return data.session?.access_token;
  };

  const fetchData = async () => {
    setLoading(true);
    const token = await getToken();
    try {
      const [mealsRes, waterRes, profileRes] = await Promise.all([
        fetch(`/api/meals?date=${today}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/water_intake?date=${today}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user_profiles', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      const meals = mealsRes.ok ? await mealsRes.json() : [];
      const water = waterRes.ok ? await waterRes.json() : [];
      const prof = profileRes.ok ? await profileRes.json() : null;
      setTodayMeals(meals);
      setWaterIntake(water);
      setProfile(prof);

      const totalWater = water.reduce((s, w) => s + (w.amount_ml || 0), 0);
      let cal = 0, pro = 0, carb = 0, fat = 0;
      meals.forEach(m => {
        const f = m.food_items || {};
        const qty = (m.quantity_grams || 100) / 100;
        cal += (f.calories_per_100g || 0) * qty;
        pro += (f.protein_per_100g || 0) * qty;
        carb += (f.carbs_per_100g || 0) * qty;
        fat += (f.fat_per_100g || 0) * qty;
      });
      setStats({ calories: Math.round(cal), protein: Math.round(pro), carbs: Math.round(carb), fat: Math.round(fat), water: totalWater });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const targetCalories = profile?.calorie_target || 2000;
  const targetWater = 2500;

  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hello, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend'}! 👋</h1>
          <p className="text-gray-600 mt-1">Here's your health overview for today</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Flame, label: 'Calories', value: `${stats.calories}`, sub: `/${targetCalories} kcal`, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50' },
            { icon: Droplets, label: 'Water', value: `${stats.water}`, sub: `/${targetWater} ml`, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
            { icon: TrendingUp, label: 'Protein', value: `${stats.protein}`, sub: 'g today', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50' },
            { icon: Activity, label: 'Carbs', value: `${stats.carbs}`, sub: 'g today', color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50' },
          ].map((s, i) => (
            <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible" className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-orange-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon className={`w-5 h-5 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`} style={{ color: 'inherit' }} />
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}<span className="text-sm font-normal text-gray-500">{s.sub}</span></div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div variants={cardVariants} custom={4} initial="hidden" animate="visible" className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ChefHat className="w-5 h-5 text-orange-500" /> Today's Meals</h3>
              <button onClick={() => navigate('/meal-planner')} className="text-sm text-orange-600 font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add Meal</button>
            </div>
            {todayMeals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Utensils className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No meals logged yet today</p>
                <button onClick={() => navigate('/meal-planner')} className="mt-3 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition">Add your first meal</button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayMeals.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/80 hover:bg-orange-50/50 transition">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-lg">🍽️</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{m.food_items?.name || 'Food'}</div>
                      <div className="text-xs text-gray-500">{m.meal_type} • {m.quantity_grams}g</div>
                    </div>
                    <div className="text-sm font-semibold text-orange-600">
                      {Math.round((m.food_items?.calories_per_100g || 0) * (m.quantity_grams / 100))} kcal
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={cardVariants} custom={5} initial="hidden" animate="visible" className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-orange-500" /> Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Plan Meals', to: '/meal-planner', icon: ChefHat, desc: 'Create daily meal plans' },
                { label: 'Track Water', to: '/water-tracker', icon: Droplets, desc: 'Log your hydration' },
                { label: 'Browse Foods', to: '/food-database', icon: Utensils, desc: 'Explore 50,000+ foods' },
                { label: 'Update Profile', to: '/profile', icon: Target, desc: 'Set your health goals' },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.to)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition text-left">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                    <a.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{a.label}</div>
                    <div className="text-xs text-gray-500">{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-orange-100">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Daily Progress</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Calories</span><span className="text-gray-900 font-medium">{stats.calories}/{targetCalories}</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min((stats.calories / targetCalories) * 100, 100)}%` }} transition={{ duration: 1, delay: 0.5 }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Water</span><span className="text-gray-900 font-medium">{stats.water}/{targetWater}ml</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min((stats.water / targetWater) * 100, 100)}%` }} transition={{ duration: 1, delay: 0.7 }} /></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
