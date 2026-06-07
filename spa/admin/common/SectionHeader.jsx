import Pill from "./Pill";

const SectionHeader = ({ icon, title, color, description }) => {
  const styles = {
    red:   { wrap: "bg-red-50 border-b border-red-100",    dot: "bg-red-400" },
    amber: { wrap: "bg-amber-50 border-b border-amber-100", dot: "bg-amber-400" },
    green: { wrap: "bg-green-50 border-b border-green-100", dot: "bg-green-400" },
    blue:  { wrap: "bg-blue-50 border-b border-blue-100",   dot: "bg-blue-400" },
  };
  const s = styles[color] || styles.blue;

  const textColor = {
    red:   "text-red-700",
    amber: "text-amber-700",
    green: "text-green-700",
    blue:  "text-blue-700",
  }[color] || "text-blue-700";

  const subColor = {
    red:   "text-red-500",
    amber: "text-amber-500",
    green: "text-green-600",
    blue:  "text-blue-500",
  }[color] || "text-blue-500";

  return (
    <div className={`flex items-center gap-3 px-5 py-3 ${s.wrap}`}>
      {/* coloured left accent dot */}
      <span className={`w-1.5 h-6 rounded-full flex-shrink-0 ${s.dot}`} />

      <span className="text-lg leading-none flex-shrink-0">{icon}</span>

      <div className="flex-1 min-w-0">
        <p className={`m-0 text-[13px] font-bold leading-tight ${textColor}`}>{title}</p>
        {description && (
          <p className={`m-0 mt-0.5 text-[11px] leading-tight ${subColor}`}>{description}</p>
        )}
      </div>

      <Pill color={color} label={title.split(" ")[0]} />
    </div>
  );
};

export default SectionHeader;