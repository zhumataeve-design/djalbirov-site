import { randomUUID } from 'node:crypto';
import { eventLabels, eventTypes, json, method, sameOrigin, saveBrief } from '../lib/server.mjs';

const MAX_TEXT = 12000;

function safeAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const answers = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(key)) continue;
    if (Array.isArray(raw)) {
      answers[key] = raw.slice(0, 40).map((item) => String(item).slice(0, 400));
    } else if (raw === null || ['string', 'number', 'boolean'].includes(typeof raw)) {
      answers[key] = String(raw).slice(0, MAX_TEXT);
    }
  }
  return answers;
}

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!sameOrigin(req)) return json(res, 403, { error: 'Запрос отклонён.' });
  const type = String(req.body?.type || '');
  const answers = safeAnswers(req.body?.answers);
  if (!eventTypes.has(type) || !answers?.contactName || !answers?.contactPhone || !req.body?.consent) {
    return json(res, 400, { error: 'Проверьте обязательные поля и согласие на обработку данных.' });
  }
  if (Object.keys(answers).length > 100) return json(res, 413, { error: 'Слишком много данных в форме.' });

  const record = {
    id: randomUUID(),
    type,
    title: eventLabels[type],
    answers,
    photos: [],
    status: 'new',
    note: '',
    createdAt: new Date().toISOString(),
  };
  try {
    await saveBrief(record);
    return json(res, 201, { id: record.id, ok: true });
  } catch (error) {
    console.error('brief_save_failed', error?.message || error);
    return json(res, 500, { error: 'Не удалось сохранить бриф. Попробуйте ещё раз.' });
  }
}
