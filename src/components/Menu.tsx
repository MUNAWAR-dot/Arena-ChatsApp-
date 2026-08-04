export function Menu({
  onClose,
  items,
}: {
  onClose: () => void;
  items: { label: string; action?: () => void }[];
}) {
  return (
    <div className="absolute inset-0 z-40" onClick={onClose}>
      <div
        className="absolute right-2 top-12 bg-[#233138] rounded-md shadow-lg py-2 w-52 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((it) => (
          <button
            key={it.label}
            onClick={() => { it.action?.(); onClose(); }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10"
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
