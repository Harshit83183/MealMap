import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();
      if (error && error.code !== 'PGRST116') throw error;
      return res.status(200).json(data || {});
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      const { age, gender, height_cm, weight_kg, activity_level, goal, dietary_preference, calorie_target } = req.body;
      const upsertData = { user_id: userId, age, gender, height_cm, weight_kg, activity_level, goal, dietary_preference, calorie_target };
      const { data, error } = await supabase.from('user_profiles').upsert(upsertData, { onConflict: 'user_id' }).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
