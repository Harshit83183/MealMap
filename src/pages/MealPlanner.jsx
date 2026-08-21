import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, ChefHat, Clock, Flame, Filter, ArrowLeft, ArrowRight } from 'lucide-react';

export default function MealPlanner() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState('Breakfast');
  const [mealTime, setMealTime] = useState('08:00');
  const [loading, setLoading] = useState(true);
  const [foodPage, setFoodPage] = useState(1);
  const [foodCount, setFoodCount] = useState(0);

  const getToken = async () => {
    const { data } = await (await import('../lib/supabase')).default.auth.getSession();
    return data.session?.access_token;
  };

  const fetchMeals = async () => {
    const token = await getToken();
    const res = await fetch(`/api/meals?date=${date}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setMeals(await res.json());
  };

  const fetchFood = async () => {
    setLoading(true);
    const res = await fetch(`/api/food_items?search=${encodeURIComponent(search)}&category=${category}&page=${foodPage}&limit=20`);
    if (res.ok) {
      const data = await res.json();
      setFoodItems(data.data);
      setFoodCount(data.count);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMeals(); }, [date]);
  useEffect(() => { fetchFood(); }, [search, category, foodPage]);

  const addMeal = async () => {
    if (!selectedFood) return;
    const token = await getToken();
    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ food_item_id: selectedFood.id, meal_type: mealType, date, meal_time: mealTime, quantity_grams: quantity }),
    });
    if (res.ok) {
      setShowAdd(false);
      setSelectedFood(null);
      setQuantity(100);
      fetchMeals();
    }
  };

  const deleteMeal = async (id) => {
    const token = await getToken();
    await fetch('/api/meals', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    fetchMeals();
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const categories = ['All', 'Indian', 'Fruits', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Snacks', 'Beverages', 'International', 'Sweets', 'Nuts & Seeds'];

  const totals = meals.reduce((acc, m) => {
    const f = m.food_items || {};
    const q = (m.quantity_grams || 100) / 100;
    acc.cal += (f.calories_per_100g || 0) * q;
    acc.pro += (f.protein_per_100g || 0) * q;
    acc.carb += (f.carbs_per_100g || 0) * q;
    acc.fat += (f.fat_per_100g || 0) * q;
    return acc;
  }, { cal: 0, pro: 0, carb: 0, fat: 0 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><ChefHat className="w-8 h-8 text-orange-500" /> Meal Planner</h1>
            <p className="text-gray-600 mt-1">Plan and track your daily meals</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 1); return nd.toISOString().split('T')[0]; })} className="p-2 rounded-lg bg-white border border-orange-100 hover:bg-orange-50 transition"><ArrowLeft className="w-4 h-4" /></button>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-4 py-2 rounded-xl border border-orange-100 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
            <button onClick={() => setDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 1); return nd.toISOString().split('T')[0]; })} className="p-2 rounded-lg bg-white border border-orange-100 hover:bg-orange-50 transition"><ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Meals for {date}</h3>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium hover:shadow-lg transition"><Plus className="w-4 h-4" /> Add Meal</button>
              </div>
              {meals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No meals planned for this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mealTypes.map(mt => {
                    const mtMeals = meals.filter(m => m.meal_type === mt);
                    if (mtMeals.length === 0) return null;
                    return (
                      <div key={mt}>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{mt}</div>
                        {mtMeals.map(m => (
                          <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-orange-50/50 transition">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-lg">🍽️</div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{m.food_items?.name}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-2"><Clock className="w-3 h-3" /> {m.meal_time} • {m.quantity_grams}g</div>
                            </div>
                            <div className="text-sm font-semibold text-orange-600">{Math.round((m.food_items?.calories_per_100g || 0) * (m.quantity_grams / 100))} kcal</div>
                            <button onClick={() => deleteMeal(m.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-100">
              <h3 className="font-bold text-gray-900 mb-4">Daily Nutrition Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Calories', value: Math.round(totals.cal), icon: Flame, color: 'text-orange-600' },
                  { label: 'Protein', value: `${Math.round(totals.pro)}g`, icon: '💪', color: 'text-emerald-600' },
                  { label: 'Carbs', value: `${Math.round(totals.carb)}g`, icon: '🌾', color: 'text-purple-600' },
                  { label: 'Fat', value: `${Math.round(totals.fat)}g`, icon: '🧈', color: 'text-yellow-600' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-gray-50">
                    <div className={`text-2xl mb-1 ${typeof s.icon === 'string' ? '' : s.color}`}>{typeof s.icon === 'string' ? s.icon : <s.icon className="w-6 h-6 mx-auto" />}</div>
                    <div className="text-lg font-bold text-gray-900">{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-100 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Add Food</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setFoodPage(1); }} placeholder="Search foods..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
            </div>
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {categories.map(c => (
                <button key={c} onClick={() => { setCategory(c); setFoodPage(1); }} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${category === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
              ))}
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : foodItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No foods found</div>
              ) : (
                foodItems.map(f => (
                  <button key={f.id} onClick={() => { setSelectedFood(f); setShowAdd(true); }} className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3 ${selectedFood?.id === f.id ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-orange-200 hover:bg-orange-50/30'}`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-sm">🍽️</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{f.name}</div>
                      <div className="text-xs text-gray-500">{f.category} • {f.calories_per_100g} kcal/100g</div>
                    </div>
                  </button>
                ))
              )}
            </div>
            {foodCount > 20 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <button disabled={foodPage <= 1} onClick={() => setFoodPage(p => p - 1)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"><ArrowLeft className="w-4 h-4" /></button>
                <span className="text-xs text-gray-500">Page {foodPage} of {Math.ceil(foodCount / 20)}</span>
                <button disabled={foodPage * 20 >= foodCount} onClick={() => setFoodPage(p => p + 1)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"><ArrowRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && selectedFood && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Add {selectedFood.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{selectedFood.calories_per_100g} kcal per 100g</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                  <select value={mealType} onChange={e => setMealType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white">
                    {mealTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={mealTime} onChange={e => setMealTime(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (grams)</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={1} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white" />
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                  Estimated: <span className="font-bold text-orange-600">{Math.round(selectedFood.calories_per_100g * (quantity / 100))}</span> kcal
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition">Cancel</button>
                <button onClick={addMeal} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:shadow-lg transition">Add Meal</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
