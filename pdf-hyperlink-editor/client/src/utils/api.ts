import { ExportLink } from '../types/link';

const API_BASE = 'http://localhost:3001/api';

export async function uploadPdf(file: File): Promise<{ success: boolean; fileId: string; fileUrl: string }> {
  const formData = new FormData();
  formData.append('pdf', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }

  return res.json();
}

export async function exportPdf(fileId: string, links: ExportLink[]): Promise<Blob> {
  const res = await fetch(`${API_BASE}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, links }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Export failed');
  }

  return res.blob();
}
