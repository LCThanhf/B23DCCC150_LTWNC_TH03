import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${BASE_URL}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/books`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...db.books.map((book) => ({
      url: `${BASE_URL}/books/${book.id}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
