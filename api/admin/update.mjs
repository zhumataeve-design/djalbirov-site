import { json, method, readBrief, requireAdmin, sameOrigin, saveBrief } from '../../lib/server.mjs';

const statuses = new Set(['new', 'in_progress', 'completed']);

export default async function handler(req, res) {
  if (!method(req, res, ['PATCH'])) return;
  if (!sameOrigin(req)) return json(res, 403, { error: 'Запрос отклонён.' });
  if (!requireAdmin(req, res)) return;
  const id = String(req.body?.id || '');
  const record = await readBrief(id);
  if (!record) return json(res, 404, { error: 'Бриф не найден.' });
  if (req.body?.status !== undefined) {
    if (!statuses.has(req.body.status)) return json(res, 400, { error: 'Неизвестный статус.' });
    record.status = req.body.status;
  }
  if (req.body?.note !== undefined) record.note = String(req.body.note).slice(0, 4000);
  try {
    await saveBrief(record);
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('admin_brief_update_failed', error?.message || error);
    return json(res, 500, { error: 'Не удалось сохранить изменения.' });
  }
}
