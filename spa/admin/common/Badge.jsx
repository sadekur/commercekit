/* ─── design-only sub-components (pure Tailwind) ─────────────────────────── */

/** Coloured pill badge */
const Badge = ({ children, color = "blue" }) => {
    const cls = {
        blue:  "bg-blue-50 text-blue-700 border border-blue-200",
        amber: "bg-amber-50 text-amber-700 border border-amber-200",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${cls[color]}`}>
            {children}
        </span>
    );
};

export default Badge;