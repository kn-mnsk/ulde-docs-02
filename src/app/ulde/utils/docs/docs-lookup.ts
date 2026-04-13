import { DocsList, DocMeta } from '../../../pages/docs/docs-meta'; // adjust path as needed

export function findDocPathById(id: string): string | null {
  const entry = DocsList.find(d => d.id === id);
  return entry ? entry.path : null;
}

export function findDocMetaById(id: string): DocMeta | null {
  return DocsList.find(d => d.id === id) ?? null;
}
