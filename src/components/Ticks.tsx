export function Ticks({ status }: { status?: "sent" | "delivered" | "read" }) {
  if (!status) return null;
  const color = status === "read" ? "#53bdeb" : "#8696a0";
  if (status === "sent") {
    return (
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none" className="inline-block ml-1 align-middle">
        <path d="M11.071 0.653L4.935 7.181 1.929 4.347 0.5 5.766 4.929 10.347 12.5 2.072z" fill={color} />
      </svg>
    );
  }
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" className="inline-block ml-1 align-middle">
      <path d="M11.071 0.653L4.935 7.181 1.929 4.347 0.5 5.766 4.929 10.347 12.5 2.072z" fill={color} />
      <path d="M15.516 0.653L9.38 7.181 8.473 6.327 7.045 7.747 9.38 10.347 16 2.072z" fill={color} />
    </svg>
  );
}
