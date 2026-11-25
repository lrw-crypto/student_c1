import { getEventLabel } from './events.js';
import { getSportProfile } from './sports.js';
import { PROJECT_TYPES } from './writing.js';

const categorySubjects = {
  independent: '自主學習', club: '社團活動', leadership: '幹部工作', service: '服務學習',
  competition: '競賽', project: '作品製作', certificate: '檢定準備',
  distinction: '特殊表現', summary: '多元表現',
};

const contextSubjects = { practice: '訓練', 'school-test': '校內測驗', competition: '競賽' };

const topicGroups = [
  ['助跑步點', ['標記助跑步點', '助跑步點不固定', '整理出助跑步點表', '固定條件再比對步點']],
  ['插竿與起跳時機', ['分解插竿與起跳', '插竿和起跳接不上', '留下插竿至起跳的側面影片']],
  ['短助跑試跳', ['從短助跑練起']], ['助跑節奏', ['增加助跑距離後節奏改變']],
  ['試跳影片', ['比對試跳影片', '留存試跳影片']],
  ['試跳高度紀錄', ['記錄每次試跳', '留存試跳高度紀錄']],
  ['各次試跳的調整', ['容易忘記各次調整', '逐次寫下調整內容']],
  ['助跑起點調整', ['微調助跑起點']], ['步點一致性的變化', ['助跑踩點較一致']],
  ['過竿次數增加', ['成功過竿次數增加']],
  ['原地推擲', ['練習原地推擲', '完成原地推擲練習']],
  ['滑步與出手銜接', ['練習滑步銜接', '滑步與出手銜接不順']],
  ['旋轉與出手銜接', ['練習旋轉銜接']], ['旋轉後的出手位置', ['旋轉後出手位置不穩']],
  ['推擲距離紀錄', ['量測各次推擲距離', '留存推擲距離表']],
  ['出手動作', ['回看出手影片']], ['推擲落點', ['落點方向不固定', '回看落點差異較大的兩次']],
  ['推擲後的腳步', ['推擲後容易踩出圈', '把推擲後的腳步記下來']],
  ['試擲判定紀錄', ['記錄有效與無效試擲']], ['推擲方式比較', ['分開記不同推擲方式']],
  ['有效試擲次數增加', ['有效試擲變多']], ['推擲落點集中度', ['推擲落點較集中']],
  ['起跑器練習', ['練習起跑器起跑']], ['起跑時機', ['聽到發令後起跑不一致']],
  ['前段加速', ['練習前段加速', '前段加速的步伐不穩']],
  ['分段計時', ['比較分段秒數', '留存分段計時表', '比較不同段落的秒數', '先比對同一段距離']],
  ['彎道節奏', ['練習彎道跑', '進出彎道時節奏改變']], ['後段速度', ['後段速度掉下來']],
  ['前段秒數縮短', ['前段秒數縮短']], ['彎道步伐穩定度', ['彎道步伐較穩']],
  ['起跑影片', ['回看起跑影片', '留下起跑影片']], ['同距離的練習比較', ['整理同距離練習紀錄']],
  ['交接位置', ['和隊友核對交接位置']], ['團隊銜接時機', ['隊友之間的時機不一致', '和隊友一起回看一段']],
  ['分段練習', ['把完整動作拆開練習', '拆解動作練習']],
  ['從分段到連貫動作', ['單獨練習和連貫操作不同']],
  ['練習表現的起伏', ['練習結果起伏大']], ['練習過程紀錄', ['只記結果，忘了過程', '留存過程紀錄']],
  ['各次表現比較', ['記下同項目的各次表現']], ['每組練習結果', ['練習並記錄每組結果']],
  ['重複失誤', ['反覆出現同一個失誤']], ['出手後的重心', ['練習出手後穩住重心']],
  ['發令與起跑反應', ['用固定口令練起跑']],
  ['練習條件', ['留下訓練條件', '紀錄少了練習條件', '用相同條件重做一次']],
  ['個人練習與實戰節奏', ['單練和實戰的節奏不同']],
  ['團隊配合', ['與隊友練配合', '隊友之間配合不順', '找隊友對照站位或時機']],
  ['前後表現比較', ['回看影片比對前後動作', '整理前後兩次的成果', '比較前後表現']],
  ['每週目標', ['拆解每週目標']], ['學習範圍', ['原本的目標太大']], ['作品範圍', ['主題範圍太廣']],
  ['做法比較', ['比較兩種做法']], ['學習筆記', ['練習並整理筆記', '整理學習筆記']],
  ['示範與實作', ['看示範後自己操作', '照著示範仍做不出來', '看完示範再實作']],
  ['資料來源比較', ['找到的資料說法不同']], ['練習進度', ['進度落後', '練習進度落後']],
  ['社團排練', ['與社員排練']], ['展演準備', ['準備成發內容']],
  ['演練銜接', ['團隊演練接不上', '先練接續段落']],
  ['器材清點', ['器材常被漏帶', '整理器材清單', '留存器材清單']],
  ['新社員的練習流程', ['協助新社員練習', '新社員不熟流程', '為新社員保留操作時間']],
  ['分工與進度', ['整理分工與進度', '工作進度不同步']], ['任務分工', ['任務分工不清', '完成分工紀錄']],
  ['通知與回覆', ['通知沒有傳到所有人', '讓重要通知有回覆']], ['物品借還', ['登記物品借還']],
  ['交接紀錄', ['製作交接紀錄', '交接資料不完整', '完成交接表', '平時持續更新交接資料']],
  ['現場動線', ['協助現場動線', '現場動線壅塞', '事前走一次動線']],
  ['流程提示', ['參與者不清楚流程', '提早做流程提示']], ['現場指引', ['製作指引', '留下現場指引']],
  ['人員交接', ['工作交接不順', '在交接時核對任務', '分工銜接有落差']],
  ['計時演練', ['限時內做不完', '完成限時演練', '做計時練習', '時間分配不穩']],
  ['分項技能練習', ['拆開技能項目練習']], ['操作熟練度', ['動作熟練度不足']],
  ['易錯題型', ['同類題目反覆出錯', '重做相同題型', '複習錯題', '回頭測試易錯題型']],
  ['檢查步驟', ['容易漏掉檢查', '留時間做最後檢查', '把步驟做成檢核表', '留下自我檢核表']],
  ['從構想到草稿', ['用草稿整理構想']], ['版本比較', ['比較不同版本', '留存前後版本', '留下各版本紀錄']],
  ['同學試看', ['請同學試看']], ['依回饋修訂', ['依回饋修正']],
  ['內容易讀性', ['內容不易看懂', '說明太難理解']], ['練習題型規劃', ['按題型安排練習']],
  ['題意確認', ['題意容易讀錯', '先確認題目要求']], ['操作順序', ['操作順序容易混淆']],
  ['公開示範', ['示範專長', '完成公開示範']], ['成果取捨', ['時間內要取捨內容']],
  ['對外展示準備', ['準備對外成果展示']], ['學習歷程紀錄', ['整理能說明成長的紀錄']],
  ['初次嘗試', ['第一次做法沒有奏效']],
  ['過程佐證', ['成果缺少過程紀錄', '提早保留過程證據', '重要經歷缺少紀錄']],
  ['兩段經歷的對照', ['對照兩段經歷']], ['做法的變化', ['找出做法的變化', '整理修改前後的差異']],
  ['經驗轉用', ['把經驗用在另一個場合', '在新任務用上學過的做法', '找另一個任務驗證']],
  ['時間安排', ['時間互相衝突', '練習時間難協調', '完成時間比預期長', '時間臨時變動']],
];

const selectedTopics = new Map(topicGroups.flatMap(([topic, labels]) => labels.map(label => [label, topic])));

function labelOf(value) {
  const label = typeof value === 'string' ? value : value?.label;
  return typeof label === 'string' ? label.trim().replace(/\s+/gu, ' ').replace(/^[｜|]+|[｜|。！？!?]+$/gu, '').trim() : '';
}

function selectedLabel(value) {
  const label = labelOf(value);
  return /^[a-z][a-z\d-]*$/iu.test(label) || /^(?:無|未選擇|請選擇|其他|不限)$/u.test(label) ? '' : label;
}

function keyOf(label) {
  return label.normalize('NFKC').toLowerCase().replace(/[^\p{Letter}\p{Number}]/gu, '');
}

function topicOf(value) {
  const label = selectedLabel(value);
  const topic = selectedTopics.get(label) ?? label
    .replace(/^(?:完成|整理出|整理|留存|保留|留下|取得|規劃|製作|練習|回看|比較|協助|標記|記錄)(?:了)?(?:一[次輪份件張個])?/u, '')
    .replace(/^(?:我的|這次的|一次的)/u, '');
  return Array.from(topic).length <= 16 ? topic : '';
}

function topicsIn(value) {
  return (Array.isArray(value) ? value : [value]).map(topicOf).filter(Boolean);
}

function appendTopic(topics, candidate, subject) {
  const key = keyOf(candidate).replace(/(?:練習|紀錄|準備|檢查)+$/u, '');
  if (!key || keyOf(subject).includes(key)) return;

  const parts = candidate.split('與').map(keyOf);
  const repeated = topics.some((topic) => {
    const previous = keyOf(topic).replace(/(?:練習|紀錄|準備|檢查)+$/u, '');
    const previousParts = topic.split('與').map(keyOf);
    return previous.includes(key) || key.includes(previous) || parts.every(part =>
      previousParts.some(previousPart => part.includes(previousPart) || previousPart.includes(part)),
    );
  });
  if (!repeated) topics.push(candidate);
}

function withRecord(subject) {
  return subject.endsWith('紀錄') ? subject : `${subject}紀錄`;
}

export function generateTitle(state = {}) {
  const sport = getSportProfile(typeof state.sport === 'string' ? state.sport : state.sport?.id);
  const sportLabel = labelOf(state.sportLabel) || (sport?.id === 'other' ? labelOf(state.customSport) : '')
    || sport?.label || selectedLabel(state.sport);
  const category = PROJECT_TYPES.find(({ id, code }) => state.type === id || (code && state.type === code));
  const categorySubject = categorySubjects[category?.id] || labelOf(state.customType)
    || labelOf(state.categoryLabel).replace(/^[F-N]\s+/u, '');
  const event = labelOf(state.eventLabel) || getEventLabel(sport?.id, state.event)
    || selectedLabel(state.eventDetail) || selectedLabel(state.event);
  const sportSubject = (event || sportLabel).replace(/^其他田徑項目$/u, '田徑').replace(/^其他運動$/u, '運動');
  const context = Object.hasOwn(contextSubjects, state.context) ? contextSubjects[state.context] : labelOf(state.contextLabel);
  const sportContext = context || (category?.id === 'competition' ? '競賽' : '訓練');
  const subject = sportSubject && context && context !== '訓練' && !sportSubject.includes(context)
    ? `${sportSubject}${context}` : sportSubject || categorySubject;

  const topics = [];
  const [firstFocus, ...otherFocuses] = topicsIn(state.focus);
  const candidates = [firstFocus, ...topicsIn(state.challengeChoice), ...topicsIn(state.outcomeChoice), ...otherFocuses].filter(Boolean);
  for (const topic of candidates) {
    appendTopic(topics, topic, subject);
    if (topics.length === 2) break;
  }

  if (topics.length) {
    const detail = topics.join(topics.some(topic => topic.includes('與')) ? '、' : '與');
    return subject ? `${subject}｜${detail}` : withRecord(detail);
  }

  const [nextStep] = topicsIn(state.reflectionChoice);
  if (nextStep) return `${subject || '多元表現'}下一步｜${nextStep}`;

  const [role] = sportSubject ? [] : topicsIn(state.role);
  if (role && !keyOf(subject).includes(keyOf(role))) return withRecord(role);

  if (sportSubject) return withRecord(sportSubject.includes(sportContext) ? sportSubject : `${sportSubject}${sportContext}`);
  return withRecord(subject || '多元表現');
}
