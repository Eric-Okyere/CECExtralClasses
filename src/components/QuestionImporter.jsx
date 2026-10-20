import { useRef, useState } from "react";
import { Upload, X, Loader2, FileText, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { importQuestionsFromFile, parseQuestionsText, TEMPLATE_TEXT } from "../utils/questionImport";

/**
 * "Import questions" dialog for the lesson builder.
 * Reads a Word, PDF, text, CSV or JSON file (or pasted text), shows a preview,
 * then hands the questions back with onImport(questions, mode) where mode is "add" or "replace".
 */
export default function QuestionImporter({ open, onClose, onImport, existingCount = 0 }) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("add");
  const fileRef = useRef(null);

  if (!open) return null;

  const reset = () => {
    setText("");
    setFileName("");
    setQuestions(null);
    setError("");
    setMode("add");
    if (fileRef.current) fileRef.current.value = "";
  };
  const close = () => {
    reset();
    onClose();
  };

  const readFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError("");
    setQuestions(null);
    setFileName(file.name);
    try {
      const { questions: found } = await importQuestionsFromFile(file);
      if (found.length === 0) setError("No questions were found. Check the layout matches the example, or paste the questions below.");
      else setQuestions(found);
    } catch (err) {
      setError(err?.message || "This file couldn't be read.");
    } finally {
      setBusy(false);
    }
  };

  const readPasted = () => {
    setError("");
    const found = parseQuestionsText(text);
    if (found.length === 0) setError("No questions were found. Number each question (Q1. or 1.) and letter each option (A. B. C. D.).");
    else setQuestions(found);
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE_TEXT], { type: "text/plain;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "question-import-example.txt" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const flagged = questions?.filter((q) => q.problems.length) || [];
  const confirm = () => {
    onImport(
      questions.map(({ question, options, answer, explanation }) => ({ question, options, answer, explanation })),
      mode
    );
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100">
          <h2 id="import-title" className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <Upload size={18} className="text-blue-600" /> Import questions
          </h2>
          <button type="button" onClick={close} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {!questions && (
            <>
              <label
                className="block border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 transition"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  readFile(e.dataTransfer.files?.[0]);
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".docx,.pdf,.txt,.csv,.json,text/plain"
                  className="sr-only"
                  onChange={(e) => readFile(e.target.files?.[0])}
                />
                {busy ? (
                  <Loader2 className="mx-auto animate-spin text-blue-600" size={28} />
                ) : (
                  <FileText className="mx-auto text-slate-400" size={28} />
                )}
                <p className="mt-3 text-sm font-bold text-slate-700">
                  {busy ? `Reading ${fileName}…` : "Choose a file or drop it here"}
                </p>
                <p className="mt-1 text-xs text-slate-500">Word (.docx), PDF, text, CSV or JSON</p>
              </label>

              <div>
                <label htmlFor="import-paste" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Or paste your questions
                </label>
                <textarea
                  id="import-paste"
                  rows={9}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={TEMPLATE_TEXT}
                  className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-mono leading-relaxed outline-none focus:ring-2 ring-blue-500"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <button type="button" onClick={downloadTemplate} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                    <Download size={14} /> Download an example
                  </button>
                  <button
                    type="button"
                    disabled={!text.trim()}
                    onClick={readPasted}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-40"
                  >
                    Read questions
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Number each question (<b>Q1.</b> or <b>1.</b>), letter the options (<b>A.</b> <b>B.</b> <b>C.</b> <b>D.</b>), then
                add <b>Answer:</b> and, if you like, <b>Reason:</b> or <b>Explanation:</b>. For CSV, use the columns
                question, option a, option b, option c, option d, answer, explanation.
              </p>
            </>
          )}

          {error && (
            <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-xl p-3" role="alert">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          {questions && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                  <CheckCircle2 size={16} /> {questions.length - flagged.length} ready
                </span>
                {flagged.length > 0 && (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
                    <AlertTriangle size={16} /> {flagged.length} need fixing after import
                  </span>
                )}
                {fileName && <span className="text-xs text-slate-500">from {fileName}</span>}
              </div>

              <ol className="space-y-3">
                {questions.map((q, i) => (
                  <li key={i} className={`rounded-2xl border p-4 ${q.problems.length ? "border-amber-300 bg-amber-50/50" : "border-slate-100"}`}>
                    <p className="text-sm font-bold text-slate-800">
                      {i + 1}. {q.question || <em className="text-slate-400">No question text</em>}
                    </p>
                    <ul className="mt-2 grid sm:grid-cols-2 gap-1.5">
                      {q.options.map((o, j) => (
                        <li
                          key={j}
                          className={`text-xs px-3 py-1.5 rounded-lg ${o === q.answer ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-50 text-slate-600"}`}
                        >
                          {String.fromCharCode(65 + j)}. {o}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && <p className="mt-2 text-xs italic text-blue-700">{q.explanation}</p>}
                    {q.problems.length > 0 && <p className="mt-2 text-xs font-bold text-amber-700">{q.problems.join(" · ")}</p>}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>

        {questions && (
          <div className="border-t border-slate-100 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
            {existingCount > 0 ? (
              <fieldset className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                <legend className="sr-only">Existing questions</legend>
                <label className="flex items-center gap-1.5">
                  <input type="radio" name="import-mode" checked={mode === "add"} onChange={() => setMode("add")} />
                  Add to the {existingCount} existing
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="radio" name="import-mode" checked={mode === "replace"} onChange={() => setMode("replace")} />
                  Replace them
                </label>
              </fieldset>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={reset} className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">
                Start again
              </button>
              <button
                type="button"
                onClick={confirm}
                className="bg-emerald-500 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600"
              >
                Import {questions.length} {questions.length === 1 ? "question" : "questions"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

