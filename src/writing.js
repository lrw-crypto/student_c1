function projectType(id, code, label, description, details) {
  return {
    id,
    code,
    label,
    description,
    roles: details.roles,
    focuses: Object.keys(details.focus),
    challenges: Object.keys(details.challenge),
    outcomes: Object.keys(details.outcome),
    reflections: Object.keys(details.reflection),
    prompts: details.prompts,
    copy: details,
  };
}

export const DEFAULT_PROMPTS = {
  action: "寫下你親手做的一件事。例如，我把每次閱讀後提出的問題記在同一份筆記。",
  challenge: "哪一步卡住？你改了什麼？例如，小組討論常離題，我把問題拆細，再請大家逐題回應。",
  outcome: "填寫完成的作品、實際觀察到的改變或留下的紀錄。例如，我整理了三次討論的紀錄。",
  reflection: "下次會改哪個步驟？例如，我會先讓一位同學試讀說明，再確認哪些地方需要講清楚。",
  narrative: "挑一個你記得的片段，寫下當時看到什麼、做了什麼。",
};

const typeDefinitions = [
  projectType("project", "K", "非修課紀錄之成果作品", "課程之外完成的設計、製作或作品", {
    actionHeading: "分工與製作",
    roles: ["主題發想", "資料蒐集", "草稿設計", "作品製作", "校對修訂", "展示解說"],
    focus: {
      "用草稿整理構想": "我先做一份草稿，把構想整理成具體內容。",
      "比較不同版本": "我比較了不同版本的呈現方式。",
      "請同學試看": "我請同學試看作品，記下他們的疑問。",
      "依回饋修正": "我依試看回饋調整作品內容。",
      "整理製作紀錄": "我留下從草稿到完成稿的製作紀錄。",
    },
    challenge: {
      "主題範圍太廣": "原先選的主題範圍太廣，初稿的重點不夠清楚。",
      "內容不易看懂": "試看的人有幾處看不懂，我需要找出原因。",
      "完成時間比預期長": "部分內容花的時間比原先估計更多。",
      "分工銜接有落差": "我和組員在交接工作時遇到困難。",
    },
    outcome: {
      "完成初版作品": "我完成了第一版作品。",
      "完成修訂版": "我完成了修訂版。",
      "留存回饋紀錄": "我保留了試看回饋。",
      "展示作品": "我展示了作品。",
    },
    reflection: {
      "早一點完成草稿": "下次我會先做出草稿，留下時間修改。",
      "先確定作品的對象": "下次我會先想清楚作品要給誰看，再決定怎麼呈現。",
      "留下各版本紀錄": "下次我會記下每個版本改了哪裡，方便回頭比較。",
    },
    prompts: {
      ...DEFAULT_PROMPTS,
      action: "寫下你做的部分和做法。例如，我訪談同學，把他們推薦的校園角落畫成一張手繪地圖。",
      challenge: "記下作品遇到的問題和修改。例如，同學看不出地圖的方向，我加上指北針和校門圖示。",
      outcome: "寫下看得到的成品或版本差異。例如，完成一張標示六個校園地點的地圖。",
      reflection: "寫下下次要提前確認的事。例如，我會先請不熟悉校園的人試走一次。",
    },
  }),
  projectType("certificate", "L", "檢定證照", "檢定準備、實際結果與證明", {
    actionHeading: "檢定準備",
    rolePrefix: "我的練習重點是",
    roles: ["題型複習", "口說或實作", "模擬測驗", "錯題整理", "進度紀錄"],
    focus: {
      "按題型安排練習": "我按不同題型安排練習。",
      "做計時練習": "我做了計時練習，記下作答速度慢的部分。",
      "看完示範再實作": "我看完示範後，自己練習了一次。",
      "複習錯題": "我整理答錯的題目，再重做容易弄錯的題型。",
    },
    challenge: {
      "題意容易讀錯": "我發現有些錯題是忽略了題目要求。",
      "操作順序容易混淆": "我練習時容易弄混操作的先後順序。",
      "時間分配不穩": "模擬測驗時，我在部分題型用掉比預期更多的時間。",
      "練習進度落後": "原先安排的練習進度沒有完成。",
    },
    outcome: {
      "完成一次模擬測驗": "我完成了一次模擬測驗。",
      "留下練習作品": "我留下練習時做的作品。",
      "整理練習紀錄": "我整理了檢定練習紀錄。",
      "留下自我檢核表": "我保留了用於自我檢核的表格。",
    },
    reflection: {
      "先確認題目要求": "下次我會先圈出題目要求，再開始作答。",
      "把步驟做成檢核表": "下次我會把操作步驟做成檢核表，做完一項就勾一項。",
      "回頭測試易錯題型": "下次我會隔一段時間重做易錯題型，確認自己還會做。",
    },
    prompts: {
      ...DEFAULT_PROMPTS,
      action: "寫下檢定名稱和練習方法。例如，準備英語檢定時，我把聽不清的對話錄音分成短句重聽。",
      challenge: "寫下常出錯的地方和調整。例如，我常漏聽對話裡的日期，後來在練習前先標記題目問的資訊。",
      outcome: "填寫證照全名、級別或實際練習結果。若使用成績作為佐證，請填自己的實際成績。",
      reflection: "寫下下次想改的練習方式。例如，我會先完整聽一遍，再回頭確認漏聽的句子。",
    },
  }),
  projectType("competition", "J", "競賽表現", "比賽準備、參賽作品與表現", {
    actionHeading: "練習與準備",
    roles: ["題目研究", "練習紀錄", "計時演練", "實作操作", "成品製作", "作品展示"],
    focus: {
      "拆開技能項目練習": "我把要練的技能拆成幾個項目，逐一練習。",
      "練習完整流程": "我從準備到檢查走完一次完整流程。",
      "計時演練": "我用計時方式演練，記下各步驟所需的時間。",
      "整理錯誤原因": "我把練習中出現的錯誤整理出來，逐項找原因。",
      "比較前後表現": "我保留了練習紀錄，方便比較前後表現。",
    },
    challenge: {
      "限時內做不完": "演練時，我有部分步驟無法在時限內完成。",
      "同類題目反覆出錯": "我在同一類題目上重複出錯。",
      "動作熟練度不足": "我在幾個操作步驟上仍需要停下來確認。",
      "容易漏掉檢查": "流程到了最後，我有時會漏掉檢查步驟。",
    },
    outcome: {
      "完成參賽作品": "我完成了參賽作品。",
      "完成限時演練": "我完成了一次限時演練。",
      "留下練習紀錄": "我留下了備賽時的練習紀錄。",
      "完成現場展示": "我在現場完成了展示。",
    },
    reflection: {
      "多練最慢的步驟": "接下來我會多練最耗時的步驟，再用完整演練檢查進度。",
      "重做相同題型": "下次我會重做出錯的題型，確認自己能獨立完成。",
      "留時間做最後檢查": "下次計時練習時，我會預留一段時間檢查成品。",
    },
    prompts: {
      ...DEFAULT_PROMPTS,
      action: "寫下參賽項目和練習細節。例如，準備演說比賽時，我把開場、例子和結尾分段錄音。",
      challenge: "寫下哪一步容易失誤，以及你換了哪個做法。例如，演說總是超時，我刪掉一個重複的例子。",
      outcome: "寫下參賽作品、成績或練習紀錄。例如，第三次演練比第一次少用 5 分鐘。",
      reflection: "寫下你準備繼續練的項目。例如，下次我會請同學在聽完後說出最記得的一句話。",
    },
  }),
  projectType("service", "I", "服務學習經驗", "志工服務、校內外支援或社區參與", {
    actionHeading: "分工與行動",
    roles: ["活動規劃", "物資準備", "場地布置", "報到接待", "帶領活動", "攝影紀錄", "意見蒐集"],
    focus: {
      "規劃活動流程": "我整理活動順序，並確認各環節要準備的物品。",
      "製作指引": "我製作現場指引，讓參與者能找到下一個位置。",
      "帶領小組": "我向小組說明任務，再帶著參與者進行活動。",
      "協助現場動線": "我在現場協助引導參與者移動。",
      "整理參與者回饋": "我把參與者提出的意見整理起來。",
    },
    challenge: {
      "參與者不清楚流程": "活動開始時，有參與者不清楚接下來要做什麼。",
      "現場動線壅塞": "有一段動線在活動進行時出現壅塞。",
      "工作交接不順": "小組之間交接工作時出現落差。",
      "時間臨時變動": "原本安排的時間臨時變動，現場需要調整。",
    },
    outcome: {
      "完成分配的服務任務": "我完成了分配給我的服務任務。",
      "留下現場指引": "我保留了活動現場使用的指引。",
      "取得參與者回饋": "我收到了參與者的回饋。",
      "留下服務紀錄": "我保留了這次的服務紀錄。",
    },
    reflection: {
      "事前走一次動線": "下次我會先走一次參與者的路線，找出容易弄錯或塞住的地方。",
      "在交接時核對任務": "下次交接時，我會和接手的人一起確認待辦事項。",
      "提早做流程提示": "下次我會先準備簡短的流程提示，放在參與者會看到的位置。",
    },
    prompts: {
      ...DEFAULT_PROMPTS,
      action: "寫下你負責的對象和工作。例如，我把報到名單依班級分欄，協助同學找到簽名位置。",
      challenge: "寫下現場發生的情況，以及你怎麼調整。例如，兩班同時到場，我用立牌分出兩條報到隊伍。",
      outcome: "寫下實際完成的任務或回饋。例如，製作兩張動線立牌並在報到入口使用。",
      reflection: "寫下你下次要提前做的事。例如，我會在活動前標出排隊起點，讓報到桌前保留通道。",
    },
  }),
  projectType("independent", "F", "高中自主學習計畫與成果", "自己規劃的學習主題、過程與成果", {
    actionHeading: "學習方法",
    roles: ["主題選定", "進度安排", "資料整理", "操作練習", "作品製作", "成果展示"],
    focus: {
      "拆解每週目標": "我把學習目標拆成每週能完成的項目。",
      "比較兩種做法": "我針對同一個任務試了兩種做法，並比較結果。",
      "看示範後自己操作": "我看完示範後，自己操作並記下卡住的地方。",
      "練習並整理筆記": "我在練習後寫下關鍵步驟，方便下次查閱。",
      "用小作品驗證": "我用一件小作品檢查自己能否運用學到的方法。",
    },
    challenge: {
      "原本的目標太大": "我發現原先設定的目標超出能完成的範圍。",
      "照著示範仍做不出來": "我跟著示範操作，卻有步驟做不出相同結果。",
      "進度落後": "我的實際進度落後於原定安排。",
      "找到的資料說法不同": "我找到的資料對同一個步驟有不同說法。",
    },
    outcome: {
      "完成練習作品": "我完成了用來練習的作品。",
      "整理學習筆記": "我整理了這段時間的學習筆記。",
      "留存前後版本": "我留存了修改前後的版本。",
      "分享學習成果": "我分享了這段時間的學習成果。",
    },
    reflection: {
      "每次只練一個重點": "接下來我會一次只練一個重點，再記下還不熟的步驟。",
      "把目標改成可交付作品": "下次我會用一件能完成的作品界定學習目標。",
      "每週保留練習紀錄": "下次我會每週留一份練習紀錄，用來比較自己做法的變化。",
    },
    prompts: {
      ...DEFAULT_PROMPTS,
      action: "寫下工具和練習任務。例如，我用試算表整理一週餐費，再用圖表比較每日支出。",
      challenge: "寫下你在哪一個步驟卡住。例如，日期排序不對，我統一了欄位格式再排序。",
      outcome: "寫下完成的作品或前後差異。例如，完成一張能自動計算每週餐費的表格。",
      reflection: "寫下下一步要練的具體技能。例如，我會用條件格式標出單日預算超支的紀錄。",
    },
  }),
  projectType("club", "G", "社團活動經驗", "社團練習、活動參與與團隊作品", {
    actionHeading: "社團任務與做法",
    roles: ["例行練習", "器材管理", "活動規劃", "分組合作", "社團宣傳", "展演準備"],
    focus: {
      "準備成發內容": "我整理要在成果發表中呈現的項目，並安排練習。",
      "與社員排練": "我和社員一起排練，確認彼此的進場與接續時機。",
      "整理器材清單": "我把活動會用到的器材列成清單，逐項確認。",
      "製作社團宣傳品": "我製作社團的宣傳品，整理活動資訊與呈現方式。",
      "協助新社員練習": "我向新社員示範練習步驟，再陪他們操作。",
    },
    challenge: {
      "團隊演練接不上": "排練時，有幾個段落的接續還不順。",
      "器材常被漏帶": "準備活動時，部分器材容易被漏掉。",
      "練習時間難協調": "社員能參與練習的時間不容易配合。",
      "新社員不熟流程": "新社員一開始不熟悉練習流程。",
    },
    outcome: {
      "完成展演任務": "我完成了社團展演的任務。",
      "完成團隊作品": "我和社員一起完成了團隊作品。",
      "留存器材清單": "我留存了社團使用的器材清單。",
      "留存練習紀錄": "我留下了社團練習紀錄。",
    },
    reflection: {
      "先練接續段落": "下次我會先把容易接錯的段落挑出來，和社員分段練習。",
      "共用借還清單": "下次我會用一張共用清單記錄器材借還，方便社員核對。",
      "為新社員保留操作時間": "下次教新社員時，我會留下讓他們自己做一次的時間。",
    },
    prompts: {
      ...DEFAULT_PROMPTS,
      action: "寫下你做過的社團任務。例如，熱音社排練時，我將每首歌的進歌提示整理成一張表。",
      challenge: "記下練習、合作或器材遇到的問題。例如，上台換樂器來不及，我和社員把換場動作分段演練。",
      outcome: "寫下能用作品或照片佐證的結果。例如，完成兩首歌曲的正式演出及一張換場提示表。",
      reflection: "寫下下次想改善的練習方式。例如，我會錄下換場流程，確認哪個環節花最多時間。",
    },
  }),
  projectType("leadership", "H", "擔任幹部經驗", "班級、社團或活動的職務與分工", {
    actionHeading: "我的職責與做法",
    rolePrefix: "我擔任",
    roles: ["班級幹部", "社團幹部", "學生會幹部", "小組組長", "活動負責人"],
    focus: {
      "整理分工與進度": "我把各項工作和負責人列出來，定期確認進度。",
      "彙整意見": "我收集大家的意見，再整理成可以一起討論的項目。",
      "登記物品借還": "我記下物品的借用人和歸還狀況。",
      "製作交接紀錄": "我把例行工作和未完成事項記下來，留給接手的人。",
      "協調臨時變動": "工作有臨時變動時，我重新確認分工與完成時間。",
    },
    challenge: {
      "任務分工不清": "有些工作在分配後，負責範圍仍不清楚。",
      "通知沒有傳到所有人": "我發出的通知沒有傳到所有需要知道的人。",
      "交接資料不完整": "交接時有些資料無法直接查到。",
      "工作進度不同步": "各項工作的進度不同，後續安排需要調整。",
    },
    outcome: {
      "完成交接表": "我整理出一份交接表。",
      "完成分工紀錄": "我完成了分工紀錄。",
      "完成負責的活動": "我完成了自己負責的活動。",
      "保留班級或社團紀錄": "我保留了班級或社團的工作紀錄。",
    },
    reflection: {
      "訂清楚完成條件": "下次分工時，我會和負責人確認完成時間與交付內容。",
      "讓重要通知有回覆": "下次發出重要通知後，我會請相關同學回覆是否收到。",
      "平時持續更新交接資料": "下次我會在工作進行時更新交接資料，減少交接時才補記的項目。",
    },
    prompts: {
      ...DEFAULT_PROMPTS,
      action: "寫下職務和一項例行工作。例如，擔任設備股長時，我每週清點投影器材並登記借還。",
      challenge: "寫下你處理過的工作情況。例如，遙控器借出後找不到，我在借用單加上預計歸還時間。",
      outcome: "寫下你留下的工作紀錄或成效。例如，整理一份含器材位置與借還流程的交接表。",
      reflection: "寫下你會保留或更改哪個制度。例如，下次我會請歸還者當場確認配件數量。",
    },
  }),
  projectType("distinction", "M", "特殊優良表現證明", "用證明、作品或紀錄呈現特殊表現", {
    actionHeading: "任務與表現",
    roles: ["規劃執行", "示範演出", "成果展示", "協調合作", "解說導覽", "成果紀錄"],
    focus: {
      "完成指定任務": "我依任務要求逐項完成，最後核對要繳交的成果。",
      "示範專長": "我在現場示範自己的操作流程，並說明其中的重點。",
      "整理改進前後紀錄": "我保留了修正前後的紀錄，方便回頭說明改動。",
      "準備對外成果展示": "我挑選代表成果的內容，安排展示順序並準備說明。",
    },
    challenge: {
      "時間內要取捨內容": "可用時間有限，我需要判斷哪些內容應優先呈現。",
      "說明太難理解": "我原先的說明對不熟悉這項專長的人不易理解。",
      "成果缺少過程紀錄": "我整理成果時，發現有一部分過程沒有留下紀錄。",
      "現場條件改變": "正式進行時，現場條件和準備時不同。",
    },
    outcome: {
      "完成公開示範": "我完成了公開示範。",
      "完成作品展出": "我展出了作品。",
      "留存過程紀錄": "我保留了過程紀錄。",
      "完成指定成果": "我完成了任務要求的成果。",
    },
    reflection: {
      "提早保留過程證據": "下次我會在關鍵步驟完成時保留紀錄，方便說明成果如何形成。",
      "用作品說明做法": "下次解說時，我會挑一個作品細節示範，再補上操作原理。",
      "先演練不同情況": "下次我會先演練可能改變的環節，準備可以立即使用的做法。",
    },
    prompts: {
      ...DEFAULT_PROMPTS,
      action: "寫下表現發生的場合與自己的任務。例如，校外展覽時，我用三張舊照片介紹家鄉的變化。",
      challenge: "寫出你為了完成任務調整的做法。例如，觀眾分不清舊地名，我在照片旁加上現在的地圖。",
      outcome: "填寫實際取得的證明名稱、日期或出具單位，也可寫下能用附件核對的成果。",
      reflection: "寫下下次會改進哪個細節。例如，我會先問觀眾去過哪些地點，再決定從哪張照片講起。",
    },
  }),
  projectType("summary", "N", "多元表現綜整心得", "用具體經歷整理高中階段的改變與下一步", {
    actionHeading: "跨經歷的做法",
    rolePrefix: "我整理的重點是",
    roles: ["自主學習", "社團參與", "班級事務", "志工服務", "競賽與展演", "作品與證照"],
    focus: {
      "對照兩段經歷": "我選了兩段經歷，對照自己當時的做法。",
      "找出做法的變化": "我回看不同階段的紀錄，整理自己做法的變化。",
      "把經驗用在另一個場合": "我把在一段經歷中學到的做法，用在另一個場合。",
      "整理能說明成長的紀錄": "我挑出能看見學習過程與成果的紀錄。",
    },
    challenge: {
      "時間互相衝突": "同時參與不同活動時，我遇到時間安排上的衝突。",
      "第一次做法沒有奏效": "我原來的做法換到另一個場合後，需要調整。",
      "重要經歷缺少紀錄": "回頭整理時，我發現有一段經歷缺少當時的紀錄。",
    },
    outcome: {
      "留存兩種不同的成果": "我留下兩段經歷各自的成果。",
      "整理修改前後的差異": "我對照了修改前後的紀錄。",
      "在新任務用上學過的做法": "我在新任務中用上了先前學過的做法。",
    },
    reflection: {
      "選一項能力繼續練": "接下來我會挑一項能力，安排固定時間練習。",
      "保留過程中的改動": "以後我會在做法改變時記下原因和結果。",
      "找另一個任務驗證": "接下來我會用另一個任務檢查這個做法是否適用。",
    },
    prompts: {
      narrative: "挑兩段真的有關聯的經歷，想想哪個做法或想法在兩次都出現。",
      action: "寫下一個跨情境的具體做法。例如，我把社團排練用的分段計時法拿來準備演說。",
      challenge: "寫下你的做法哪裡需要調整。例如，原本只記每段時間，後來加記哪些句子讓我停頓。",
      outcome: "挑一兩份能看出變化的成果。例如，留下兩次演說錄音和一張分段計時表。",
      reflection: "寫下你想繼續練的一件事，以及怎麼練。例如，我每週錄一次三分鐘的說明，聽完只改一個重點。",
    },
  }),
  projectType("custom", "", "自己寫", "從一段自己的經歷開始", {
    actionHeading: "我的任務與做法",
    roles: [],
    focus: {},
    challenge: {},
    outcome: {},
    reflection: {},
    prompts: DEFAULT_PROMPTS,
  }),
];

export const PROJECT_TYPES = typeDefinitions.sort((first, second) => (first.code || "Z").localeCompare(second.code || "Z"));

export function getProjectType(id) {
  return PROJECT_TYPES.find((type) => type.id === id) ?? null;
}

const fillerOpening = /^(?:(?:在這次的學習過程中|在這次學習過程中|透過這次的活動|透過這次活動|經過這次的學習|總而言之|綜上所述)(?:[，,]\s*|\s*(?=我|本人)))+/u;
const fillerSentences = new Set([
  "我學到了很多",
  "我學到很多",
  "讓我學到很多",
  "讓我學到了很多",
  "我收穫良多",
  "我獲益良多",
  "這是一次很寶貴的經驗",
  "這是一次難忘的經驗",
  "讓我受益匪淺",
  "讓我收穫良多",
]);

function sentenceKey(value) {
  return value.normalize("NFKC").toLowerCase().replace(/[^\p{Letter}\p{Number}]/gu, "");
}

function studentSentences(value) {
  if (typeof value !== "string") return [];

  const pieces = value.replace(/\r\n?/g, "\n").match(/\n+|[^。！？!?\n]+(?:[。！？!?]+[」』”’）】〉》]*)?|[。！？!?]+/gu) ?? [];
  let gap = "";
  return pieces.flatMap((piece) => {
    if (/^\s+$/u.test(piece)) {
      gap += piece;
      return [];
    }

    const draft = piece.trim().replace(fillerOpening, "").trim();
    const key = sentenceKey(draft);
    if (!key || fillerSentences.has(key)) return [];

    const hasEnding = /[。！？!?.…][」』”’）】〉》]*$/u.test(draft);
    const separator = gap || piece.match(/^\s*/u)[0];
    gap = "";
    return [{ text: hasEnding ? draft : `${draft.replace(/[，、,：:]+$/u, "")}。`, separator }];
  });
}

function roleSentences(role) {
  const sentences = studentSentences(role);
  if (sentences.length !== 1) return sentences;

  const [{ text }] = sentences;
  if (/^(?:我|本人|自己)|[，,。！？!?].+[。！？!?]$/u.test(text)) return sentences;
  if (/^(?:負責|擔任|負起|協助|參與)/u.test(text)) return [{ text: `我${text}`, separator: "" }];

  const hasRoleTitle = /(?:組員|成員|隊員|社員|班長|組長|隊長|社長|會長|幹部|股長|代表|負責人|助理|助教|志工)[」』）】。！？!?]*$/u.test(text);
  return [{ text: `${hasRoleTitle ? "我擔任" : "我負責"}${text}`, separator: "" }];
}

const firstPersonRole = /^(?:我|本人)(?:的工作是|負責|擔任|是)/u;

function choices(value, allowed) {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.filter((item) => allowed.includes(item)))];
}

function chosenCopy(value, allowed, copy) {
  return choices(value, allowed).map((label) => copy[label]);
}

function dropDuplicates(sentences, included) {
  return sentences.filter(({ text }) => {
    const key = sentenceKey(text);
    if (included.some((earlier) => earlier === key || (key.length >= 8 && earlier.includes(key)))) return false;

    included.push(key);
    return true;
  });
}

function joinSentences(sentences) {
  return sentences.map(({ text, separator }, index) => `${index ? separator : ""}${text}`).join("");
}

export function generateReport(state = {}, profile = null) {
  const activity = getProjectType(state.type);
  const type = profile ?? activity;
  const written = {
    overview: studentSentences(state.narrative),
    action: studentSentences(state.action),
    challenge: studentSentences(state.challenge),
    outcome: studentSentences(state.outcome),
    reflection: studentSentences(state.reflection),
  };
  const authoredKeys = Object.values(written).flat().map(({ text }) => sentenceKey(text));
  const authoredIncludes = (phrase) => authoredKeys.some((key) => key.includes(sentenceKey(phrase)));
  const roleAlreadyStated = (text) => {
    if (authoredIncludes(text)) return true;

    const key = sentenceKey(text);
    const responsibility = key.replace(firstPersonRole, "");
    return responsibility.length >= 2 && authoredKeys.some((part) =>
      firstPersonRole.test(part) && part.replace(firstPersonRole, "").startsWith(responsibility),
    );
  };
  const roles = Array.isArray(state.role) ? state.role : [state.role];
  const customRoles = typeof state.roleText === "string" && state.roleText.trim()
    ? [state.roleText]
    : roles.filter((role) => !type?.roles.includes(role));
  const typedRoles = customRoles.flatMap(roleSentences).filter(({ text }) => !roleAlreadyStated(text));
  const selected = { action: [], challenge: [], outcome: [], reflection: [] };

  if (type) {
    const activeFocuses = written.action.length ? [] : choices(state.focus, type.focuses);
    const chosenRoles = choices(state.role, type.roles).filter((role) =>
      !activeFocuses.includes(role) && !authoredIncludes(role),
    );
    if (!typedRoles.length && chosenRoles.length) {
      selected.action.push(`${type.copy.rolePrefix ?? "我負責"}${chosenRoles.join("、")}。`);
    }

    selected.action.push(...activeFocuses.map((focus) => type.copy.focus[focus]));
    if (!written.challenge.length) selected.challenge = chosenCopy(state.challengeChoice, type.challenges, type.copy.challenge);
    if (!written.outcome.length) selected.outcome = chosenCopy(state.outcomeChoice, type.outcomes, type.copy.outcome);
    if (!written.reflection.length) selected.reflection = chosenCopy(state.reflectionChoice, type.reflections, type.copy.reflection);
  }

  const headings = {
    overview: "我的學習經歷",
    action: type?.copy.actionHeading ?? "我的任務與做法",
    challenge: "遇到的問題",
    outcome: "成果與佐證",
    reflection: "反思與下一步",
  };
  const included = [];
  let evidenceCount = 0;
  const sections = Object.entries(headings).flatMap(([id, heading]) => {
    const own = dropDuplicates(written[id], included);
    const typed = id === "action" ? dropDuplicates(typedRoles, included) : [];
    if (own.length || typed.length) evidenceCount += 1;

    const supplemental = (selected[id] ?? [])
      .filter((sentence) => !authoredIncludes(sentence))
      .map((text) => ({ text, separator: "" }));
    const content = [...typed, ...dropDuplicates(supplemental, included), ...own];
    return content.length ? [{ id, heading, text: joinSentences(content) }] : [];
  });

  const title = typeof state.title === "string" ? state.title.trim() : "";
  const reportType = activity?.code ? activity.label : "";
  return { title: title || reportType || "學習成果", typeLabel: reportType, typeCode: activity?.code ?? "", sections, evidenceCount };
}
