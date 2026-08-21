import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  let userId = null;
  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) userId = user.id;
  }
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { date } = req.query;
      let query = supabase.from('calorie_logs').select('*').eq('user_id', userId);
      if (date) query = query.eq('date', date);
      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { date, calories_consumed, protein, carbs, fat, weight } = req.body;
      const { data, error } = await supabase.from('calorie_logs').insert({ user_id: userId, date, calories_consumed, protein, carbs, fat, weight }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, date, calories_consumed, protein, carbs, fat, weight } = req.body;
      const { data, error } = await supabase.from('calorie_logs').update({ date, calories_consumed, protein, carbs, fat, weight }).eq('id', id).eq('user_id', userId).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
