import { get } from '@vercel/blob';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { method, readBrief, requireAdmin } from '../../lib/server.mjs';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  if (!requireAdmin(req, res)) return;
  const id = String(req.query?.id || '');
  const pathname = String(req.query?.path || '');
  const record = await readBrief(id);
  if (!record || !record.photos.includes(pathname)) return res.status(404).end('Not found');
  try {
    const file = await get(pathname, { access: 'private' });
    if (!file || file.statusCode !== 200) return res.status(404).end('Not found');
    res.setHeader('Content-Type', file.blob.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    await pipeline(Readable.fromWeb(file.stream), res);
  } catch (error) {
    console.error('admin_photo_read_failed', error?.message || error);
    if (!res.headersSent) res.status(500).end('Unable to load photo');
    else res.end();
  }
}
