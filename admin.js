const loginPanel = document.getElementById('loginPanel');
const adminApp = document.getElementById('adminApp');
const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const listEl = document.getElementById('briefList');
const detailEl = document.getElementById('briefDetail');
const logoutButton = document.getElementById('logoutButton');
const labels = { wedding: 'Свадьба', anniversary: 'Юбилей', corporate: 'Корпоратив' };
const statuses = { new: 'Новый', in_progress: 'В работе', completed: 'Готово' };
let briefs = [];
let selectedId = '';

document.getElementById('shareLinks').replaceChildren(...Object.entries({ wedding: 'Свадебный', anniversary: 'Юбилейный', corporate: 'Корпоративный' }).map(([type, name]) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'share-link';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = `Копировать: ${name}`;
  const url = `${location.origin}/brief.html?type=${type}`;
  const code = document.createElement('code');
  code.textContent = url;
  button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(url); button.textContent = 'Ссылка скопирована'; }
    catch { window.prompt('Скопируйте ссылку:', url); }
    setTimeout(() => { button.textContent = `Копировать: ${name}`; }, 1800);
  });
  wrapper.append(button, code);
  return wrapper;
}));

async function call(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Не удалось выполнить запрос.');
  return data;
}

async function refreshSession() {
  try {
    const data = await call('/api/login');
    if (!data.configured) {
      loginStatus.textContent = 'Добавьте ADMIN_PASSWORD и SESSION_SECRET в настройках проекта Vercel.';
      loginStatus.classList.add('error');
      return;
    }
    if (data.authenticated) return showAdmin();
  } catch { /* показываем форму входа */ }
  loginPanel.hidden = false;
  adminApp.hidden = true;
  logoutButton.hidden = true;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginStatus.textContent = '';
  loginStatus.classList.remove('error');
  const password = new FormData(loginForm).get('password');
  try {
    await call('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    loginForm.reset();
    await showAdmin();
  } catch (error) {
    loginStatus.textContent = error.message;
    loginStatus.classList.add('error');
  }
});

logoutButton.addEventListener('click', async () => {
  await call('/api/login', { method: 'DELETE' }).catch(() => {});
  loginPanel.hidden = false;
  adminApp.hidden = true;
  logoutButton.hidden = true;
});
document.getElementById('refreshButton').addEventListener('click', loadBriefs);

async function showAdmin() {
  loginPanel.hidden = true;
  adminApp.hidden = false;
  logoutButton.hidden = false;
  await loadBriefs();
}

async function loadBriefs() {
  listEl.textContent = 'Загружаем брифы…';
  try {
    const data = await call('/api/admin/briefs');
    briefs = data.briefs || [];
    renderList();
    if (selectedId && briefs.some((brief) => brief.id === selectedId)) await openBrief(selectedId);
    else { selectedId = ''; renderList(); showEmpty(); }
  } catch (error) {
    listEl.textContent = error.message;
    loginPanel.hidden = false;
    adminApp.hidden = true;
    logoutButton.hidden = true;
  }
}

function renderList() {
  listEl.replaceChildren();
  if (!briefs.length) { listEl.textContent = 'Пока нет отправленных брифов.'; return; }
  for (const brief of briefs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `brief-card ${brief.id === selectedId ? 'selected' : ''}`;
    const title = document.createElement('strong');
    title.textContent = `${labels[brief.type] || 'Мероприятие'} · ${brief.answers?.contactName || 'Без имени'}`;
    const meta = document.createElement('span');
    meta.textContent = `${formatDate(brief.createdAt)} · ${brief.photos?.length || 0} фото`;
    const pill = document.createElement('span');
    pill.className = 'status-pill';
    pill.textContent = statuses[brief.status] || statuses.new;
    button.append(title, meta, pill);
    button.setAttribute('aria-expanded', String(brief.id === selectedId));
    button.addEventListener('click', () => toggleBrief(brief.id));
    listEl.append(button);
  }
}

function showEmpty() {
  const hasBriefs = briefs.length > 0;
  detailEl.innerHTML = `<div class="empty-state"><p class="eyebrow">${hasBriefs ? 'Ответы гостей' : 'Пока пусто'}</p><h2>${hasBriefs ? 'Выберите бриф' : 'Нет отправленных брифов'}</h2><p>${hasBriefs ? 'Нажмите на заявку в списке, чтобы открыть ответы и фотографии.' : 'Новые ответы появятся здесь после отправки формы гостями.'}</p></div>`;
}

async function openBrief(id) {
  selectedId = id;
  renderList();
  detailEl.textContent = 'Открываем бриф…';
  try {
    const brief = await call(`/api/admin/briefs?id=${encodeURIComponent(id)}`);
    renderDetail(brief);
  } catch (error) {
    detailEl.textContent = error.message;
  }
}

function toggleBrief(id) {
  if (selectedId === id) {
    selectedId = '';
    renderList();
    showEmpty();
    return;
  }
  openBrief(id);
}

function renderDetail(brief) {
  detailEl.replaceChildren();
  const head = document.createElement('div');
  head.className = 'detail-head';
  const heading = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = labels[brief.type] || 'Мероприятие';
  const title = document.createElement('h2');
  title.textContent = brief.answers?.contactName || 'Без имени';
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent = `${brief.title} · отправлено ${formatDate(brief.createdAt)}`;
  heading.append(eyebrow, title, meta);
  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const word = document.createElement('button');
  word.type = 'button';
  word.className = 'btn sm';
  word.textContent = 'Скачать бриф Word';
  word.addEventListener('click', () => downloadWord(brief, word));
  actions.append(word);
  if (brief.photos?.length) {
    const archive = document.createElement('button');
    archive.type = 'button';
    archive.className = 'btn sm';
    archive.textContent = 'Скачать фото ZIP';
    archive.addEventListener('click', () => downloadArchive(brief, archive));
    actions.append(archive);
  }
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'btn ghost sm';
  remove.textContent = 'Удалить бриф';
  remove.addEventListener('click', () => deleteBrief(brief, remove));
  actions.append(remove);
  head.append(heading, actions);
  detailEl.append(head);

  const body = document.createElement('div');
  body.className = 'detail-body';
  const groups = groupAnswers(brief.answers || {});
  for (const [groupName, rows] of groups) {
    const group = document.createElement('section');
    group.className = 'answer-group';
    const h = document.createElement('h3');
    h.textContent = groupName;
    group.append(h);
    rows.forEach(([label, value]) => {
      const row = document.createElement('div');
      row.className = 'answer-row';
      const key = document.createElement('span'); key.className = 'answer-label'; key.textContent = label;
      const val = document.createElement('span'); val.className = 'answer-value'; val.textContent = value;
      row.append(key, val); group.append(row);
    });
    body.append(group);
  }

  const photosHeading = document.createElement('h3'); photosHeading.textContent = `Фотографии · ${brief.photos?.length || 0}`;
  body.append(photosHeading);
  if (brief.photos?.length) {
    const grid = document.createElement('div'); grid.className = 'photo-grid';
    for (const path of brief.photos) {
      const link = document.createElement('a');
      link.href = `/api/admin/photo?id=${encodeURIComponent(brief.id)}&path=${encodeURIComponent(path)}`;
      link.target = '_blank'; link.rel = 'noopener';
      const image = document.createElement('img'); image.loading = 'lazy'; image.alt = 'Фото из брифа'; image.src = link.href;
      link.append(image); grid.append(link);
    }
    body.append(grid);
  } else {
    const noPhotos = document.createElement('p'); noPhotos.className = 'photo-empty'; noPhotos.textContent = 'Фото не приложены.'; body.append(noPhotos);
  }

  const controls = document.createElement('div'); controls.className = 'detail-controls';
  const statusLabel = document.createElement('label'); statusLabel.className = 'field';
  const statusText = document.createElement('span'); statusText.textContent = 'Статус';
  const select = document.createElement('select');
  for (const [value, label] of Object.entries(statuses)) { const option = document.createElement('option'); option.value = value; option.textContent = label; select.append(option); }
  select.value = brief.status || 'new';
  select.addEventListener('change', () => updateBrief(brief, { status: select.value }));
  statusLabel.append(statusText, select);
  const note = document.createElement('label'); note.className = 'field';
  const noteLabel = document.createElement('span'); noteLabel.textContent = 'Заметка для себя';
  const textarea = document.createElement('textarea'); textarea.maxLength = 4000; textarea.value = brief.note || ''; textarea.placeholder = 'Внутренние заметки по подготовке';
  note.append(noteLabel, textarea);
  const save = document.createElement('button'); save.type = 'button'; save.className = 'btn sm'; save.textContent = 'Сохранить заметку';
  save.addEventListener('click', () => updateBrief(brief, { note: textarea.value }, save));
  controls.append(statusLabel, note, save); body.append(controls); detailEl.append(body);
}

async function updateBrief(brief, change, button) {
  if (button) { button.disabled = true; button.textContent = 'Сохраняем…'; }
  try {
    await call('/api/admin/update', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: brief.id, ...change }) });
    Object.assign(brief, change);
    const index = briefs.findIndex((item) => item.id === brief.id);
    if (index >= 0) briefs[index] = { ...briefs[index], ...change };
    renderList();
    if (button) button.textContent = 'Сохранено';
  } catch (error) {
    if (button) button.textContent = error.message;
  } finally {
    if (button) setTimeout(() => { button.disabled = false; button.textContent = 'Сохранить заметку'; }, 1800);
  }
}

function groupAnswers(answers) {
  const groups = new Map();
  const set = (group, label, value) => {
    const text = Array.isArray(value) ? value.join(', ') : String(value ?? '').trim();
    if (!text) return;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push([label, text]);
  };
  const labelsMap = {
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
    noGo: ['Гости и программа', 'Ограничения'], extra: ['Гости и программа', 'Дополнительно'],
    dressCode: ['Событие', 'Дресс-код'],
  };
  for (const [key, value] of Object.entries(answers)) {
    const [group, label] = labelsMap[key] || ['Другие ответы', key];
    set(group, label, value);
  }
  return groups;
}

async function downloadArchive(brief, button) {
  button.disabled = true; button.textContent = 'Собираем ZIP…';
  try {
    const files = [];
    for (let i = 0; i < brief.photos.length; i++) {
      const path = brief.photos[i];
      const response = await fetch(`/api/admin/photo?id=${encodeURIComponent(brief.id)}&path=${encodeURIComponent(path)}`, { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error('Не удалось загрузить одну из фотографий.');
      files.push({ name: `${String(i + 1).padStart(2, '0')}_${path.split('/').pop().replace(/^[0-9a-f-]{36}-/i, '')}`, bytes: new Uint8Array(await response.arrayBuffer()) });
    }
    const archive = makeZip(files);
    const url = URL.createObjectURL(archive);
    const link = document.createElement('a'); link.href = url; link.download = `${brief.type}-${brief.id.slice(0, 8)}-photos.zip`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    button.textContent = 'Архив скачан';
  } catch (error) { button.textContent = error.message; }
  finally { setTimeout(() => { button.disabled = false; button.textContent = 'Скачать фото ZIP'; }, 2200); }
}

function downloadWord(brief, button) {
  button.disabled = true;
  button.textContent = 'Готовим Word…';
  try {
    const encoder = new TextEncoder();
    const paragraphs = [];
    const run = (text, options = {}) => {
      const props = [options.bold ? '<w:b/>' : '', options.color ? `<w:color w:val="${options.color}"/>` : '', options.size ? `<w:sz w:val="${options.size}"/>` : ''].join('');
      const body = String(text).split(/\r?\n/).map((line, index) => `${index ? '<w:br/>' : ''}<w:t xml:space="preserve">${escapeXml(line || ' ')}</w:t>`).join('');
      return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ''}${body}</w:r>`;
    };
    const paragraph = (runs, style = 'Normal', extra = '') => `<w:p><w:pPr>${style ? `<w:pStyle w:val="${style}"/>` : ''}${extra}</w:pPr>${runs}</w:p>`;
    const cell = (text, width, isLabel = false) => `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${isLabel ? '<w:shd w:val="clear" w:color="auto" w:fill="F5F1E8"/>' : ''}<w:vAlign w:val="center"/></w:tcPr>${paragraph(run(text, isLabel ? { bold: true, color: '80652F' } : { color: '292722' }), 'Normal', '<w:spacing w:before="80" w:after="80"/>')}</w:tc>`;
    const table = (rows) => `<w:tbl><w:tblPr><w:tblW w:w="9638" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tblCellMar><w:tblBorders><w:top w:val="single" w:sz="5" w:color="E3DED3"/><w:left w:val="single" w:sz="5" w:color="E3DED3"/><w:bottom w:val="single" w:sz="5" w:color="E3DED3"/><w:right w:val="single" w:sz="5" w:color="E3DED3"/><w:insideH w:val="single" w:sz="5" w:color="E3DED3"/><w:insideV w:val="single" w:sz="5" w:color="E3DED3"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="2600"/><w:gridCol w:w="7038"/></w:tblGrid>${rows.map(([label, value]) => `<w:tr>${cell(label, 2600, true)}${cell(value, 7038)}</w:tr>`).join('')}</w:tbl>`;

    paragraphs.push(paragraph(run('RAMAZAN DJALBIROV · ВЕДУЩИЙ МЕРОПРИЯТИЙ', { bold: true, color: '8A7652', size: 18 }), 'Brand'));
    paragraphs.push(paragraph(run('БРИФ МЕРОПРИЯТИЯ', { bold: true, color: '9A7739', size: 38 }), 'Title', '<w:spacing w:before="100" w:after="80"/>'));
    paragraphs.push(paragraph(run(labels[brief.type] || 'Мероприятие', { bold: true, color: '302D26', size: 26 }), 'Subtitle'));
    paragraphs.push(paragraph(run('ИНФОРМАЦИЯ О ЗАЯВКЕ', { bold: true, color: '8A7652', size: 18 }), 'Brand', '<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="8" w:color="D5B46A"/></w:pBdr>'));
    paragraphs.push(table([
      ['Имя', brief.answers?.contactName || 'Без имени'],
      ['Телефон / WhatsApp', brief.answers?.contactPhone || '—'],
      ['Получено', formatDate(brief.createdAt)],
    ]));
    paragraphs.push(paragraph(run('ОТВЕТЫ', { bold: true, color: '8A7652', size: 18 }), 'Brand', '<w:spacing w:before="280" w:after="60"/>'));
    for (const [groupName, rows] of groupAnswers(brief.answers || {})) {
      if (groupName === 'Контакты') continue;
      paragraphs.push(paragraph(run(groupName, { bold: true, color: '80652F', size: 26 }), 'Heading1', '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="3" w:color="D5B46A"/></w:pBdr>'));
      paragraphs.push(table(rows));
    }
    if (brief.photos?.length) {
      paragraphs.push(paragraph(run('ПРИЛОЖЕННЫЕ ФОТОГРАФИИ', { bold: true, color: '80652F', size: 26 }), 'Heading1', '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="3" w:color="D5B46A"/></w:pBdr>'));
      paragraphs.push(table(brief.photos.map((path, index) => {
        const filename = path.split('/').pop().replace(/^[0-9a-f-]{36}-/i, '');
        return [`Фото ${index + 1}`, filename];
      })));
    }
    paragraphs.push(paragraph(run('РАМАЗАН ДЖАЛБИРОВ · DJALBIROV.KZ', { color: '8A7652', size: 18 }), 'Brand', '<w:spacing w:before="360" w:after="0"/><w:jc w:val="center"/>'));
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/><w:color w:val="292722"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Brand"><w:name w:val="Brand"/><w:pPr><w:spacing w:after="80"/><w:keepNext/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:spacing w:after="120"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="38"/><w:color w:val="9A7739"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:pPr><w:spacing w:after="220"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="302D26"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:keepNext/><w:spacing w:before="260" w:after="100"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="80652F"/></w:rPr></w:style></w:styles>`;
    const files = [
      { name: '[Content_Types].xml', bytes: encoder.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>') },
      { name: '_rels/.rels', bytes: encoder.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>') },
      { name: 'word/document.xml', bytes: encoder.encode(documentXml) },
      { name: 'word/_rels/document.xml.rels', bytes: encoder.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>') },
      { name: 'word/styles.xml', bytes: encoder.encode(stylesXml) },
    ];
    const safeName = `${labels[brief.type] || 'Бриф'}-${brief.answers?.contactName || 'гость'}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').slice(0, 80);
    const archive = makeZip(files);
    const url = URL.createObjectURL(new Blob([archive], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
    const link = document.createElement('a'); link.href = url; link.download = `${safeName}.docx`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    button.textContent = 'Word скачан';
  } catch (error) {
    button.textContent = 'Не удалось скачать';
  } finally {
    setTimeout(() => { button.disabled = false; button.textContent = 'Скачать бриф Word'; }, 2200);
  }
}

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function deleteBrief(brief, button) {
  const name = brief.answers?.contactName || 'без имени';
  if (!window.confirm(`Точно удалить бриф «${labels[brief.type] || 'Мероприятие'} · ${name}»? Ответы и прикреплённые фотографии будут удалены без возможности восстановления.`)) return;
  button.disabled = true;
  button.textContent = 'Удаляем…';
  try {
    await call('/api/admin/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: brief.id }) });
    briefs = briefs.filter((item) => item.id !== brief.id);
    selectedId = '';
    renderList();
    showEmpty();
  } catch (error) {
    button.disabled = false;
    button.textContent = error.message || 'Не удалось удалить';
  }
}

function makeZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name.replace(/[\\/]/g, '_'));
    const bytes = file.bytes;
    const crc = crc32(bytes);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(8, 0, true);
    lv.setUint32(14, crc, true); lv.setUint32(18, bytes.length, true); lv.setUint32(22, bytes.length, true); lv.setUint16(26, name.length, true); local.set(name, 30);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, bytes.length, true); cv.setUint32(24, bytes.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); central.set(name, 46);
    localParts.push(local, bytes); centralParts.push(central); offset += local.length + bytes.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22); const ev = new DataView(end.buffer); ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, centralSize, true); ev.setUint32(16, offset, true);
  return new Blob([...localParts, ...centralParts, end], { type: 'application/zip' });
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function formatDate(value) { return new Date(value).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }); }
refreshSession();
