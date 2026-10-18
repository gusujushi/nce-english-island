/* 文件读取与解析：音频 / LRC / SRT / TXT / PDF
 * 自动识别课号，支持 UTF-8、GBK、UTF-16 编码的中文歌词文件。
 */
(function () {
  const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|webm|mp4)$/i;
  const TEXT_EXT = /\.(lrc|srt|txt|text|md)$/i;
  const PDF_EXT = /\.pdf$/i;
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  const MAXN = { 1: 144, 2: 96, 3: 60, 4: 48 };
  const CN_NUM = { "一": 1, "二": 2, "三": 3, "四": 4, "1": 1, "2": 2, "3": 3, "4": 4 };
  let TITLE_KEYS = null;
  function titleKeys() {
    if (!TITLE_KEYS) TITLE_KEYS = window.NCE.lessons.map((l) => ({ b: l.b, n: l.n, key: l.t.toLowerCase().replace(/[^a-z]/g, "") })).filter((t) => t.key.length >= 5);
    return TITLE_KEYS;
  }
  const unitOf = (b, n) => (b === 1 && n % 2 === 0 ? n - 1 : n);

  /* 从路径（文件夹名、文件名）判断第几册：从最深一层往上找 */
  function detectBook(path) {
    if (!path) return null;
    const segs = String(path).split(/[\\/]/).reverse();
    for (const raw of segs) {
      const seg = raw.replace(/\.[^.]+$/, "");
      if (/全\s*[四4]\s*册|[1一]\s*[-~至到]\s*[4四]\s*册|1-4|四册全/.test(seg)) continue;
      const m = seg.match(/第\s*([1-4一二三四])\s*册/) ||
        seg.match(/(?:新概念英语|新概念|nce|new\s*concept(?:\s*english)?)\s*[-_ .]?\s*(?:第\s*)?([1-4一二三四])(?!\d)/i) ||
        seg.match(/\bbook\s*[-_ ]?([1-4])(?!\d)/i) ||
        seg.match(/(?:^|[^\d])([一二三四])\s*册/) ||
        seg.match(/(?:^|[^\d])([1-4])\s*册/);
      if (m) return CN_NUM[m[1]];
    }
    return null;
  }

  /* 从文件名判断课号；返回 {b, n}（b 可能为 null，表示没认出册数） */
  function detectLesson(name, path, defaultBook) {
    if (!name) return null;
    let base = name.replace(/\.[^.]+$/, "");
    let b = detectBook(path ? path : name) || detectBook(name);
    // 课文标题匹配：同时能确定册数
    const key = base.toLowerCase().replace(/[^a-z]/g, "");
    if (key.length >= 5) {
      const hits = titleKeys().filter((t) => key.includes(t.key) && (!b || t.b === b)).sort((x, y) => y.key.length - x.key.length);
      if (hits.length && (hits.length === 1 || hits[0].key.length > hits[1].key.length)) return { b: hits[0].b, n: hits[0].n, raw: hits[0].n };
    }
    b = b || defaultBook || null;
    let n = null;
    const m = base.match(/lesson\s*[-_.]?\s*0*(\d{1,3})(?!\d)/i) || base.match(/第\s*0*(\d{1,3})\s*课/) || base.match(/(?:^|[^a-z])L\s*0*(\d{1,3})(?!\d)/i);
    if (m) n = +m[1];
    else {
      const cleaned = base
        .replace(/(nce|新概念英语|新概念|new\s*concept\s*english|book|vol|册)\s*[-_.]?\s*(?:第\s*)?([1-4一二三四]|iv|iii|ii|i)(?![\d])/ig, " ")
        .replace(/第\s*[1-4一二三四]\s*册/g, " ")
        .replace(/[1-4一二三四]\s*册/g, " ")
        .replace(/\b(19|20)\d\d\b/g, " ")
        .replace(/\d+\s*(k|kbps|hz)\b/ig, " ");
      const nums = (cleaned.match(/\d+/g) || []).map(Number).filter((x) => x >= 1 && x <= 144);
      if (nums.length) n = nums[0];
    }
    if (!n) return null;
    if (b && n > MAXN[b]) return null;
    return { b, n: b ? unitOf(b, n) : n, raw: n };
  }

  /* 智能解码：UTF-8 → GBK → UTF-16 */
  function decode(buf) {
    const b = new Uint8Array(buf);
    if (b[0] === 0xff && b[1] === 0xfe) return new TextDecoder("utf-16le").decode(buf);
    if (b[0] === 0xfe && b[1] === 0xff) return new TextDecoder("utf-16be").decode(buf);
    try { return new TextDecoder("utf-8", { fatal: true }).decode(buf).replace(/^﻿/, ""); }
    catch (e) {
      try { return new TextDecoder("gb18030").decode(buf); } catch (e2) { return new TextDecoder("gbk").decode(buf); }
    }
  }

  function splitEnCn(text) {
    text = text.trim();
    const i = text.search(CJK);
    if (i < 0) return { en: text, cn: "" };
    let en = text.slice(0, i).trim().replace(/[\/|｜]+$/, "").trim();
    const cn = text.slice(i).trim();
    // 中文后面又跟英文的情况（"中文 English"）
    if (!/[A-Za-z]{2,}/.test(en)) {
      const m = cn.match(/^([^A-Za-z]*?)\s*([A-Z][\s\S]*)$/);
      if (m && /[A-Za-z]{3,}/.test(m[2]) && !CJK.test(m[2])) return { en: m[2].trim(), cn: m[1].trim() };
      return { en: "", cn };
    }
    return { en, cn };
  }

  function isMeta(en, id, i) {
    if (/^lesson\s*\d+/i.test(en)) return true;
    if (/listen to the tape|listen and then answer|first listen|then answer the question|listen to the recording/i.test(en)) return true;
    // 单独一行的课文标题（只看开头几行；第一册标题常常就是课文第一句，不算）
    const l = i != null && i < 3 && id && !String(id).startsWith("1-") && window.NCE.lessons.find((x) => x.b + "-" + x.n === id);
    if (l && en.toLowerCase().replace(/[^a-z]/g, "") === l.t.toLowerCase().replace(/[^a-z]/g, "")) return true;
    return false;
  }

  /* LRC 歌词 → 句子列表（含时间轴） */
  function parseLRC(text, n) {
    const entries = [];
    let offset = 0;
    let title = "";
    text.split(/\r?\n/).forEach((line) => {
      const meta = line.match(/^\s*\[(ti|ar|al|by|offset|re|ve|length):([^\]]*)\]\s*$/i);
      if (meta) {
        if (meta[1].toLowerCase() === "offset") offset = (+meta[2] || 0) / 1000;
        if (meta[1].toLowerCase() === "ti") title = meta[2].trim();
        return;
      }
      const times = [];
      const re = /\[(\d{1,3}):(\d{1,2}(?:[.:]\d{1,3})?)\]/g;
      let m, last = 0;
      while ((m = re.exec(line))) { times.push(+m[1] * 60 + parseFloat(m[2].replace(":", "."))); last = re.lastIndex; }
      if (!times.length) return;
      const body = line.slice(last).replace(/<\d+:\d+(?:\.\d+)?>/g, "").trim();
      times.forEach((t) => entries.push({ t: Math.max(0, t + offset), body }));
    });
    entries.sort((a, b) => a.t - b.t);
    const sents = [];
    entries.forEach((e, i) => {
      if (!e.body) { if (sents.length && sents[sents.length - 1].t1 == null) sents[sents.length - 1].t1 = e.t; return; }
      const { en, cn } = splitEnCn(e.body);
      const prev = sents[sents.length - 1];
      if (!en && cn) {
        if (prev && (!prev.cn || Math.abs(prev.t0 - e.t) < 0.05)) { prev.cn = prev.cn ? prev.cn + " " + cn : cn; return; }
        if (prev) { prev.cn = (prev.cn ? prev.cn + " " : "") + cn; }
        return;
      }
      if (prev && Math.abs(prev.t0 - e.t) < 0.01 && en) { prev.en += " " + en; if (cn) prev.cn = (prev.cn ? prev.cn + " " : "") + cn; return; }
      if (prev && prev.t1 == null) prev.t1 = e.t;
      sents.push({ en, cn, t0: e.t, t1: null });
    });
    sents.forEach((s, i) => { s.i = i; s.meta = isMeta(s.en, n, i); });
    return { sents, title };
  }

  /* SRT 字幕 */
  function parseSRT(text, n) {
    const blocks = text.replace(/\r/g, "").split(/\n\s*\n/);
    const toSec = (s) => { const m = s.match(/(\d+):(\d+):(\d+)[,.](\d+)/); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000 : 0; };
    const sents = [];
    blocks.forEach((b) => {
      const lines = b.split("\n").filter(Boolean);
      const ti = lines.findIndex((l) => /-->/.test(l));
      if (ti < 0) return;
      const [a, z] = lines[ti].split("-->");
      const body = lines.slice(ti + 1);
      const en = body.filter((l) => !CJK.test(l)).join(" ").trim();
      const cn = body.filter((l) => CJK.test(l)).join(" ").trim();
      if (!en) { if (sents.length && cn) sents[sents.length - 1].cn += cn; return; }
      sents.push({ en, cn, t0: toSec(a), t1: toSec(z) });
    });
    sents.forEach((s, i) => { s.i = i; s.meta = isMeta(s.en, n, i); });
    return { sents };
  }

  /* 普通文本 → 句子。英文按句切分，中文行收集为译文 */
  function splitSentences(text) {
    const protectedText = text
      .replace(/\b(Mr|Mrs|Ms|Dr|St|Prof|Sr|Jr|No|vs|etc|e\.g|i\.e|U\.S|U\.K|Co|Ltd|Inc|Mt|ft|in|oz|lb|cf)\./g, (m) => m.replace(/\./g, "§"))
      .replace(/(\d)\.(\d)/g, "$1§$2")
      .replace(/\b([A-Z])\.(?=\s?[A-Z]\.?)/g, "$1§");
    return protectedText
      .split(/(?<=[.!?]["'’”)]?)\s+(?=["'‘“(]?[A-Z0-9])/)
      .map((s) => s.replace(/§/g, ".").trim())
      .filter((s) => /[A-Za-z]/.test(s));
  }

  function parsePlainLesson(text, n) {
    const lines = text.replace(/\r/g, "").split("\n");
    const enParas = [];
    const cnLines = [];
    let buf = [];
    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line) { if (buf.length) { enParas.push(buf.join(" ")); buf = []; } return; }
      if (CJK.test(line)) {
        const { en, cn } = splitEnCn(line);
        if (en && /[A-Za-z]{3,}/.test(en)) buf.push(en);
        if (cn) cnLines.push(cn);
        return;
      }
      buf.push(line);
    });
    if (buf.length) enParas.push(buf.join(" "));
    const sents = [];
    enParas.forEach((p, pi) => {
      // 标题行、短行不切分
      if (/^lesson\s*\d+/i.test(p) || p.split(/\s+/).length <= 8 && !/[.!?]$/.test(p)) { sents.push({ en: p, cn: "", t0: null, t1: null, para: pi }); return; }
      splitSentences(p).forEach((s) => sents.push({ en: s, cn: "", t0: null, t1: null, para: pi }));
    });
    sents.forEach((s, i) => { s.i = i; s.meta = isMeta(s.en, n, i); });
    return { sents, cnText: cnLines.join("\n") };
  }

  /* 一个文本里包含多课时，按 “Lesson N” 标题拆开 */
  function splitMultiLesson(text) {
    const re = /^[ \t]*(?:lesson|第)\s*0*(\d{1,3})\b[^\n]*$/gim;
    const marks = [];
    let m;
    while ((m = re.exec(text))) { const n = +m[1]; if (n >= 1 && n <= 144) marks.push({ n, idx: m.index }); }
    // 去掉目录区：同一课号出现多次时取最后一段内容最长的
    if (marks.length < 2) return null;
    const parts = {};
    marks.forEach((mk, i) => {
      const end = i + 1 < marks.length ? marks[i + 1].idx : text.length;
      const chunk = text.slice(mk.idx, end);
      if (!parts[mk.n] || chunk.length > parts[mk.n].length) parts[mk.n] = chunk;
    });
    return Object.keys(parts).length >= 2 ? parts : null;
  }

  let pdfjsLoading = null;
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfjsLoading) return pdfjsLoading;
    pdfjsLoading = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; res(window.pdfjsLib); };
      s.onerror = () => { pdfjsLoading = null; rej(new Error("PDF 解析组件需要联网下载，当前无法加载。可以把 PDF 里的课文复制粘贴到“粘贴课文”。")); };
      document.head.appendChild(s);
    });
    return pdfjsLoading;
  }
  async function pdfToText(file) {
    const lib = await loadPdfJs();
    const doc = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
    let out = "";
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      tc.items.forEach((it) => { out += it.str + (it.hasEOL ? "\n" : " "); });
      out += "\n\n";
    }
    return out;
  }

  /* 合并到某个单元（第一册双数课并入单数课） */
  function putText(res, b, n, t) {
    const id = b + "-" + unitOf(b, n);
    const prev = res.texts[id];
    if (prev && prev.source === "lrc" && t.source !== "lrc") return;
    // 第一册单、双数课分成两个文件时合并；双数课的时间轴属于另一段音频，故去掉，改用英音朗读
    const noTime = (arr) => arr.map((s) => ({ ...s, t0: null, t1: null }));
    if (prev && b === 1 && n % 2 === 0 && prev.source === t.source) {
      prev.sents = prev.sents.concat(noTime(t.sents));
      prev.sents.forEach((s, i) => (s.i = i));
      return;
    }
    if (prev && b === 1 && n % 2 === 1 && prev.source === t.source && prev.evenFirst) {
      t.sents = t.sents.concat(noTime(prev.sents));
      t.sents.forEach((s, i) => (s.i = i));
    }
    if (b === 1 && n % 2 === 0) t.evenFirst = true;
    res.texts[id] = t;
  }

  /* 主入口：处理一批文件 → { audio: {id: File}, texts: {id: …}, unmatched: [File], log: [] }
   * opts.defaultBook：认不出册数时使用的默认册数 */
  async function processFiles(files, onProgress, opts = {}) {
    const res = { audio: {}, texts: {}, unmatched: [], log: [] };
    const list = Array.from(files).filter((f) => !/^\./.test(f.name));
    const db = opts.defaultBook || null;
    let done = 0;
    for (const f of list) {
      done++;
      onProgress && onProgress(done, list.length, f.name);
      const path = f._path || f.webkitRelativePath || f.name;
      try {
        if (AUDIO_EXT.test(f.name)) {
          const d = detectLesson(f.name, path, db);
          if (d && d.b) {
            const id = d.b + "-" + d.n;
            const even = d.b === 1 && d.raw % 2 === 0;
            const cur = res.audio[id];
            // 第一册：课文（单数课）的音频优先于句型练习（双数课）
            if (!cur || (cur._even && !even) || (cur._even === even && f.size > cur.size)) { f._even = even; res.audio[id] = f; }
          } else res.unmatched.push(f);
        } else if (TEXT_EXT.test(f.name)) {
          const text = decode(await f.arrayBuffer());
          if (/\.(lrc|srt)$/i.test(f.name)) {
            let d = detectLesson(f.name, path, db);
            const tiM = text.match(/\[ti:([^\]]*)\]/i);
            if ((!d || !d.b) && tiM) d = detectLesson(tiM[1], path, db) || d;
            if (!d || !d.b) {
              const firstLine = (text.match(/\]\s*(lesson\s*\d+[^\n]*)/i) || [])[1];
              if (firstLine) d = detectLesson(firstLine, path, db) || d;
            }
            if (d && d.b) {
              const id = d.b + "-" + d.n;
              const p = /\.lrc$/i.test(f.name) ? parseLRC(text, id) : parseSRT(text, id);
              if (p.sents.length) putText(res, d.b, d.n, { sents: p.sents, source: /\.lrc$/i.test(f.name) ? "lrc" : "srt", file: f.name });
            } else res.unmatched.push(f);
          } else {
            const multi = splitMultiLesson(text);
            const bk = detectBook(path) || db;
            if (multi && bk) {
              let k = 0;
              Object.entries(multi).forEach(([n, chunk]) => {
                n = +n;
                if (n > MAXN[bk]) return;
                const id = bk + "-" + unitOf(bk, n);
                const p = parsePlainLesson(chunk, id);
                if (p.sents.length > 1) { putText(res, bk, n, { ...p, source: "txt", file: f.name }); k++; }
              });
              res.log.push(`${f.name}：拆分出第 ${bk} 册 ${k} 课`);
            } else if (multi && !bk) {
              res.log.push(`${f.name}：包含多课，但认不出是第几册——请在上方“默认册数”里选好册数后重新导入`);
            } else {
              const d = detectLesson(f.name, path, db);
              if (d && d.b) { const id = d.b + "-" + d.n; putText(res, d.b, d.n, { ...parsePlainLesson(text, id), source: "txt", file: f.name }); }
              else res.unmatched.push(f);
            }
          }
        } else if (PDF_EXT.test(f.name)) {
          const text = await pdfToText(f);
          const multi = splitMultiLesson(text);
          const bk = detectBook(path) || db;
          if (multi && bk) {
            let k = 0;
            Object.entries(multi).forEach(([n, chunk]) => {
              n = +n;
              if (n > MAXN[bk]) return;
              const id = bk + "-" + unitOf(bk, n);
              const p = parsePlainLesson(chunk, id);
              if (p.sents.length > 1) { putText(res, bk, n, { ...p, source: "pdf", file: f.name }); k++; }
            });
            res.log.push(`${f.name}：从 PDF 拆分出第 ${bk} 册 ${k} 课`);
          } else if (multi) {
            res.log.push(`${f.name}：PDF 包含多课，但认不出是第几册——请先选好“默认册数”再导入`);
          } else {
            const d = detectLesson(f.name, path, db);
            if (d && d.b) { const id = d.b + "-" + d.n; putText(res, d.b, d.n, { ...parsePlainLesson(text, id), source: "pdf", file: f.name }); }
            else res.log.push(`${f.name}：没能在 PDF 里找到 “Lesson N” 标题`);
          }
        }
      } catch (e) {
        res.log.push(`${f.name}：读取失败（${e.message}）`);
      }
    }
    Object.values(res.texts).forEach((t) => delete t.evenFirst);
    return res;
  }

  /* 递归读取文件夹（File System Access API） */
  async function readDirHandle(dir, prefix = "", out = [], depth = 0) {
    if (depth > 4) return out;
    for await (const [name, h] of dir.entries()) {
      if (h.kind === "file") {
        if (AUDIO_EXT.test(name) || TEXT_EXT.test(name) || PDF_EXT.test(name)) {
          const f = await h.getFile();
          f._path = prefix + name;
          out.push(f);
        }
      } else if (h.kind === "directory" && !name.startsWith(".")) {
        await readDirHandle(h, prefix + name + "/", out, depth + 1);
      }
    }
    return out;
  }

  /* IndexedDB：记住上次的文件夹；手机上把导入的音频保存在本机 */
  let dbPromise = null;
  function idb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((res, rej) => {
      const r = indexedDB.open("nce-island", 2);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
        if (!db.objectStoreNames.contains("audio")) db.createObjectStore("audio");
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => { dbPromise = null; rej(r.error); };
    });
    return dbPromise;
  }
  async function tx(store, mode, fn) {
    const db = await idb();
    return new Promise((res, rej) => {
      const t = db.transaction(store, mode);
      const out = fn(t.objectStore(store));
      t.oncomplete = () => res(out && "result" in out ? out.result : undefined);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error("存储空间不足或被浏览器拒绝"));
    });
  }
  const idbSet = (k, v) => tx("kv", "readwrite", (st) => { st.put(v, k); });
  const idbGet = (k) => tx("kv", "readonly", (st) => st.get(k));
  // 把文件内容读成独立的 Blob 再保存，避免部分手机浏览器只保存“文件引用”
  async function audioPut(id, file) {
    const blob = new Blob([await file.arrayBuffer()], { type: file.type || "audio/mpeg" });
    return tx("audio", "readwrite", (st) => { st.put({ name: file.name, blob }, id); });
  }
  async function audioAll() {
    const db = await idb();
    return new Promise((res, rej) => {
      const out = {};
      const req = db.transaction("audio", "readonly").objectStore("audio").openCursor();
      req.onsuccess = () => { const c = req.result; if (c) { out[c.key] = c.value; c.continue(); } else res(out); };
      req.onerror = () => rej(req.error);
    });
  }
  const audioClear = () => tx("audio", "readwrite", (st) => { st.clear(); });

  window.Parser = { detectLesson, detectBook, unitOf, MAXN, decode, parseLRC, parseSRT, parsePlainLesson, splitMultiLesson, splitSentences, processFiles, readDirHandle, idbSet, idbGet, audioPut, audioAll, audioClear, AUDIO_EXT, TEXT_EXT, PDF_EXT };
})();
