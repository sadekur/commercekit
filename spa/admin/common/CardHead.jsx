import Badge from "./Badge";

/** Card header */
const CardHead = ({ icon, iconBg, title, description, badge, badgeColor }) => (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${iconBg}`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="m-0 text-[13px] font-semibold text-gray-900 leading-tight">{title}</p>
            {description && (
                <p className="m-0 mt-0.5 text-[11px] text-gray-400 leading-tight">{description}</p>
            )}
        </div>
        {badge && <Badge color={badgeColor}>{badge}</Badge>}
    </div>
);

export default CardHead