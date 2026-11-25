const eventOptions = new Map([
  ['sprint', [
    { id: '50m', label: '50 公尺' },
    { id: '60m', label: '60 公尺' },
    { id: '100m', label: '100 公尺' },
    { id: '200m', label: '200 公尺' },
    { id: '400m', label: '400 公尺' }
  ]],
  ['general-track', [
    { id: 'relay', label: '接力' },
    { id: 'hurdles', label: '跨欄' },
    { id: 'middle-distance', label: '中距離跑' },
    { id: 'long-distance', label: '長跑' },
    { id: 'long-jump', label: '跳遠' },
    { id: 'high-jump', label: '跳高' },
    { id: 'triple-jump', label: '三級跳遠' },
    { id: 'discus', label: '鐵餅' },
    { id: 'javelin', label: '標槍' },
    { id: 'hammer', label: '鏈球' },
    { id: 'race-walking', label: '競走' },
    { id: 'combined', label: '全能運動' }
  ]],
  ['other', [
    { id: 'basketball', label: '籃球' },
    { id: 'volleyball', label: '排球' },
    { id: 'baseball', label: '棒球' },
    { id: 'softball', label: '壘球' },
    { id: 'soccer', label: '足球' },
    { id: 'badminton', label: '羽球' },
    { id: 'table-tennis', label: '桌球' },
    { id: 'tennis', label: '網球' },
    { id: 'swimming', label: '游泳' },
    { id: 'taekwondo', label: '跆拳道' }
  ]]
]);

export const CONTEXT_OPTIONS = [
  { id: 'practice', label: '日常訓練' },
  { id: 'school-test', label: '校內測驗' },
  { id: 'competition', label: '正式比賽' }
];

export const EVIDENCE_OPTIONS = [
  { id: 'training-log', label: '訓練紀錄' },
  { id: 'measurement', label: '量測或計時表' },
  { id: 'result-sheet', label: '正式成績單' },
  { id: 'photo', label: '照片' },
  { id: 'video-still', label: '影片截圖' },
  { id: 'certificate', label: '獎狀或證明' }
];

function findLabel(options, id) {
  return options.find(option => option.id === id)?.label ?? '';
}

export function getEventOptions(sportId) {
  return eventOptions.get(sportId) ?? [];
}

export function getEventLabel(sportId, eventId) {
  return findLabel(getEventOptions(sportId), eventId);
}

export function getContextLabel(id) {
  return findLabel(CONTEXT_OPTIONS, id);
}

export function getEvidenceLabel(id) {
  return findLabel(EVIDENCE_OPTIONS, id);
}
