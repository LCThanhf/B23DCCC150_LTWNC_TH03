import { db } from '@/lib/db';
import type { Book } from '@/types';

export interface BookFilter {
  category?: string;
  q?: string;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Giả lập truy vấn chậm 800ms như đề bài yêu cầu. */
export async function loadBooksShift(filter: BookFilter = {}): Promise<Book[]> {
  await sleep(800);

  const category = filter.category?.trim() ?? '';
  const keyword = filter.q?.trim().toLowerCase() ?? '';

  return db.books.filter((book) => {
    const matchCategory = category === '' || book.category === category;
    const matchKeyword = keyword === '' || book.title.toLowerCase().includes(keyword);
    return matchCategory && matchKeyword;
  });
}

export async function getBookById(id: number): Promise<Book | undefined> {
  return db.books.find((book) => book.id === id);
}
