import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Database, Filter, ArrowLeft, ArrowRight, Flame, Beef, Wheat, Droplets } from 'lucide-react';

export default function FoodDatabase() {
  const [foodItems, setFoodItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const categories = ['All', 'Indian', 'Fruits', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Snacks', 'Beverages', 'International', 'Sweets', 'Nuts & Seeds'];

  const fetchFood = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/food_items?search=${encodeURIComponent(search)}&category=${category}&page=${page}&limit=50`);
      const data = await res.json();
      setFoodItems(data.data || []);
      setCount(data.count || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchFood(); }, [search, category, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Database className="w-8 h-8 text-orange-500" /> Food Database</h1>
          <p className="text-gray-600 mt-1">Explore our comprehensive collection of {count.toLocaleString()}+ foods with accurate nutritional data</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search any food item..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white/50" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-5 h-5 text-gray-400 shrink-0" />
              {categories.map(c => (
                <button key={c} onClick={() => { setCategory(c); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${category === c ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : foodItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No foods found matching your search</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {foodItems.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 10) * 0.05, duration: 0.4 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-orange-100 hover:shadow-lg hover:border-orange-200 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">{f.category}</span>
                  <span className="text-xs text-gray-400">per {f.serving_size}{f.serving_unit}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{f.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="font-semibold">{f.calories_per_100g}</span> kcal
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Beef className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-semibold">{f.protein_per_100g}g</span> protein
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Wheat className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-semibold">{f.carbs_per_100g}g</span> carbs
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Droplets className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="font-semibold">{f.fat_per_100g}g</span> fat
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {count > 50 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"><ArrowLeft className="w-4 h-4" /> Previous</button>
            <span className="text-sm text-gray-600">Page {page} of {Math.ceil(count / 50)}</span>
            <button disabled={page * 50 >= count} onClick={() => setPage(p => p + 1)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition">Next <ArrowRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
