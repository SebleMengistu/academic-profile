import slugify from 'slugify';

export const generateSlug = (text: string): string =>
  slugify(text, { lower: true, strict: true, trim: true });

export const generateUniqueSlug = async (
  text: string,
  model: { findOne: (q: Record<string, unknown>) => Promise<unknown> },
  existingId?: string
): Promise<string> => {
  const base = generateSlug(text);
  let slug = base;
  let counter = 1;
  while (true) {
    const query: Record<string, unknown> = { slug };
    if (existingId) query._id = { $ne: existingId };
    const existing = await model.findOne(query);
    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
};
