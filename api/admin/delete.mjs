import { del } from '@vercel/blob';
import { json, listPrivate, method, readBrief, requireAdmin, sameOrigin } from '../../lib/server.mjs';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!sameOrigin(req)) return json(res, 403, { error: 'Запрос отклонён.' });
  if (!requireAdmin(req, res)) return;

  const id = String(req.body?.id || '');
  const record = await readBrief(id);
  if (!record) return json(res, 404, { error: 'Бриф не найден.' });

  try {
    const uploads = await listPrivate(`uploads/${id}/`);
    const paths = [...new Set([`records/${id}.json`, ...uploads.map((blob) => blob.pathname)])];
    await del(paths);
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('admin_brief_delete_failed', error?.message || error);
    return json(res, 500, { error: 'Не удалось удалить бриф и прикреплённые фотографии.' });
  }
}
