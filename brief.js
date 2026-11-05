import { upload } from '@vercel/blob/client';

const TYPE_CONFIG = {
  wedding: {
    kicker: 'Свадебный вечер', title: 'Бриф для свадьбы',
    sections: [
      { title: 'Контакты и событие', fields: [
        { id: 'contactName', label: 'Ваше имя', type: 'text', required: true, placeholder: 'Как к вам обращаться' },
        { id: 'contactPhone', label: 'Телефон или WhatsApp', type: 'tel', required: true, placeholder: '+7 …' },
        { id: 'eventDate', label: 'Дата свадьбы', type: 'date', required: true },
        { id: 'venue', label: 'Площадка и адрес', type: 'text', required: true, placeholder: 'Название ресторана, город' },
        { id: 'eventTime', label: 'Время начала и планируемое завершение', type: 'text', placeholder: 'Например, сбор гостей в 17:00' },
        { id: 'guestCount', label: 'Примерное количество гостей', type: 'number', placeholder: 'Например, 120' },
        { id: 'coupleNames', label: 'Как обращаться к молодожёнам?', type: 'text', required: true, placeholder: 'Имена и удобное обращение', wide: true },
        { id: 'weddingLanguage', label: 'Язык ведения', type: 'checks', options: ['Қазақша', 'Русский', 'Қазақша и русский', 'Другой'] },
        { id: 'audience', label: 'Что важно знать о гостях?', type: 'textarea', placeholder: 'Возраст, языки, семейные группы, особенности аудитории', wide: true },
      ]},
      { title: 'История пары', fields: [
        { id: 'meetingStory', label: 'Как вы познакомились? Что запомнилось о первой встрече?', type: 'textarea', wide: true },
        { id: 'relationshipStory', label: 'Какие общие истории, поездки или моменты хочется вспомнить?', type: 'textarea', wide: true },
        { id: 'proposalStory', label: 'Расскажите о предложении или другом важном моменте в отношениях', type: 'textarea', wide: true },
        { id: 'sharedLife', label: 'Чем любите заниматься вместе? Есть ли общие привычки, прозвища или традиции?', type: 'textarea', wide: true },
        { id: 'funnyStories', label: 'Какие добрые смешные истории можно рассказать гостям?', type: 'textarea', wide: true },
        { id: 'quizIdeas', label: 'Какие факты или вопросы можно использовать для викторины о паре?', type: 'textarea', help: 'Можно добавить варианты ответов, если они уже есть.', wide: true },
      ]},
      { title: 'Близкие и программа', fields: [
        { id: 'importantPeople', label: 'Кого важно упомянуть или обязательно пригласить к поздравлению?', type: 'textarea', placeholder: 'Имена, кем приходятся, как обращаться', wide: true },
        { id: 'familyNotes', label: 'Есть ли семейные особенности или важные обстоятельства, которые стоит учитывать?', type: 'textarea', wide: true },
        { id: 'preferences', label: 'Что вам ближе по настроению?', type: 'checks', options: ['Тёплые истории', 'Музыка и танцы', 'Интеллектуальные игры', 'Командные активности', 'Лёгкий юмор', 'Свободная программа', 'Полностью доверяем ведущему'] },
        { id: 'music', label: 'Песни, фильмы, увлечения пары или другие идеи для программы', type: 'textarea', wide: true },
        { id: 'noGo', label: 'Какие темы, шутки или активности лучше не затрагивать?', type: 'textarea', wide: true },
        { id: 'extra', label: 'Что ещё важно знать о свадьбе?', type: 'textarea', wide: true },
      ]},
    ],
  },
  anniversary: {
    kicker: 'Юбилей', title: 'Бриф на юбилей',
    sections: [
      { title: 'Контакты и событие', fields: [
        { id: 'contactName', label: 'Ваше имя', type: 'text', required: true, placeholder: 'Как к вам обращаться' },
        { id: 'contactPhone', label: 'Телефон или WhatsApp', type: 'tel', required: true, placeholder: '+7 …' },
        { id: 'eventDate', label: 'Дата юбилея', type: 'date', required: true },
        { id: 'venue', label: 'Площадка и точный адрес', type: 'text', required: true, placeholder: 'Название ресторана, город' },
        { id: 'eventTime', label: 'Время начала и завершения', type: 'text' },
        { id: 'celebrant', label: 'Кого поздравляем?', type: 'text', required: true, placeholder: 'Имя и удобное обращение', wide: true },
        { id: 'dressCode', label: 'Дресс-код', type: 'text', placeholder: 'Если предусмотрен' },
        { id: 'guestCount', label: 'Примерное количество гостей', type: 'number', placeholder: 'Например, 60' },
      ]},
      { title: 'О юбиляре', fields: [
        { id: 'bio', label: 'Расскажите о юбиляре: откуда родом, семья, детство, учёба, работа', type: 'textarea', wide: true },
        { id: 'personality', label: 'Черты характера, привычки и увлечения', type: 'textarea', wide: true },
        { id: 'lifeStories', label: 'Самые яркие, необычные или смешные истории из жизни', type: 'textarea', wide: true },
        { id: 'favorites', label: 'Любимые блюда, песни, фильмы, книги, артисты или спорт', type: 'textarea', wide: true },
        { id: 'proudMoments', label: 'Какие достижения или моменты жизни хочется отметить?', type: 'textarea', wide: true },
        { id: 'dreams', label: 'Мечты, планы или любимые места', type: 'textarea', wide: true },
      ]},
      { title: 'Гости и программа', fields: [
        { id: 'importantPeople', label: 'Кому обязательно нужно дать слово? Укажите имена и отношения', type: 'textarea', wide: true },
        { id: 'preferences', label: 'Какие активности нравятся?', type: 'checks', options: ['Интеллектуальные', 'Музыкальные', 'Танцевальные', 'Командные', 'Массовые', 'Лёгкий юмор', 'Полностью доверяем ведущему'] },
        { id: 'guestStories', label: 'Истории или особенности гостей, которые помогут сделать программу личной', type: 'textarea', wide: true },
        { id: 'familyTraditions', label: 'Семейные традиции и темы, важные для семьи', type: 'textarea', wide: true },
        { id: 'noGo', label: 'На какие темы лучше не шутить и кого не вовлекать в активности?', type: 'textarea', wide: true },
        { id: 'extra', label: 'Другие пожелания к юбилею', type: 'textarea', wide: true },
      ]},
    ],
  },
  corporate: {
    kicker: 'Корпоративное событие', title: 'Корпоративный бриф',
    sections: [
      { title: 'Контакты и событие', fields: [
        { id: 'contactName', label: 'Ваше имя и должность', type: 'text', required: true, placeholder: 'Как к вам обращаться' },
        { id: 'contactPhone', label: 'Телефон или WhatsApp', type: 'tel', required: true, placeholder: '+7 …' },
        { id: 'eventDate', label: 'Дата мероприятия', type: 'date', required: true },
        { id: 'venue', label: 'Площадка и адрес', type: 'text', required: true, placeholder: 'Название площадки, город' },
        { id: 'eventTime', label: 'Время начала и завершения', type: 'text' },
        { id: 'companyName', label: 'Название компании и сфера деятельности', type: 'text', required: true, wide: true },
        { id: 'eventName', label: 'Название и повод мероприятия', type: 'text', placeholder: 'Например, летний тимбилдинг', wide: true },
        { id: 'guestCount', label: 'Сколько гостей ожидается?', type: 'number', placeholder: 'Примерное количество' },
        { id: 'staffCount', label: 'Сколько сотрудников в компании?', type: 'number' },
        { id: 'companyHistory', label: 'Сколько лет компания работает? Есть ли дочерние компании?', type: 'textarea', wide: true },
      ]},
      { title: 'Цели и контекст компании', fields: [
        { id: 'goals', label: 'Цели мероприятия и главный результат, которого хочется достичь', type: 'textarea', wide: true },
        { id: 'achievements', label: 'Значимые события и достижения компании за год или за всё время', type: 'textarea', wide: true },
        { id: 'leaders', label: 'Ключевые руководители: имя, должность и как к ним обращаться', type: 'textarea', wide: true },
        { id: 'competitors', label: 'Конкуренты, партнёры или отраслевые особенности, которые важно знать', type: 'textarea', wide: true },
        { id: 'lastEvents', label: 'Опишите до трёх последних корпоративных событий: формат и что понравилось или не подошло', type: 'textarea', wide: true },
      ]},
      { title: 'Коллектив и стиль', fields: [
        { id: 'management', label: 'Стиль руководства и общения с сотрудниками', type: 'textarea', wide: true },
        { id: 'culture', label: 'Ценности компании и желаемый стиль вечера', type: 'textarea', placeholder: 'Официальный, свободный, семейный и т. п.', wide: true },
        { id: 'stories', label: 'Безопасные внутренние шутки, традиции, мемы и смешные истории', type: 'textarea', wide: true },
        { id: 'people', label: 'Сотрудники или отделы, которых стоит представить. Добавьте имена, роли и интересные особенности', type: 'textarea', help: 'Можно перечислить несколько человек или описать отделы.', wide: true },
        { id: 'noGo', label: 'Кого лучше не вовлекать в конкурсы и какие темы не затрагивать?', type: 'textarea', wide: true },
        { id: 'extra', label: 'Другие пожелания к программе', type: 'textarea', wide: true },
      ]},
    ],
  },
};

const params = new URLSearchParams(location.search);
const type = params.get('type');
const config = TYPE_CONFIG[type];
const form = document.getElementById('briefForm');
const sections = document.getElementById('formSections');
const fileInput = document.getElementById('photos');
const fileList = document.getElementById('fileList');
const status = document.getElementById('formStatus');
const submitButton = document.getElementById('submitButton');

if (!config) {
  document.getElementById('formKicker').textContent = 'Ссылка не распознана';
  document.getElementById('formTitle').textContent = 'Выберите нужный бриф';
  document.querySelector('.intro-text').textContent = 'Попросите организатора прислать ссылку на свадебный, юбилейный или корпоративный бриф.';
  form.hidden = true;
} else {
  document.title = `${config.title} — Рамазан Джалбиров`;
  document.getElementById('formKicker').textContent = config.kicker;
  document.getElementById('formTitle').textContent = config.title;
  sections.innerHTML = config.sections.map((section, i) => `
    <section class="form-section">
      <div class="section-heading"><span class="section-no">${String(i + 1).padStart(2, '0')}</span><div><p class="eyebrow">Раздел ${i + 1}</p><h2>${section.title}</h2></div></div>
      <div class="fields">${section.fields.map(renderField).join('')}</div>
    </section>`).join('');
}

function renderField(field) {
  if (field.type === 'checks') {
    return `<fieldset class="field wide" style="border:0;padding:0;margin:0"><legend><span>${field.label}</span></legend><div class="choice-grid">${field.options.map((option, i) => `<label class="choice"><input type="checkbox" name="${field.id}" value="${option}"><span>${option}</span></label>`).join('')}</div></fieldset>`;
  }
  const required = field.required ? 'required' : '';
  const star = field.required ? ' <b class="required">*</b>' : '';
  const help = field.help ? `<small class="field-help">${field.help}</small>` : '';
  const value = field.placeholder ? ` placeholder="${field.placeholder}"` : '';
  const control = field.type === 'textarea'
    ? `<textarea name="${field.id}" maxlength="12000"${value}></textarea>`
    : `<input type="${field.type}" name="${field.id}" maxlength="500"${value} ${required}>`;
  return `<label class="field ${field.wide ? 'wide' : ''}"><span>${field.label}${star}</span>${control}${help}</label>`;
}

function selectedFiles() { return Array.from(fileInput.files || []); }
function showFiles() {
  const files = selectedFiles();
  fileList.replaceChildren();
  files.forEach((file) => {
    const li = document.createElement('li');
    li.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} МБ`;
    fileList.append(li);
  });
}
fileInput.addEventListener('change', showFiles);

function validateFiles(files) {
  if (files.length > 20) return 'Можно прикрепить не больше 20 фотографий.';
  for (const file of files) {
    const typeOk = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.type);
    const extOk = /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
    if (!typeOk || !extOk) return `Файл «${file.name}» не похож на поддерживаемую фотографию.`;
    if (file.size > 10 * 1024 * 1024) return `«${file.name}» больше 10 МБ.`;
  }
  return '';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = '';
  status.classList.remove('error');
  if (!form.reportValidity()) return;
  const files = selectedFiles();
  const fileError = validateFiles(files);
  if (fileError) { status.textContent = fileError; status.classList.add('error'); return; }
  if (!document.getElementById('consent').checked) { status.textContent = 'Пожалуйста, подтвердите согласие.'; status.classList.add('error'); return; }

  const answers = {};
  const fields = new Set(Array.from(form.querySelectorAll('[name]')).filter((el) => el.type !== 'file').map((el) => el.name));
  for (const name of fields) {
    const nodes = Array.from(form.querySelectorAll(`[name="${CSS.escape(name)}"]`));
    const checks = nodes.filter((node) => node.type === 'checkbox');
    if (checks.length) answers[name] = checks.filter((node) => node.checked).map((node) => node.value);
    else answers[name] = nodes[0]?.value?.trim() || '';
  }
  submitButton.disabled = true;
  let savedId = '';
  const uploadedPaths = [];
  try {
    status.textContent = 'Сохраняем ответы…';
    const saved = await request('/api/briefs', { type, answers, consent: true });
    savedId = saved.id;
    const paths = [];
    for (let i = 0; i < files.length; i++) {
      status.textContent = `Загружаем фото ${i + 1} из ${files.length}…`;
      const file = files[i];
      const safeName = file.name.normalize('NFKC').replace(/[^\p{L}\p{N}._-]+/gu, '_').slice(-100) || 'photo';
      const pathname = `uploads/${saved.id}/${crypto.randomUUID()}-${safeName}`;
      const blob = await upload(pathname, file, {
        access: 'private',
        handleUploadUrl: '/api/uploads',
        clientPayload: JSON.stringify({ id: saved.id, type }),
      });
      paths.push(blob.pathname);
      uploadedPaths.push(blob.pathname);
    }
    if (paths.length) {
      status.textContent = 'Прикрепляем фотографии…';
      await request('/api/brief-photos', { id: saved.id, paths });
    }
    form.hidden = true;
    document.querySelector('.intro').hidden = true;
    document.querySelector('.success').hidden = false;
  } catch (error) {
    if (savedId) {
      if (uploadedPaths.length) await request('/api/brief-photos', { id: savedId, paths: uploadedPaths }).catch(() => {});
      form.hidden = true;
      document.querySelector('.intro').hidden = true;
      document.querySelector('.success').hidden = false;
      document.querySelector('.success p:not(.eyebrow)').textContent = uploadedPaths.length
        ? 'Бриф сохранён. Часть фотографий не загрузилась — их можно дослать Рамазану в WhatsApp.'
        : 'Бриф сохранён. Фотографии не загрузились — при необходимости их можно дослать Рамазану в WhatsApp.';
      return;
    }
    status.textContent = error.message || 'Не удалось отправить бриф. Проверьте интернет и попробуйте ещё раз.';
    status.classList.add('error');
  } finally {
    submitButton.disabled = false;
  }
});

async function request(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Не удалось отправить форму.');
  return data;
}
