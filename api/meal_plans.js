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

  try {
    if (req.method === 'GET') {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { data, error } = await supabase.from('meal_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { name, day_of_week, meals } = req.body;
      const { data, error } = await supabase.from('meal_plans').insert({ user_id: userId, name, day_of_week, meals }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.body;
      const { error } = await supabase.from('meal_plans').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
