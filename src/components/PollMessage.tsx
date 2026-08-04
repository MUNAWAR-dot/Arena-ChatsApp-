import type { Poll } from "../data";
import { useStore } from "../store";

export function PollMessage({
  poll,
  chatId,
  messageId,
  isMine,
}: {
  poll: Poll;
  chatId: string;
  messageId: string;
  isMine?: boolean;
}) {
  const { state, dispatch } = useStore();
  const me = state.profile.name;
  const totalVotes = poll.options.reduce((s, o) => s + o.votes.length, 0);
  const isClosed = state.closedPolls.includes(messageId);

  return (
    <div className="min-w-[220px] py-1">
      <div className="text-sm font-medium mb-1">📊 {poll.question}</div>
      {isClosed && (
        <div className="text-[10px] text-orange-300 mb-2">🔒 Poll closed</div>
      )}
      {!isClosed && poll.multiple && (
        <div className="text-[10px] text-emerald-300 mb-2">Select one or more</div>
      )}
      <div className="space-y-2">
        {poll.options.map((o) => {
          const pct = totalVotes ? Math.round((o.votes.length / totalVotes) * 100) : 0;
          const myVote = o.votes.includes(me);
          return (
            <button
              key={o.id}
              onClick={() => !isClosed && dispatch({ type: "VOTE_POLL", chatId, messageId, optionId: o.id, voter: me })}
              disabled={isClosed}
              className="w-full text-left disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1">
                  <span className={`w-4 h-4 rounded-full border ${myVote ? "bg-emerald-500 border-emerald-500" : "border-zinc-400"} flex items-center justify-center`}>
                    {myVote && <span className="text-[10px] text-white">✓</span>}
                  </span>
                  {o.text}
                </span>
                <span className="text-[#8696a0]">{o.votes.length}</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${myVote ? "bg-emerald-500" : "bg-zinc-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-[#8696a0]">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
        {isMine && !isClosed && (
          <button
            onClick={() => {
              if (confirm("Close this poll? No more votes can be cast.")) {
                dispatch({ type: "CLOSE_POLL", messageId });
              }
            }}
            className="text-[10px] text-orange-300 hover:text-orange-400 underline"
          >
            Close poll
          </button>
        )}
      </div>
    </div>
  );
}
