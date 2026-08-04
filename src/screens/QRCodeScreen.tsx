import { useStore } from "../store";
import { ArrowLeft } from "../icons";

export function QRCodeScreen({ onBack }: { onBack: () => void }) {
  const { state } = useStore();

  // Generate a fake QR code grid (deterministic from name)
  const seed = state.profile.name + state.profile.phone;
  const grid: boolean[][] = [];
  for (let r = 0; r < 25; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < 25; c++) {
      const h = (seed.charCodeAt((r * 25 + c) % seed.length) + r * 7 + c * 13) % 7;
      row.push(h < 3);
    }
    grid.push(row);
  }
  // Force corners (finder patterns)
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c > 17) || (r > 17 && c < 7);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium">QR code</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-emerald-500 p-1 rounded-2xl">
          <div className="bg-white p-6 rounded-xl">
            <div className="grid grid-cols-25 gap-0" style={{ gridTemplateColumns: "repeat(25, 1fr)" }}>
              {grid.map((row, r) =>
                row.map((on, c) => {
                  let fill = on;
                  if (isFinder(r, c)) {
                    const dr = r < 7 ? r : 24 - r;
                    const dc = c < 7 ? c : 24 - c;
                    const isOn =
                      dr === 0 || dr === 6 || dc === 0 || dc === 6 ||
                      (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
                    fill = isOn;
                  }
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`w-3 h-3 ${fill ? "bg-black" : "bg-white"}`}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-[#8696a0] mt-6">
          Your QR code is private. If you share it with someone, they can scan it with their Chatsapp camera to add you as a contact.
        </p>
        <div className="mt-6 text-center">
          <div className="font-medium text-lg">{state.profile.name}</div>
          <div className="text-sm text-[#8696a0]">{state.profile.phone}</div>
        </div>
        <button className="mt-6 bg-emerald-500 text-[#111b21] px-6 py-2 rounded-full font-medium">
          Share
        </button>
      </div>
    </div>
  );
}
