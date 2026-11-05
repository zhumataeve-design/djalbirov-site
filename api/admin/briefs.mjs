import { json, listPrivate, method, readBrief, requireAdmin } from '../../lib/server.mjs';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  if (!requireAdmin(req, res)) return;
  try {
    const id = String(req.query?.id || '');
    if (id) {
      const record = await readBrief(id);
      if (!record) return json(res, 404, { error: 'Бриф не найден.' });
      return json(res, 200, record);
    }
    const blobs = await listPrivate('records/');
    const records = (await Promise.all(blobs.filter((blob) => blob.pathname.endsWith('.json')).map(async (blob) => {
      const record = await readBrief(blob.pathname.slice('records/'.length, -'.json'.length));
      return record;
    }))).filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return json(res, 200, { briefs: records });
  } catch (error) {
    console.error('admin_briefs_read_failed', error?.message || error);
    return json(res, 500, { error: 'Не удалось загрузить брифы.' });
  }
}
