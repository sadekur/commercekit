const Pill = ({ color, label }) => {
  const colorMap = {
    red: "bg-red-500/10 text-red-500 border-red-500/30",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    green: "bg-green-500/10 text-green-500 border-green-500/30",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  };
  const colorClass = colorMap[color] || colorMap.blue;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase border ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

export default Pill;