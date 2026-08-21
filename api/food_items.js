import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { search, category, page = 1, limit = 50 } = req.query;
      let query = supabase.from('food_items').select('*', { count: 'exact' });
      if (search) query = query.ilike('name', `%${search}%`);
      if (category && category !== 'All') query = query.eq('category', category);
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query.order('name', { ascending: true }).range(from, to);
      if (error) throw error;
      return res.status(200).json({ data, count, page: parseInt(page), limit: parseInt(limit) });
    }
    if (req.method === 'POST') {
      const { name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_size, serving_unit } = req.body;
      const { data, error } = await supabase.from('food_items').insert({ name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_size, serving_unit }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
