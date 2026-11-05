import { createHmac, timingSafeEqual } from 'node:crypto';
import { get, list, put } from '@vercel/blob';

export const eventTypes = new Set(['wedding', 'anniversary', 'corporate']);
export const eventLabels = {
  wedding: 'Свадебный бриф',
  anniversary: 'Бриф на юбилей',
  corporate: 'Корпоративный бриф',
};

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function method(req, res, allowed) {
  if (!allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    json(res, 405, { error: 'Метод не поддерживается.' });
    return false;
  }
  return true;
}

export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function cookieValue(req, name) {
  const raw = req.headers.cookie || '';
  const part = raw.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : '';
}

export function createSessionToken() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET is not configured');
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function hasAdminSession(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return false;
  const token = cookieValue(req, 'dj_admin');
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  const expected = createHmac('sha256', secret).update(payload).digest();
  let actual;
  try { actual = Buffer.from(signature, 'base64url'); } catch { return false; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).exp > Date.now();
  } catch {
    return false;
  }
}

export function requireAdmin(req, res) {
  if (!hasAdminSession(req)) {
    json(res, 401, { error: 'Войдите в кабинет администратора.' });
    return false;
  }
  return true;
}

export async function readBlobText(pathname) {
  const result = await get(pathname, { access: 'private' });
  if (!result || result.statusCode !== 200) return null;
  return new Response(result.stream).text();
}

export async function readBrief(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const pathname = `records/${id}.json`;
  const text = await readBlobText(pathname);
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export async function saveBrief(record) {
  const pathname = `records/${record.id}.json`;
  await put(pathname, JSON.stringify(record), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json; charset=utf-8',
    cacheControlMaxAge: 60,
  });
}

export async function listPrivate(prefix) {
  const all = [];
  let cursor;
  do {
    const page = await list({ prefix, limit: 100, cursor });
    all.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return all;
}
