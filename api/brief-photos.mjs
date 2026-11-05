import { list } from '@vercel/blob';
import { json, method, readBrief, sameOrigin, saveBrief } from '../lib/server.mjs';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!sameOrigin(req)) return json(res, 403, { error: 'Запрос отклонён.' });
  const id = String(req.body?.id || '');
  const paths = Array.isArray(req.body?.paths) ? req.body.paths : [];
  if (paths.length > 20 || paths.some((path) => typeof path !== 'string' || !path.startsWith(`uploads/${id}/`))) {
    return json(res, 400, { error: 'Список фотографий не прошёл проверку.' });
  }
  const record = await readBrief(id);
  if (!record) return json(res, 404, { error: 'Бриф не найден.' });
  try {
    const stored = await list({ prefix: `uploads/${id}/`, limit: 100 });
    const known = new Set(stored.blobs.map((blob) => blob.pathname));
    if (paths.some((path) => !known.has(path))) return json(res, 400, { error: 'Не все фотографии загрузились.' });
    record.photos = [...new Set([...record.photos, ...paths])];
    await saveBrief(record);
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('brief_photo_attach_failed', error?.message || error);
    return json(res, 500, { error: 'Не удалось прикрепить фотографии к брифу.' });
  }
}
