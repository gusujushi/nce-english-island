/* 语法库（第一至四册）+ 句子自动分析（彩色标注、意群切分、主干提示）
 * 说明：这是基于规则的“提示”，帮你快速看出句子骨架；遇到拿不准的长难句，可用“AI 老师”精讲。
 */
(function () {
  const IRREG = "made|built|known|found|given|taken|seen|done|held|told|thought|brought|bought|caught|taught|kept|left|lost|paid|put|sent|set|shown|sold|spent|struck|understood|won|written|led|read|heard|felt|meant|met|run|cut|hit|hurt|shut|spread|borne|born|worn|torn|thrown|grown|drawn|blown|flown|known|become|begun|broken|chosen|driven|eaten|fallen|forgotten|frozen|gotten|got|hidden|laid|lain|ridden|risen|shaken|spoken|stolen|sung|sunk|swum|woken|bound|dug|fed|fought|hung|sought|stood|sat|slept|swept|wound|withdrawn|undertaken|overcome|arisen|forbidden|said|called|laid|dealt|lit|spoilt|learnt|burnt|dreamt|sworn|shot|sped|split|stuck|stung|torn|wept|wrung";
  const NOT_PART = /^(often|even|then|when|seven|eleven|children|women|men|ten|open|sudden|golden|garden|heaven|listen|happen|between|kitchen|seen|been|hundred|need|indeed|speed|seed|feed|bed|red|shed|bleed|creed|greed|steed|sacred|naked|wicked|kindred|hatred|wretched|rugged|ragged|beloved|learned)$/i;
  const AUX = new Set("am is are was were be been being has have had having do does did will would shall should can could may might must ought".split(" "));
  const ADV_SKIP = new Set("not never also always already ever just only often still probably certainly usually seldom rarely hardly scarcely even soon then generally actually really once now sometimes simply merely largely".split(" "));
  const CONJ = new Set("which who whom whose that where when while whereas because although though if unless since whether until till before after once as so but and or nor yet however therefore thus hence moreover nevertheless otherwise whenever wherever whatever whoever".split(" "));
  const STRONG_CONJ = new Set("which who whom whose where when while whereas because although though if unless since whether until till however therefore thus hence moreover nevertheless otherwise whenever wherever whatever whoever".split(" "));
  const PREP = new Set("in on at by for with from to of about into onto upon over under above below between among through during without within against towards toward across along around behind beyond beside besides near despite throughout like unlike via per".split(" "));
  const DET = new Set("the a an this that these those his her their its my our your some any no every each such which what whose many much more most other another all both several few".split(" "));
  const PRON_OBJ = new Set("me him her us them it you myself himself herself themselves itself".split(" "));

  const BASIC = [
    { id: "be", name: "be 动词句型", color: "#e8590c", books: [1],
      re: /\b(am|is|are|was|were|'m|'re)\b(?!\s+(?:not\s+)?\w+ing\b)/i,
      desc: "主语 + be（am / is / are）+ 表语，说明“是什么、怎么样、在哪里”。",
      how: "I 配 am，单数配 is，复数和 you 配 are；把 be 理解成中文的“是”或“在”。",
      ex: "This is my handbag. —— 这是我的手提包。" },
    { id: "be_q", name: "一般疑问句（be 开头）", color: "#f08c00", books: [1, 2],
      re: /^\s*["'‘“]?(is|are|am|was|were|isn't|aren't|wasn't|weren't)\b[^.?!]*\?/i,
      desc: "把 be 动词提到句首，句末用问号，用 Yes / No 回答。",
      how: "读的时候句尾语调上扬 ↗；回答 Yes, it is. / No, it isn't.",
      ex: "Is this your umbrella? —— 这是你的伞吗？" },
    { id: "do_q", name: "一般疑问句（助动词开头）", color: "#f59f00", books: [1, 2],
      re: /^\s*["'‘“]?(do|does|did|can|could|will|would|shall|should|may|must|have|has|don't|doesn't|didn't|can't|won't)\s+(?:you|he|she|it|we|they|i|the|this|that|these|those|your|his|her|my|our|their|[A-Z][a-z]+)\b[^.?!]*\?/,
      desc: "实义动词的疑问句要借助 do / does / did，情态动词（can、will…）直接提前。",
      how: "句尾语调上扬 ↗；助动词后面的动词要用原形。",
      ex: "Do you like coffee? —— 你喜欢咖啡吗？" },
    { id: "wh_q", name: "特殊疑问句", color: "#d9480f", books: [1, 2],
      re: /^\s*["'‘“]?(what|where|when|who|whom|whose|which|why|how)\b[^.!]*\?/i,
      desc: "用 what / where / who / how 等疑问词开头，问具体信息，不能用 Yes / No 回答。",
      how: "疑问词重读，句尾语调通常下降 ↘。",
      ex: "Where do you come from? —— 你从哪里来？" },
    { id: "imper", name: "祈使句", color: "#c2255c", books: [1, 2],
      re: /^\s*["'‘“]?(please\s+)?(don't\s+|do\s+not\s+|never\s+)?(come|go|give|put|take|open|shut|close|look|listen|sit|stand|read|write|turn|bring|hurry|wait|be|let|tell|show|make|try|help|stop|keep|leave|answer|call|send|pass|catch|drop|get|empty|clean|sweep|dust|switch|eat|drink|buy|ask|remember|excuse|mind|enjoy|have|follow|move|meet|pay|sing|see)\b/i,
      desc: "以动词原形开头，表示请求、命令或劝告，主语 you 被省略。",
      how: "加 please 更礼貌；否定用 Don't + 动词原形。",
      ex: "Don't drop it! —— 别摔了！" },
    { id: "there_be", name: "There be 句型", color: "#2b8a3e", books: [1, 2],
      re: /\bthere\s+(is|are|was|were|will be|has been|have been|isn't|aren't|wasn't|weren't|'s)\b/i,
      desc: "There is / are + 某物 + 某地，表示“某处有某物”。",
      how: "be 的单复数跟着后面最近的名词走：There is a book… / There are some books…",
      ex: "There is a refrigerator in the kitchen. —— 厨房里有一台冰箱。" },
    { id: "prog", name: "进行时", color: "#1098ad", books: [1, 2],
      re: null,
      desc: "be + doing，表示“正在做”（现在进行时）或“当时正在做”（过去进行时）。",
      how: "看到 am / is / are / was / were + -ing，就加上“正在……”。",
      ex: "Tim is climbing a tree. —— 蒂姆正在爬树。" },
    { id: "pres", name: "一般现在时", color: "#3b5bdb", books: [1],
      re: /\b(always|usually|often|sometimes|never|every\s+(?:day|morning|evening|night|week|month|year|sunday|monday|weekend))\b|\b(?:he|she|it)\s+(?:\w+ly\s+)?(?!is\b|was\b|has\b|does\b)[a-z]+s\b/i,
      desc: "表示经常、习惯性的动作或客观事实；第三人称单数动词加 -s / -es。",
      how: "注意 always / usually / every day 这类时间词；he / she / it 后动词要加 -s。",
      ex: "She always stays at home in the morning. —— 她早上总是待在家里。" },
    { id: "past", name: "一般过去时", color: "#5f3dc4", books: [1, 2],
      re: /\b(yesterday|ago|last\s+(?:night|week|month|year|sunday|monday|saturday|summer|winter|time))\b|\b(did|didn't|went|came|saw|said|told|took|made|found|bought|thought|left|met|sat|ran|wrote|gave|knew|felt|heard|began|became|ate|drank|got|stood|lost|caught|brought|taught|sold|paid|put|kept|slept|woke|fell|flew|drove|rode|spoke|broke|chose|forgot|hid|threw|grew|drew|wore)\b/i,
      desc: "表示过去发生的动作或状态；规则动词加 -ed，不规则动词要单独记。",
      how: "注意 yesterday / ago / last… 等时间词；疑问、否定借助 did，动词还原。",
      ex: "I went to the theatre last week. —— 上周我去看戏了。" },
    { id: "future", name: "一般将来时", color: "#0b7285", books: [1, 2, 3],
      re: /\b(will|shall|'ll|won't|shan't)\s+(?:not\s+)?(?:be\s+)?[a-z]+\b|\b(am|is|are|'m|'re|'s)\s+going\s+to\b/i,
      desc: "will / shall + 动词原形，或 be going to + 动词原形，表示将来要发生的事或打算。",
      how: "be going to 更强调“已经打算好”；will 多表示临时决定或预测。",
      ex: "I am going to paint it pink. —— 我打算把它漆成粉红色。" },
    { id: "modal", name: "情态动词", color: "#862e9c", books: [1, 2, 3],
      re: /\b(can|could|may|might|must|mustn't|should|shouldn't|needn't|can't|cannot|couldn't|have to|has to|had to|ought to)\b(?!\s+(?:not\s+)?have\s+\w+(?:ed|en)\b)/i,
      desc: "can（能）、may（可以/也许）、must（必须/一定）、should（应该）、have to（不得不）等，后接动词原形。",
      how: "情态动词表示说话人的态度：能力、许可、必要、推测，翻译时加上相应的语气。",
      ex: "You must stay in bed. —— 你必须卧床休息。" },
    { id: "plural", name: "名词复数与指示代词", color: "#e64980", books: [1],
      re: /\b(these|those)\b|\b(?:they|we|you)\s+are\b|\b[a-z]{3,}(?:s|es)\s+(?:are|were)\b/i,
      desc: "复数名词配 are / were；this → these，that → those。",
      how: "名词复数加 -s / -es，注意不规则变化：man → men, child → children。",
      ex: "These are our passports. —— 这些是我们的护照。" },
    { id: "pron", name: "物主代词 / 反身代词", color: "#a61e4d", books: [1],
      re: /\b(my|your|his|her|its|our|their|mine|yours|hers|ours|theirs|myself|yourself|himself|herself|itself|ourselves|yourselves|themselves)\b/i,
      desc: "my / your / his（……的）修饰名词；myself / himself（……自己）用作宾语或强调。",
      how: "看到 -self / -selves 翻译成“……自己”；enjoy yourself = 玩得开心。",
      ex: "Enjoy yourself! —— 玩得开心！" },
  ];

  const G = [
    { id: "rel", name: "定语从句", color: "#9b5de5",
      re: /\b(which|who|whom|whose)\b|,\s*(where|when)\b|\b(in|of|by|to|from|with|on|at|for|through|during)\s+(which|whom)\b/i,
      desc: "跟在名词后面、给名词“加说明”的从句，常由 which / who / whom / whose / where / when 引导。",
      how: "读到引导词就在心里加一个“（这个……）”：先把主句读懂，再回头看它修饰谁。",
      ex: "The man who built this house was my grandfather. —— 建造这座房子的那个人是我祖父。" },
    { id: "passive", name: "被动语态", color: "#e5484d",
      re: null, // 用函数判断，见 testPassive
      desc: "be + 过去分词，表示“主语被……”。科普文章里极常见，因为作者关心的是“事情”而不是“谁做的”。",
      how: "看到 be + done，先翻成“被……”，再按中文习惯调整（中文常省略“被”）。",
      ex: "The ship was discovered in 1956. —— 这艘船是在 1956 年被发现的。" },
    { id: "perfect", name: "完成时", color: "#f76707",
      re: null,
      desc: "have / has / had + 过去分词，强调“到某个时间为止已经……”，与现在或过去某点有联系。",
      how: "has done =“已经/一直……（到现在）”；had done =“在那之前就已经……”。",
      ex: "Scientists have studied bats for centuries. —— 科学家研究蝙蝠已有几百年了。" },
    { id: "modalperf", name: "情态动词 + have done", color: "#d6336c",
      re: /\b(must|may|might|could|should|would|needn't|cannot|can't|couldn't|wouldn't|shouldn't|ought to)\s+(?:not\s+)?have\s+\w+/i,
      desc: "对过去的推测或虚拟：must have done（一定已经）、may/might have done（可能已经）、should have done（本应该）、could have done（本可以）。",
      how: "先判断是“推测过去”还是“过去没做到的遗憾”。",
      ex: "They must have lost their way. —— 他们一定是迷路了。" },
    { id: "participle", name: "分词短语（非谓语）", color: "#2f9e44",
      re: /(?:^|[,;:—–]\s*)(?:not\s+)?[A-Za-z]+ing\b|\bhaving\s+\w+(?:ed|en)\b|\b\w+(?:ed|en)\s+by\b|(?:^|[,;:—–]\s*)(?:once\s+|when\s+|if\s+)?(?:[A-Za-z]+ed|seen|given|taken|known|made|built|written|found|left|brought|shown|told|born|driven|hidden|held|struck|thrown|grown|drawn|taught|caught|kept|led)\s+(?:by|in|with|from|to|as|at|for|on|through|under)\b/i,
      desc: "doing（主动/进行）或 done（被动/完成）构成的短语，充当状语或定语，不是句子真正的谓语。",
      how: "把分词短语当作“附加信息”：先跳过它找主干，再回来补上“……的时候 / 因为…… / ……的”。",
      ex: "Seen from the air, the island looks like a heart. —— 从空中看，这座岛像一颗心。" },
    { id: "inf", name: "不定式 to do", color: "#0ca678",
      re: /\bto\s+(?!the\b|a\b|an\b|be\s+\w+ed\b|his\b|her\b|their\b|its\b|my\b|our\b|your\b|this\b|that\b|these\b|those\b|them\b|him\b|me\b|us\b|it\b|which\b|whom\b|some\b|any\b|all\b|each\b|every\b)(be|have|make|find|keep|get|give|take|see|know|learn|study|understand|show|prevent|avoid|reach|discover|produce|provide|explain|create|become|do|go|come|say|tell|use|help|try|work|live|build|grow|save|protect|detect|locate|climb|preserve|recount|write|read|achieve|survive|escape|catch|hold|carry|remain|win|lose|seek|ensure|pay|spend|buy|sell|invest|continue|compete|play|swim|fly|move|change|believe|imagine|expect|feel|look|think|consider|enable|allow|encourage|persuade|[a-z]+(?:ise|ize|ate|ify)|[a-z]{3,})\b/i,
      desc: "to + 动词原形，可以表示目的（为了……）、作主语/宾语/定语等。",
      how: "先试着翻成“为了……”，不通顺再看它是不是在作宾语（want to do）或修饰前面的名词（a way to do）。",
      ex: "He climbed the mountain to see the sunrise. —— 他爬上山去看日出。" },
    { id: "cond", name: "条件 / 让步条件", color: "#1c7ed6",
      re: /\b(if|unless|provided|providing|as long as|so long as|in case|supposing|otherwise|on condition that)\b|^(had|were|should)\s+\w+\s+\w+/i,
      desc: "if / unless / provided that 等引导的条件；Had / Were / Should 放句首是省略 if 的倒装虚拟条件。",
      how: "先读条件（如果……），再读结果（那么……）；注意 would / could 往往表示“假设、与事实相反”。",
      ex: "If you heat ice, it melts. —— 冰受热就会融化。" },
    { id: "subj", name: "虚拟语气", color: "#ae3ec9",
      re: /\b(as if|as though|if only|would rather|it is (?:high |about )?time|wish(?:es|ed)?|lest)\b|\b(insist|suggest|demand|recommend|require|propose|essential|important|necessary|vital)\w*\s+that\b/i,
      desc: "表达与事实相反、愿望或建议：wish / as if / it is time / suggest that (should) do 等。",
      how: "看到 would / could / might + have done，或 wish、as if，提醒自己“这不是事实，是假设或愿望”。",
      ex: "I wish I had more time. —— 要是我有更多时间就好了（实际上没有）。" },
    { id: "formal_it", name: "it 句型（形式主语 / 强调）", color: "#f59f00",
      re: /\bit\s+(?:is|was|seems|seemed|appears|appeared|has been|had been|would be|will be|may be|might be|must be|becomes|became)\s+(?:not\s+)?(?:\w+\s+){0,4}?(?:to|that|whether|how|what|who|which|for)\b/i,
      desc: "It is … to do / that …：it 只是“占位”的形式主语，真正的主语在后面；It is … that/who … 还可能是强调句。",
      how: "把 to do / that 后面的内容代回 it 的位置去理解；如果去掉 It is…that 句子仍完整，那就是强调句。",
      ex: "It is difficult to climb this mountain. —— 爬这座山很难。" },
    { id: "cleft", name: "强调句 It is … that/who", color: "#fab005",
      re: /\bit\s+(?:is|was)\s+(?:not\s+)?(?:only\s+)?[\w\s,'’]{1,40}?\s+(?:that|who)\b/i,
      desc: "It is / was + 被强调部分 + that / who + 其余部分，用来突出某个成分。",
      how: "试着拿掉 It is 和 that，若剩下的句子完整，就是强调句，翻译时加“正是……”。",
      ex: "It was the old people who created the problem. —— 正是老年人造成了这个问题。" },
    { id: "inversion", name: "倒装", color: "#c2255c",
      re: /(?:^|[;:]\s*)(not only|never|seldom|rarely|hardly|scarcely|little|no sooner|nor|neither|only (?:when|then|by|after|in|if|through|with|recently)|under no|in no|at no|not until|so \w+|such)\b[^.,;]{0,40}?\b(is|are|was|were|do|does|did|have|has|had|can|could|will|would|should|must|may|might)\b/i,
      desc: "否定词、only 等放句首时，助动词提到主语前面，形成倒装，起强调作用。",
      how: "把助动词放回主语后面，句子就恢复正常语序了。",
      ex: "Never have I seen such a sight. = I have never seen such a sight. —— 我从未见过这样的景象。" },
    { id: "compare", name: "比较结构", color: "#3bc9db",
      re: /\b(more|less|fewer|better|worse|greater|rather|other)\s+(?:\w+\s+){0,4}?than\b|\b\w+er\s+than\b|\bas\s+\w+(?:\s+\w+)?\s+as\b|\bthe\s+(?:more|less|\w+er)\b[^.]*\bthe\s+(?:more|less|\w+er)\b|\blike\s+a\b/i,
      desc: "比较级 + than、as … as、the more … the more（越……越……）、比喻 like a … 等。",
      how: "找到“谁和谁比”“比什么”，并留意 than 后面常省略了重复的部分。",
      ex: "The more difficult the route is, the more highly it is regarded. —— 路线越难，评价就越高。" },
    { id: "contrast", name: "转折 / 让步", color: "#ff922b",
      re: /\b(however|although|though|whereas|nevertheless|nonetheless|despite|in spite of|yet|on the other hand|on the contrary|instead|but)\b/i,
      desc: "however / although / but / despite 等表示转折或让步，后面往往才是作者真正想强调的。",
      how: "看到转折词就提高注意力：“但是”之后通常是重点。",
      ex: "Although it was raining, they went on climbing. —— 虽然在下雨，他们还是继续攀登。" },
    { id: "cause", name: "因果", color: "#74b816",
      re: /\b(because|since|as a result|therefore|thus|hence|consequently|so that|due to|owing to|for this reason|thanks to|so\s+\w+\s+that|such\s+(?:a\s+)?\w+\s+that|lead(?:s|ing)? to|led to|result(?:s|ed)? in)\b/i,
      desc: "because / since / therefore / so…that / result in 等表示原因和结果。",
      how: "画一个箭头：原因 → 结果。说明文的逻辑主线往往就是一连串因果。",
      ex: "Spiders kill insects, so they are our friends. —— 蜘蛛消灭昆虫，所以是我们的朋友。" },
    { id: "noun", name: "名词性从句", color: "#7048e8",
      re: /\b(believe|believed|think|thought|know|knew|known|say|said|says|suggest|suggests|suggested|show|shows|showed|shown|find|found|realize|realise|realized|realised|agree|claim|claimed|argue|argued|feel|felt|hope|fear|suppose|doubt|wonder|wondered|discover|discovered|learn|learnt|learned|mean|means|meant|explain|prove|proved|assume|notice|recognize|recognise|ensure|clear|true|fact|idea|belief|evidence|possible|likely|certain|sure|question)\s+(that|whether|what|how|why|if|where|who)\b|^(what|whether|how|why)\b[^.?]*\b(is|was|are|were|seems|remains)\b/i,
      desc: "一个从句充当名词（主语、宾语、表语或同位语），常由 that / whether / what / how / why 引导。",
      how: "把整个从句看成一个“大名词”：know [that …] = 知道【……这件事】。",
      ex: "Scientists believe that bats use echoes. —— 科学家认为蝙蝠利用回声。" },
    { id: "insert", name: "插入语 / 同位语", color: "#868e96",
      re: /\s[—–]\s|\s-\s|\(|,\s*(?:in fact|of course|for example|for instance|that is|in other words|however|indeed|perhaps|I think|I believe|you may|it seems|as a rule|in short|after all|so to speak)\s*,|,\s*(?:you|I|we|they|he|she)\s+(?:may|might|will|would)\s+\w+,/i,
      desc: "被逗号、破折号或括号隔开的补充说明，去掉后句子依然完整。",
      how: "第一遍读时先跳过插入部分，抓主干；第二遍再把补充信息加回来。",
      ex: "Spiders, you may be surprised to learn, are our friends. —— 蜘蛛——你也许会惊讶——是我们的朋友。" },
    { id: "with", name: "with 复合结构", color: "#15aabf",
      re: /\bwith\s+(?:the\s+|a\s+|his\s+|her\s+|their\s+|its\s+)?\w+\s+(?:\w+ing|\w+ed|in|on|out|off|up|down)\b/i,
      desc: "with + 名词 + doing/done/介词短语，作伴随状语，描述“带着……的状态”。",
      how: "翻成“……着”或“随着……”。",
      ex: "He sat there with his eyes closed. —— 他闭着眼睛坐在那里。" },
  ];

  const ALL = BASIC.concat(G);

  function wordsOf(s) { return (s.match(/[A-Za-z][A-Za-z'’-]*/g) || []); }

  function testPassive(s) {
    const re = new RegExp("\\b(am|is|are|was|were|be|been|being)\\s+(?:(?:not|never|also|often|still|now|then|always|usually|generally|already|just|only|largely|actually|really|\\w+ly)\\s+){0,2}([a-z]+(?:ed|en)|" + IRREG + ")\\b", "ig");
    let m;
    while ((m = re.exec(s))) { if (!NOT_PART.test(m[2])) return true; }
    return false;
  }
  function testPerfect(s) {
    const re = new RegExp("\\b(has|have|had|having|'ve|'d)\\s+(?:(?:not|never|already|just|ever|also|always|long|since|recently|\\w+ly)\\s+){0,2}(been|[a-z]+ed|[a-z]+en|" + IRREG + ")\\b", "ig");
    let m;
    while ((m = re.exec(s))) { if (!NOT_PART.test(m[2]) || m[2] === "been") return true; }
    return false;
  }

  function testProg(s) {
    const re = /\b(am|is|are|was|were|'m|'re|'s|be|been)\s+(?:not\s+|still\s+|always\s+|just\s+)?([a-z]+ing)\b/ig;
    let m;
    while ((m = re.exec(s))) { if (!/^(thing|something|nothing|anything|everything|during|morning|evening|king|ring|spring|string|interesting|exciting|boring|amusing|surprising|charming|willing|missing|living|building|ceiling|feeling|meaning|darling)$/.test(m[2].toLowerCase())) return true; }
    return false;
  }

  function tags(sentence, book) {
    const out = [];
    for (const g of ALL) {
      if (book && g.books && !g.books.includes(book)) continue;
      let hit = false;
      if (g.id === "passive") hit = testPassive(sentence);
      else if (g.id === "perfect") hit = testPerfect(sentence);
      else if (g.id === "prog") hit = testProg(sentence);
      else hit = g.re.test(sentence);
      if (hit) out.push(g);
    }
    // 强调句与形式主语只保留一个提示，避免重复
    if (out.find((g) => g.id === "cleft") && out.find((g) => g.id === "formal_it")) {
      return out.filter((g) => g.id !== "cleft");
    }
    return out;
  }

  // 生成词形变化，用于匹配本课重点词
  function forms(w) {
    w = w.toLowerCase();
    const f = new Set([w, w + "s", w + "es", w + "ed", w + "d", w + "ing", w + "er", w + "ly", w + "al"]);
    if (w.endsWith("e")) { f.add(w.slice(0, -1) + "ing"); f.add(w.slice(0, -1) + "ion"); }
    if (w.endsWith("y")) { f.add(w.slice(0, -1) + "ies"); f.add(w.slice(0, -1) + "ied"); }
    if (/[^aeiou][aeiou][bdgmnprt]$/.test(w)) { const d = w + w.slice(-1); f.add(d + "ed"); f.add(d + "ing"); }
    if (w.endsWith("sis")) f.add(w.slice(0, -3) + "ses");
    if (w.endsWith("on")) f.add(w.slice(0, -2) + "a");
    return f;
  }

  /* 把句子切成 token 并打上颜色类别 */
  function colorize(sentence, vocab) {
    const vocabMap = new Map();
    (vocab || []).forEach((v) => {
      const head = v.w.split(" ")[0];
      if (v.w.includes(" ")) return;
      forms(head).forEach((f) => vocabMap.set(f, v));
    });
    const parts = sentence.match(/[A-Za-z][A-Za-z'’-]*|\d[\d,.]*|[^\sA-Za-z\d]+|\s+/g) || [];
    const toks = parts.map((p) => ({ t: p, w: /^[A-Za-z]/.test(p) ? p.toLowerCase().replace(/[’']s$/, "") : null, cls: "" }));
    const words = toks.filter((x) => x.w);
    const prevWordIdx = (i) => { for (let j = i - 1; j >= 0; j--) { if (toks[j].w) return j; if (/[,;:—–(]/.test(toks[j].t)) return -1; } return -1; };
    const nextWordIdx = (i) => { for (let j = i + 1; j < toks.length; j++) { if (toks[j].w) return j; if (/[,;:.!?—–()]/.test(toks[j].t)) return -1; } return -1; };

    for (let i = 0; i < toks.length; i++) {
      const tk = toks[i];
      if (!tk.w) continue;
      const w = tk.w;
      if (tk.cls) continue;
      if (STRONG_CONJ.has(w) || (CONJ.has(w) && !["that", "as", "so", "and", "or", "but", "yet", "before", "after", "since", "once"].includes(w))) {
        tk.cls = "conj"; tk.tip = "连接词 / 从句引导词";
        continue;
      }
      if (w === "that") {
        const p = prevWordIdx(i), n = nextWordIdx(i);
        const pw = p >= 0 ? toks[p].w : "";
        const nw = n >= 0 ? toks[n].w : "";
        // that 后接名词时多为限定词（that man），否则多为从句引导词
        if (!(nw && /^(is|was|are|were|has|had|will|would|can|could|may|might|must|should)$/.test(nw) && !pw) && !(nw && DET.has(nw) === false && /^(man|woman|day|time|year|way|case|kind|sort|one|place|thing|point|period|moment|age)s?$/.test(nw))) {
          tk.cls = "conj"; tk.tip = "that：从句引导词（也可能是代词，结合上下文）";
        }
        continue;
      }
      if (["but", "yet", "and", "or", "so", "as", "since", "before", "after", "once"].includes(w)) {
        const p = i - 1 >= 0 ? toks[i - 1].t : "";
        if (["but", "yet", "so"].includes(w) || /[,;]\s*$/.test(p) || i === 0) { tk.cls = "conj"; tk.tip = "连接词"; }
        else if (["as", "since", "before", "after", "once"].includes(w)) { tk.cls = "conj"; tk.tip = "连接词 / 介词"; }
        continue;
      }
      if (AUX.has(w) || /^(isn't|aren't|wasn't|weren't|don't|doesn't|didn't|won't|wouldn't|can't|cannot|couldn't|shouldn't|mustn't|hasn't|haven't|hadn't)$/.test(w)) {
        if (w === "to") continue;
        // 谓语链：助动词 (+副词) (+be/been/have) (+动词)
        tk.cls = "verb"; tk.tip = "谓语（助动词/情态动词/be 动词）";
        let j = i;
        const isModalOrDo = /^(will|would|shall|should|can|could|may|might|must|do|does|did|won't|wouldn't|can't|cannot|couldn't|shouldn't|mustn't|don't|doesn't|didn't)$/.test(w);
        let steps = 0;
        while (steps < 5) {
          const n = nextWordIdx(j);
          if (n < 0) break;
          const nw = toks[n].w;
          if (ADV_SKIP.has(nw) || /ly$/.test(nw)) { j = n; steps++; continue; }
          if (AUX.has(nw)) { toks[n].cls = "verb"; toks[n].tip = "谓语"; j = n; steps++; continue; }
          const looksVerb = /(ed|en|ing)$/.test(nw) && !NOT_PART.test(nw) || new RegExp("^(" + IRREG + ")$").test(nw);
          if (looksVerb || (isModalOrDo && !DET.has(nw) && !PRON_OBJ.has(nw) && !PREP.has(nw))) {
            toks[n].cls = "verb"; toks[n].tip = "谓语动词";
          }
          break;
        }
        continue;
      }
      if (w === "to") {
        const n = nextWordIdx(i);
        if (n >= 0) {
          const nw = toks[n].w;
          if (!DET.has(nw) && !PRON_OBJ.has(nw) && !/^\d/.test(nw) && toks[n].t[0] === toks[n].t[0].toLowerCase() && !/(tion|ment|ness|ity|ies|ers)$/.test(nw) && !/s$/.test(nw)) {
            tk.cls = "nonf"; toks[n].cls = "nonf"; tk.tip = toks[n].tip = "不定式 to do（非谓语）";
            continue;
          }
        }
        tk.cls = "prep"; tk.tip = "介词";
        continue;
      }
      if (/ing$/.test(w) && w.length > 4 && !/^(thing|nothing|something|anything|everything|king|ring|spring|string|bring|sing|wing|during|morning|evening|ceiling|building|feeling|meaning|beginning|being)$/.test(w)) {
        const p = prevWordIdx(i);
        if (p < 0 || PREP.has(toks[p].w)) { tk.cls = "nonf"; tk.tip = "-ing 分词/动名词（非谓语）"; continue; }
      }
      if (/ed$/.test(w) && !NOT_PART.test(w)) {
        const p = prevWordIdx(i);
        const n = nextWordIdx(i);
        if (p < 0 && n >= 0 && (toks[n].w === "by" || PREP.has(toks[n].w))) { tk.cls = "nonf"; tk.tip = "过去分词短语（非谓语）"; continue; }
      }
      if (new RegExp("^(" + IRREG + ")$").test(w) && prevWordIdx(i) < 0) {
        const n = nextWordIdx(i);
        if (n >= 0 && PREP.has(toks[n].w)) { tk.cls = "nonf"; tk.tip = "过去分词短语（非谓语）"; continue; }
      }
      if (PREP.has(w)) { tk.cls = "prep"; tk.tip = "介词"; continue; }
    }
    // 重点词汇高亮（叠加）
    toks.forEach((tk) => { if (tk.w && vocabMap.has(tk.w)) { tk.vocab = vocabMap.get(tk.w); } });
    return toks;
  }

  /* 意群切分：按标点、连接词、介词把长句切成可一口气读完的小块 */
  function chunks(sentence) {
    const words = sentence.trim().split(/\s+/);
    const out = [];
    let cur = [];
    const flush = () => { if (cur.length) { out.push(cur.join(" ")); cur = []; } };
    words.forEach((raw, i) => {
      const w = raw.toLowerCase().replace(/[^a-z']/g, "");
      if (cur.length >= 3 && (STRONG_CONJ.has(w) || (["and", "but", "or", "that"].includes(w) && cur.length >= 4))) flush();
      else if (cur.length >= 5 && (PREP.has(w) || (w === "to"))) flush();
      cur.push(raw);
      if (/[,;:—–)]$/.test(raw) || /^[—–]$/.test(raw)) flush();
    });
    flush();
    return out;
  }

  /* 主干提示：去掉插入成分、从句和状语后的“骨架” */
  function trunk(sentence) {
    let s = sentence.replace(/\([^)]*\)/g, " ").replace(/\s[—–]\s[^—–]*\s[—–]\s/g, " ");
    const segs = s.split(/,|;/);
    const keep = [];
    const dropStart = /^\s*(which|who|whom|whose|where|when|while|whereas|although|though|if|unless|because|since|as|after|before|until|once|however|moreover|therefore|thus|indeed|perhaps|for example|for instance|in fact|of course|in other words|that is|not only|especially|particularly|including|such as|like|according to|despite|in spite of|with|without|by|in|on|at|from|during|through|after all|[a-z]+ing\b|[a-z]+ed\b|having|to\s+\w+|(?:seen|given|taken|known|made|built|written|found|left|brought|shown|told|born|driven|hidden|held|struck|thrown|grown|drawn|taught|caught|kept|led)\s+(?:by|in|with|from|to|as|at|for|on|through|under)\b)/i;
    segs.forEach((seg, i) => {
      if (i > 0 && dropStart.test(seg)) return;
      if (i === 0 && segs.length > 1 && dropStart.test(seg) && !/^\s*(it|there|the|a|an|this|these|those|they|we|he|she|i|you)\b/i.test(seg)) return;
      let t = seg.replace(/\b(which|who|whom|whose)\b.*$/i, "");
      if (t.trim().split(/\s+/).length >= 2) keep.push(t.trim());
    });
    let res = keep.join(", ").replace(/\s+/g, " ").trim();
    if (!res) return "";
    res = res.replace(/[,;:]\s*$/, "");
    if (!/[.!?]$/.test(res)) res += /\?$/.test(sentence.trim()) ? "?" : ".";
    const a = wordsOf(res).length, b = wordsOf(sentence).length;
    if (a >= b - 1 || a < 3) return "";
    return res;
  }

  function difficulty(sentence) {
    const n = wordsOf(sentence).length;
    const clauses = (sentence.match(/\b(which|who|whom|whose|that|where|when|while|although|though|because|if|unless|whether|since)\b/gi) || []).length;
    const score = n / 8 + clauses;
    return { words: n, clauses, level: score >= 5 ? 3 : score >= 3 ? 2 : 1 };
  }

  window.Grammar = { list: ALL, byId: Object.fromEntries(ALL.map((g) => [g.id, g])), tags, colorize, chunks, trunk, difficulty, forms, wordsOf };
})();
