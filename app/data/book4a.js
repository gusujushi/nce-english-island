/* 新概念英语第四册 · 课程资料（第 1–24 课）
 * 只收录导读、词汇、语法重点等学习资料；课文原文由你电脑里的文件读取。
 * w: "单词|英式音标|词性与中文"  g: 本课重点语法（见 grammar.js）
 */
(function () {
  const L = (o) => NCE.add(4, o);

  L({ n: 1, t: "Finding fossil man", cn: "发现化石人",
    sum: "没有文字的民族靠一代又一代讲故事的人口耳相传，把历史编成传说保存下来，而这些传说往往有不少真实成分。要了解更古老的人类，就得靠考古学家发掘出来的化石和遗物。",
    bg: "先想清楚两条线：① 口头传说（saga / legend）怎样保存历史；② 化石怎样把人类历史推得更远。阅读时留意作者怎么从“传说”过渡到“化石”。",
    g: ["rel", "participle", "passive"],
    tip: "archaeologist 里的 ch 读 /k/；英音 fossil 的 o 读短促圆唇的 /ɒ/，不是美音的 /ɑː/。",
    q: "没有文字的民族用什么方法保存自己的历史？",
    w: ["fossil|ˈfɒsl|n. 化石", "saga|ˈsɑːɡə|n. 英雄传说；长篇故事", "legend|ˈledʒənd|n. 传说", "generation|ˌdʒenəˈreɪʃn|n. 一代人", "recount|rɪˈkaʊnt|v. 叙述，讲述", "preserve|prɪˈzɜːv|v. 保存", "Polynesian|ˌpɒlɪˈniːʒn|adj./n. 波利尼西亚的（人）", "archaeologist|ˌɑːkiˈɒlədʒɪst|n. 考古学家", "ancestor|ˈænsestə|n. 祖先", "remains|rɪˈmeɪnz|n. 遗骸，遗迹", "primitive|ˈprɪmətɪv|adj. 原始的", "descendant|dɪˈsendənt|n. 后代"] });

  L({ n: 2, t: "Spare that spider", cn: "不要伤害蜘蛛",
    sum: "蜘蛛其实是人类的朋友：它们消灭了数量惊人的昆虫，而昆虫里有许多是人类最大的敌人。如果没有蜘蛛，昆虫会吞掉庄稼，人类甚至可能面临饥荒。",
    bg: "这是一篇“先提问，再论证”的说明文。抓住作者的论证链：蜘蛛吃昆虫 → 昆虫危害人类 → 所以蜘蛛帮了人类。注意文中的数字和估算。",
    g: ["cause", "insert", "compare"],
    tip: "英音是“非卷舌音”：starve /stɑːv/、insect /ˈɪnsekt/ 里的 r 只在后面跟元音时才发出来。",
    q: "作者为什么说蜘蛛是人类的朋友？",
    w: ["spider|ˈspaɪdə|n. 蜘蛛", "insect|ˈɪnsekt|n. 昆虫", "enemy|ˈenəmi|n. 敌人", "destroy|dɪˈstrɔɪ|v. 消灭，毁掉", "estimate|ˈestɪmeɪt|v. 估计", "acre|ˈeɪkə|n. 英亩", "devour|dɪˈvaʊə|v. 吞食", "starvation|stɑːˈveɪʃn|n. 饥饿，饿死", "consume|kənˈsjuːm|v. 吃掉，消耗", "inhabitant|ɪnˈhæbɪtənt|n. 居住者", "species|ˈspiːʃiːz|n. 物种", "rid|rɪd|v. 摆脱，清除"] });

  L({ n: 3, t: "Matterhorn man", cn: "马特霍恩山区人",
    sum: "现代登山者喜欢挑有难度、有挑战的路线；而早期的登山先驱只想找最容易的路登顶。文章讲述英国登山家怀伯尔（Whymper）征服马特霍恩峰的故事：成功登顶，下山时却发生了绳断人亡的悲剧。",
    bg: "先看“今天的登山者”和“早期登山者”的对比，再看具体人物故事。故事部分按时间顺序：多次尝试 → 竞争对手 → 登顶 → 悲剧。",
    g: ["compare", "contrast", "passive"],
    tip: "glacier 英音 /ˈɡlæsiə/，美音 /ˈɡleɪʃər/，英美差异很大；route 英音读 /ruːt/。",
    q: "现代登山者和早期登山者选择路线的方式有何不同？",
    w: ["alpinist|ˈælpɪnɪst|n. 登山运动员", "route|ruːt|n. 路线", "pioneer|ˌpaɪəˈnɪə|n. 先驱，开拓者", "summit|ˈsʌmɪt|n. 山顶", "ascent|əˈsent|n. 攀登，上升", "descent|dɪˈsent|n. 下降，下山", "precipice|ˈpresəpɪs|n. 悬崖", "glacier|ˈɡlæsiə|n. 冰川", "triumph|ˈtraɪʌmf|n. 胜利", "tragedy|ˈtrædʒədi|n. 悲剧", "rival|ˈraɪvl|n. 竞争对手", "conquer|ˈkɒŋkə|v. 征服"] });

  L({ n: 4, t: "Seeing hands", cn: "能看见东西的手",
    sum: "苏联报道了一些人能用手指“看见”颜色的案例：一个女学生蒙着眼睛也能分辨颜色，甚至隔着东西也能感知。科学家对此做了实验，认为皮肤可能对光有某种敏感性。",
    bg: "这是一篇科学报道。阅读时区分“事实/实验”和“推测/解释”：哪些是观察到的现象，哪些是科学家的猜想。",
    g: ["perfect", "passive", "rel"],
    tip: "laboratory 英音 /ləˈbɒrətri/ 重音在第二音节，美音则是 /ˈlæbrətɔːri/。",
    q: "那个女孩能用手指做到什么？科学家怎么解释？",
    w: ["detect|dɪˈtekt|v. 察觉，发现", "solid|ˈsɒlɪd|adj. 实心的，固体的", "concern|kənˈsɜːn|v. 涉及，与……有关", "sensitive|ˈsensətɪv|adj. 敏感的", "colour|ˈkʌlə|n. 颜色（英式拼写）", "investigate|ɪnˈvestɪɡeɪt|v. 调查，研究", "nerve|nɜːv|n. 神经", "phenomenon|fəˈnɒmɪnən|n. 现象", "laboratory|ləˈbɒrətri|n. 实验室", "experiment|ɪkˈsperɪmənt|n. 实验", "identify|aɪˈdentɪfaɪ|v. 辨认", "faculty|ˈfæklti|n. 官能，能力"] });

  L({ n: 5, t: "Youth", cn: "青年",
    sum: "人们总是谈论“青年问题”。作者认为，如果真有这个问题（他本人表示怀疑），那也是老一辈造成的，而不是年轻人自己。年轻人只是在成长，关键是长辈要把他们当成平等的人来理解和尊重。",
    bg: "这是一篇议论文，观点鲜明。抓住作者“反常识”的核心观点，再找他用来支撑观点的理由。注意 which I take leave to doubt 这种插入语。",
    g: ["cleft", "cond", "insert"],
    tip: "attitude 英音 /ˈætɪtjuːd/，tu 读 /tjuː/；美音读 /tuː/。youth 结尾 th 舌尖轻触上齿 /θ/。",
    q: "作者认为“青年问题”是谁造成的？",
    w: ["youth|juːθ|n. 青年；青春", "take leave to|teɪk liːv tə|冒昧地（做某事）", "fundamental|ˌfʌndəˈmentl|adj. 根本的", "rebel|rɪˈbel|v. 反叛", "maturity|məˈtʃʊərəti|n. 成熟", "respect|rɪˈspekt|n./v. 尊重", "attitude|ˈætɪtjuːd|n. 态度", "sympathy|ˈsɪmpəθi|n. 同情，理解", "behave|bɪˈheɪv|v. 表现，举止", "grown-up|ˈɡrəʊn ʌp|n. 成年人", "generation|ˌdʒenəˈreɪʃn|n. 一代人", "superior|suːˈpɪəriə|adj. 优越的，高人一等的"] });

  L({ n: 6, t: "The sporting spirit", cn: "体育的精神",
    sum: "选自奥威尔（George Orwell）。他不同意“体育比赛能增进国际友谊”的说法，认为国际比赛常常激起敌意和狭隘的民族情绪；严肃的体育竞赛就像“去掉枪炮的战争”。",
    bg: "作者先摆出流行观点，再逐条反驳。注意他的语气很尖锐，用词带强烈感情色彩（savage、hatred），读时体会作者态度。",
    g: ["formal_it", "cond", "compare"],
    tip: "prestige 英音 /preˈstiːʒ/，结尾 ge 读 /ʒ/（像“日”的声母但更轻）。",
    q: "奥威尔认为国际体育比赛会带来什么结果？",
    w: ["sporting|ˈspɔːtɪŋ|adj. 体育的；有体育道德的", "goodwill|ˌɡʊdˈwɪl|n. 友好，善意", "spectator|spekˈteɪtə|n. 观众", "savage|ˈsævɪdʒ|adj. 野蛮的", "passion|ˈpæʃn|n. 激情", "hatred|ˈheɪtrɪd|n. 仇恨", "nationalism|ˈnæʃnəlɪzəm|n. 民族主义", "prestige|preˈstiːʒ|n. 声望，威信", "rivalry|ˈraɪvlri|n. 竞争，对抗", "violence|ˈvaɪələns|n. 暴力", "competitive|kəmˈpetətɪv|adj. 竞争的", "contest|ˈkɒntest|n. 比赛"] });

  L({ n: 7, t: "Bats", cn: "蝙蝠",
    sum: "蝙蝠靠“回声定位”在黑暗中飞行和捕食：它发出人耳听不见的高频声波，再根据回声判断障碍物和猎物的位置。人类的雷达、声呐原理与此相似。",
    bg: "说明文：先讲动物发出的声音并非都是“语言”，再讲蝙蝠回声定位的发现与原理。阅读时画一张“发声 → 反射 → 接收 → 判断”的流程图。",
    g: ["passive", "rel", "participle"],
    tip: "echo 英音 /ˈekəʊ/ 的双元音 /əʊ/（美音 /oʊ/）是英音最典型的标志之一。radar 英音 /ˈreɪdɑː/ 结尾不卷舌。",
    q: "蝙蝠在黑暗中是怎样避开障碍物的？",
    w: ["bat|bæt|n. 蝙蝠", "echo|ˈekəʊ|n. 回声", "locate|ləʊˈkeɪt|v. 确定……的位置", "obstacle|ˈɒbstəkl|n. 障碍物", "frequency|ˈfriːkwənsi|n. 频率", "radar|ˈreɪdɑː|n. 雷达", "prey|preɪ|n. 猎物", "navigate|ˈnævɪɡeɪt|v. 导航", "pulse|pʌls|n. 脉冲", "emit|iˈmɪt|v. 发出", "squeak|skwiːk|n. 吱吱声", "sensitive|ˈsensətɪv|adj. 灵敏的"] });

  L({ n: 8, t: "Trading standards", cn: "贸易标准",
    sum: "本课谈贸易中的“标准”：从古至今，度量衡、质量和产品规格是否统一，直接影响买卖双方的信任与贸易效率。标准不统一会带来混乱和额外成本，统一标准则能促进贸易。",
    bg: "抓住关键词 standard（标准）在文中出现的不同场景，每出现一次就问自己：这里说的是哪方面的标准？它解决了什么问题？",
    g: ["passive", "rel", "cause"],
    tip: "quality 英音 /ˈkwɒləti/ 中 a 读短 /ɒ/；standard 英音 /ˈstændəd/ 结尾弱读 /əd/。",
    q: "统一的标准对贸易有什么好处？",
    w: ["standard|ˈstændəd|n. 标准", "merchant|ˈmɜːtʃənt|n. 商人", "commodity|kəˈmɒdəti|n. 商品", "consumer|kənˈsjuːmə|n. 消费者", "quality|ˈkwɒləti|n. 质量", "regulation|ˌreɡjuˈleɪʃn|n. 规章，规定", "inspector|ɪnˈspektə|n. 检查员", "manufacturer|ˌmænjuˈfæktʃərə|n. 制造商", "fraud|frɔːd|n. 欺诈", "guarantee|ˌɡærənˈtiː|n./v. 保证", "measure|ˈmeʒə|n. 计量单位；措施", "uniform|ˈjuːnɪfɔːm|adj. 统一的"] });

  L({ n: 9, t: "Royal espionage", cn: "皇家间谍活动",
    sum: "间谍活动并不是现代才有：本课讲述历史上与王室有关的谍报故事——为了获得情报或别国的技术秘密，有人不惜乔装、潜入、收买。",
    bg: "叙事类课文。用“人物 — 目的 — 手段 — 结果”四格表梳理情节，留意文中表示时间先后的词（first、later、eventually）。",
    g: ["passive", "participle", "perfect"],
    tip: "espionage 英音 /ˈespiənɑːʒ/，结尾 /ɑːʒ/ 有法语味；royal /ˈrɔɪəl/ 是两个音节。",
    q: "故事中的人物为什么要进行间谍活动？",
    w: ["espionage|ˈespiənɑːʒ|n. 间谍活动", "spy|spaɪ|n./v. 间谍；侦察", "royal|ˈrɔɪəl|adj. 皇家的", "agent|ˈeɪdʒənt|n. 特工；代理人", "intelligence|ɪnˈtelɪdʒəns|n. 情报；智力", "reveal|rɪˈviːl|v. 泄露，揭示", "conspiracy|kənˈspɪrəsi|n. 阴谋", "disguise|dɪsˈɡaɪz|v./n. 伪装", "betray|bɪˈtreɪ|v. 背叛，出卖", "monarch|ˈmɒnək|n. 君主", "confidential|ˌkɒnfɪˈdenʃl|adj. 机密的", "secret|ˈsiːkrət|n. 秘密"] });

  L({ n: 10, t: "Silicon valley", cn: "硅谷",
    sum: "加州硅谷为什么能成为世界高科技中心？大学（斯坦福）的科研与人才、敢于冒险的创业文化、风险投资，以及人才在公司间流动带来的知识交流，共同造就了它。",
    bg: "原因分析型说明文。边读边列清单：作者给出了几个“成功因素”？每个因素对应哪句话？",
    g: ["rel", "passive", "cause"],
    tip: "entrepreneur 来自法语，英音 /ˌɒntrəprəˈnɜː/，重音在最后一个音节。",
    q: "硅谷成功的关键因素有哪些？",
    w: ["silicon|ˈsɪlɪkən|n. 硅", "valley|ˈvæli|n. 山谷", "semiconductor|ˌsemikənˈdʌktə|n. 半导体", "electronics|ɪˌlekˈtrɒnɪks|n. 电子学；电子产品", "entrepreneur|ˌɒntrəprəˈnɜː|n. 企业家", "venture|ˈventʃə|n. 冒险事业", "capital|ˈkæpɪtl|n. 资本", "graduate|ˈɡrædʒuət|n. 毕业生", "innovation|ˌɪnəˈveɪʃn|n. 创新", "prosperity|prɒˈsperəti|n. 繁荣", "campus|ˈkæmpəs|n. 校园", "industry|ˈɪndəstri|n. 工业，行业"] });

  L({ n: 11, t: "How to grow old", cn: "如何安度晚年",
    sum: "选自罗素（Bertrand Russell）。老年人不要沉湎于过去，也不要过分依恋子女；要培养广泛而超越个人的兴趣。他把人生比作一条河：起初窄小，奔腾冲过岩石和瀑布，后来渐渐变宽、变缓，最后汇入大海，毫无痛苦地失去个体的存在。",
    bg: "这是英语散文名篇。前半部分是建议（不要做什么、要做什么），后半部分是著名的“河流比喻”——重点精读比喻部分，体会长句的节奏。",
    g: ["compare", "cond", "rel"],
    tip: "vigour 是英式拼写（美式 vigor），英音结尾 /ə/ 不卷舌。boulder /ˈbəʊldə/ 注意双元音 /əʊ/。",
    q: "罗素用什么来比喻人的一生？",
    w: ["cling|klɪŋ|v. 依恋，紧抓", "vigour|ˈvɪɡə|n. 活力（英式拼写）", "impersonal|ɪmˈpɜːsənl|adj. 非个人的，客观的", "boulder|ˈbəʊldə|n. 巨石", "waterfall|ˈwɔːtəfɔːl|n. 瀑布", "recede|rɪˈsiːd|v. 后退，远去", "merge|mɜːdʒ|v. 融合，汇合", "individual|ˌɪndɪˈvɪdʒuəl|adj./n. 个人的；个体", "existence|ɪɡˈzɪstəns|n. 存在", "absorb|əbˈzɔːb|v. 吸收；使专注", "weariness|ˈwɪərinəs|n. 疲倦", "passionately|ˈpæʃənətli|adv. 热烈地"] });

  L({ n: 12, t: "Banks and their customers", cn: "银行与顾客",
    sum: "银行和客户之间本质上是债务人与债权人的关系：你把钱存进银行，银行就欠你钱；银行有义务按你的支票（cheque）付款。文章解释存款、支票、透支等银行基本常识。",
    bg: "术语较多的说明文。先把 debtor / creditor / cheque / overdraft 四个词弄懂，课文就迎刃而解。",
    g: ["passive", "cond", "noun"],
    tip: "debtor 中 b 不发音 /ˈdetə/；cheque 是英式拼写，美式是 check。",
    q: "存钱之后，银行和客户谁是债务人？",
    w: ["cheque|tʃek|n. 支票（英式）", "customer|ˈkʌstəmə|n. 顾客", "deposit|dɪˈpɒzɪt|v./n. 存款", "withdraw|wɪðˈdrɔː|v. 取（钱）", "debtor|ˈdetə|n. 债务人", "creditor|ˈkredɪtə|n. 债权人", "overdraft|ˈəʊvədrɑːft|n. 透支", "account|əˈkaʊnt|n. 账户", "interest|ˈɪntrəst|n. 利息", "obligation|ˌɒblɪˈɡeɪʃn|n. 义务", "signature|ˈsɪɡnətʃə|n. 签名", "liable|ˈlaɪəbl|adj. 负有责任的"] });

  L({ n: 13, t: "The search for oil", cn: "石油勘探",
    sum: "寻找石油先由地质学家研究地表岩层，再用地震勘探等方法（人工制造震波，分析从地下岩层反射回来的信号）推测地下储油构造。但最终只有钻井才能确认是否真有石油。",
    bg: "过程描述型说明文：按“地面考察 → 地震勘探 → 钻探”的步骤读，注意每一步用了什么仪器或方法。",
    g: ["passive", "participle", "inf"],
    tip: "reservoir 英音 /ˈrezəvwɑː/，结尾带法语味 /wɑː/；seismic /ˈsaɪzmɪk/ 首音节读 /saɪz/。",
    q: "为什么说只有钻井才能最终确定有没有石油？",
    w: ["geologist|dʒiˈɒlədʒɪst|n. 地质学家", "petroleum|pəˈtrəʊliəm|n. 石油", "drill|drɪl|v./n. 钻孔；钻机", "seismic|ˈsaɪzmɪk|adj. 地震的", "layer|ˈleɪə|n. 层", "deposit|dɪˈpɒzɪt|n. 矿床，沉积物", "sediment|ˈsedɪmənt|n. 沉积物", "reservoir|ˈrezəvwɑː|n. 储藏处；水库", "survey|ˈsɜːveɪ|n. 勘测，调查", "explosion|ɪkˈspləʊʒn|n. 爆炸", "porous|ˈpɔːrəs|adj. 多孔的", "trap|træp|n. 圈闭；陷阱"] });

  L({ n: 14, t: "The Butterfly Effect", cn: "蝴蝶效应",
    sum: "气象学家洛伦茨发现：天气系统对初始条件极其敏感，输入数据的一点点差别（比如小数点后几位的取舍）会让长期预测结果完全不同——“巴西一只蝴蝶扇动翅膀，可能引起得克萨斯的一场龙卷风”。这说明长期天气预报有天然的极限。",
    bg: "科学发现的故事 + 原理说明。抓住“小差别 → 大不同”这一核心，再看它对天气预报意味着什么。",
    g: ["noun", "cond", "passive"],
    tip: "forecast 英音 /ˈfɔːkɑːst/ 中 a 读长音 /ɑː/（美音读 /æ/）；chaos /ˈkeɪɒs/ 的 ch 读 /k/。",
    q: "“蝴蝶效应”说明了什么？",
    w: ["chaos|ˈkeɪɒs|n. 混沌，混乱", "meteorologist|ˌmiːtiəˈrɒlədʒɪst|n. 气象学家", "forecast|ˈfɔːkɑːst|n./v. 预报", "predict|prɪˈdɪkt|v. 预测", "tornado|tɔːˈneɪdəʊ|n. 龙卷风", "atmosphere|ˈætməsfɪə|n. 大气", "initial|ɪˈnɪʃl|adj. 最初的", "simulation|ˌsɪmjuˈleɪʃn|n. 模拟", "turbulence|ˈtɜːbjələns|n. 湍流，动荡", "decimal|ˈdesɪml|n./adj. 小数（的）", "flap|flæp|v. 扇动", "sensitive|ˈsensətɪv|adj. 敏感的"] });

  L({ n: 15, t: "Secrecy in industry", cn: "工业中的秘密",
    sum: "有两个因素严重削弱了工业科研的效率：一是科研工作所处的普遍保密氛围，二是研究人员个人缺乏自由。保密阻碍了交流，限制了个人创造力。",
    bg: "典型的“总—分”结构：第一句提出两个因素，后文分别展开。读完第一句就能预测全文结构。",
    g: ["passive", "rel", "contrast"],
    tip: "secrecy /ˈsiːkrəsi/ 注意重音在第一音节；patent 英音常读 /ˈpeɪtnt/。",
    q: "影响工业科研效率的两个因素是什么？",
    w: ["secrecy|ˈsiːkrəsi|n. 保密", "effectiveness|ɪˈfektɪvnəs|n. 有效性", "weigh|weɪ|v. 有影响，起作用", "atmosphere|ˈætməsfɪə|n. 气氛", "competitor|kəmˈpetɪtə|n. 竞争者", "patent|ˈpeɪtnt|n. 专利", "restriction|rɪˈstrɪkʃn|n. 限制", "initiative|ɪˈnɪʃətɪv|n. 主动性", "publication|ˌpʌblɪˈkeɪʃn|n. 发表，出版", "prospect|ˈprɒspekt|n. 前景", "hamper|ˈhæmpə|v. 妨碍", "individual|ˌɪndɪˈvɪdʒuəl|adj. 个人的"] });

  L({ n: 16, t: "The modern city", cn: "现代城市",
    sum: "本课讨论现代城市的组织与规划：人口集中、交通拥挤等问题怎样产生，城市应如何规划才能真正为人服务。",
    bg: "议论性说明文。找出作者提到的“问题”和“对策”，用两栏笔记整理。",
    g: ["passive", "rel", "contrast"],
    tip: "transport 作名词重音在前 /ˈtrænspɔːt/，作动词重音在后 /trænˈspɔːt/。",
    q: "作者认为现代城市面临哪些问题？",
    w: ["urban|ˈɜːbən|adj. 城市的", "suburb|ˈsʌbɜːb|n. 郊区", "congestion|kənˈdʒestʃən|n. 拥挤", "pedestrian|pəˈdestriən|n. 行人", "pollution|pəˈluːʃn|n. 污染", "planner|ˈplænə|n. 规划者", "transport|ˈtrænspɔːt|n. 交通（英式）", "inhabitant|ɪnˈhæbɪtənt|n. 居民", "architecture|ˈɑːkɪtektʃə|n. 建筑", "density|ˈdensəti|n. 密度", "amenity|əˈmiːnəti|n. 便利设施", "organization|ˌɔːɡənaɪˈzeɪʃn|n. 组织"] });

  L({ n: 17, t: "The new Olympics", cn: "新奥林匹克运动会",
    sum: "本课围绕奥运会展开：在商业化、民族荣誉和“重在参与”的理想之间，奥运会应该是什么样子？作者提出了对“新奥运”的看法。",
    bg: "带观点的评论文章。区分作者描述的“现状”和他设想的“新面貌”。",
    g: ["cond", "compare", "inf"],
    tip: "athlete 只有两个音节 /ˈæθliːt/，不要读成 ath-e-lete；Olympic /əˈlɪmpɪk/ 首音节弱读。",
    q: "作者设想的“新奥运”和现在的奥运有何不同？",
    w: ["Olympic|əˈlɪmpɪk|adj. 奥林匹克的", "athlete|ˈæθliːt|n. 运动员", "amateur|ˈæmətə|n. 业余爱好者", "professional|prəˈfeʃənl|adj./n. 职业的", "medal|ˈmedl|n. 奖牌", "commercial|kəˈmɜːʃl|adj. 商业的", "sponsor|ˈspɒnsə|n./v. 赞助（人）", "spectacle|ˈspektəkl|n. 壮观场面", "tournament|ˈtʊənəmənt|n. 锦标赛", "host|həʊst|v. 主办", "ceremony|ˈserəməni|n. 仪式", "record|ˈrekɔːd|n. 纪录"] });

  L({ n: 18, t: "Porpoises", cn: "海豚",
    sum: "水手中流传着一种迷信：海豚会把溺水的人推向水面、推上岸来救人。科学家研究认为，这种行为可能源于海豚把刚出生的幼崽托出水面呼吸的本能。",
    bg: "先讲“传说”，再给“科学解释”。阅读时注意作者如何用科学观察解释看似神奇的现象。",
    g: ["perfect", "inf", "participle"],
    tip: "porpoise 英音 /ˈpɔːpəs/，后半读 /pəs/，不要读成 poise；mariner /ˈmærɪnə/。",
    q: "海豚“救人”的行为可能来自什么本能？",
    w: ["porpoise|ˈpɔːpəs|n. 海豚，鼠海豚", "superstition|ˌsuːpəˈstɪʃn|n. 迷信", "mariner|ˈmærɪnə|n. 水手", "drown|draʊn|v. 淹死", "surface|ˈsɜːfɪs|n. 水面，表面", "instinct|ˈɪnstɪŋkt|n. 本能", "mammal|ˈmæml|n. 哺乳动物", "marine|məˈriːn|adj. 海洋的", "dolphin|ˈdɒlfɪn|n. 海豚", "nudge|nʌdʒ|v. 轻推", "shore|ʃɔː|n. 岸", "observe|əbˈzɜːv|v. 观察"] });

  L({ n: 19, t: "The stuff of dreams", cn: "梦的本质",
    sum: "人为什么要做梦？睡眠实验发现，梦大多出现在“快速眼动”睡眠阶段；如果人被反复打断、无法做梦，就会变得烦躁不安。梦可能对大脑整理信息、恢复精力起着重要作用。",
    bg: "科学实验报道。按“实验设计 → 实验结果 → 结论”读，特别注意研究者如何“剥夺”被试的梦。",
    g: ["passive", "participle", "noun"],
    tip: "psychologist 的 p 不发音 /saɪˈkɒlədʒɪst/；nightmare 英音 /ˈnaɪtmeə/ 结尾不卷舌。",
    q: "如果一个人长期不能做梦，会怎样？",
    w: ["dream|driːm|n./v. 梦", "subconscious|sʌbˈkɒnʃəs|adj. 潜意识的", "psychologist|saɪˈkɒlədʒɪst|n. 心理学家", "volunteer|ˌvɒlənˈtɪə|n. 志愿者", "deprive|dɪˈpraɪv|v. 剥夺", "rapid|ˈræpɪd|adj. 快速的", "nightmare|ˈnaɪtmeə|n. 噩梦", "symbol|ˈsɪmbl|n. 象征", "interpret|ɪnˈtɜːprɪt|v. 解释，解读", "anxiety|æŋˈzaɪəti|n. 焦虑", "electrode|ɪˈlektrəʊd|n. 电极", "subject|ˈsʌbdʒɪkt|n. 实验对象"] });

  L({ n: 20, t: "Snake poison", cn: "蛇毒",
    sum: "本课介绍蛇毒：毒液如何通过毒牙注入、对神经或血液产生什么作用，以及人体和某些动物对蛇毒的抵抗。",
    bg: "科普说明文。抓住“毒液 → 作用方式 → 后果 → 解毒/免疫”这条线。",
    g: ["passive", "rel", "cond"],
    tip: "reptile 英音 /ˈreptaɪl/ 结尾读 /aɪl/，美音常读 /təl/；venom /ˈvenəm/。",
    q: "蛇毒是怎样对人体起作用的？",
    w: ["venom|ˈvenəm|n. 毒液", "poison|ˈpɔɪzn|n. 毒药", "fang|fæŋ|n. 毒牙", "antidote|ˈæntidəʊt|n. 解毒剂", "paralysis|pəˈræləsɪs|n. 麻痹", "nerve|nɜːv|n. 神经", "immune|ɪˈmjuːn|adj. 免疫的", "inject|ɪnˈdʒekt|v. 注射", "cobra|ˈkəʊbrə|n. 眼镜蛇", "reptile|ˈreptaɪl|n. 爬行动物", "lethal|ˈliːθl|adj. 致命的", "dose|dəʊs|n. 剂量"] });

  L({ n: 21, t: "William S. Hart and the early 'Western' film", cn: "威廉·S. 哈特和早期“西部”电影",
    sum: "演员兼导演威廉·S. 哈特拍摄的西部片以真实著称：他熟悉真正的西部生活，力求场景、服装和人物都贴近历史，与后来浪漫化的好莱坞西部片形成对比。",
    bg: "人物 + 电影史。关注作者如何用对比突出哈特电影的“真实感”。",
    g: ["rel", "contrast", "passive"],
    tip: "genre 来自法语，英音 /ˈʒɒnrə/；costume 英音 /ˈkɒstjuːm/。",
    q: "哈特的西部片有什么特点？",
    w: ["cowboy|ˈkaʊbɔɪ|n. 牛仔", "frontier|ˈfrʌntɪə|n. 边疆", "authentic|ɔːˈθentɪk|adj. 真实的", "realism|ˈriːəlɪzəm|n. 现实主义", "director|dəˈrektə|n. 导演", "costume|ˈkɒstjuːm|n. 服装", "romantic|rəʊˈmæntɪk|adj. 浪漫的", "genre|ˈʒɒnrə|n. 类型，体裁", "outlaw|ˈaʊtlɔː|n. 歹徒，亡命之徒", "saloon|səˈluːn|n. 酒馆", "sheriff|ˈʃerɪf|n. 治安官", "audience|ˈɔːdiəns|n. 观众"] });

  L({ n: 22, t: "Knowledge and progress", cn: "知识与进步",
    sum: "为什么“进步”的观念在现代世界如此重要？因为我们身边确实在发生某种进步——知识，尤其是科学技术知识，在一代代地积累。但知识的积累并不等于人类在道德和艺术上也同样进步。",
    bg: "哲理性议论文。抓住“哪种进步在发生，哪种未必”这一区分，作者的论证就清楚了。",
    g: ["inversion", "rel", "contrast"],
    tip: "progress 英音名词 /ˈprəʊɡres/（美音 /ˈprɑːɡres/）；knowledge /ˈnɒlɪdʒ/ 的 k 不发音。",
    q: "作者认为现代世界中哪种进步确实在发生？",
    w: ["progress|ˈprəʊɡres|n. 进步", "loom|luːm|v. 显得重要；赫然出现", "accumulate|əˈkjuːmjəleɪt|v. 积累", "knowledge|ˈnɒlɪdʒ|n. 知识", "technique|tekˈniːk|n. 技术", "civilization|ˌsɪvəlaɪˈzeɪʃn|n. 文明", "inherit|ɪnˈherɪt|v. 继承", "moral|ˈmɒrəl|adj. 道德的", "wisdom|ˈwɪzdəm|n. 智慧", "cumulative|ˈkjuːmjələtɪv|adj. 累积的", "artistic|ɑːˈtɪstɪk|adj. 艺术的", "particular|pəˈtɪkjələ|adj. 特定的"] });

  L({ n: 23, t: "Bird flight", cn: "鸟的飞行",
    sum: "本课讲鸟类的飞行：翅膀和羽毛的结构如何让鸟飞起来，以及鸟类在长途迁徙中惊人的耐力和导航能力。",
    bg: "科普说明文。可以分“飞行原理”和“迁徙导航”两块做笔记。",
    g: ["passive", "compare", "participle"],
    tip: "feather /ˈfeðə/ 的 th 是浊音 /ð/；species 英音 /ˈspiːʃiːz/。",
    q: "鸟类靠什么在迁徙中辨别方向？",
    w: ["migrate|maɪˈɡreɪt|v. 迁徙", "migration|maɪˈɡreɪʃn|n. 迁徙", "navigation|ˌnævɪˈɡeɪʃn|n. 导航", "wing|wɪŋ|n. 翅膀", "feather|ˈfeðə|n. 羽毛", "altitude|ˈæltɪtjuːd|n. 高度", "glide|ɡlaɪd|v. 滑翔", "soar|sɔː|v. 高飞，翱翔", "species|ˈspiːʃiːz|n. 物种", "orientation|ˌɔːriənˈteɪʃn|n. 定向", "magnetic|mæɡˈnetɪk|adj. 磁的", "endurance|ɪnˈdjʊərəns|n. 耐力"] });

  L({ n: 24, t: "Beauty", cn: "美",
    sum: "什么是美？美有没有客观标准？本课探讨美的本质：审美观念随时代和文化而变化，但真正的美似乎又能跨越时间打动人心。",
    bg: "抽象议论文，句子较长。先找每段的主题句，再看作者举了哪些例子。",
    g: ["noun", "formal_it", "contrast"],
    tip: "aesthetic 英式拼写，英音 /iːsˈθetɪk/；beauty /ˈbjuːti/ 中 t 清晰发音（美音常闪音化）。",
    q: "作者认为美有客观标准吗？",
    w: ["beauty|ˈbjuːti|n. 美", "aesthetic|iːsˈθetɪk|adj. 审美的", "harmony|ˈhɑːməni|n. 和谐", "proportion|prəˈpɔːʃn|n. 比例", "subjective|səbˈdʒektɪv|adj. 主观的", "objective|əbˈdʒektɪv|adj. 客观的", "universal|ˌjuːnɪˈvɜːsl|adj. 普遍的", "admire|ədˈmaɪə|v. 欣赏", "perceive|pəˈsiːv|v. 感知", "ideal|aɪˈdɪəl|n./adj. 理想（的）", "taste|teɪst|n. 品味", "standard|ˈstændəd|n. 标准"] });
})();
