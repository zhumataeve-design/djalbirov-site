import { handleUpload } from '@vercel/blob/client';
import { eventTypes, json, method, readBrief, sameOrigin } from '../lib/server.mjs';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const maxFileSize = 10 * 1024 * 1024;

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  try {
    const result = await handleUpload({
      request: req,
      body: req.body,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!sameOrigin(req)) throw new Error('Источник загрузки не разрешён.');
        let payload;
        try { payload = JSON.parse(clientPayload || '{}'); } catch { throw new Error('Некорректная загрузка.'); }
        const id = String(payload.id || '');
        const type = String(payload.type || '');
        const name = pathname.split('/').at(-1) || '';
        if (!eventTypes.has(type) || !/^[0-9a-f-]{36}$/i.test(id) || !pathname.startsWith(`uploads/${id}/`) || !name || name.includes('..')) {
          throw new Error('Путь для загрузки не разрешён.');
        }
        const record = await readBrief(id);
        if (!record || record.type !== type) throw new Error('Бриф не найден.');
        return {
          access: 'private',
          addRandomSuffix: false,
          allowedContentTypes: allowedTypes,
          maximumSizeInBytes: maxFileSize,
          validUntil: Date.now() + 10 * 60 * 1000,
          tokenPayload: JSON.stringify({ id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = JSON.parse(tokenPayload || '{}');
        if (!/^[0-9a-f-]{36}$/i.test(String(payload.id || '')) || !blob.pathname.startsWith(`uploads/${payload.id}/`)) {
          throw new Error('Загруженный файл не прошёл проверку.');
        }
      },
    });
    return json(res, 200, result);
  } catch (error) {
    console.error('brief_upload_token_failed', error?.message || error);
    return json(res, 400, { error: 'Не удалось подготовить загрузку фото.' });
  }
}
