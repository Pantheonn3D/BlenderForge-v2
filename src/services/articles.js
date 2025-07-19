import supabase from '../supabaseClient'; // Adjusted path to go up one level

export async function getArticles({ searchQuery = '', category = 'all', difficulty = 'all' }) {
  let query = supabase
    .from('articles')
    .select(`
      id, title, description, image_url, category, difficulty,
      read_time, slug, created_at, profiles ( username )
    `)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (difficulty && difficulty !== 'all') {
    query = query.eq('difficulty', difficulty);
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data;
}