import { useState, useMemo, useRef } from "react";
import { COUNTRIES, type Country } from "../countries";
import { ArrowLeft, Search, Check, X } from "../icons";

const POPULAR_CODES = ["US", "GB", "IN", "AU", "CA", "PK", "NG", "PH", "DE", "FR"];

export function CountryPicker({
  current,
  onPick,
  onClose,
}: {
  current?: string; // country code (e.g. "US")
  onPick: (country: Country) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Robust search: name, ISO code, dial code, flag ─────────
  const filtered = useMemo(() => {
    const raw = query.trim();
    if (!raw) return null;

    const qLower = raw.toLowerCase();
    const qName = qLower.replace(/[^a-z0-9]/g, "");
    const qDial = raw.replace(/[^0-9]/g, "");
    const isNumeric = /^\+?\d+$/.test(raw);

    return COUNTRIES.filter((c) => {
      const name = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const dial = c.dial.replace(/[^0-9]/g, "");
      const code = c.code.toLowerCase();
      const flag = c.flag;

      if (isNumeric) {
        return qDial.length <= 2 ? dial.startsWith(qDial) : dial.includes(qDial);
      }
      return (
        name.includes(qName) ||
        code.includes(qName) ||
        dial.includes(qDial) ||
        flag === raw
      );
    });
  }, [query]);

  // ── Alphabet sections for the full list ────────────────────
  const sections = useMemo(() => {
    const map = new Map<string, Country[]>();
    COUNTRIES.forEach((c) => {
      const letter = c.name[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(c);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, []);

  const popular = useMemo(
    () => POPULAR_CODES.map((code) => COUNTRIES.find((c) => c.code === code)).filter(Boolean) as Country[],
    []
  );

  const isSearching = !!query;

  return (
    <div className="absolute inset-0 z-50 bg-[#111b21] flex flex-col text-white">
      <header className="flex items-center gap-3 px-2 py-3 bg-[#202c33]">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium flex-1">Choose a country</h1>
        {current && (
          <span className="text-xs text-[#8696a0]">
            {COUNTRIES.find((c) => c.code === current)?.flag} {current}
          </span>
        )}
      </header>

      {/* Search field — isolated from any parent click handlers */}
      <div
        className="px-3 py-2 border-b border-[#222d34]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="bg-[#202c33] rounded-full flex items-center gap-2 px-3 py-2">
          <Search className="w-4 h-4 text-[#8696a0] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Search country name or dial code"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#8696a0] min-w-0"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-[#8696a0] hover:text-white p-0.5 shrink-0"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          filtered && filtered.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs text-[#8696a0]">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
              </div>
              {filtered.map((c) => (
                <CountryRow
                  key={c.code + c.dial}
                  c={c}
                  selected={current === c.code}
                  onPick={() => { onPick(c); onClose(); }}
                />
              ))}
            </>
          ) : (
            <div className="text-center text-sm text-[#8696a0] mt-16 px-6">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              No country found for "{query}"
              <div className="text-xs mt-2">Try "India", "91", "+1" or "US"</div>
            </div>
          )
        ) : (
          <>
            <div className="px-4 py-2 text-xs uppercase tracking-wide text-emerald-400">Popular</div>
            {popular.map((c) => (
              <CountryRow
                key={"pop-" + c.code}
                c={c}
                selected={current === c.code}
                onPick={() => { onPick(c); onClose(); }}
              />
            ))}
            <div className="px-4 py-2 text-xs uppercase tracking-wide text-emerald-400 mt-2">All countries</div>
            {sections.map(([letter, list]) => (
              <div key={letter}>
                <div className="px-4 py-1.5 bg-[#182229] text-xs font-semibold text-[#8696a0] sticky top-0 z-10">
                  {letter}
                </div>
                {list.map((c) => (
                  <CountryRow
                    key={c.code + c.dial}
                    c={c}
                    selected={current === c.code}
                    onPick={() => { onPick(c); onClose(); }}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function CountryRow({
  c,
  selected,
  onPick,
}: {
  c: Country;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#202c33] text-left transition-colors ${
        selected ? "bg-emerald-500/10" : ""
      }`}
    >
      <span className="w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center text-lg shrink-0">
        {c.flag}
      </span>
      <span className="flex-1 truncate">{c.name}</span>
      <span className="text-[#8696a0] text-sm font-mono">{c.dial}</span>
      {selected && <Check className="w-4 h-4 text-emerald-400 ml-2 shrink-0" />}
    </button>
  );
}
