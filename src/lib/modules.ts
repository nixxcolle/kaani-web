import { moduleCatalog } from './supabase';
import type { LearningModule } from './data';

type ModuleRow = { id: string; title: string; description: string | null; file_name: string | null; file_data: string | null };

export async function fetchLearningModules(): Promise<LearningModule[]> {
  const rows: ModuleRow[] = [];
  // Count drives pagination even when the server's row cap is smaller than our page size.
  let total = 0;
  do {
    const { data, error, count } = await moduleCatalog.from('modules')
      .select('id, title, description, file_data, file_name', { count: 'exact' })
      .order('created_at', { ascending: true }).order('id', { ascending: true })
      .range(rows.length, rows.length + 99);
    if (error) throw error;
    if (!data || count === null) throw new Error('Module response is incomplete.');
    total = count;
    if (!data.length && rows.length < total) throw new Error('Module pagination stopped before completion.');
    rows.push(...data);
  } while (rows.length < total);

  return rows.map(row => {
    if (typeof row.id !== 'string' || typeof row.title !== 'string') throw new Error('Module record is missing its ID or title.');
    return {
      id: row.id, title: row.title,
      description: row.description || '',
      objectives: [], contentSections: [{ heading: 'Overview & Objectives', body: row.description || '' }],
      file_name: row.file_name || '', file_data: row.file_data,
    };
  });
}
