/* 课程资料的公共结构
 * NCE.addRows(册, [[课号, 英文标题, 中文标题, "语法id,…", 中文导读, "单词|英式音标|释义; …", 英音提示?], …])
 * NCE.add(册, {n, t, cn, sum, bg, g:[…], tip, q, w:["单词|音标|释义", …]})
 * 第一册按“单双课”为一个单元：课号写奇数课（1 表示 Lesson 1–2）。
 */
window.NCE = {
  lessons: [],
  add(b, o) { this.lessons.push(Object.assign({ b }, o)); },
  addRows(b, rows) {
    rows.forEach(([n, t, cn, g, sum, w, tip]) => {
      this.lessons.push({ b, n, t, cn, g: g ? g.split(",") : [], sum, tip: tip || "", w: w.split(/;\s*/).filter(Boolean) });
    });
  },
};
