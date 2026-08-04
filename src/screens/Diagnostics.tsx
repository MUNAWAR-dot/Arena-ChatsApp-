import { useState } from "react";
import { runSelfTests, type TestResult } from "../backend/selfTest";
import { db } from "../backend/db";
import { ArrowLeft, Check, X, Refresh } from "../icons";

export function Diagnostics({ onBack }: { onBack: () => void }) {
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [dbStats, setDbStats] = useState<{ store: string; count: number }[] | null>(null);

  const run = async () => {
    setRunning(true);
    setResults(null);
    const res = await runSelfTests();
    setResults(res);
    setDbStats(await db.integrityCheck());
    setRunning(false);
  };

  const passed = results?.filter((r) => r.passed).length || 0;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium flex-1">System Diagnostics</h1>
        <button
          onClick={run}
          disabled={running}
          className="bg-emerald-500 disabled:opacity-50 text-[#111b21] text-sm font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5"
        >
          <Refresh className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
          {running ? "Running…" : "Run tests"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!results && !running && (
          <div className="text-center text-[#8696a0] mt-16 px-6">
            <div className="text-5xl mb-3">🩺</div>
            <p className="text-sm">
              Runs real checks against the live services: database CRUD, indexed queries,
              E2EE round-trip, OTP authentication, message outbox/dedupe, status TTL, and media ingestion.
            </p>
          </div>
        )}

        {running && (
          <div className="flex items-center gap-3 bg-[#202c33] rounded-xl p-4">
            <Refresh className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="text-sm">Executing service checks…</span>
          </div>
        )}

        {results && (
          <>
            <div className={`rounded-xl p-4 flex items-center gap-3 ${passed === results.length ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-red-500/15 border border-red-500/30"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${passed === results.length ? "bg-emerald-500" : "bg-red-500"}`}>
                {passed === results.length ? <Check className="w-5 h-5 text-[#111b21]" /> : <X className="w-5 h-5 text-white" />}
              </div>
              <div>
                <div className="font-semibold">{passed}/{results.length} checks passed</div>
                <div className="text-xs text-[#8696a0]">
                  {passed === results.length ? "All backend services operational" : "Some checks failed — see below"}
                </div>
              </div>
            </div>

            {results.map((r) => (
              <div key={r.name} className={`rounded-xl p-3 flex items-start gap-3 border ${r.passed ? "bg-[#202c33] border-[#222d34]" : "bg-red-500/10 border-red-500/30"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${r.passed ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                  {r.passed ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{r.name}</div>
                  {r.detail && <div className="text-xs text-red-400 mt-0.5 break-words">{r.detail}</div>}
                </div>
                <span className="text-xs text-[#8696a0] shrink-0">{r.ms}ms</span>
              </div>
            ))}

            {dbStats && (
              <div className="bg-[#202c33] rounded-xl p-4">
                <div className="text-sm font-medium mb-2">Database integrity</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {dbStats.map((s) => (
                    <div key={s.store} className="flex justify-between text-xs bg-[#111b21] rounded px-2 py-1">
                      <span className="text-[#8696a0]">{s.store}</span>
                      <span className="text-emerald-400 font-mono">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
