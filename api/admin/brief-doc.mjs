import { Document, Paragraph, Packer, TextRun } from 'docx';
import { json, method, readBrief, requireAdmin } from '../../lib/server.mjs';

const groups = {
  contactName: ['Контакты', 'Имя'], contactPhone: ['Контакты', 'Телефон'],
  eventDate: ['Событие', 'Дата'], venue: ['Событие', 'Площадка'], eventTime: ['Событие', 'Время'],
  guestCount: ['Событие', 'Ожидаемое количество гостей'], weddingLanguage: ['Событие', 'Язык ведения'],
  coupleNames: ['Пара и юбиляр', 'Имена молодожёнов'], celebrant: ['Пара и юбиляр', 'Юбиляр'],
  audience: ['Контекст', 'О гостях'], companyName: ['Компания', 'Название и сфера'], eventName: ['Компания', 'Мероприятие'],
  staffCount: ['Компания', 'Сотрудники в компании'], companyHistory: ['Компания', 'История компании'], goals: ['Компания', 'Цели'],
  achievements: ['Компания', 'Достижения'], leaders: ['Компания', 'Руководители'], competitors: ['Компания', 'Отраслевой контекст'],
  lastEvents: ['Компания', 'Прошлые мероприятия'], management: ['Коллектив', 'Стиль общения'], culture: ['Коллектив', 'Ценности и стиль'],
  stories: ['Коллектив', 'Истории и традиции'], people: ['Коллектив', 'Люди и отделы'],
  bio: ['О юбиляре', 'Биография'], personality: ['О юбиляре', 'Характер и увлечения'], lifeStories: ['О юбиляре', 'Истории'],
  favorites: ['О юбиляре', 'Любимое'], proudMoments: ['О юбиляре', 'Достижения'], dreams: ['О юбиляре', 'Мечты и планы'],
  meetingStory: ['История пары', 'Знакомство'], relationshipStory: ['История пары', 'Общие истории'], proposalStory: ['История пары', 'Важный момент'],
  sharedLife: ['История пары', 'Общая жизнь'], funnyStories: ['История пары', 'Смешные истории'], quizIdeas: ['История пары', 'Викторина'],
  importantPeople: ['Гости и программа', 'Важные гости'], familyNotes: ['Гости и программа', 'Семья'], preferences: ['Гости и программа', 'Пожелания'],
  guestStories: ['Гости и программа', 'Истории гостей'], familyTraditions: ['Гости и программа', 'Традиции'], music: ['Гости и программа', 'Идеи для программы'],
  noGo: ['Гости и программа', 'Ограничения'], extra: ['Гости и программа', 'Дополнительно'], dressCode: ['Событие', 'Дресс-код'],
};

function answerGroups(answers) {
  const result = new Map();
  for (const [key, raw] of Object.entries(answers || {})) {
    const [group, label] = groups[key] || ['Другие ответы', key];
    const value = (Array.isArray(raw) ? raw.join(', ') : String(raw ?? '')).trim();
    if (!value) continue;
    if (!result.has(group)) result.set(group, []);
    result.get(group).push([label, value]);
  }
  return result;
}

function formatDate(value) {
  return new Date(value).toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' });
}

function makeDocument(record) {
  const answers = record.answers || {};
  const children = [];
  const textRun = (text, options = {}) => new TextRun({ font: 'Arial', text: String(text), ...options });
  const paragraph = (runs, options = {}) => new Paragraph({ children: runs, spacing: { after: 120, ...options.spacing }, ...options });

  children.push(paragraph([textRun('RAMAZAN DJALBIROV · ВЕДУЩИЙ МЕРОПРИЯТИЙ', { bold: true, color: '8A7652', size: 18 })], { spacing: { after: 220 } }));
  children.push(paragraph([textRun('БРИФ МЕРОПРИЯТИЯ', { bold: true, color: '9A7739', size: 40 })], { spacing: { after: 80 } }));
  children.push(paragraph([textRun(record.title || 'Мероприятие', { bold: true, color: '302D26', size: 28 })], { spacing: { after: 280 } }));
  children.push(paragraph([textRun('ИНФОРМАЦИЯ О ЗАЯВКЕ', { bold: true, color: '8A7652', size: 18 })], { spacing: { after: 110 } }));

  for (const [label, value] of [
    ['Имя', answers.contactName || 'Без имени'],
    ['Телефон / WhatsApp', answers.contactPhone || '—'],
    ['Получено', formatDate(record.createdAt)],
  ]) {
    children.push(paragraph([
      textRun(`${label}: `, { bold: true, color: '80652F' }),
      textRun(value, { color: '292722' }),
    ], { spacing: { after: 100 } }));
  }

  children.push(paragraph([textRun('ОТВЕТЫ', { bold: true, color: '8A7652', size: 18 })], { spacing: { before: 280, after: 80 } }));
  for (const [group, rows] of answerGroups(answers)) {
    if (group === 'Контакты') continue;
    children.push(paragraph([textRun(group.toLocaleUpperCase('ru-RU'), { bold: true, color: '80652F', size: 28 })], { spacing: { before: 300, after: 130 }, keepNext: true }));
    for (const [label, value] of rows) {
      children.push(paragraph([textRun(label, { bold: true, color: '76684B', size: 18 })], { spacing: { before: 120, after: 50 }, keepNext: true }));
      const valueRuns = value.split(/\r?\n/).map((line, index) => index ? textRun(line || ' ', { break: 1 }) : textRun(line || ' '));
      children.push(paragraph(valueRuns, { spacing: { after: 180 } }));
    }
  }

  if (record.photos?.length) {
    children.push(paragraph([textRun('ПРИЛОЖЕННЫЕ ФОТОГРАФИИ', { bold: true, color: '80652F', size: 28 })], { spacing: { before: 300, after: 130 }, keepNext: true }));
    record.photos.forEach((path, index) => {
      const name = path.split('/').pop().replace(/^[0-9a-f-]{36}-/i, '');
      children.push(paragraph([textRun(`Фото ${index + 1}: `, { bold: true, color: '76684B' }), textRun(name)]));
    });
  }

  children.push(paragraph([textRun('РАМАЗАН ДЖАЛБИРОВ · DJALBIROV.KZ', { color: '8A7652', size: 18 })], { spacing: { before: 420, after: 0 }, alignment: 'center' }));
  return new Document({ sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } } }, children }] });
}

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  if (!requireAdmin(req, res)) return;
  const id = String(req.query?.id || '');
  const record = await readBrief(id);
  if (!record) return json(res, 404, { error: 'Бриф не найден.' });

  try {
    const buffer = await Packer.toBuffer(makeDocument(record));
    const baseName = `${record.title || 'Бриф'}-${record.answers?.contactName || 'гость'}`
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
      .trim()
      .slice(0, 100);
    const encodedName = encodeURIComponent(`${baseName}.docx`).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="brief-${id}.docx"; filename*=UTF-8''${encodedName}`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.end(buffer);
  } catch (error) {
    console.error('admin_brief_docx_failed', error?.message || error);
    return json(res, 500, { error: 'Не удалось подготовить Word-документ.' });
  }
}
