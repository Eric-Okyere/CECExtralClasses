/**
 * Turns question banks (pasted text, Word, PDF, CSV or JSON) into quiz items:
 *   { question, options: [...], answer, explanation, problems: [...] }
 *
 * Text format it understands (numbering, emoji and spacing are flexible):
 *
 *   Q1. In multi-base ten materials, a SMALL CUBE represents:
 *   A. 1,000
 *   B. 100
 *   C. 10,000
 *   D. 1,000,000
 *   Answer: A
 *   Reason: The small cube is the base unit, representing 1,000.
 *
 * `answer` is always stored as the full text of the correct option,
 * because the lesson player compares the learner's pick with it.
 */

const LETTERS = "ABCDEFGH";

const clean = (s = "") => s.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
// Drop bullets and emoji (✅ 💡 • –) in front of a line, keep "(" for "(a)".
const stripLead = (s) => s.replace(/^[^\p{L}\p{N}(]+/u, "");

const QUESTION_RE = /^(?:q(?:uestion)?\s*\.?\s*)?(\d{1,3})\s*[.):](?:\s+(.*))?$/i;
const QUESTION_PREFIX_RE = /^q(?:uestion)?\s*(\d{1,3})\s+(.+)$/i; // "Q1 What is..."
const ANSWER_RE = /^(?:the\s+)?(?:correct\s+)?(?:answer|ans)\s*(?:is)?\s*[:=\-–]\s*(.*)$/i;
const EXPLANATION_RE = /^(?:reason|explanation|explain|because|why|solution|rationale|working)\s*[:=\-–]\s*(.*)$/i;
const NOISE_RE = /^(?:\d+|page\s+\d+(?:\s+of\s+\d+)?)$/i;

/** Splits "A. 5  B. 7  C. 2" (or a single "A. 5") into option texts, if the letters run in order. */
function splitOptions(line, expectedIndex) {
  const marks = [];
  const re = /(?:^|\s)\(?([A-Ha-h])\s*[.)]\s+/g;
  let m;
  while ((m = re.exec(line))) {
    const idx = LETTERS.indexOf(m[1].toUpperCase());
    const want = expectedIndex + marks.length;
    if (idx !== want) {
      if (marks.length === 0) return null; // first letter must be the next expected one
      continue; // e.g. "B. " inside option text — not a new option
    }
    marks.push({ start: m.index, textStart: m.index + m[0].length });
  }
  if (marks.length === 0 || marks[0].start !== 0) return null;
  return marks
    .map((mk, i) => clean(line.slice(mk.textStart, marks[i + 1]?.start ?? line.length)))
    .filter(Boolean);
}

const norm = (s = "") => s.toLowerCase().replace(/[\s.,;:!?'"’()]+/g, " ").trim();

/** Turns "A", "a)", "A. 1,000", "Option B" or the answer text itself into the matching option text. */
export function resolveAnswer(raw, options) {
  const a = clean(String(raw ?? "")).replace(/^option\s+/i, "");
  if (!a || options.length === 0) return "";
  const letter = a.match(/^\(?([A-Ha-h])\s*(?:[.):]|$)/);
  if (letter) {
    const idx = LETTERS.indexOf(letter[1].toUpperCase());
    if (idx < options.length) return options[idx];
  }
  const n = norm(a);
  const exact = options.find((o) => norm(o) === n);
  if (exact) return exact;
  const partial = options.filter((o) => norm(o).startsWith(n) || n.startsWith(norm(o)));
  return partial.length === 1 ? partial[0] : "";
}

function finish(q) {
  const options = q.options.map(clean).filter(Boolean);
  const item = {
    question: clean(q.question),
    options,
    answer: resolveAnswer(q.rawAnswer, options),
    explanation: clean(q.explanation),
  };
  return withProblems(item, q.rawAnswer);
}

export function withProblems(item, rawAnswer = item.answer) {
  const problems = [];
  if (!item.question) problems.push("No question text");
  if (item.options.length < 2) problems.push("Needs at least 2 options");
  if (!clean(String(rawAnswer ?? ""))) problems.push("No answer given");
  else if (!item.answer) problems.push(`Answer "${clean(String(rawAnswer))}" doesn't match any option`);
  return { ...item, problems };
}

/** Parses free text (pasted, or extracted from Word/PDF). */
export function parseQuestionsText(text) {
  const out = [];
  let cur = null;
  let field = null;
  const start = (question) => {
    if (cur) out.push(finish(cur));
    cur = { question, options: [], rawAnswer: "", explanation: "" };
    field = "question";
  };

  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const line = stripLead(clean(rawLine));
    if (!line || NOISE_RE.test(line)) continue;
    let m;

    if (cur && (m = line.match(ANSWER_RE))) {
      cur.rawAnswer = m[1];
      field = "answer";
      continue;
    }
    if (cur && (m = line.match(EXPLANATION_RE))) {
      cur.explanation = m[1];
      field = "explanation";
      continue;
    }
    if (cur && !cur.rawAnswer && field !== "explanation") {
      const opts = splitOptions(line, cur.options.length);
      if (opts) {
        cur.options.push(...opts);
        field = "option";
        continue;
      }
    }
    if ((m = line.match(QUESTION_RE)) || (m = line.match(QUESTION_PREFIX_RE))) {
      start(m[2] || "");
      continue;
    }
    // Un-numbered question after a finished one: a line ending in "?" or ":".
    if (cur && (field === "answer" || field === "explanation") && /[?:]$/.test(line)) {
      start(line);
      continue;
    }
    if (!cur) continue; // titles / headings before the first question
    if (field === "question") cur.question += " " + line;
    else if (field === "option") cur.options[cur.options.length - 1] += " " + line;
    else if (field === "explanation") cur.explanation += " " + line;
    else if (field === "answer") cur.rawAnswer += " " + line;
  }
  if (cur) out.push(finish(cur));
  return out;
}

/* ---------- CSV / JSON ---------- */

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const delim = (text.split("\n")[0].match(/;/g) || []).length > (text.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

function fromRecord(rec) {
  const get = (...names) => {
    for (const n of names) {
      const key = Object.keys(rec).find((k) => k.trim().toLowerCase() === n);
      if (key && rec[key] != null && String(rec[key]).trim()) return rec[key];
    }
    return "";
  };
  let options = rec.options;
  if (typeof options === "string") options = options.split("|");
  if (!Array.isArray(options)) {
    options = [];
    for (let i = 0; i < LETTERS.length; i++) {
      const v = get(`option ${i + 1}`, `option${i + 1}`, `option_${i + 1}`, `option ${LETTERS[i].toLowerCase()}`, LETTERS[i].toLowerCase());
      if (v) options.push(v);
    }
  }
  options = options.map((o) => clean(String(o))).filter(Boolean);
  const rawAnswer = get("answer", "correct answer", "correct", "correct_answer", "key");
  return withProblems(
    {
      question: clean(String(get("question", "question text", "questions", "q"))),
      options,
      answer: resolveAnswer(rawAnswer, options),
      explanation: clean(String(get("explanation", "reason", "solution", "rationale"))),
    },
    rawAnswer
  );
}

export function parseQuestionsCsv(text) {
  const rows = parseCsvRows(String(text).replace(/^\uFEFF/, ""));
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => fromRecord(Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""]))));
}

export function parseQuestionsJson(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.questions || data.quiz || [];
  return list.map(fromRecord);
}

/* ---------- Files ---------- */

async function docxToText(file) {
  const mammoth = (await import("mammoth/mammoth.browser.js")).default;
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const lines = [];
  // Word's automatic numbering is lost when the text is read, so put it back.
  // Nested items are options (A. B. C.). For one flat list, an item ending in "?" or ":"
  // (or a long one) is a question and the short items after it are its options.
  let qNo = 0;
  let optNo = -1; // -1 = not inside a question's options
  const labelFor = (text, depth) => {
    if (depth % 2 === 1 || (optNo >= 0 && optNo < LETTERS.length && !/[?:]$/.test(text) && text.length <= 80)) {
      if (optNo < 0) optNo = 0;
      return `${LETTERS[optNo++]}. `;
    }
    qNo += 1;
    optNo = 0;
    return `${qNo}. `;
  };
  const walk = (node, depth) => {
    for (const el of node.children) {
      const tag = el.tagName.toLowerCase();
      if (tag === "ol" || tag === "ul") {
        for (const li of el.children) {
          if (li.tagName.toLowerCase() !== "li") continue;
          const own = [...li.childNodes]
            .filter((c) => !(c.nodeType === 1 && /^(ol|ul)$/i.test(c.tagName)))
            .map((c) => c.textContent)
            .join(" ");
          const text = clean(own);
          if (text) {
            const already = QUESTION_RE.test(text) || QUESTION_PREFIX_RE.test(text) || /^\(?[A-Ha-h][.)]\s/.test(text) || ANSWER_RE.test(text) || EXPLANATION_RE.test(text);
            lines.push((tag === "ol" && !already ? labelFor(text, depth) : "") + text);
          }
          walk(li, depth + 1);
        }
      } else if (tag === "table") {
        for (const cell of el.querySelectorAll("td, th")) lines.push(clean(cell.textContent));
      } else if (/^(p|h[1-6])$/.test(tag)) {
        const text = clean(el.textContent);
        const q = text.match(QUESTION_RE) || text.match(QUESTION_PREFIX_RE);
        if (q) {
          qNo = Number(q[1]);
          optNo = 0;
        } else if (ANSWER_RE.test(stripLead(text))) optNo = -1;
        lines.push(text);
      } else {
        walk(el, depth);
      }
    }
  };
  walk(doc.body.firstElementChild, 0);
  return lines.join("\n");
}

async function pdfToText(file) {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    let lastY = null;
    for (const item of content.items) {
      const y = item.transform?.[5];
      if (lastY !== null && y !== undefined && Math.abs(y - lastY) > 2 && !text.endsWith("\n")) text += "\n";
      text += item.str;
      if (item.hasEOL) text += "\n";
      if (y !== undefined) lastY = y;
    }
    text += "\n";
  }
  return text;
}

/** Reads a file and returns { questions, text }. Throws with a friendly message if the file can't be read. */
export async function importQuestionsFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".json")) return { questions: parseQuestionsJson(await file.text()) };
  if (name.endsWith(".csv")) return { questions: parseQuestionsCsv(await file.text()) };
  let text;
  if (name.endsWith(".docx")) text = await docxToText(file);
  else if (name.endsWith(".pdf")) text = await pdfToText(file);
  else if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) text = await file.text();
  else throw new Error("Use a Word (.docx), PDF, text, CSV or JSON file.");
  if (!clean(text)) throw new Error("No text was found in this file. A scanned PDF or a photo can't be read; paste the questions instead.");
  return { questions: parseQuestionsText(text), text };
}

export const TEMPLATE_TEXT = `Q1. In multi-base ten materials, a SMALL CUBE represents:
A. 1,000
B. 100
C. 10,000
D. 1,000,000
Answer: A
Reason: The small cube is the base unit, representing 1,000.

Q2. How many GH₵200 notes make GH₵185,000,000?
A. 925,000
B. 92,500
C. 1,850,000
D. 9,250
Answer: A
Reason: GH₵185,000,000 ÷ GH₵200 = 925,000 notes.
`;

/** Returns a message listing questions that can't be saved, or "" if all are fine. */
export function quizProblems(quiz) {
  const bad = [];
  quiz.forEach((q, i) => {
    const options = (q.options || []).map((o) => String(o).trim()).filter(Boolean);
    const answer = String(q.answer || "").trim();
    if (!String(q.question || "").trim() || options.length < 2 || !answer || !options.includes(answer)) bad.push(i + 1);
  });
  if (!bad.length) return "";
  return `Please fix question${bad.length > 1 ? "s" : ""} ${bad.join(", ")}: each needs question text, at least 2 options, and a correct answer that matches one of the options exactly.`;
}
