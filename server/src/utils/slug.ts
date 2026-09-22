import slugify from 'slugify';
import supabase from '../lib/supabase';

export const generateSlug = (text: string): string =>
  slugify(text, { lower: true, strict: true, trim: true });

export const generateUniqueSlug = async (
  text: string,
  table: string,
  existingId?: string
): Promise<string> => {
  const base = generateSlug(text);
  let slug = base;
  let counter = 1;

  while (true) {
    let query = supabase.from(table).select('id').eq('slug', slug);
    if (existingId) query = query.neq('id', existingId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
};
