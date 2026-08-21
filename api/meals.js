import supabase from './db-client.js';
import { createClient } from '@supabase/supabase-js';

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
      const { date } = req.query;
      let query = supabase.from('meals').select('*, food_items(*)').eq('user_id', userId);
      if (date) query = query.eq('date', date);
      const { data, error } = await query.order('meal_time', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { food_item_id, meal_type, date, meal_time, quantity_grams, notes } = req.body;
      const { data, error } = await supabase.from('meals').insert({ user_id: userId, food_item_id, meal_type, date, meal_time, quantity_grams, notes }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.body;
      const { error } = await supabase.from('meals').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
