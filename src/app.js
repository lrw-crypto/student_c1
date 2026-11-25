import { PROJECT_TYPES, getProjectType, generateReport, DEFAULT_PROMPTS } from './writing.js';
import { SPORT_PROFILES, getSportProfile } from './sports.js?v=2';
import { EXAMPLES } from './examples.js?v=2';
import { CONTEXT_OPTIONS, EVIDENCE_OPTIONS, getContextLabel, getEventOptions, getEventLabel, getEvidenceLabel } from './events.js';
import { generateTitle } from './titles.js?v=2';
import { clearDraft, loadDraft, preparePhoto, saveDraft } from './storage.js';
import { downloadDocx } from './docx.js';
import { downloadPdf } from './pdf.js';

const themes = {
  green: { accent: '#24634e' },
  blue: { accent: '#274996' },
  clay: { accent: '#a14b32' },
};

const defaultState = {
  step: 0, mode: 'guided', type: '', customType: '', sport: '', customSport: '', event: '', context: '', title: '', name: '', department: '', date: '',
  role: '', focus: '', action: '', challengeChoice: '', challenge: '', outcomeChoice: '', outcome: '',
  reflectionChoice: '', reflection: '', narrative: '', photos: [], layout: 'text-first',
  theme: 'blue', finalSections: null, sample: '',
};
const maxPhotos = 6;
const experienceChoices = ['context', 'role', 'focus', 'challengeChoice', 'outcomeChoice', 'reflectionChoice'];
const sectionDefaults = [
  { id: 'overview', heading: '經歷摘要' },
  { id: 'action', heading: '我做了什麼' },
  { id: 'challenge', heading: '遇到的問題' },
  { id: 'outcome', heading: '成果與證據' },
  { id: 'reflection', heading: '我的反思' },
];
const ui = Object.fromEntries(
  ['panel', 'panel-footer', 'paper', 'steps', 'save-status', 'preview-summary', 'layout', 'themes',
    'download-word', 'download-pdf', 'reset', 'example', 'toast', 'confirm-dialog', 'confirm-title',
    'confirm-message', 'confirm-action', 'sample-dialog', 'sample-description', 'sample-options'].map(id => [id, document.getElementById(id)]),
);
let state = { ...defaultState, photos: [] };
let saveTimer;
let toastTimer;
let saving = Promise.resolve();
let loadingPhotos = false;
let exporting = false;

function escape(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function clean(value) {
  return String(value ?? '').trim();
}

function sportLabel() {
  return state.sport === 'other'
    ? clean(state.customSport)
    : state.sport === 'general-track' ? '田徑' : getSportProfile(state.sport)?.label ?? '';
}

function activeProfile() {
  const category = getProjectType(state.type);
  return getSportProfile(state.sport) ?? (category?.code ? category : getProjectType('summary'));
}

function report() {
  const base = generateReport(state.mode === 'guided' ? { ...state, narrative: '' } : {
    type: state.type, narrative: state.narrative,
  }, activeProfile());
  const sections = state.finalSections ?? base.sections;
  const eventLabel = getEventLabel(state.sport, state.event);
  const sport = sportLabel();
  const contextLabel = getContextLabel(state.context);
  const categoryLabel = state.type === 'custom' ? clean(state.customType) : base.typeLabel;
  const title = clean(state.title) || generateTitle({
    ...state,
    ...(state.mode === 'narrative' ? { focus: '', challengeChoice: '', outcomeChoice: '', reflectionChoice: '', role: '' } : {}),
    sportLabel: sport,
    eventLabel: state.sport === 'other' ? sport || eventLabel : eventLabel,
    customType: state.type === 'custom' ? state.customType : '',
    categoryLabel,
    contextLabel,
  });
  const selectedEvent = state.sport === 'other' ? sport || eventLabel : eventLabel;
  const subject = state.sport === 'sprint' && selectedEvent ? `${selectedEvent}短跑` : selectedEvent || sport;
  return {
    ...base,
    typeLabel: [base.typeCode, categoryLabel].filter(Boolean).join(' '),
    title,
    name: clean(state.name),
    department: [...new Set([clean(state.department), subject, contextLabel].filter(Boolean))].join('　·　'),
    date: clean(state.date),
    sections: sections.map(({ id, heading, text }) => ({ id, heading, text: clean(text) })).filter(section => section.text),
    photos: state.photos.map(photo => ({ ...photo, caption: clean(photo.caption) || getEvidenceLabel(photo.captionType) })),
    layout: state.layout,
    theme: themes[state.theme] ?? themes.blue,
  };
}

function hasMaterial(data = report()) {
  return Boolean(clean(state.title) || data.sections.length || data.photos.length);
}

function hasDraft() {
  return Object.keys(defaultState).some(key => {
    if (key === 'photos') return state.photos.length > 0;
    if (key === 'step') return false;
    return state[key] !== defaultState[key];
  });
}

function sectionRows(data) {
  if (state.finalSections) return state.finalSections;
  const available = new Map(data.sections.map(section => [section.id, section]));
  return sectionDefaults.map(section => available.get(section.id) ?? { ...section, text: '' });
}

const renderedMarkup = new WeakMap();
let photoSignature = '';
let photoMarkup = '';

function renderPhotos(photos) {
  const signature = JSON.stringify(photos.map(photo => [photo.id, photo.caption]));
  if (signature === photoSignature) return photoMarkup;
  photoSignature = signature;
  photoMarkup = photos.map(photo => {
    const caption = clean(photo.caption);
    return `<figure class="paper-figure"><img src="${escape(photo.src)}" alt="${escape(caption || '成果照片')}">${caption ? `<figcaption>${escape(caption)}</figcaption>` : ''}</figure>`;
  }).join('');
  return photoMarkup;
}

function preview() {
  const data = report();
  const { sections, photos } = data;
  const count = Array.from(sections.map(section => section.text).join('').replace(/\s/g, '')).length;
  const over = count > 400;
  ui['preview-summary'].textContent = count ? `內文 ${count} 字${over ? ' · 建議精簡至 400 字' : ''}` : '點選後同步更新';
  for (const title of ui.panel.querySelectorAll('[data-generated-title]')) title.textContent = data.title;
  for (const label of ui.panel.querySelectorAll('[data-title-label]')) label.textContent = clean(state.title) ? '自訂標題' : '自動標題';
  for (const button of ui.panel.querySelectorAll('[data-auto-title]')) button.hidden = !clean(state.title);
  ui['preview-summary'].classList.toggle('over-limit', over);
  const hasContent = hasMaterial(data);
  const hasTopic = hasContent || Boolean(state.sport || state.type || state.context);
  ui.paper.style.setProperty('--paper-accent', data.theme.accent);
  ui.paper.classList.toggle('paper--empty', !hasContent);
  const meta = [data.name, data.department, data.date].filter(Boolean).join('　·　');
  const text = section => `<section class="paper-section"><h3>${escape(section.heading)}</h3><p>${escape(section.text)}</p></section>`;
  const split = Math.ceil(sections.length / 2);
  const textBlocks = photos.length ? sections : sections.slice(0, split);
  let left = textBlocks.map(text).join('');
  let right = photos.length
    ? `<section class="paper-section"><h3>成果照片</h3>${renderPhotos(photos)}</section>`
    : sections.slice(split).map(text).join('');
  if (photos.length && state.layout === 'photo-first') [left, right] = [right, left];
  if (!hasContent) {
    left = `<div class="preview-empty" aria-hidden="true"><span></span><i></i><i></i><i></i><span></span><i></i><i></i></div>`;
    right = `<div class="preview-empty preview-empty--photo" aria-hidden="true"><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-4 3 2 4-5 5 5"/></svg></div>`;
  }
  const kicker = data.typeLabel || '多元學習成果';
  const header = `${kicker === data.title ? '' : `<p class="paper-kicker">${escape(kicker)}</p>`}<h2>${escape(hasTopic ? data.title : '你的成果標題')}</h2>${meta ? `<p class="paper-meta">${escape(meta)}</p>` : ''}`;
  if (!ui.paper.children.length) {
    ui.paper.innerHTML = '<header class="paper-header"></header><div class="paper-body"><div class="paper-column"></div><div class="paper-column"></div></div>';
  }
  const [leftColumn, rightColumn] = ui.paper.lastElementChild.children;
  for (const [node, markup] of [[ui.paper.firstElementChild, header], [leftColumn, left], [rightColumn, right]]) {
    if (renderedMarkup.get(node) !== markup) {
      node.innerHTML = markup;
      renderedMarkup.set(node, markup);
    }
  }
  ui['download-word'].disabled = ui['download-pdf'].disabled = !hasContent || exporting || loadingPhotos;
  ui.layout.value = state.layout;
  for (const button of ui.themes.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(state.theme === button.dataset.theme));
  }
}

function queueSave() {
  ui['save-status'].textContent = '儲存中…';
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(persist, 200);
}

function persist() {
  window.clearTimeout(saveTimer);
  const snapshot = structuredClone(state);
  saving = saving.then(async () => {
    const saved = await saveDraft(snapshot);
    ui['save-status'].textContent = saved ? '草稿已儲存在這部裝置' : '暫時無法儲存草稿';
  });
  return saving;
}

function notify(message) {
  window.clearTimeout(toastTimer);
  ui.toast.hidden = false;
  ui.toast.textContent = message;
  toastTimer = window.setTimeout(() => { ui.toast.hidden = true; }, 4400);
}

function field(key, label, options = {}) {
  const { placeholder = '', max = 80, value = state[key], multiline = false, hint = '' } = options;
  const attributes = `id="field-${key}" data-field="${key}" maxlength="${max}" placeholder="${escape(placeholder)}"${hint ? ` aria-describedby="hint-${key}"` : ''}`;
  return `<div class="field"><label class="field-heading" for="field-${key}">${label}</label>${multiline
    ? `<textarea ${attributes} rows="${options.rows ?? 2}">${escape(value)}</textarea>`
    : `<input ${attributes} type="text" value="${escape(value)}">`}${hint ? `<p class="field-hint" id="hint-${key}">${escape(hint)}</p>` : ''}</div>`;
}

function chips(key, options, label) {
  if (!options?.length) return '';
  const buttons = options.map(option => {
    const { id, label: text } = typeof option === 'string' ? { id: option, label: option } : option;
    return `<button type="button" class="chip" data-choice="${key}" data-value="${escape(id)}" aria-pressed="${state[key] === id}">${escape(text)}</button>`;
  }).join('');
  return `<div class="chipset" role="group" aria-label="${escape(label)}">${buttons}</div>`;
}

function selectionGroup(key, options, label, written = '') {
  if (!options?.length) return '';
  return `<div class="selection-group"><span class="selection-heading">${label}${clean(written) ? ' <small class="field-hint">採用補寫內容</small>' : ''}</span>
    ${chips(key, options, label)}</div>`;
}

function optionalFields(id, summary, body, open = false) {
  return `<details class="optional-fields" data-optional="${escape(id)}"${open ? ' open' : ''}>
    <summary>${summary}</summary><div class="optional-fields-body">${body}</div>
  </details>`;
}

function panelIntro(title, description) {
  return `<h2 class="panel-title" id="panel-title" tabindex="-1">${title}</h2><p class="panel-description">${description}</p>`;
}

function titleCard(data) {
  return `<div class="generated-title"><span class="automatic-label" data-title-label>${clean(state.title) ? '自訂標題' : '自動標題'}</span>
    <strong data-generated-title>${escape(data.title)}</strong></div>`;
}

function basicsPanel() {
  const choices = PROJECT_TYPES.filter(type => type.id !== 'custom').map(type => {
    return `<button type="button" class="choice" data-choice="type" data-value="${escape(type.id)}" aria-pressed="${state.type === type.id}"><span class="choice-code">${escape(type.code)}</span><strong>${escape(type.label)}</strong></button>`;
  }).join('');
  const sports = SPORT_PROFILES.map(sport => `<button type="button" class="sport-choice" data-choice="sport" data-value="${escape(sport.id)}" aria-pressed="${state.sport === sport.id}"><strong>${escape(sport.label)}</strong><span class="sport-description">${escape(sport.description)}</span></button>`).join('');
  const eventOptions = getEventOptions(state.sport);
  const eventHeading = state.sport === 'sprint' ? '距離（選填）' : '細項（選填）';
  const metadata = `${state.type === 'custom' ? field('customType', '自訂類別', { placeholder: '例如：校隊訓練紀錄', max: 35 }) : ''}
    ${state.sport === 'other' ? field('customSport', '自訂運動項目', { placeholder: '例如：羽球雙打', max: 35 }) : ''}
    <div class="field-row">
      ${field('name', '姓名', { placeholder: '例如：林同學', max: 32 })}
      ${field('department', '班級或校隊', { placeholder: '例如：高二體育班', max: 36 })}
    </div>
    ${field('date', '活動時間', { placeholder: '例如：高二下學期', max: 36 })}`;
  return `${panelIntro('選這次想記錄的項目', '點選運動項目和活動類別，下一步選經歷。')}
    <div class="field sport-field"><div class="field-heading" id="sport-label">運動項目（選填）</div>
      <div class="sport-grid" role="group" aria-labelledby="sport-label">${sports}</div>
      ${eventOptions.length ? `<div class="event-options"><div class="field-heading">${eventHeading}</div>${chips('event', eventOptions, eventHeading)}</div>` : ''}
    </div>
    <div class="field"><div class="field-heading" id="activity-label">高中多元表現類別</div>
      <div class="choice-grid" role="group" aria-labelledby="activity-label">${choices}<button type="button" class="choice choice--custom" data-choice="type" data-value="custom" aria-pressed="${state.type === 'custom'}"><strong>自訂類別</strong></button></div>
    </div>
    ${optionalFields('metadata', '補充資料（選填）', metadata)}`;
}

function experiencePanel() {
  const profile = activeProfile();
  const sport = getEventLabel(state.sport, state.event) || sportLabel();
  const isSport = Boolean(state.sport);
  const prompts = { ...DEFAULT_PROMPTS, ...profile?.prompts };
  const count = experienceChoices.filter(key => state[key]).length;
  const modes = `<div class="mode-toggle" role="group" aria-label="撰寫方式">
    <button class="mode" data-choice="mode" data-value="guided" aria-pressed="${state.mode === 'guided'}" type="button">點選引導</button>
    <button class="mode" data-choice="mode" data-value="narrative" aria-pressed="${state.mode === 'narrative'}" type="button">自行敘述</button></div>`;
  const written = state.mode === 'narrative' ? field('narrative', '我的經歷', {
    multiline: true, rows: 6, max: 1600, placeholder: prompts.narrative,
  }) : `<p class="field-hint">有補寫的段落會優先用你填的文字。</p>
    ${field('role', '自訂角色', { max: 32 })}
    ${field('action', '補寫做法', { multiline: true, max: 400, placeholder: prompts.action })}
    ${field('challenge', '補寫困難', { multiline: true, max: 400, placeholder: prompts.challenge })}
    ${field('outcome', '補寫成果', { multiline: true, max: 400, placeholder: prompts.outcome })}
    ${field('reflection', '補寫反思', { multiline: true, max: 400, placeholder: prompts.reflection })}`;
  return `${panelIntro(sport ? `選${escape(sport)}的經歷` : '選出你的經歷', '每組選一個符合的選項，沒有就跳過。')}
    <div class="choice-summary"><span class="choice-summary-count">${count}</span><span class="choice-summary-label">個已選重點</span></div>
    ${titleCard(report())}
    ${state.mode === 'narrative' ? '<p class="tip">目前使用自述。點任一選項即可回到點選引導。</p>' : ''}
    ${state.finalSections ? '<p class="tip">目前預覽採用你修改過的定稿，可在定稿區重新套用選項。</p>' : ''}
    ${isSport ? selectionGroup('context', CONTEXT_OPTIONS, '這次的場合') : ''}
    ${selectionGroup('focus', profile.focuses, isSport ? '我怎麼練或比賽' : '我做了什麼', state.action)}
    ${selectionGroup('challengeChoice', profile.challenges, '我遇到的困難', state.challenge)}
    ${selectionGroup('outcomeChoice', profile.outcomes, '我的成果', state.outcome)}
    ${selectionGroup('reflectionChoice', profile.reflections, '下次怎麼做', state.reflection)}
    ${selectionGroup('role', profile.roles, '我的角色（選填）')}
    ${optionalFields('writing', '補寫或自行敘述（選填）', modes + written, state.mode === 'narrative')}`;
}

function photoCards() {
  const captionPrompt = getSportProfile(state.sport)?.prompts.caption ?? '例如：我負責的活動或拍攝位置';
  return state.photos.map((photo, index) => `<div class="photo-item">
    <img class="photo-thumb" src="${escape(photo.src)}" alt="">
    <div class="photo-info field"><label class="field-heading" for="caption-type-${index}">照片 ${index + 1} 圖說（選填）</label>
      <select id="caption-type-${index}" data-caption-type="${index}">
        <option value="">不加圖說</option>
        ${EVIDENCE_OPTIONS.map(option => `<option value="${option.id}" ${photo.captionType === option.id ? 'selected' : ''}>${option.label}</option>`).join('')}
      </select>
      ${optionalFields(`caption-${photo.id}`, '自訂圖說（選填）', `<label class="sr-only" for="caption-${index}">自訂照片 ${index + 1} 圖說</label>
        <input type="text" id="caption-${index}" data-caption="${index}" maxlength="110" value="${escape(photo.caption)}" placeholder="${escape(captionPrompt)}">`)}
    </div>
    <div class="photo-actions">
      <button class="icon-button" type="button" data-photo="up" data-index="${index}" aria-label="上移照片 ${index + 1}" ${index === 0 ? 'disabled' : ''}>上移</button>
      <button class="icon-button" type="button" data-photo="down" data-index="${index}" aria-label="下移照片 ${index + 1}" ${index === state.photos.length - 1 ? 'disabled' : ''}>下移</button>
      <button class="icon-button" type="button" data-photo="remove" data-index="${index}" aria-label="移除照片 ${index + 1}">×</button>
    </div></div>`).join('');
}

function finalPanel() {
  const data = report();
  const edits = `${field('title', '自訂成果標題', { placeholder: data.title, max: 64 })}
    <button class="button button--quiet" type="button" data-auto-title ${clean(state.title) ? '' : 'hidden'}>使用自動標題</button>
    <div class="final-header"><div><h3>定稿內文</h3><p class="field-hint">留空的段落不會匯出。</p></div>
    <button class="button button--quiet" type="button" data-regenerate ${state.finalSections ? '' : 'disabled'}>重新套用選項</button></div>
    ${sectionRows(data).map((section, index) => `<div class="field">
      <label class="field-heading" for="final-${index}">${escape(section.heading)}</label>
      <textarea id="final-${index}" data-final="${index}" rows="2" maxlength="1600">${escape(section.text)}</textarea>
    </div>`).join('')}`;
  return `${panelIntro('確認成果，下載檔案', '標題和內文已自動整理。也可以加入照片。')}
    ${titleCard(data)}
    <div class="field">
      <div class="field-heading">成果照片 <span class="field-hint">（${state.photos.length} / ${maxPhotos}）</span></div>
      <button class="photo-drop" type="button" data-upload ${loadingPhotos || state.photos.length >= maxPhotos ? 'disabled' : ''}>
        <span class="upload-icon" aria-hidden="true">+</span><strong>${loadingPhotos ? '正在處理照片…' : '選取照片或拖曳到這裡'}</strong>
        <span>每張 35 MB 以內，建議使用 JPG、PNG 或 WebP</span></button>
      <input type="file" id="photo-input" accept="image/*" multiple hidden>
      <div class="photo-list">${photoCards()}</div>
    </div>
    ${optionalFields('final', '修改標題和內文（選填）', edits, Boolean(state.finalSections || state.title))}`;
}

const panelRenderers = [basicsPanel, experiencePanel, finalPanel];

function renderPanel() {
  const openDetails = new Set(Array.from(ui.panel.querySelectorAll('details[open]'), item => item.dataset.optional));
  const sampleNote = state.sample ? '<p class="sample-note tip">示範草稿。請改選符合自己的經歷。</p>' : '';
  ui.panel.innerHTML = sampleNote + panelRenderers[state.step]();
  for (const details of ui.panel.querySelectorAll('details')) {
    if (openDetails.has(details.dataset.optional)) details.open = true;
  }
  for (const button of ui.steps.querySelectorAll('button')) {
    if (Number(button.dataset.step) === state.step) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  }
  ui['panel-footer'].innerHTML = `<span class="step-progress">步驟 ${state.step + 1} / 3</span><div class="panel-actions">
    ${state.step > 0 ? '<button class="button button--outline" data-prev type="button">上一步</button>' : ''}
    ${state.step < 2 ? '<button class="button button--primary" data-next type="button">下一步</button>' : '<button class="button button--primary" data-preview type="button">查看預覽</button>'}</div>`;
}

function setStep(next) {
  if (next === state.step) return;
  state.step = next;
  renderPanel();
  queueSave();
  document.getElementById('panel-title').focus({ preventScroll: true });
  ui.steps.scrollIntoView({ block: 'nearest', behavior: 'instant' });
}

function commit() {
  preview();
  queueSave();
}

function selectChoice(button) {
  const { choice: key, value } = button.dataset;
  const oldProfile = activeProfile();
  const resumesGuidance = state.mode === 'narrative' && experienceChoices.includes(key);
  if (key === 'sport') {
    state.event = '';
    state.context = '';
  }
  if (resumesGuidance) state.mode = 'guided';
  state[key] = state[key] === value && key !== 'mode' && !resumesGuidance ? '' : value;
  if (['type', 'sport'].includes(key) && activeProfile() !== oldProfile) {
    if (oldProfile?.roles.includes(state.role)) state.role = '';
    state.focus = '';
    state.challengeChoice = '';
    state.outcomeChoice = '';
    state.reflectionChoice = '';
  }
  renderPanel();
  const replacement = Array.from(ui.panel.querySelectorAll('[data-choice]')).find(candidate =>
    candidate.dataset.choice === key && candidate.dataset.value === value);
  replacement?.focus({ preventScroll: true });
  commit();
}

async function addPhotos(files) {
  if (loadingPhotos || !files.length) return;
  const remaining = maxPhotos - state.photos.length;
  if (remaining <= 0) {
    notify(`最多可加入 ${maxPhotos} 張照片。`);
    return;
  }
  loadingPhotos = true;
  renderPanel();
  preview();
  const errors = [];
  let added = 0;
  for (const file of Array.from(files).slice(0, remaining)) {
    try {
      state.photos.push(await preparePhoto(file));
      added += 1;
    } catch (error) {
      errors.push(error.message);
    }
  }
  loadingPhotos = false;
  if (state.step === 2) renderPanel();
  commit();
  if (errors.length || files.length > remaining) {
    notify([`已加入 ${added} 張`, ...new Set(errors), files.length > remaining ? `最多 ${maxPhotos} 張` : ''].filter(Boolean).join('。'));
  } else {
    notify(`已加入 ${added} 張照片。`);
  }
}

function updatePhoto(button) {
  if (loadingPhotos) return;
  const index = Number(button.dataset.index);
  if (button.dataset.photo === 'remove') state.photos.splice(index, 1);
  else {
    const target = index + (button.dataset.photo === 'up' ? -1 : 1);
    if (!state.photos[target]) return;
    [state.photos[index], state.photos[target]] = [state.photos[target], state.photos[index]];
  }
  renderPanel();
  commit();
}

function confirmAction(title, message, action) {
  ui['confirm-title'].textContent = title;
  ui['confirm-message'].textContent = message;
  ui['confirm-action'].textContent = action;
  return new Promise(resolve => {
    const dialog = ui['confirm-dialog'];
    dialog.returnValue = '';
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true });
    dialog.showModal();
  });
}

async function download(kind) {
  if (!hasMaterial() || exporting) return;
  const data = report();
  exporting = true;
  const button = ui[`download-${kind}`];
  const original = button.textContent;
  button.textContent = '產生檔案中…';
  preview();
  try {
    await (kind === 'word' ? downloadDocx(data) : downloadPdf(data));
    notify(`已下載 ${kind === 'word' ? 'Word' : 'PDF'}。`);
  } catch (error) {
    console.error(error);
    notify('匯出失敗，請稍後再試。');
  } finally {
    exporting = false;
    button.textContent = original;
    preview();
  }
}

ui.panel.addEventListener('submit', event => event.preventDefault());
ui.panel.addEventListener('input', event => {
  const input = event.target;
  if (input.dataset.field) {
    state[input.dataset.field] = input.value;
    if (input.dataset.field === 'role') {
      for (const button of ui.panel.querySelectorAll('[data-choice="role"]')) {
        button.setAttribute('aria-pressed', String(button.dataset.value === input.value));
      }
    }
  } else if (input.dataset.caption !== undefined) {
    state.photos[Number(input.dataset.caption)].caption = input.value;
  } else if (input.dataset.final !== undefined) {
    state.finalSections ??= sectionRows(report());
    state.finalSections[Number(input.dataset.final)].text = input.value;
    ui.panel.querySelector('[data-regenerate]').disabled = false;
  } else return;
  commit();
});
ui.panel.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.choice) selectChoice(button);
  if (button.hasAttribute('data-upload')) document.getElementById('photo-input').click();
  if (button.dataset.photo) updatePhoto(button);
  if (button.hasAttribute('data-auto-title')) {
    state.title = '';
    renderPanel();
    commit();
    document.getElementById('field-title')?.focus({ preventScroll: true });
  }
  if (button.hasAttribute('data-regenerate') && await confirmAction(
    '重新套用選項？', '定稿內文將依目前的選項重新產生。', '重新套用',
  )) {
    state.finalSections = null;
    renderPanel();
    commit();
  }
});
ui.panel.addEventListener('change', event => {
  const input = event.target;
  if (input.id === 'photo-input') void addPhotos(input.files);
  if (input.dataset.captionType !== undefined) {
    state.photos[Number(input.dataset.captionType)].captionType = input.value;
    commit();
  }
});
for (const type of ['dragover', 'dragleave', 'drop']) {
  ui.panel.addEventListener(type, event => {
    const drop = event.target.closest('.photo-drop');
    if (!drop) return;
    event.preventDefault();
    drop.classList.toggle('is-dragging', type === 'dragover');
    if (type === 'drop') void addPhotos(event.dataTransfer.files);
  });
}
ui.steps.addEventListener('click', event => {
  const button = event.target.closest('[data-step]');
  if (button) setStep(Number(button.dataset.step));
});
ui['panel-footer'].addEventListener('click', event => {
  if (event.target.closest('[data-next]')) setStep(state.step + 1);
  if (event.target.closest('[data-prev]')) setStep(state.step - 1);
  if (event.target.closest('[data-preview]')) {
    const previewCard = ui.paper.closest('.preview');
    previewCard.scrollIntoView({ block: 'start', behavior: 'instant' });
    ui.paper.parentElement.focus({ preventScroll: true });
  }
});
ui.layout.addEventListener('change', () => { state.layout = ui.layout.value; commit(); });
ui.themes.addEventListener('click', event => {
  const button = event.target.closest('[data-theme]');
  if (button) { state.theme = button.dataset.theme; commit(); }
});
ui['download-word'].addEventListener('click', () => void download('word'));
ui['download-pdf'].addEventListener('click', () => void download('pdf'));
ui.reset.addEventListener('click', async () => {
  if (!hasDraft()) { notify('目前沒有草稿。'); return; }
  if (loadingPhotos) return;
  if (!await confirmAction('清空這份草稿？', '目前的文字與照片將從這部裝置移除。', '清空草稿')) return;
  window.clearTimeout(saveTimer);
  await saving;
  await clearDraft();
  state = { ...defaultState, photos: [] };
  renderPanel();
  preview();
  ui['save-status'].textContent = '草稿儲存在這部裝置';
  notify('草稿已清空。');
});
ui['sample-options'].innerHTML = EXAMPLES.map(example => `<button class="sample-option" value="${escape(example.id)}">
  <strong>${escape(example.label)}</strong><span>${escape(example.detail)}</span>
</button>`).join('');
ui.example.addEventListener('click', () => {
  if (loadingPhotos) return;
  const dialog = ui['sample-dialog'];
  dialog.returnValue = '';
  ui['sample-description'].textContent = hasDraft() ? '選擇範例會取代目前的草稿。' : '選一份範例，看點選後的成果。';
  dialog.showModal();
});
ui['sample-dialog'].addEventListener('close', () => {
  const sample = EXAMPLES.find(example => example.id === ui['sample-dialog'].returnValue);
  if (!sample) return;
  state = { ...defaultState, ...sample.draft, photos: [], step: 1, sample: sample.id };
  renderPanel();
  commit();
  document.getElementById('panel-title').focus({ preventScroll: true });
  ui.steps.scrollIntoView({ block: 'nearest', behavior: 'instant' });
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && hasDraft()) void persist();
});

const saved = await loadDraft();
if (saved && typeof saved === 'object') state = { ...defaultState, ...saved };
if (!Array.isArray(state.photos)) state.photos = [];
if (!panelRenderers[state.step]) state.step = 0;
if (saved) ui['save-status'].textContent = '草稿已儲存在這部裝置';
renderPanel();
preview();
