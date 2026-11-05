import { createSessionToken, hasAdminSession, json, method, sameOrigin } from '../lib/server.mjs';
import { timingSafeEqual } from 'node:crypto';

function equalSecret(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

export default function handler(req, res) {
  if (!method(req, res, ['GET', 'POST', 'DELETE'])) return;
  if (req.method !== 'GET' && !sameOrigin(req)) return json(res, 403, { error: 'Запрос отклонён.' });

  if (req.method === 'GET') {
    const configured = Boolean(process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET?.length >= 32);
    return json(res, 200, { configured, authenticated: hasAdminSession(req) });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'dj_admin=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
    return json(res, 200, { ok: true });
  }

  const password = String(req.body?.password || '');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return json(res, 503, { error: 'Кабинет ещё не настроен. Добавьте ADMIN_PASSWORD и SESSION_SECRET в настройках проекта.' });
  }
  if (password.length < 1 || password.length > 256 || !equalSecret(password, adminPassword)) {
    return json(res, 401, { error: 'Неверный пароль.' });
  }
  try {
    const token = createSessionToken();
    res.setHeader('Set-Cookie', `dj_admin=${encodeURIComponent(token)}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);
    return json(res, 200, { ok: true });
  } catch {
    return json(res, 503, { error: 'Кабинет не настроен.' });
  }
}
