/* 新概念英语 1–4 册 · 能力岛 —— 主程序 */
(function () {
  "use strict";

  /* ---------------- 四册与课程 ---------------- */
  const BOOKS = [
    { b: 1, name: "第一册", en: "First Things First", island: "启航岛", emoji: "⛵", hex: "#ff6b6b", max: 144, w: 0.35, min: 12,
      level: "入门：日常对话 + 基础语法", bg: "先听录音理解对话，再看彩色句子分析学句型；第一册重在“开口说”，每句跟读到能脱口而出。", q: "听完录音，你能用英语说出这段对话的大意吗？" },
    { b: 2, name: "第二册", en: "Practice and Progress", island: "成长岛", emoji: "🌱", hex: "#f9a826", max: 96, w: 0.6, min: 18,
      level: "进阶：小故事 + 各种时态", bg: "按“谁—在哪—发生了什么—结果”梳理故事，留意本课的语法重点和时间词，最后试着用英语复述。", q: "先盲听，试着用中文复述这一课讲了什么？" },
    { b: 3, name: "第三册", en: "Developing Skills", island: "探索岛", emoji: "🧭", hex: "#12a4b6", max: 60, w: 1.0, min: 30,
      level: "提高：长文章 + 长难句", bg: "先抓每段主题句和作者观点，再用彩色分析攻克长难句，注意文章里的逻辑连接词。", q: "先盲听，你能说出作者的主要观点或故事结局吗？" },
    { b: 4, name: "第四册", en: "Fluency in English", island: "银河岛", emoji: "🌌", hex: "#9b5de5", max: 48, w: 1.25, min: 40,
      level: "流利：议论文 + 科普文", bg: "", q: "" },
  ];
  const DEFAULT_TIP = "英式发音三要点：非卷舌（car /kɑː/）、短 /ɒ/（hot /hɒt/）、双元音 /əʊ/（go /ɡəʊ/）。";
  const LESSONS = window.NCE.lessons.slice().sort((a, b) => a.b - b.b || a.n - b.n);
  const LMAP = {};
  LESSONS.forEach((l, i) => {
    l.id = `${l.b}-${l.n}`;
    l.idx = i;
    l.label = l.b === 1 ? `Lesson ${l.n}–${l.n + 1}` : `Lesson ${l.n}`;
    l.bg = l.bg || BOOKS[l.b - 1].bg;
    l.q = l.q || BOOKS[l.b - 1].q;
    l.tip = l.tip || DEFAULT_TIP;
    l.words = l.w.map((s) => { const [w, ipa, cn] = s.split("|"); return { w, ipa, cn, id: l.id, b: l.b }; });
    LMAP[l.id] = l;
  });
  const bookOf = (l) => BOOKS[l.b - 1];
  const TOTAL_UNITS = LESSONS.length;

  const STEPS = [
    { id: "intro", name: "导读盲听", icon: "🎧" },
    { id: "words", name: "英音词汇", icon: "🔤" },
    { id: "read", name: "逐句精读", icon: "🔍" },
    { id: "grammar", name: "语法透视", icon: "🧩" },
    { id: "shadow", name: "影子跟读", icon: "🗣️" },
    { id: "quiz", name: "闯关测验", icon: "🏆" },
  ];

  /* ---------------- 存储 ---------------- */
  const KEY = "nceisland.v1";
  const TKEY = "nceisland.texts.v1";
  const AKEY = "nceisland.ai.v1";
  const safeGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast("浏览器存储空间不足，进度可能无法保存"); return false; } };
  const DEFAULT_SETTINGS = { voiceURI: "", rate: 0.9, showCn: true, apiKey: "", model: "claude-opus-5-5", theme: "auto", audioRate: 1, defaultBook: "" };
  const S = Object.assign({ startDate: null, plan: { days: 30, books: [1, 2, 3, 4] }, steps: {}, quiz: {}, reviewDone: {}, starred: {}, studyDays: [] }, safeGet(KEY, {}));
  S.settings = Object.assign({}, DEFAULT_SETTINGS, S.settings || {});
  let TEXTS = safeGet(TKEY, {});
  let AI_CACHE = safeGet(AKEY, {});
  const save = () => safeSet(KEY, S);
  const saveTexts = () => safeSet(TKEY, TEXTS);
  const AUDIO = {}; // id -> {file, url}

  const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayStr = () => fmtDate(new Date());
  if (!S.startDate) { S.startDate = todayStr(); save(); }

  /* ---------------- 学习计划 ----------------
   * 按难度加权分配：第一册一个单元很短，第四册一课最长。
   * 每 5 天为一轮：前 4 天学新课，第 5 天复习这一轮学过的内容。 */
  let PLAN = [];
  function buildPlan() {
    const days = Math.max(5, Math.min(365, +S.plan.days || 30));
    const units = LESSONS.filter((l) => S.plan.books.includes(l.b));
    const plan = [];
    for (let d = 1; d <= days; d++) plan.push({ day: d, type: d % 5 === 0 ? "review" : "learn", lessons: [] });
    const learn = plan.filter((p) => p.type === "learn");
    const total = units.reduce((s, l) => s + bookOf(l).w, 0) || 1;
    let cum = 0;
    units.forEach((l) => {
      const w = bookOf(l).w;
      const k = Math.min(learn.length - 1, Math.floor(((cum + w / 2) / total) * learn.length));
      learn[k].lessons.push(l.id);
      cum += w;
    });
    let since = [];
    plan.forEach((p) => {
      if (p.type === "learn") { since = since.concat(p.lessons); if (!p.lessons.length) p.type = "free"; }
      else { p.lessons = since; since = []; if (!p.lessons.length) p.type = "free"; }
    });
    PLAN = plan;
  }
  buildPlan();
  const dayMinutes = (p) => p.type === "learn" ? p.lessons.reduce((s, id) => s + bookOf(LMAP[id]).min, 0) : (p.type === "review" ? 45 : 20);
  const avgMinutes = () => { const ls = PLAN.filter((p) => p.type === "learn"); return ls.length ? Math.round(ls.reduce((s, p) => s + dayMinutes(p), 0) / ls.length) : 0; };
  function rangeLabel(ids) {
    const groups = [];
    ids.map((id) => LMAP[id]).forEach((l) => {
      const g = groups[groups.length - 1];
      if (g && g.b === l.b) g.last = l; else groups.push({ b: l.b, first: l, last: l });
    });
    return groups.map((g) => {
      const a = g.first.n, z = g.b === 1 ? g.last.n + 1 : g.last.n;
      return `${g.b}册 L${a}${z !== a ? "–" + z : ""}`;
    }).join(" · ");
  }
  const dominantBook = (p) => {
    if (!p.lessons.length) return BOOKS[0];
    const c = {}; p.lessons.forEach((id) => { const b = LMAP[id].b; c[b] = (c[b] || 0) + bookOf(LMAP[id]).w; });
    return BOOKS[+Object.keys(c).sort((a, b) => c[b] - c[a])[0] - 1];
  };

  function markStudy() { const t = todayStr(); if (!S.studyDays.includes(t)) { S.studyDays.push(t); save(); } }
  function currentDay() {
    const a = new Date(S.startDate + "T00:00:00"), b = new Date(todayStr() + "T00:00:00");
    return Math.max(1, Math.min(PLAN.length, Math.floor((b - a) / 86400000) + 1));
  }
  function streak() {
    let n = 0; const d = new Date();
    while (S.studyDays.includes(fmtDate(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  const lessonSteps = (id) => S.steps[id] || {};
  const lessonDoneCount = (id) => STEPS.filter((s) => lessonSteps(id)[s.id]).length;
  const lessonDone = (id) => lessonDoneCount(id) === STEPS.length;
  const dayDone = (p) => p.type === "learn" ? p.lessons.every(lessonDone) : p.type === "review" ? !!S.reviewDone[p.day] : true;
  function completeStep(id, step) {
    S.steps[id] = S.steps[id] || {};
    if (!S.steps[id][step]) { S.steps[id][step] = true; markStudy(); save(); toast(`✅ ${LMAP[id].b}册 ${LMAP[id].label}「${STEPS.find((s) => s.id === step).name}」完成`); }
  }

  /* ---------------- 工具 ---------------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let toastTimer;
  function toast(msg) {
    let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.remove("hidden"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add("hidden"), 2600);
  }
  const allWords = LESSONS.flatMap((l) => l.words);
  const FORM_INDEX = new Map();
  allWords.forEach((v) => { if (!v.w.includes(" ")) Grammar.forms(v.w).forEach((f) => { if (!FORM_INDEX.has(f)) FORM_INDEX.set(f, v); }); });
  const findWord = (w) => FORM_INDEX.get(w.toLowerCase().replace(/[^a-z'-]/g, "")) || null;
  const lessonSents = (id) => (TEXTS[id] && TEXTS[id].sents) || [];
  const contentSents = (id) => lessonSents(id).filter((s) => !s.meta && s.en);
  function exampleFor(word, id) {
    const fs = Grammar.forms(word.w.split(" ")[0]);
    for (const s of contentSents(id)) if (Grammar.wordsOf(s.en).some((x) => fs.has(x.toLowerCase()))) return s.en;
    return "";
  }
  function markWord(sentence, word) {
    const fs = Grammar.forms(word.split(" ")[0]);
    return esc(sentence).replace(/[A-Za-z][A-Za-z'’-]*/g, (m) => fs.has(m.toLowerCase()) ? `<mark>${m}</mark>` : m);
  }
  const lessonTitle = (l) => `${l.b}册 ${l.label}`;

  /* ---------------- 英式发音 (TTS) ---------------- */
  let voices = [];
  function loadVoices() { voices = (window.speechSynthesis && speechSynthesis.getVoices()) || []; }
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = () => { loadVoices(); if (location.hash.startsWith("#/settings")) render(); }; }
  const gbVoices = () => voices.filter((v) => /en[-_]GB/i.test(v.lang));
  function pickVoice() {
    if (S.settings.voiceURI) { const v = voices.find((x) => x.voiceURI === S.settings.voiceURI); if (v) return v; }
    const gb = gbVoices();
    for (const p of [/Sonia|Ryan|Libby|Maisie|Thomas|Natural/i, /Google UK English/i, /Hazel|George|Susan|Daniel|Kate|Serena|Arthur|Martha/i]) { const v = gb.find((x) => p.test(x.name)); if (v) return v; }
    return gb[0] || voices.find((v) => /^en/i.test(v.lang)) || null;
  }
  function speak(text, opts = {}) {
    if (!window.speechSynthesis) { toast("当前浏览器不支持语音朗读，请使用 Edge 或 Chrome"); return; }
    stopAudio();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = "en-GB";
    u.rate = opts.rate || S.settings.rate || 0.9;
    if (opts.onend) u.onend = opts.onend;
    speechSynthesis.speak(u);
  }

  /* ---------------- 原声音频 ---------------- */
  const player = new Audio();
  player.preload = "auto";
  let segTimer = null, segEnd = null, segCb = null;
  function audioFor(id) {
    const a = AUDIO[id]; if (!a) return null;
    if (!a.url) a.url = URL.createObjectURL(a.file);
    return a.url;
  }
  function stopAudio() { player.pause(); clearInterval(segTimer); segTimer = null; segEnd = null; const cb = segCb; segCb = null; if (cb) cb(false); }
  function playSegment(id, t0, t1, cb) {
    const url = audioFor(id);
    if (!url) return false;
    if (window.speechSynthesis) speechSynthesis.cancel();
    stopAudio();
    if (player.src !== url) player.src = url;
    player.playbackRate = S.settings.audioRate || 1;
    try { player.preservesPitch = true; } catch (e) {}
    const go = () => {
      player.currentTime = Math.max(0, (t0 || 0) - 0.05);
      player.play().catch(() => toast("音频无法播放，可能是格式不受支持"));
      segEnd = t1; segCb = cb || null;
      clearInterval(segTimer);
      segTimer = setInterval(() => {
        if ((segEnd != null && player.currentTime >= segEnd) || player.ended) { player.pause(); clearInterval(segTimer); segTimer = null; const c = segCb; segCb = null; if (c) c(true); }
      }, 40);
    };
    if (player.readyState >= 1) go(); else player.addEventListener("loadedmetadata", go, { once: true });
    return true;
  }
  function playSentence(id, s, cb) {
    if (s.t0 != null && AUDIO[id] && playSegment(id, s.t0, s.t1, cb)) return "audio";
    speak(s.en, { onend: () => cb && cb(true) });
    return "tts";
  }

  /* ---------------- 路由 ---------------- */
  const NAV = [
    ["#/", "🏠", "今日学习"], ["#/map", "🗺️", "学习地图"], ["#/lessons", "📚", "四册课程"],
    ["#/words", "⭐", "生词本"], ["#/files", "📂", "我的课文文件"], ["#/method", "🧭", "学习方法"], ["#/settings", "⚙️", "设置与计划"],
  ];
  function navHTML() {
    const h = location.hash || "#/";
    const on = (href) => (href === "#/" ? h === "#/" || h === "" : h.startsWith(href)) ? "on" : "";
    $("#nav").innerHTML = NAV.map(([href, ico, txt]) => `<a href="${href}" class="${on(href)}"><span class="ico">${ico}</span>${txt}</a>`).join("");
    $("#topbar").innerHTML = NAV.map(([href, ico, txt]) => `<a href="${href}" class="${on(href)}">${ico} ${txt}</a>`).join("");
    $("#sideFoot").innerHTML = `课文 ${Object.keys(TEXTS).length}/${TOTAL_UNITS} · 音频 ${Object.keys(AUDIO).length}/${TOTAL_UNITS}<br>连续学习 ${streak()} 天 🔥`;
  }
  function render() {
    stopAudio(); if (window.speechSynthesis) speechSynthesis.cancel();
    closePop();
    const parts = (location.hash || "#/").replace(/^#\//, "").split("/");
    navHTML();
    const main = $("#main");
    window.scrollTo(0, 0);
    if (parts[0] === "") main.innerHTML = viewHome();
    else if (parts[0] === "map") main.innerHTML = viewMap();
    else if (parts[0] === "lessons") main.innerHTML = viewLessons(+parts[1] || dominantBook(PLAN[currentDay() - 1]).b);
    else if (parts[0] === "lesson") { viewLesson(main, parts[1], parts[2] || "intro"); return; }
    else if (parts[0] === "day") { viewDay(main, +parts[1]); return; }
    else if (parts[0] === "words") { viewWords(main); return; }
    else if (parts[0] === "files") { viewFiles(main); return; }
    else if (parts[0] === "method") main.innerHTML = viewMethod();
    else if (parts[0] === "settings") { viewSettings(main); return; }
    else main.innerHTML = viewHome();
  }
  window.addEventListener("hashchange", render);

  /* ---------------- 首页 ---------------- */
  function viewHome() {
    const d = currentDay();
    const p = PLAN[d - 1];
    const bk = dominantBook(p);
    const planIds = PLAN.flatMap((x) => x.type === "learn" ? x.lessons : []);
    const doneLessons = planIds.filter(lessonDone).length;
    const doneDays = PLAN.filter((x) => x.type !== "free" && dayDone(x)).length;
    const noFiles = Object.keys(TEXTS).length === 0;
    const dueWords = Object.values(S.starred).filter((w) => (w.due || "") <= todayStr()).length;
    const mins = dayMinutes(p);
    const pct = planIds.length ? Math.round(doneLessons / planIds.length * 100) : 0;
    return `
      <div class="hero" style="--hc:${bk.hex}">
        <div class="deco">${bk.emoji}</div>
        <div class="row spread">
          <div>
            <div class="small" style="opacity:.9">${PLAN.length} 天学习计划 · ${S.plan.books.map((b) => BOOKS[b - 1].emoji + " " + BOOKS[b - 1].name).join("  ")}</div>
            <h1>第 ${d} 天 ${p.type === "review" ? "· 复习日" : p.type === "free" ? "· 自由复习" : ""}</h1>
            <div>${p.type === "learn" ? `今天学习：${rangeLabel(p.lessons)}（${p.lessons.length} 个单元）` : p.type === "review" ? `复习本轮学过的 ${p.lessons.length} 个单元：${rangeLabel(p.lessons)}` : "今天没有新课，复习生词本或挑一课跟读吧"}</div>
            <div class="small" style="opacity:.9;margin-top:4px">⏱️ 预计用时约 ${mins} 分钟</div>
          </div>
          <div class="stat"><span class="big">${pct}%</span><div class="small">计划完成度</div></div>
        </div>
        <div class="bar" style="margin-top:14px;background:rgba(255,255,255,.35)"><i style="width:${pct}%;background:#fff"></i></div>
      </div>
      ${avgMinutes() > 150 ? `<div class="note small" style="margin-top:12px">⚡ 当前计划平均每天约 <b>${(avgMinutes() / 60).toFixed(1)} 小时</b>，强度很大。如果每天时间不够，可以到 <a href="#/settings">设置与计划</a> 改成 60 / 90 / 120 天，或只选部分册数——进度不会丢。</div>` : ""}
      ${noFiles ? `<div class="card" style="margin-top:16px;border-left:6px solid var(--i2)">
        <h3>👋 第一步：导入你下载的新概念英语 1–4 册</h3>
        <p class="muted">程序会读取你电脑里（如“下载”文件夹）的 MP3 原声与 LRC / TXT / PDF 课文；课文原文、逐句原声和彩色分析都基于你自己的文件。</p>
        <a class="btn primary" href="#/files">📂 去导入文件</a>
      </div>` : ""}
      <h2>📌 今日任务</h2>
      ${p.type === "learn" ? `<div class="grid ${p.lessons.length > 4 ? "g3" : "g2"}">${p.lessons.map(taskCard).join("")}</div>` : p.type === "review" ? `<div class="grid g2">${reviewCard(p)}</div>` : `<div class="card">🌿 今天是自由日：去 <a href="#/words">生词本</a> 复习，或在 <a href="#/lessons">四册课程</a> 里挑一课做影子跟读。</div>`}
      <h2>📊 我的学习</h2>
      <div class="grid g4">
        <div class="card stat"><b>${doneLessons}</b><span class="muted small">已学完单元 / ${planIds.length}</span></div>
        <div class="card stat"><b>${doneDays}</b><span class="muted small">已完成天数 / ${PLAN.length}</span></div>
        <div class="card stat"><b>${streak()} 🔥</b><span class="muted small">连续学习天数</span></div>
        <a class="card stat" href="#/words" style="text-decoration:none;color:inherit"><b>${Object.keys(S.starred).length}</b><span class="muted small">生词本 · 今日待复习 ${dueWords}</span></a>
      </div>
      <h2>📖 四册进度</h2>
      <div class="grid g4">${BOOKS.map((B) => { const ls = LESSONS.filter((l) => l.b === B.b); const dn = ls.filter((l) => lessonDone(l.id)).length; return `
        <a class="lesson-card" style="--c:${B.hex}" href="#/lessons/${B.b}"><div class="row spread"><span class="n">${B.emoji} ${B.name}</span><span class="small muted">${dn}/${ls.length}</span></div>
        <div class="t" style="font-size:15px">${B.en}</div><div class="muted small">${B.island} · ${B.level}</div>
        <div class="bar" style="margin-top:8px"><i style="width:${dn / ls.length * 100}%;background:${B.hex}"></i></div></a>`; }).join("")}</div>
      <h2>🗓️ 本轮进度</h2>
      ${cycleBlock(Math.ceil(d / 5))}
    `;
  }
  function taskCard(id) {
    const l = LMAP[id], B = bookOf(l), st = lessonSteps(id);
    const next = STEPS.find((s) => !st[s.id]);
    return `<a class="task" style="--c:${B.hex}" href="#/lesson/${id}/${next ? next.id : "intro"}">
      <div class="num" style="font-size:${l.b === 1 ? 13 : 16}px;line-height:1.1;text-align:center">${l.b}册<br>${l.b === 1 ? l.n + "-" + (l.n + 1) : l.n}</div>
      <div style="flex:1;min-width:0">
        <div class="en" style="font-weight:700;font-size:16px">${esc(l.t)}</div>
        <div class="muted small">${esc(l.cn)} · ${next ? "下一步：" + next.icon + " " + next.name : "🎉 已全部完成"}</div>
        <div class="dots">${STEPS.map((s) => `<i class="${st[s.id] ? "on" : ""}" title="${s.name}"></i>`).join("")}</div>
      </div>
      <span class="chip ${lessonDone(id) ? "done" : ""}">${lessonDoneCount(id)}/6</span>
    </a>`;
  }
  function reviewCard(p) {
    const B = dominantBook(p);
    return `<a class="task" style="--c:${B.hex}" href="#/day/${p.day}">
      <div class="num">${B.emoji}</div>
      <div style="flex:1"><div style="font-weight:700">第 ${p.day / 5} 轮复习关卡</div>
      <div class="muted small">核心词回顾 + 综合测验 + 原文听写，复习 ${rangeLabel(p.lessons)}</div></div>
      <span class="chip ${S.reviewDone[p.day] ? "done" : ""}">${S.reviewDone[p.day] ? "已通关" : "去复习"}</span></a>`;
  }
  function dayHref(p) { return p.type === "review" ? "#/day/" + p.day : p.type === "learn" ? "#/lesson/" + (p.lessons.find((id) => !lessonDone(id)) || p.lessons[0]) : "#/words"; }
  function cycleBlock(k) {
    const today = currentDay();
    const days = PLAN.slice((k - 1) * 5, k * 5);
    if (!days.length) return "";
    const B = dominantBook(days[0]);
    return `<div class="island" style="--c:${B.hex}">
      <div class="island-head"><div class="island-emoji">${B.emoji}</div>
        <div><b style="font-size:17px">第 ${k} 轮 · D${days[0].day}–D${days[days.length - 1].day}</b><div class="muted small">${rangeLabel(days.flatMap((p) => p.type === "learn" ? p.lessons : [])) || "复习"}</div></div></div>
      <div class="days">${days.map((p) => { const DB = dominantBook(p); return `<a class="day ${p.day === today ? "today" : ""} ${p.type !== "free" && dayDone(p) ? "done" : ""} ${p.type !== "learn" ? "review" : ""}" style="--c:${DB.hex}" href="${dayHref(p)}">
        <b>D${p.day}</b>${p.type === "review" ? "复习" : p.type === "free" ? "自由" : esc(rangeLabel(p.lessons))}</a>`; }).join("")}</div>
    </div>`;
  }

  /* ---------------- 地图 ---------------- */
  function viewMap() {
    const cycles = Math.ceil(PLAN.length / 5);
    return `<h1>🗺️ 学习地图</h1>
      <p class="muted">共 ${PLAN.length} 天、${cycles} 轮；每轮 4 天学新课 + 1 天复习通关。今天是第 <b>${currentDay()}</b> 天（开始于 ${S.startDate}，平均每天约 ${avgMinutes()} 分钟）。颜色代表册数：</p>
      <div class="row" style="margin-bottom:14px">${BOOKS.filter((B) => S.plan.books.includes(B.b)).map((B) => `<span class="chip" style="background:${B.hex};color:#fff">${B.emoji} ${B.name} · ${B.island}</span>`).join("")}</div>
      <div class="grid g2">${Array.from({ length: cycles }, (_, i) => cycleBlock(i + 1)).join("")}</div>`;
  }

  /* ---------------- 课程列表 ---------------- */
  function viewLessons(b) {
    const B = BOOKS[b - 1] || BOOKS[0];
    const ls = LESSONS.filter((l) => l.b === B.b);
    return `<h1>📚 四册课程</h1>
      <div class="pill-tabs">${BOOKS.map((X) => `<button onclick="location.hash='#/lessons/${X.b}'" class="${X.b === B.b ? "on" : ""}" style="--c:${X.hex}">${X.emoji} ${X.name}</button>`).join("")}</div>
      <div class="note small" style="border-left:5px solid ${B.hex}"><b>${B.name} · ${B.en}</b>（${B.island}）—— ${B.level}。共 ${ls.length} 个单元${B.b === 1 ? "（每单元 = 单数课课文 + 双数课句型练习）" : ""}。🎧 = 已关联原声，📄 = 已导入原文。</div>
      <div class="grid g3" style="margin-top:14px">${ls.map((l) => `
        <a class="lesson-card" style="--c:${B.hex}" href="#/lesson/${l.id}">
          <div class="row spread"><span class="n">${l.label.toUpperCase()}</span><span class="small">${AUDIO[l.id] ? "🎧" : ""}${TEXTS[l.id] ? "📄" : ""}${lessonDone(l.id) ? " ✅" : ""}</span></div>
          <div class="t">${esc(l.t)}</div><div class="muted small">${esc(l.cn)}</div>
          <div class="dots">${STEPS.map((s) => `<i class="${lessonSteps(l.id)[s.id] ? "on" : ""}"></i>`).join("")}</div>
        </a>`).join("")}</div>`;
  }

  /* ---------------- 课程页 ---------------- */
  function viewLesson(main, id, tab) {
    const l = LMAP[id];
    if (!l) { location.hash = "#/lessons"; return; }
    const B = bookOf(l), st = lessonSteps(id);
    const prev = LESSONS[l.idx - 1], next = LESSONS[l.idx + 1];
    const hasText = contentSents(id).length > 0;
    main.innerHTML = `
      <div class="lesson-head" style="--c:${B.hex}">
        <div class="row spread">
          <div><div class="small" style="opacity:.9">${B.emoji} ${B.name} · ${B.island} · ${l.label.toUpperCase()}</div>
            <h1>${esc(l.t)}</h1><div>${esc(l.cn)}</div></div>
          <div class="row">
            ${prev ? `<a class="btn sm" style="background:rgba(255,255,255,.25);color:#fff" href="#/lesson/${prev.id}">← 上一课</a>` : ""}
            ${next ? `<a class="btn sm" style="background:rgba(255,255,255,.25);color:#fff" href="#/lesson/${next.id}">下一课 →</a>` : ""}
          </div>
        </div>
        <div class="small" style="margin-top:8px;opacity:.95">${AUDIO[id] ? "🎧 原声已关联" : "🎧 未关联原声（将用英式 TTS 朗读）"} · ${hasText ? `📄 原文 ${contentSents(id).length} 句（来自 ${esc(TEXTS[id].file || "粘贴")}）` : "📄 尚未导入原文"}</div>
      </div>
      <div class="pill-tabs" style="--c:${B.hex}">
        ${STEPS.map((s, i) => `<button data-tab="${s.id}" class="${tab === s.id ? "on" : ""}">${i + 1}. ${s.icon} ${s.name} ${st[s.id] ? '<span class="ok">✔</span>' : ""}</button>`).join("")}
      </div>
      <div id="tabBody"></div>`;
    $$(".pill-tabs button", main).forEach((b) => b.onclick = () => { location.hash = `#/lesson/${id}/${b.dataset.tab}`; });
    const fn = { intro: tabIntro, words: tabWords, read: tabRead, grammar: tabGrammar, shadow: tabShadow, quiz: tabQuiz }[tab] || tabIntro;
    fn($("#tabBody"), id, l, B);
  }
  function doneBar(id, step, label, B) {
    const st = lessonSteps(id);
    const next = STEPS[STEPS.findIndex((s) => s.id === step) + 1];
    const nl = LESSONS[LMAP[id].idx + 1];
    return `<div class="row" style="margin-top:22px">
      <button class="btn ${st[step] ? "" : "primary"}" data-done="${step}" style="${st[step] ? "" : `background:${B.hex}`}">${st[step] ? "✔ 已完成本步" : "✅ " + label}</button>
      ${next ? `<a class="btn ghost" href="#/lesson/${id}/${next.id}">下一步：${next.icon} ${next.name} →</a>` : (nl ? `<a class="btn ghost" href="#/lesson/${nl.id}">进入下一课 →</a>` : "")}
    </div>`;
  }
  function bindDone(body, id) {
    $$("[data-done]", body).forEach((b) => b.onclick = () => { completeStep(id, b.dataset.done); const next = STEPS[STEPS.findIndex((s) => s.id === b.dataset.done) + 1]; if (next) location.hash = `#/lesson/${id}/${next.id}`; else render(); });
  }
  function needText(l) {
    return `<div class="card" style="border-left:6px solid var(--i2)">
      <h3>📄 这一步需要课文原文</h3>
      <p class="muted">请先在「我的课文文件」里导入你下载的新概念英语（LRC / TXT / PDF），或者直接把本课课文粘贴到下面：</p>
      <textarea id="pasteBox" placeholder="把${lessonTitle(l)}的英文课文粘贴到这里（可以带中文译文，程序会自动分开）"></textarea>
      <div class="row" style="margin-top:10px"><button class="btn primary" id="pasteOk">保存课文</button><a class="btn ghost" href="#/files">📂 导入整个文件夹</a></div>
    </div>`;
  }
  function bindPaste(id) {
    const b = $("#pasteOk"); if (!b) return;
    b.onclick = () => {
      const t = $("#pasteBox").value.trim();
      if (!/[A-Za-z]{3,}/.test(t)) { toast("没有识别到英文内容"); return; }
      const p = Parser.parsePlainLesson(t, id);
      TEXTS[id] = { ...p, source: "paste", file: "粘贴" };
      saveTexts(); toast(`已保存 ${p.sents.length} 句`); render();
    };
  }

  /* 1 导读盲听 */
  function tabIntro(body, id, l, B) {
    const t = TEXTS[id];
    body.innerHTML = `
      <div class="grid g2">
        <div class="card"><h3>🎧 第一遍：盲听（不看原文）</h3>
          <p class="muted small">先别看课文！带着问题完整听一遍，能听懂多少算多少，这是检验进步的“起点”。</p>
          <div class="note"><b>🤔 听前问题：</b>${esc(l.q)}</div>
          <div style="margin-top:12px">
          ${AUDIO[id] ? `<audio controls preload="metadata" src="${audioFor(id)}" style="width:100%"></audio>` :
            (contentSents(id).length ? `<button class="btn dark" id="ttsAll">🔊 用英式发音朗读全文</button><div class="muted small" style="margin-top:6px">未关联原声 MP3，将使用电脑的英式语音。</div>` : `<div class="muted">尚未导入音频与课文。<a href="#/files">去导入</a></div>`)}
          </div>
        </div>
        <div class="card"><h3>📖 课文导读（通俗版）</h3><p>${esc(l.sum)}</p>
          <div class="note small"><b>🧭 读法建议：</b>${esc(l.bg)}</div></div>
      </div>
      <div class="grid g2" style="margin-top:16px">
        <div class="card"><h3>🇬🇧 英音提示</h3><p>${esc(l.tip)}</p>
          <p class="muted small">英式发音（RP）三大特点：① 非卷舌：car /kɑː/，r 不发音；② not、hot 的 o 读短圆唇 /ɒ/；③ go、home 读 /əʊ/。</p></div>
        <div class="card"><h3>🧩 本课语法重点</h3>${l.g.map((gid) => { const g = Grammar.byId[gid]; return g ? `<div class="gtag" style="--k:${g.color}"><b>${g.name}</b><div class="small">${esc(g.desc)}</div></div>` : ""; }).join("")}</div>
      </div>
      ${t && t.cnText ? `<div class="card" style="margin-top:16px"><h3>🀄 你文件中的参考译文</h3><details><summary class="muted">听完、读完再展开看</summary><p style="white-space:pre-wrap">${esc(t.cnText)}</p></details></div>` : ""}
      ${S.settings.apiKey && contentSents(id).length ? `<div class="card" style="margin-top:16px"><h3>🤖 AI 老师导读</h3><p class="muted small">让 AI 老师结合你的课文原文，用通俗中文讲讲全文结构和难点。</p><button class="btn" id="aiLesson">生成本课导读</button><div id="aiLessonOut" style="margin-top:10px"></div></div>` : ""}
      ${doneBar(id, "intro", "我已盲听并读完导读", B)}`;
    const tts = $("#ttsAll");
    if (tts) tts.onclick = () => speak(contentSents(id).map((s) => s.en).join(" "));
    const ai = $("#aiLesson");
    if (ai) ai.onclick = () => aiExplainLesson(id, $("#aiLessonOut"));
    bindDone(body, id);
  }

  /* 2 英音词汇 */
  function tabWords(body, id, l, B) {
    body.innerHTML = `
      <div class="row spread"><p class="muted" style="margin:0">点 🔊 听英式发音，跟读 3 遍；黄色高亮是它在你课文原文中的位置。点 ☆ 加入生词本。</p>
        <div class="row"><button class="btn sm" id="playAllW">🔊 连续朗读</button><button class="btn sm" id="starAll">☆ 全部加入生词本</button></div></div>
      <div class="grid g3" style="margin-top:12px">${l.words.map((w, i) => {
        const ex = exampleFor(w, id);
        return `<div class="word-card" style="--c:${B.hex}">
          <div class="row spread"><span class="w">${esc(w.w)}</span>
            <span><button class="icon-btn" data-say="${esc(w.w)}" title="英式发音">🔊</button>
            <button class="star" data-star="${i}" title="加入生词本">${S.starred[w.w] ? "⭐" : "☆"}</button></span></div>
          <div class="ipa">/${esc(w.ipa)}/ <span class="chip">英</span></div>
          <div>${esc(w.cn)}</div>
          ${ex ? `<div class="example">${markWord(ex, w.w)} <button class="icon-btn" style="display:inline-grid;width:24px;height:24px;font-size:11px" data-say="${esc(ex)}">🔊</button></div>` : (contentSents(id).length ? "" : `<div class="example small">导入原文后显示课文例句</div>`)}
        </div>`; }).join("")}</div>
      ${doneBar(id, "words", "这些词我会读、会认了", B)}`;
    $$("[data-say]", body).forEach((b) => b.onclick = () => speak(b.dataset.say));
    $$("[data-star]", body).forEach((b) => b.onclick = () => { toggleStar(l.words[+b.dataset.star]); b.textContent = S.starred[l.words[+b.dataset.star].w] ? "⭐" : "☆"; });
    $("#starAll").onclick = () => { l.words.forEach((w) => { if (!S.starred[w.w]) toggleStar(w, true); }); save(); render(); };
    $("#playAllW").onclick = () => {
      let i = 0;
      const next = () => { if (i >= l.words.length || !location.hash.includes("/words")) return; speak(l.words[i].w, { onend: () => setTimeout(next, 900) }); i++; };
      next();
    };
    bindDone(body, id);
  }
  function toggleStar(w, silent) {
    if (S.starred[w.w]) delete S.starred[w.w];
    else S.starred[w.w] = { w: w.w, ipa: w.ipa, cn: w.cn, id: w.id, b: w.b, box: 0, due: todayStr() };
    if (!silent) { save(); toast(S.starred[w.w] ? `⭐ 已加入生词本：${w.w}` : `已移出生词本：${w.w}`); }
  }

  /* 3 逐句精读 */
  function tabRead(body, id, l, B) {
    const sents = lessonSents(id);
    if (!contentSents(id).length) { body.innerHTML = needText(l); bindPaste(id); return; }
    let showCn = S.settings.showCn;
    const hasAudio = !!AUDIO[id];
    body.innerHTML = `
      <div class="row spread" style="margin-bottom:10px">
        <div class="legend">
          <span style="--k:var(--a-conj)">连接词/从句引导词</span><span style="--k:var(--a-verb)">谓语动词</span>
          <span style="--k:var(--a-nonf)">非谓语 (to do / doing / done)</span><span style="--k:var(--a-prep)">介词</span><span style="--k:var(--a-vocab)">本课重点词</span>
        </div>
        <div class="row">
          <button class="btn sm" id="toggleCn">${showCn ? "隐藏" : "显示"}中文</button>
          <button class="btn sm" id="playAll">▶ ${hasAudio ? "连续播放原声" : "英音连读"}</button>
          <select id="aRate" style="width:auto">${[0.7, 0.8, 0.9, 1, 1.1, 1.25].map((r) => `<option value="${r}" ${r == (S.settings.audioRate || 1) ? "selected" : ""}>${r}x</option>`).join("")}</select>
        </div>
      </div>
      <div class="reader">
        <div class="card" id="sentList">${sents.map((s) => `
          <div class="sent ${s.meta ? "meta" : ""}" data-i="${s.i}">
            <div class="idx">${s.meta ? "" : s.i + 1}</div>
            <div style="flex:1;min-width:0"><div class="en">${esc(s.en)}</div>${s.cn ? `<div class="cn ${showCn ? "" : "hidden"}">${esc(s.cn)}</div>` : ""}</div>
            <div class="tools">
              <button class="icon-btn" data-play="${s.i}" title="${s.t0 != null && hasAudio ? "播放原声" : "英式朗读"}">${s.t0 != null && hasAudio ? "▶" : "🔊"}</button>
              ${s.t0 != null && hasAudio ? `<button class="icon-btn" data-tts="${s.i}" title="英式 TTS 慢读">🐢</button>` : ""}
            </div>
          </div>`).join("")}</div>
        <div class="card panel" id="anaPanel"></div>
      </div>
      ${doneBar(id, "read", "全文逐句精读完毕", B)}`;
    $("#toggleCn").onclick = () => { S.settings.showCn = !S.settings.showCn; save(); showCn = S.settings.showCn; $$(".sent .cn", body).forEach((e) => e.classList.toggle("hidden", !showCn)); $("#toggleCn").textContent = (showCn ? "隐藏" : "显示") + "中文"; };
    $("#aRate").onchange = (e) => { S.settings.audioRate = +e.target.value; save(); player.playbackRate = S.settings.audioRate; };
    const highlight = (i) => { $$(".sent", body).forEach((e) => e.classList.toggle("playing", +e.dataset.i === i)); };
    $$("[data-play]", body).forEach((b) => b.onclick = (e) => { e.stopPropagation(); const s = sents[+b.dataset.play]; highlight(s.i); playSentence(id, s, () => highlight(-1)); });
    $$("[data-tts]", body).forEach((b) => b.onclick = (e) => { e.stopPropagation(); speak(sents[+b.dataset.tts].en, { rate: 0.75 }); });
    $$(".sent", body).forEach((el) => el.onclick = () => {
      $$(".sent", body).forEach((e) => e.classList.remove("on")); el.classList.add("on");
      analyzeInto($("#anaPanel"), id, sents[+el.dataset.i], sents);
    });
    $("#playAll").onclick = () => {
      let i = 0;
      const next = () => {
        if (!location.hash.includes("/read")) return;
        while (i < sents.length && !sents[i].en) i++;
        if (i >= sents.length) { highlight(-1); return; }
        const s = sents[i++]; highlight(s.i);
        const el = $(`.sent[data-i="${s.i}"]`, body); if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        playSentence(id, s, (ok) => { if (ok) setTimeout(next, hasAudio && s.t0 != null ? 150 : 400); });
      };
      next();
    };
    const first = contentSents(id)[0];
    const el = $(`.sent[data-i="${first.i}"]`, body); el.classList.add("on");
    analyzeInto($("#anaPanel"), id, first, sents);
    bindDone(body, id);
  }

  const CHUNK_COLORS = ["var(--i1)", "var(--i2)", "var(--i3)", "var(--i4)", "var(--i5)", "var(--i6)"];
  function analyzeInto(panel, id, s, sents) {
    const l = LMAP[id];
    const toks = Grammar.colorize(s.en, l.words);
    const tags = Grammar.tags(s.en, l.b);
    const ch = Grammar.chunks(s.en);
    const tr = Grammar.trunk(s.en);
    const dif = Grammar.difficulty(s.en);
    const vocabHere = [];
    toks.forEach((t) => { if (t.vocab && !vocabHere.includes(t.vocab)) vocabHere.push(t.vocab); });
    const cacheKey = "s:" + id + ":" + s.en;
    const hasAudio = s.t0 != null && AUDIO[id];
    panel.innerHTML = `
      <div class="row spread"><h3 style="margin:0">🔍 第 ${s.i + 1} 句</h3>
        <span class="chip">${dif.words} 词 · ${["", "⭐ 简单", "⭐⭐ 中等", "⭐⭐⭐ 长难句"][dif.level]}</span></div>
      <div class="colored" style="margin-top:8px">${toks.map((t) => t.w ? `<span class="tk ${t.cls} ${t.vocab ? "vocab" : ""}" data-w="${esc(t.t)}" title="${esc(t.tip || "")}">${esc(t.t)}</span>` : esc(t.t)).join("")}</div>
      <div class="row" style="margin:6px 0 4px">
        <button class="btn sm" id="pPlay">${hasAudio ? "▶ 原声" : "🔊 英音"}</button>
        <button class="btn sm" id="pSlow">🐢 英音慢读</button>
        <button class="btn sm" id="pLoop">🔁 循环 3 遍</button>
      </div>
      ${s.cn ? `<div class="note small" style="margin-top:8px"><b>译文：</b>${esc(s.cn)}</div>` : ""}
      <h3 style="margin-top:14px">🫧 意群切分 <span class="muted small">（按块停顿朗读，点击单块发音）</span></h3>
      <div class="chunks">${ch.map((c, i) => `<span style="--cc:${CHUNK_COLORS[i % 6]}" data-chunk="${esc(c)}">${esc(c)}</span>`).join("")}</div>
      ${tr ? `<h3 style="margin-top:14px">🦴 主干提示 <span class="muted small">（自动去掉修饰成分，仅供参考）</span></h3><div class="en" style="font-size:16px">${esc(tr)}</div>` : ""}
      <h3 style="margin-top:14px">🧩 语法点</h3>
      ${tags.length ? tags.map((g) => `<div class="gtag" style="--k:${g.color}"><b>${g.name}</b><div class="small">${esc(g.desc)}</div><div class="small muted">读法：${esc(g.how)}</div></div>`).join("") : `<div class="muted small">这句结构比较简单：主语 + 谓语 + 宾语/表语，直接顺读即可。</div>`}
      ${vocabHere.length ? `<h3 style="margin-top:14px">🔤 本句重点词</h3>${vocabHere.map((v) => `<div class="row" style="gap:6px"><b class="en">${esc(v.w)}</b><span class="ipa">/${esc(v.ipa)}/</span><span class="small">${esc(v.cn)}</span><button class="icon-btn" data-sayw="${esc(v.w)}">🔊</button></div>`).join("")}` : ""}
      <p class="muted small" style="margin-top:10px">👆 点击上面彩色句子中的任何单词，可查看英式发音与释义。</p>
      <h3 style="margin-top:14px">🤖 AI 老师精讲</h3>
      <div id="aiOut">${AI_CACHE[cacheKey] ? renderMd(AI_CACHE[cacheKey]) : (S.settings.apiKey ? `<button class="btn" id="aiBtn" style="background:var(--i6);color:#fff">请 AI 老师用中文讲解这句</button>` : `<div class="muted small">在「设置与计划」里填写 Claude API Key 后，可让 AI 老师逐句讲解：译文、主干、结构拆解、英式发音要点。</div>`)}</div>`;
    $("#pPlay", panel).onclick = () => playSentence(id, s);
    $("#pSlow", panel).onclick = () => speak(s.en, { rate: 0.72 });
    $("#pLoop", panel).onclick = () => { let k = 0; const go = () => { if (k++ < 3) playSentence(id, s, (ok) => ok && setTimeout(go, 600)); }; go(); };
    $$("[data-chunk]", panel).forEach((e) => e.onclick = () => speak(e.dataset.chunk, { rate: 0.8 }));
    $$("[data-sayw]", panel).forEach((e) => e.onclick = () => speak(e.dataset.sayw));
    $$(".tk", panel).forEach((e) => e.onclick = (ev) => showPop(e.dataset.w, ev));
    const ai = $("#aiBtn", panel);
    if (ai) ai.onclick = () => aiExplainSentence(id, s, sents, $("#aiOut", panel), cacheKey);
  }

  /* 单词浮层 */
  function closePop() { const p = $(".pop"); if (p) p.remove(); }
  document.addEventListener("click", (e) => { if (!e.target.closest(".pop") && !e.target.closest(".tk")) closePop(); });
  function showPop(word, ev) {
    closePop();
    const clean = word.replace(/[’']s$/, "").replace(/[^A-Za-z'-]/g, "");
    const v = findWord(clean);
    const p = document.createElement("div");
    p.className = "pop";
    p.innerHTML = `<div class="row spread"><span class="w">${esc(clean)}</span><button class="icon-btn" id="popSay">🔊</button></div>
      ${v ? `<div class="ipa">/${esc(v.ipa)}/ <span class="chip">英</span></div><div>${esc(v.cn)}</div><div class="muted small">${lessonTitle(LMAP[v.id])} 重点词：${esc(v.w)}</div>` : `<div class="muted small">本词不在课程词表中。可以听英式发音，或查英式词典：</div>`}
      <div class="row" style="margin-top:8px">
        <a class="btn sm" target="_blank" rel="noopener" href="https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${encodeURIComponent(clean.toLowerCase())}">剑桥词典(英音)</a>
        <a class="btn sm" target="_blank" rel="noopener" href="https://www.youdao.com/result?word=${encodeURIComponent(clean.toLowerCase())}&lang=en">有道</a>
        ${v ? `<button class="btn sm" id="popStar">${S.starred[v.w] ? "⭐ 已收藏" : "☆ 收藏"}</button>` : ""}
      </div>`;
    document.body.appendChild(p);
    const x = Math.min(window.innerWidth - 316, Math.max(8, ev.clientX - 150));
    const y = ev.clientY + 16 + 220 > window.innerHeight ? ev.clientY - 230 : ev.clientY + 16;
    p.style.left = x + "px"; p.style.top = Math.max(8, y) + "px";
    $("#popSay", p).onclick = () => speak(clean);
    const st = $("#popStar", p); if (st) st.onclick = () => { toggleStar(v); st.textContent = S.starred[v.w] ? "⭐ 已收藏" : "☆ 收藏"; };
    speak(clean);
  }

  /* 4 语法透视 */
  function tabGrammar(body, id, l, B) {
    const sents = contentSents(id);
    if (!sents.length) { body.innerHTML = needText(l); bindPaste(id); return; }
    const found = Grammar.list.map((g) => ({ g, hits: sents.filter((s) => Grammar.tags(s.en, l.b).includes(g)) })).filter((x) => x.hits.length);
    found.sort((a, b) => (l.g.includes(b.g.id) - l.g.includes(a.g.id)) || b.hits.length - a.hits.length);
    const longest = sents.slice().sort((a, b) => Grammar.difficulty(b.en).words - Grammar.difficulty(a.en).words).slice(0, 3);
    body.innerHTML = `
      <p class="muted">程序自动扫描了本课原文，列出出现的语法现象和原文例句。⭐ 是本课重点。点击例句可以听英音。</p>
      <div class="grid g2">${found.map(({ g, hits }) => `
        <div class="card" style="border-top:5px solid ${g.color}">
          <div class="row spread"><h3 style="color:${g.color};margin:0">${l.g.includes(g.id) ? "⭐ " : ""}${g.name}</h3><span class="chip">原文 ${hits.length} 处</span></div>
          <p class="small" style="margin:6px 0">${esc(g.desc)}</p>
          <div class="note small">🗝️ 读法：${esc(g.how)}<br>📝 例：${esc(g.ex)}</div>
          <details style="margin-top:8px" ${l.g.includes(g.id) ? "open" : ""}><summary class="small muted">本课原文例句</summary>
            ${hits.slice(0, 4).map((s) => `<div class="example" style="cursor:pointer" data-s="${s.i}">▸ ${esc(s.en)}</div>`).join("")}
          </details>
        </div>`).join("")}</div>
      <h2>🏔️ 本课最长的 3 个句子（长难句攻坚）</h2>
      <div class="grid">${longest.map((s) => `<div class="card"><div class="en" style="font-size:16px">${esc(s.en)}</div>
        <div class="chunks" style="margin-top:8px">${Grammar.chunks(s.en).map((c, i) => `<span style="--cc:${CHUNK_COLORS[i % 6]}">${esc(c)}</span>`).join("")}</div>
        ${Grammar.trunk(s.en) ? `<div class="small" style="margin-top:6px">🦴 主干：<span class="en">${esc(Grammar.trunk(s.en))}</span></div>` : ""}
        <a class="small" href="#/lesson/${id}/read">到精读页查看彩色分析 →</a></div>`).join("")}</div>
      ${doneBar(id, "grammar", "本课语法我看懂了", B)}`;
    $$("[data-s]", body).forEach((e) => e.onclick = () => playSentence(id, lessonSents(id)[+e.dataset.s]));
    bindDone(body, id);
  }

  /* 5 影子跟读 */
  function tabShadow(body, id, l, B) {
    const sents = contentSents(id);
    if (!sents.length) { body.innerHTML = needText(l); bindPaste(id); return; }
    let idx = 0, recorder = null, recUrl = null, auto = false;
    const canRec = !!(navigator.mediaDevices && window.MediaRecorder);
    body.innerHTML = `
      <div class="card">
        <div class="row spread"><span class="chip" id="shIdx"></span>
          <label class="row small"><input type="checkbox" id="shChunk"> 按意群逐块跟读</label></div>
        <div class="shadow-sent" id="shSent"></div>
        <div class="muted small" style="text-align:center" id="shCn"></div>
        <div class="big-btns" style="margin-top:14px">
          <button class="btn" id="shPrev">⏮ 上一句</button>
          <button class="btn dark" id="shPlay">▶ 听原句</button>
          <button class="btn" id="shRec" ${canRec ? "" : "disabled"}>🎙️ 录我的跟读</button>
          <button class="btn" id="shMine" disabled>🔈 听我的录音</button>
          <button class="btn" id="shNext">下一句 ⏭</button>
        </div>
        <div class="row" style="justify-content:center;margin-top:14px">
          <button class="btn primary" id="shAuto" style="background:${B.hex}">🔁 自动跟读模式</button>
          <span class="muted small">（播放一句 → 留出时间让你跟读 → 自动下一句）</span>
        </div>
        ${canRec ? "" : `<p class="muted small" style="text-align:center">当前浏览器不支持录音，可以只跟读不录音。</p>`}
      </div>
      <div class="note small" style="margin-top:14px">🗣️ <b>影子跟读法</b>：像影子一样紧跟原声，晚半拍模仿。重点模仿英音的 <b>重音、连读、弱读和语调</b>：
      如 <span class="en">and</span> 常弱读成 /ən/，<span class="en">of</span> 弱读成 /əv/，词尾辅音 + 元音开头要连读（<span class="en">an_old_man</span>）。每句至少跟读 3 遍，录音对比原声找差距。</div>
      ${doneBar(id, "shadow", "我已跟读完全文", B)}`;
    const show = () => {
      const s = sents[idx];
      $("#shIdx").textContent = `第 ${idx + 1} / ${sents.length} 句`;
      $("#shSent").innerHTML = $("#shChunk").checked ? Grammar.chunks(s.en).map((c) => `<span style="white-space:nowrap">${esc(c)}</span>`).join(' <span class="muted">/</span> ') : esc(s.en);
      $("#shCn").textContent = s.cn || "";
      $("#shMine").disabled = true; recUrl = null;
    };
    const playCur = (cb) => {
      const s = sents[idx];
      if ($("#shChunk").checked && !(AUDIO[id] && s.t0 != null)) {
        const cs = Grammar.chunks(s.en); let k = 0;
        const go = () => { if (k < cs.length) speak(cs[k++], { rate: 0.85, onend: () => setTimeout(go, 1200) }); else cb && cb(); };
        go();
      } else playSentence(id, s, () => cb && cb());
    };
    $("#shChunk").onchange = show;
    $("#shPrev").onclick = () => { auto = false; if (idx > 0) { idx--; show(); } };
    $("#shNext").onclick = () => { auto = false; if (idx < sents.length - 1) { idx++; show(); } };
    $("#shPlay").onclick = () => { auto = false; playCur(); };
    $("#shRec").onclick = async () => {
      const btn = $("#shRec");
      if (recorder && recorder.state === "recording") { recorder.stop(); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const chunks = [];
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          recUrl = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
          btn.classList.remove("rec-on"); btn.textContent = "🎙️ 重新录音"; $("#shMine").disabled = false;
          new Audio(recUrl).play();
        };
        recorder.start(); btn.classList.add("rec-on"); btn.textContent = "⏹ 停止录音"; markStudy();
      } catch (e) { toast("无法使用麦克风：" + e.message); }
    };
    $("#shMine").onclick = () => { if (recUrl) new Audio(recUrl).play(); };
    $("#shAuto").onclick = () => {
      auto = !auto;
      $("#shAuto").textContent = auto ? "⏸ 停止自动跟读" : "🔁 自动跟读模式";
      const loop = () => {
        if (!auto || !location.hash.includes("/shadow")) return;
        const s = sents[idx];
        const t0 = Date.now();
        playCur(() => {
          const dur = (s.t0 != null && s.t1 != null && AUDIO[id]) ? (s.t1 - s.t0) * 1000 : Math.max(1500, Date.now() - t0);
          setTimeout(() => { if (!auto) return; if (idx < sents.length - 1) { idx++; show(); loop(); } else { auto = false; $("#shAuto").textContent = "🔁 自动跟读模式"; toast("🎉 全文跟读完成！"); } }, dur * 1.3 + 600);
        });
      };
      if (auto) loop(); else stopAudio();
    };
    show();
    bindDone(body, id);
  }

  /* 6 闯关测验 */
  function buildQuiz(ids, count) {
    const pool = ids.flatMap((id) => LMAP[id].words);
    const books = new Set(ids.map((id) => LMAP[id].b));
    const sameLevel = allWords.filter((x) => books.has(x.b));
    const others = (w) => shuffle(sameLevel.filter((x) => x.w !== w.w && x.cn !== w.cn));
    const qs = [];
    shuffle(pool).slice(0, Math.ceil(count * 0.4)).forEach((w) => {
      qs.push({ type: "meaning", prompt: `<span class="en" style="font-size:20px;font-weight:700">${esc(w.w)}</span> <span class="ipa">/${esc(w.ipa)}/</span>`, say: w.w, answer: w.cn, opts: shuffle([w.cn, ...others(w).slice(0, 3).map((x) => x.cn)]) });
    });
    shuffle(pool).slice(0, Math.ceil(count * 0.2)).forEach((w) => {
      qs.push({ type: "listen", prompt: "🎧 点 🔊 听英式发音，选出你听到的单词", say: w.w, answer: w.w, opts: shuffle([w.w, ...others(w).slice(0, 3).map((x) => x.w)]) });
    });
    const cloze = [];
    ids.forEach((id) => contentSents(id).forEach((s) => {
      LMAP[id].words.forEach((w) => {
        if (w.w.includes(" ")) return;
        const fs = Grammar.forms(w.w);
        const hit = Grammar.wordsOf(s.en).find((x) => fs.has(x.toLowerCase()));
        if (hit && Grammar.wordsOf(s.en).length <= 40) cloze.push({ s, w, hit });
      });
    }));
    shuffle(cloze).slice(0, Math.ceil(count * 0.3)).forEach(({ s, w, hit }) => {
      const blanked = esc(s.en).replace(new RegExp("\\b" + hit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b"), "<b>______</b>");
      qs.push({ type: "cloze", prompt: `<div class="en" style="font-size:16px">${blanked}</div><div class="muted small">（原文填空，选出空格处的单词）</div>`, answer: hit, opts: shuffle([hit, ...others(w).filter((x) => !x.w.includes(" ")).slice(0, 3).map((x) => x.w)]) });
    });
    const dict = ids.flatMap((id) => contentSents(id).filter((s) => { const k = Grammar.wordsOf(s.en).length; return k >= 4 && k <= 16; }).map((s) => ({ id, s })));
    shuffle(dict).slice(0, Math.max(1, Math.floor(count * 0.1))).forEach(({ id, s }) => qs.push({ type: "dictation", id, s, prompt: "✍️ 原文听写：点 🔊 听句子，写下整句话" }));
    return shuffle(qs).slice(0, count + 1);
  }
  function quizHTML(qs) {
    return qs.map((q, i) => `<div class="card q" data-q="${i}">
      <div class="row spread"><b>第 ${i + 1} 题</b>${q.say || q.type === "dictation" ? `<button class="icon-btn" data-qsay="${i}">🔊</button>` : ""}</div>
      <div style="margin-top:6px">${q.prompt}</div>
      ${q.type === "dictation" ? `<input type="text" data-dict="${i}" placeholder="边听边输入，可以反复播放" style="margin-top:8px" autocomplete="off" spellcheck="false"><div class="row" style="margin-top:8px"><button class="btn sm" data-check="${i}">检查</button></div><div class="diff small" data-res="${i}" style="margin-top:6px"></div>` :
        `<div class="opts">${q.opts.map((o) => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div>`}
    </div>`).join("");
  }
  function bindQuiz(root, qs, onFinish) {
    const answered = new Set(); let right = 0;
    const finish = () => { if (answered.size === qs.length) onFinish(Math.round(right / qs.length * 100)); };
    $$("[data-qsay]", root).forEach((b) => b.onclick = () => { const q = qs[+b.dataset.qsay]; if (q.type === "dictation") playSentence(q.id, q.s); else speak(q.say); });
    $$(".q", root).forEach((card) => {
      const i = +card.dataset.q, q = qs[i];
      $$(".opt", card).forEach((b) => b.onclick = () => {
        if (answered.has(i)) return;
        answered.add(i);
        const ok = b.dataset.o === q.answer;
        if (ok) right++;
        b.classList.add(ok ? "right" : "wrong");
        if (!ok) $$(".opt", card).find((x) => x.dataset.o === q.answer).classList.add("right");
        if (q.type === "cloze" || q.type === "listen") speak(q.answer);
        finish();
      });
      const chk = $("[data-check]", card);
      if (chk) chk.onclick = () => {
        const typed = Grammar.wordsOf($("[data-dict]", card).value.toLowerCase());
        const target = Grammar.wordsOf(q.s.en);
        const bag = typed.slice();
        let hit = 0;
        const html = target.map((w) => { const k = bag.indexOf(w.toLowerCase()); if (k >= 0) { bag.splice(k, 1); hit++; return `<span class="hit">${esc(w)}</span>`; } return `<span class="miss">${esc(w)}</span>`; }).join(" ");
        const pct = Math.round(hit / target.length * 100);
        $("[data-res]", card).innerHTML = `${html}<br><b>${pct}%</b> ${pct >= 80 ? "👍 很棒！" : "再听几遍试试"}<br><span class="en">${esc(q.s.en)}</span>`;
        if (!answered.has(i)) { answered.add(i); if (pct >= 80) right++; finish(); }
      };
    });
  }
  function tabQuiz(body, id, l, B) {
    const qs = buildQuiz([id], 10);
    body.innerHTML = `<div class="row spread"><p class="muted" style="margin:0">词义、听音、原文填空、听写综合测验。全部答完会记录成绩（最好成绩：${S.quiz[id] != null ? S.quiz[id] + "%" : "暂无"}），60 分过关。</p>
      <button class="btn sm" id="reQuiz">🔄 换一套题</button></div>
      ${contentSents(id).length ? "" : `<div class="note small" style="margin-top:8px">导入课文原文后会增加“原文填空”和“听写”题。</div>`}
      <div style="margin-top:12px">${quizHTML(qs)}</div><div id="qResult"></div>
      ${doneBar(id, "quiz", "完成测验", B)}`;
    bindQuiz(body, qs, (score) => {
      S.quiz[id] = Math.max(S.quiz[id] || 0, score); save();
      $("#qResult").innerHTML = `<div class="card" style="text-align:center;margin-top:10px"><div style="font-size:42px">${score >= 90 ? "🏆" : score >= 70 ? "🎉" : "💪"}</div><h2 style="margin:4px">得分 ${score}%</h2><p class="muted">${score >= 60 ? "闯关成功！" : "建议回到“词汇”和“精读”再巩固一下。"}</p></div>`;
      if (score >= 60) completeStep(id, "quiz");
    });
    $("#reQuiz").onclick = () => render();
    bindDone(body, id);
  }

  /* ---------------- 复习日 ---------------- */
  function viewDay(main, d) {
    const p = PLAN[d - 1];
    if (!p) { location.hash = "#/map"; return; }
    if (p.type === "learn") { location.hash = dayHref(p); return; }
    if (p.type === "free") { location.hash = "#/words"; return; }
    const B = dominantBook(p);
    const qs = buildQuiz(p.lessons, 15);
    const words = shuffle(p.lessons.flatMap((id) => LMAP[id].words)).slice(0, 120);
    main.innerHTML = `
      <div class="hero" style="--hc:${B.hex}"><div class="deco">${B.emoji}</div>
        <div class="small">第 ${d} 天 · 复习日</div><h1>第 ${d / 5} 轮通关挑战</h1><div>复习 ${rangeLabel(p.lessons)} · ${p.lessons.filter(lessonDone).length}/${p.lessons.length} 个单元已学完</div></div>
      <h2>① 课文回顾</h2>
      <div class="row" style="gap:8px">${p.lessons.map((id) => { const l = LMAP[id]; return `<a class="chip ${lessonDone(id) ? "done" : ""}" style="font-size:13px;text-decoration:none" href="#/lesson/${id}/read">${l.b}册 L${l.n} ${esc(l.t)}</a>`; }).join("")}</div>
      <p class="muted small">建议：每课用原声完整听一遍（不看原文），能听懂 80% 以上即可；听不懂的回到精读页。</p>
      <h2>② 核心词速览（随机 ${words.length} 词）</h2>
      <div class="card"><div class="row" style="gap:8px">${words.map((w) => `<button class="chip" data-say="${esc(w.w)}" title="${esc(w.cn)}" style="cursor:pointer;border:0;font-size:13px">${esc(w.w)}</button>`).join("")}</div>
      <p class="muted small">点击单词听英音；鼠标悬停看释义。</p></div>
      <h2>③ 通关测验</h2>
      <div>${quizHTML(qs)}</div><div id="qResult"></div>
      ${d === PLAN.length ? `<div class="card" style="margin-top:20px;text-align:center"><h2>🎓 最后一天：恭喜你走完全部计划！</h2><p class="muted">接下来可以每天从任意一课挑 5 句做听写和跟读，保持语感。</p></div>` : ""}`;
    $$("[data-say]", main).forEach((b) => b.onclick = () => speak(b.dataset.say));
    bindQuiz(main, qs, (score) => {
      $("#qResult").innerHTML = `<div class="card" style="text-align:center;margin-top:10px"><div style="font-size:42px">${score >= 60 ? "🏝️" : "💪"}</div><h2>得分 ${score}%</h2><p class="muted">${score >= 60 ? "本轮通关成功！" : "60 分即可通关，再挑战一次吧（刷新换题）。"}</p></div>`;
      if (score >= 60) { S.reviewDone[d] = true; markStudy(); save(); navHTML(); }
    });
  }

  /* ---------------- 生词本（间隔重复复习） ---------------- */
  const INTERVALS = [0, 1, 2, 4, 7, 15, 30];
  function viewWords(main) {
    const list = Object.values(S.starred).filter((w) => LMAP[w.id]).sort((a, b) => (a.due || "").localeCompare(b.due || ""));
    const due = list.filter((w) => (w.due || "") <= todayStr());
    main.innerHTML = `<h1>⭐ 生词本</h1>
      <p class="muted">按间隔重复（1、2、4、7、15、30 天）安排复习：记得越牢，下次出现得越晚。共 ${list.length} 词，今天待复习 <b>${due.length}</b> 词。</p>
      ${due.length ? `<div id="flashWrap"></div>` : `<div class="card">🎉 今天没有待复习的生词。${list.length ? "" : "在课程的「英音词汇」页点 ☆ 可以收藏单词。"}</div>`}
      <h2>全部生词</h2>
      <div class="grid g3">${list.map((w) => `<div class="word-card" style="--c:${BOOKS[LMAP[w.id].b - 1].hex}">
        <div class="row spread"><span class="w">${esc(w.w)}</span><span><button class="icon-btn" data-say="${esc(w.w)}">🔊</button><button class="star" data-del="${esc(w.w)}" title="移出">⭐</button></span></div>
        <div class="ipa">/${esc(w.ipa)}/</div><div>${esc(w.cn)}</div><div class="muted small">${lessonTitle(LMAP[w.id])} · 熟练度 ${"●".repeat(w.box || 0)}${"○".repeat(6 - (w.box || 0))} · 下次 ${w.due}</div></div>`).join("")}</div>`;
    $$("[data-say]", main).forEach((b) => b.onclick = () => speak(b.dataset.say));
    $$("[data-del]", main).forEach((b) => b.onclick = () => { delete S.starred[b.dataset.del]; save(); render(); });
    if (!due.length) return;
    let i = 0, flipped = false;
    const wrap = $("#flashWrap");
    const show = () => {
      if (i >= due.length) { wrap.innerHTML = `<div class="card">✅ 今日生词复习完成！</div>`; markStudy(); return; }
      const w = due[i];
      const ex = exampleFor(w, w.id);
      wrap.innerHTML = `<div class="flash" id="flash">${flipped ? `<div><div class="w">${esc(w.w)}</div><div class="ipa" style="font-size:20px">/${esc(w.ipa)}/</div><div style="font-size:20px;margin-top:6px">${esc(w.cn)}</div>${ex ? `<div class="example">${markWord(ex, w.w)}</div>` : ""}</div>` : `<div><div class="w">${esc(w.w)}</div><div class="muted">点击卡片查看释义 · ${i + 1}/${due.length}</div></div>`}</div>
        <div class="row" style="justify-content:center;margin-top:12px">${flipped ? `<button class="btn" data-r="0" style="background:var(--bad);color:#fff">😵 不认识</button><button class="btn" data-r="1" style="background:var(--i2);color:#fff">🤔 模糊</button><button class="btn" data-r="2" style="background:var(--ok);color:#fff">😎 认识</button>` : `<button class="btn dark" id="flipBtn">翻面</button>`}</div>`;
      $("#flash").onclick = () => { flipped = !flipped; show(); if (flipped) speak(w.w); };
      const fb = $("#flipBtn"); if (fb) fb.onclick = () => { flipped = true; show(); speak(w.w); };
      $$("[data-r]", wrap).forEach((b) => b.onclick = () => {
        const r = +b.dataset.r, rec = S.starred[w.w];
        rec.box = r === 0 ? 0 : r === 1 ? Math.max(1, rec.box || 0) : Math.min(6, (rec.box || 0) + 1);
        const dd = new Date(); dd.setDate(dd.getDate() + (r === 0 ? 0 : INTERVALS[rec.box]));
        rec.due = fmtDate(dd);
        save(); i++; flipped = false; show();
      });
    };
    show();
  }

  /* ---------------- 文件导入 ---------------- */
  let lastUnmatched = [];
  function viewFiles(main) {
    const supportsDir = !!window.showDirectoryPicker;
    main.innerHTML = `<h1>📂 我的课文文件</h1>
      <p class="muted">选择你电脑上存放新概念英语的文件夹（例如 <b>下载 / Downloads</b> 里的「新概念英语」）。可以一次选包含四册的总文件夹，也可以一册一册导入。文件只在你的浏览器本地读取，不会上传。</p>
      <div class="drop" id="drop">
        <div style="font-size:42px">🗂️</div>
        <p><b>支持：</b>MP3 / M4A / WAV 原声 · LRC 歌词（带时间轴，可逐句播放，推荐）· SRT 字幕 · TXT 文本 · PDF 课本</p>
        <div class="row" style="justify-content:center;margin-bottom:10px">
          <span class="small">认不出是第几册时，默认当作：</span>
          <select id="defBook" style="width:auto">
            <option value="">自动识别（推荐）</option>${BOOKS.map((B) => `<option value="${B.b}" ${String(S.settings.defaultBook) === String(B.b) ? "selected" : ""}>${B.name}</option>`).join("")}
          </select>
        </div>
        <div class="row" style="justify-content:center">
          ${supportsDir ? `<button class="btn primary" id="pickDir">📁 选择文件夹（推荐）</button>` : ""}
          <label class="btn ${supportsDir ? "" : "primary"}">📁 ${supportsDir ? "兼容方式选择文件夹" : "选择文件夹"}<input type="file" id="dirInput" webkitdirectory directory multiple hidden></label>
          <label class="btn">📄 选择文件<input type="file" id="fileInput" multiple hidden accept=".mp3,.m4a,.aac,.wav,.ogg,.flac,.lrc,.srt,.txt,.pdf"></label>
        </div>
        <p class="muted small">也可以把文件或文件夹直接拖到这里。程序会根据文件夹名（如“新概念英语第二册”“NCE2”“Book 3”）、文件名和课文标题自动判断册数与课号。</p>
        <div id="reconnect"></div>
        <div id="prog" class="muted small"></div>
      </div>
      <div id="importLog"></div>
      <h2>📋 课程与文件对应表</h2>
      ${BOOKS.map((B) => { const ls = LESSONS.filter((l) => l.b === B.b); const na = ls.filter((l) => AUDIO[l.id]).length, nt = ls.filter((l) => TEXTS[l.id]).length; return `
      <details class="card" style="margin-bottom:10px;border-left:6px solid ${B.hex}" ${na + nt ? "" : ""}>
        <summary style="cursor:pointer"><b>${B.emoji} ${B.name}</b> <span class="muted small">· 音频 ${na}/${ls.length} · 课文 ${nt}/${ls.length}</span>
          ${nt ? `<button class="btn sm ghost" data-clearbook="${B.b}" style="margin-left:8px">清除本册课文</button>` : ""}</summary>
        <div style="overflow-x:auto;margin-top:8px"><table class="map"><thead><tr><th>课</th><th>标题</th><th>原声音频</th><th>课文原文</th><th></th></tr></thead><tbody>
        ${ls.map((l) => `<tr><td><b>${l.b === 1 ? l.n + "–" + (l.n + 1) : l.n}</b></td><td class="en">${esc(l.t)}</td>
          <td>${AUDIO[l.id] ? "🎧 " + esc(AUDIO[l.id].file.name) : '<span class="muted">—</span>'}</td>
          <td>${TEXTS[l.id] ? `📄 ${esc(TEXTS[l.id].file || "")} <span class="muted">(${TEXTS[l.id].source.toUpperCase()}，${TEXTS[l.id].sents.length} 句${TEXTS[l.id].sents.some((s) => s.t0 != null) ? "，有时间轴" : ""})</span>` : '<span class="muted">—</span>'}</td>
          <td>${TEXTS[l.id] ? `<button class="btn sm ghost" data-clear="${l.id}">清除</button>` : ""}</td></tr>`).join("")}
        </tbody></table></div>
      </details>`; }).join("")}
      <p class="muted small">提示：课文文本会保存在浏览器里，下次打开无需重新导入；音频文件较大，每次打开程序需要重新选择文件夹（或点“重新连接”）。</p>`;
    const opts = () => ({ defaultBook: +$("#defBook").value || null });
    $("#defBook").onchange = (e) => { S.settings.defaultBook = e.target.value; save(); };
    const handle = async (files) => {
      const prog = $("#prog");
      const r = await Parser.processFiles(files, (i, total, name) => { prog.textContent = `正在读取 ${i}/${total}：${name}`; }, opts());
      applyImport(r);
      prog.textContent = "";
      lastUnmatched = r.unmatched;
      render();
      showImportLog(r);
    };
    const pick = $("#pickDir");
    if (pick) pick.onclick = async () => {
      try {
        const dir = await window.showDirectoryPicker({ id: "nce", mode: "read", startIn: "downloads" });
        await Parser.idbSet("dir", dir).catch(() => {});
        $("#prog").textContent = "正在扫描文件夹……";
        handle(await Parser.readDirHandle(dir, dir.name + "/"));
      } catch (e) { if (e.name !== "AbortError") toast("无法打开文件夹：" + e.message); }
    };
    $("#dirInput").onchange = (e) => handle(e.target.files);
    $("#fileInput").onchange = (e) => handle(e.target.files);
    $$("[data-clear]", main).forEach((b) => b.onclick = () => { delete TEXTS[b.dataset.clear]; saveTexts(); render(); });
    $$("[data-clearbook]", main).forEach((b) => b.onclick = (e) => { e.preventDefault(); if (!confirm("确定清除本册所有已导入的课文吗？")) return; Object.keys(TEXTS).forEach((k) => { if (k.startsWith(b.dataset.clearbook + "-")) delete TEXTS[k]; }); saveTexts(); render(); });
    const drop = $("#drop");
    drop.ondragover = (e) => { e.preventDefault(); drop.classList.add("over"); };
    drop.ondragleave = () => drop.classList.remove("over");
    drop.ondrop = async (e) => {
      e.preventDefault(); drop.classList.remove("over");
      const files = [];
      const walk = (entry, path) => new Promise((res) => {
        if (entry.isFile) entry.file((f) => { f._path = path + f.name; files.push(f); res(); }, () => res());
        else if (entry.isDirectory) {
          const rd = entry.createReader(); const all = [];
          const read = () => rd.readEntries(async (ents) => { if (!ents.length) { for (const en of all) await walk(en, path + entry.name + "/"); res(); } else { all.push(...ents); read(); } }, () => res());
          read();
        } else res();
      });
      const entries = Array.from(e.dataTransfer.items || []).map((it) => it.webkitGetAsEntry && it.webkitGetAsEntry()).filter(Boolean);
      if (entries.length) { for (const en of entries) await walk(en, ""); handle(files); }
      else handle(e.dataTransfer.files);
    };
    reconnectUI(opts);
    if (lastUnmatched.length) showImportLog({ unmatched: lastUnmatched, log: [], audio: {}, texts: {} });
  }
  async function reconnectUI(opts) {
    const box = $("#reconnect"); if (!box || !window.showDirectoryPicker) return;
    let dir; try { dir = await Parser.idbGet("dir"); } catch (e) { return; }
    if (!dir || Object.keys(AUDIO).length) return;
    box.innerHTML = `<button class="btn dark" id="reBtn" style="margin-top:8px">🔗 重新连接上次的文件夹：${esc(dir.name)}</button>`;
    $("#reBtn").onclick = async () => {
      try {
        if ((await dir.requestPermission({ mode: "read" })) !== "granted") { toast("没有获得文件夹读取权限"); return; }
        $("#prog").textContent = "正在扫描文件夹……";
        const r = await Parser.processFiles(await Parser.readDirHandle(dir, dir.name + "/"), (i, t, name) => { $("#prog").textContent = `正在读取 ${i}/${t}：${name}`; }, opts());
        applyImport(r); lastUnmatched = r.unmatched; render(); showImportLog(r);
      } catch (e) { toast("重新连接失败：" + e.message); }
    };
  }
  function applyImport(r) {
    Object.entries(r.audio).forEach(([id, f]) => { if (AUDIO[id] && AUDIO[id].url) URL.revokeObjectURL(AUDIO[id].url); AUDIO[id] = { file: f }; });
    Object.entries(r.texts).forEach(([id, t]) => { TEXTS[id] = t; });
    saveTexts();
    const cnt = (o) => { const c = {}; Object.keys(o).forEach((id) => { const b = id.split("-")[0]; c[b] = (c[b] || 0) + 1; }); return Object.keys(c).sort().map((b) => `${b}册 ${c[b]}`).join("，") || "0"; };
    toast(`导入完成 —— 音频：${cnt(r.audio)}；课文：${cnt(r.texts)}`);
  }
  function showImportLog(r) {
    const box = $("#importLog"); if (!box) return;
    const un = r.unmatched || [];
    const lessonOpts = (b) => LESSONS.filter((l) => l.b === b).map((l) => `<option value="${l.id}">${l.label} ${esc(l.t)}</option>`).join("");
    box.innerHTML = (r.log.length || un.length) ? `<div class="card" style="margin-top:14px">
      ${r.log.length ? `<div class="small">${r.log.map(esc).join("<br>")}</div>` : ""}
      ${un.length ? `<h3 style="margin-top:8px">❓ 这些文件没认出是第几册第几课，请手动指定：</h3>
        <p class="muted small">如果一大批文件都没认出，最简单的办法是在上面“默认册数”里选好册数，再导入这一册的文件夹。</p>
        ${un.slice(0, 200).map((f, i) => `<div class="row" style="margin:6px 0"><span class="small" style="flex:1;min-width:200px">${esc(f._path || f.webkitRelativePath || f.name)}</span>
          <select data-unb="${i}" style="width:110px"><option value="">册数</option>${BOOKS.map((B) => `<option value="${B.b}">${B.name}</option>`).join("")}</select>
          <select data-un="${i}" style="width:220px" disabled><option value="">— 课号 —</option></select></div>`).join("")}` : ""}
    </div>` : "";
    $$("[data-unb]", box).forEach((s) => s.onchange = () => {
      const sel = $(`[data-un="${s.dataset.unb}"]`, box);
      sel.innerHTML = `<option value="">— 课号 —</option>` + (s.value ? lessonOpts(+s.value) : "");
      sel.disabled = !s.value;
    });
    $$("[data-un]", box).forEach((s) => s.onchange = async () => {
      const id = s.value; if (!id) return;
      const f = un[+s.dataset.un];
      if (Parser.AUDIO_EXT.test(f.name)) AUDIO[id] = { file: f };
      else {
        const text = Parser.decode(await f.arrayBuffer());
        const p = /\.lrc$/i.test(f.name) ? Parser.parseLRC(text, id) : /\.srt$/i.test(f.name) ? Parser.parseSRT(text, id) : Parser.parsePlainLesson(text, id);
        TEXTS[id] = { ...p, source: (f.name.split(".").pop() || "txt").toLowerCase(), file: f.name }; saveTexts();
      }
      lastUnmatched = un.filter((x) => x !== f);
      toast(`已指定为 ${lessonTitle(LMAP[id])}`); render();
    });
  }

  /* ---------------- 学习方法 ---------------- */
  function viewMethod() {
    const ex = "Scientists who study bats have found that these animals are able to locate insects in the dark by listening to echoes.";
    return `<h1>🧭 能力岛学习法</h1>
      <p class="muted">把新概念英语 1–4 册拆成“四座岛”，每课 6 个小步骤，按计划一天天闯关。</p>
      <div class="grid g4">${BOOKS.map((B) => `<div class="card" style="border-top:5px solid ${B.hex}"><h3>${B.emoji} ${B.name} · ${B.island}</h3><p class="small"><b>${B.en}</b><br>${B.level}<br>每单元约 ${B.min} 分钟</p></div>`).join("")}</div>
      <h2>📝 每课 6 步</h2>
      <div class="grid g3">${STEPS.map((s, i) => `<div class="card" style="border-top:5px solid var(--i${i + 1})"><h3>${i + 1}. ${s.icon} ${s.name}</h3><p class="small">${[
        "不看原文盲听一遍，带着问题听；再读中文导读，了解大意和结构。",
        "学习本课核心词：听英式发音、看音标、跟读 3 遍，并在原文中找到它。",
        "逐句播放原声；用彩色结构找主干、看意群、查生词；遮住中文自己翻译。",
        "自动扫描全文语法现象，配原文例句；攻克本课最长的 3 个句子。",
        "影子跟读：紧跟原声模仿英音的重音、连读、弱读和语调，录音对比。",
        "词义、听音、原文填空、听写综合测验，60 分过关。"][i]}</p></div>`).join("")}</div>
      <p class="muted small">第一、二册课文短，6 步可以很快走完（10–20 分钟）；第三、四册每课 30–40 分钟，精读和跟读要多花时间。</p>
      <h2>🎨 彩色句子分析怎么看</h2>
      <div class="card">
        <div class="colored">${Grammar.colorize(ex, LMAP["4-7"].words).map((t) => t.w ? `<span class="tk ${t.cls} ${t.vocab ? "vocab" : ""}">${esc(t.t)}</span>` : esc(t.t)).join("")}</div>
        <div class="legend" style="margin-top:10px">
          <span style="--k:var(--a-conj)">紫色 = 连接词 / 从句引导词：句子在这里“分岔”</span>
          <span style="--k:var(--a-verb)">红色 = 谓语：句子的“发动机”</span>
          <span style="--k:var(--a-nonf)">绿色波浪 = 非谓语：to do / doing / done</span>
          <span style="--k:var(--a-prep)">蓝色 = 介词：后面跟着修饰成分</span>
          <span style="--k:var(--a-vocab)">黄底 = 本课重点词</span>
        </div>
        <p class="small muted" style="margin-top:10px">三步读懂长难句：① 找红色谓语，确定主干“谁 — 做了什么”；② 在紫色处断开，把从句当作补充说明；③ 绿色和蓝色部分都是修饰，最后再加回来。</p>
        <p class="small muted">示例句为演示用的自编句，你的课文分析以导入的原文为准。第一、二册还会标出 be 动词句型、疑问句、时态等基础语法。</p>
      </div>
      <h2>🇬🇧 英式发音要点</h2>
      <div class="grid g3">
        <div class="card"><h3>① 非卷舌</h3><p class="small">r 只在元音前发音：car /kɑː/、teacher /ˈtiːtʃə/；但 far away 连读时 r 会出现（连接 r）。</p></div>
        <div class="card"><h3>② 短 /ɒ/ 和长 /ɑː/</h3><p class="small">hot /hɒt/、dog /dɒɡ/ 圆唇短促；ask /ɑːsk/、bath /bɑːθ/、can't /kɑːnt/ 读长 /ɑː/。</p></div>
        <div class="card"><h3>③ 双元音 /əʊ/</h3><p class="small">go /ɡəʊ/、home /həʊm/、echo /ˈekəʊ/——从中性 /ə/ 滑向 /ʊ/，比美音 /oʊ/ 更靠前。</p></div>
        <div class="card"><h3>④ t 清晰</h3><p class="small">water /ˈwɔːtə/、better /ˈbetə/ 的 t 清楚发出，不像美音变成“d”。</p></div>
        <div class="card"><h3>⑤ 弱读</h3><p class="small">and /ən/、of /əv/、to /tə/、can /kən/ 在句中通常弱读，重音给实词。</p></div>
        <div class="card"><h3>⑥ 推荐语音</h3><p class="small">原声 MP3（英音版）最地道。TTS 推荐使用 Edge 浏览器中的 “Microsoft Sonia / Ryan (United Kingdom)” 自然语音。</p></div>
      </div>
      <h2>🗓️ 计划节奏</h2>
      <div class="card"><p class="small">每 5 天为一轮：前 4 天学新课，第 5 天复习通关（核心词速览 + 15 题综合测验 + 原文听写）。程序按难度分配每天的课：第一册一天可以学很多单元，第四册一天一两课。</p>
      <p class="small">你要求“一个月学会”，默认计划就是 30 天学完四册；这意味着每天约 ${(avgMinutes() / 60).toFixed(1)} 小时。如果时间不够，到 <a href="#/settings">设置与计划</a> 改成 60、90 或 120 天（每册约 30 天），已完成的进度都会保留。</p></div>`;
  }

  /* ---------------- 设置 ---------------- */
  function viewSettings(main) {
    const gb = gbVoices();
    const cur = pickVoice();
    const presets = [[30, "30 天冲刺（四册一个月）"], [60, "60 天（每天约一半时间）"], [90, "90 天（推荐，强度适中）"], [120, "120 天（每册约 30 天）"]];
    main.innerHTML = `<h1>⚙️ 设置与计划</h1>
      <div class="grid g2">
        <div class="card" style="border-top:5px solid var(--i5)"><h3>📅 学习计划</h3>
          <label class="small">学哪几册</label>
          <div class="row" style="margin:4px 0 10px">${BOOKS.map((B) => `<label class="chip" style="cursor:pointer;font-size:13px"><input type="checkbox" data-book="${B.b}" ${S.plan.books.includes(B.b) ? "checked" : ""}> ${B.emoji} ${B.name}</label>`).join("")}</div>
          <label class="small">计划天数</label>
          <div class="row" style="margin:4px 0">${presets.map(([d, t]) => `<button class="btn sm ${+S.plan.days === d ? "dark" : ""}" data-days="${d}">${t}</button>`).join("")}</div>
          <div class="row" style="margin-top:6px"><span class="small">自定义：</span><input type="number" id="days" min="5" max="365" value="${S.plan.days}" style="width:100px"> 天</div>
          <p class="small" style="margin-top:8px">当前：${PLAN.length} 天，平均每天约 <b>${avgMinutes()} 分钟</b>（${(avgMinutes() / 60).toFixed(1)} 小时）。</p>
          <label class="small">计划开始日期</label><input type="date" id="start" value="${S.startDate}">
          <p class="muted small">今天是计划第 ${currentDay()} 天。修改计划或开始日期只会重新安排日程，已完成的进度都会保留。</p></div>
        <div class="card"><h3>🇬🇧 英式发音（TTS）</h3>
          ${gb.length ? `<select id="voice">${gb.map((v) => `<option value="${esc(v.voiceURI)}" ${cur && cur.voiceURI === v.voiceURI ? "selected" : ""}>${esc(v.name)}</option>`).join("")}</select>` :
            `<div class="note small">⚠️ 没有检测到英式（en-GB）语音。建议：① 使用 <b>Microsoft Edge</b> 浏览器打开本程序（自带 Sonia、Ryan 等英式自然语音）；② 或在 Windows「设置 → 时间和语言 → 语音 → 添加语音」中添加 “English (United Kingdom)”。</div>`}
          <div class="row" style="margin-top:10px"><span class="small">语速</span><input type="range" id="rate" min="0.6" max="1.2" step="0.05" value="${S.settings.rate}" style="flex:1"><span id="rateV">${S.settings.rate}</span></div>
          <button class="btn sm" id="testVoice" style="margin-top:8px">🔊 试听：“The weather in Britain is rather changeable.”</button>
          <label class="small" style="display:block;margin-top:12px">外观</label>
          <select id="theme"><option value="auto" ${S.settings.theme === "auto" ? "selected" : ""}>跟随系统</option><option value="light" ${S.settings.theme === "light" ? "selected" : ""}>彩色明亮</option><option value="dark" ${S.settings.theme === "dark" ? "selected" : ""}>彩色暗夜</option></select></div>
        <div class="card"><h3>🤖 AI 老师（可选）</h3>
          <p class="small muted">填入你自己的 Claude API Key 后，可以让 AI 老师逐句精讲（通俗中文 + 英式音标 + 朗读提示）。需要联网，按 Anthropic 官方价格计费；Key 只保存在你本机浏览器中。</p>
          <input type="password" id="apiKey" placeholder="sk-ant-..." value="${esc(S.settings.apiKey)}">
          <label class="small" style="margin-top:8px;display:block">模型</label>
          <select id="model">${[["claude-opus-5-5", "Claude Opus 5.5（讲解质量最好，默认）"], ["claude-sonnet-5-5", "Claude Sonnet 5.5（更快更省）"], ["claude-haiku-5-5", "Claude Haiku 5.5（最便宜）"]].map(([v, t]) => `<option value="${v}" ${S.settings.model === v ? "selected" : ""}>${t}</option>`).join("")}</select>
          <div class="row" style="margin-top:8px"><button class="btn sm" id="saveKey">保存</button><button class="btn sm ghost" id="clearAi">清空 AI 讲解缓存（${Object.keys(AI_CACHE).length} 条）</button></div></div>
        <div class="card"><h3>💾 学习数据</h3>
          <p class="small muted">进度保存在本机浏览器。换电脑或换浏览器前，请先导出备份。</p>
          <div class="row"><button class="btn sm" id="exp">⬇️ 导出进度</button><label class="btn sm">⬆️ 导入进度<input type="file" id="imp" accept=".json" hidden></label><button class="btn sm ghost" id="reset" style="color:var(--bad)">重置全部进度</button></div></div>
      </div>`;
    const replan = () => { buildPlan(); save(); render(); };
    $$("[data-book]", main).forEach((c) => c.onchange = () => {
      const books = $$("[data-book]", main).filter((x) => x.checked).map((x) => +x.dataset.book);
      if (!books.length) { c.checked = true; toast("至少要选一册"); return; }
      S.plan.books = books; replan();
    });
    $$("[data-days]", main).forEach((b) => b.onclick = () => { S.plan.days = +b.dataset.days; replan(); });
    $("#days").onchange = (e) => { const v = Math.max(5, Math.min(365, +e.target.value || 30)); S.plan.days = v; replan(); };
    const v = $("#voice"); if (v) v.onchange = () => { S.settings.voiceURI = v.value; save(); speak("Hello, welcome to New Concept English."); };
    $("#rate").oninput = (e) => { S.settings.rate = +e.target.value; $("#rateV").textContent = S.settings.rate; save(); };
    $("#testVoice").onclick = () => speak("The weather in Britain is rather changeable.");
    $("#start").onchange = (e) => { if (e.target.value) { S.startDate = e.target.value; save(); toast("已更新计划开始日期"); render(); } };
    $("#theme").onchange = (e) => { S.settings.theme = e.target.value; save(); applyTheme(); };
    $("#saveKey").onclick = () => { S.settings.apiKey = $("#apiKey").value.trim(); S.settings.model = $("#model").value; save(); toast("已保存"); };
    $("#model").onchange = () => { S.settings.model = $("#model").value; save(); };
    $("#clearAi").onclick = () => { AI_CACHE = {}; safeSet(AKEY, AI_CACHE); render(); };
    $("#exp").onclick = () => {
      const data = { ...S, settings: { ...S.settings, apiKey: "" }, texts: TEXTS };
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
      a.download = `nce-island-backup-${todayStr()}.json`; a.click();
    };
    $("#imp").onchange = async (e) => {
      try {
        const data = JSON.parse(await e.target.files[0].text());
        if (data.texts) { TEXTS = data.texts; saveTexts(); delete data.texts; }
        const key = S.settings.apiKey;
        Object.assign(S, data); S.settings = Object.assign({}, DEFAULT_SETTINGS, S.settings); S.settings.apiKey = S.settings.apiKey || key;
        save(); buildPlan(); toast("已导入进度"); render();
      } catch (err) { toast("导入失败：文件格式不对"); }
    };
    $("#reset").onclick = () => { if (confirm("确定清空全部学习进度吗？（课文文件不受影响）")) { S.steps = {}; S.quiz = {}; S.reviewDone = {}; S.starred = {}; S.studyDays = []; S.startDate = todayStr(); save(); render(); } };
  }
  function applyTheme() {
    const t = S.settings.theme;
    if (t === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  }

  /* ---------------- AI 老师（Claude API） ---------------- */
  const SYSTEM = "你是一位耐心、讲解通俗易懂的英语老师，正在帮助中国学习者学习《新概念英语》1–4 册。请始终用简体中文讲解，英文例子保留原文。所有音标使用英式发音（英式 IPA，如 /ɒ/、/əʊ/、非卷舌）。讲解要结合课文原句，不要空谈语法术语；遇到术语时用一句大白话解释。讲解深浅要适合所学册数：第一册面向零基础，第四册面向中高级。";
  async function callClaude(prompt, maxTokens) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": S.settings.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "server-side-fallback-2026-07-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: S.settings.model || "claude-opus-5-5",
        max_tokens: maxTokens || 4000,
        fallbacks: "default",
        output_config: { effort: "low" },
        system: SYSTEM,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((data.error && data.error.message) || ("HTTP " + r.status));
    if (data.stop_reason === "refusal") throw new Error("模型拒绝了这个请求，请换一句再试");
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (!text) throw new Error("没有收到讲解内容");
    return text;
  }
  async function aiExplainSentence(id, s, sents, out, cacheKey) {
    const l = LMAP[id];
    const ctx = sents.filter((x) => x.en && Math.abs(x.i - s.i) <= 2 && x.i !== s.i);
    out.innerHTML = `<div class="muted small">🤖 AI 老师正在备课……</div>`;
    const prompt = `课文：新概念英语${bookOf(l).name} ${l.label} "${l.t}"（${l.cn}）。
上下文：${ctx.map((x) => x.en).join(" ")}

请讲解这一句：
"${s.en}"

按以下小标题输出（用 ### 作为小标题，内容简洁，用列表）：
### 译文
（自然流畅的中文）
### 一句话看懂
（用大白话说这句话在讲什么）
### 句子主干
（主语 + 谓语 + 宾语/表语，并说明哪些部分是修饰）
### 结构拆解
（按意群拆开，逐块解释作用：从句、非谓语、介词短语等）
### 重点词汇
（3–6 个，格式：单词 /英式音标/ 词性 中文意思 —— 在本句中的用法）
### 英音朗读提示
（重音、弱读、连读、意群停顿，用 / 标出停顿）`;
    try {
      const text = await callClaude(prompt, 3000);
      AI_CACHE[cacheKey] = text; safeSet(AKEY, AI_CACHE);
      out.innerHTML = renderMd(text);
    } catch (e) {
      out.innerHTML = `<div class="note small" style="color:var(--bad)">AI 讲解失败：${esc(e.message)}<br>请检查网络和 API Key。</div>`;
    }
  }
  async function aiExplainLesson(id, out) {
    const l = LMAP[id];
    const key = "l:" + id;
    if (AI_CACHE[key]) { out.innerHTML = renderMd(AI_CACHE[key]); return; }
    out.innerHTML = `<div class="muted small">🤖 AI 老师正在通读全文……</div>`;
    const text = contentSents(id).map((s) => s.en).join(" ");
    const prompt = `下面是新概念英语${bookOf(l).name} ${l.label} "${l.t}" 的课文原文：
${text}

请为第一次学这课的中国学习者写一份通俗导读，用 ### 作为小标题：
### 全文一句话
### 段落结构（每段一行：段落大意 + 关键句开头几个词）
### 作者观点、故事结局或对话目的
### 三个最值得学的句子（引用原句，简要说明为什么）
### 学完能用上的 5 个表达（英式音标 + 中文）`;
    try {
      const t = await callClaude(prompt, 4000);
      AI_CACHE[key] = t; safeSet(AKEY, AI_CACHE);
      out.innerHTML = renderMd(t);
    } catch (e) { out.innerHTML = `<div class="note small" style="color:var(--bad)">AI 导读失败：${esc(e.message)}</div>`; }
  }
  function renderMd(md) {
    const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, '<span class="en">$1</span>');
    let html = "", inList = false;
    esc(md).split("\n").forEach((ln) => {
      const t = ln.trim();
      const li = t.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (li) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(li[1])}</li>`; return; }
      if (inList) { html += "</ul>"; inList = false; }
      if (/^#{1,4}\s/.test(t)) html += `<h4>${inline(t.replace(/^#+\s*/, ""))}</h4>`;
      else if (t) html += `<p style="margin:4px 0">${inline(t)}</p>`;
    });
    if (inList) html += "</ul>";
    return `<div class="ai-box">${html}</div>`;
  }

  /* ---------------- 启动 ---------------- */
  applyTheme();
  render();
  window.NCEApp = { S, TEXTS: () => TEXTS, AUDIO, PLAN: () => PLAN, LMAP, render };
})();
