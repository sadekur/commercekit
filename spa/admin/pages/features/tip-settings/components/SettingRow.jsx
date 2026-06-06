
/** Setting row */
const SettingRow = ({ label, description, hint, last, children }) => (
    <div className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors duration-100 ${!last ? "border-b border-gray-100" : ""}`}>
        <div className="pr-6 min-w-0">
            <p className="m-0 text-[13px] font-semibold text-gray-800 leading-tight">{label}</p>
            {description && (
                <p className="m-0 mt-1 text-[11px] text-gray-400 leading-relaxed">{description}</p>
            )}
            {hint && <p className="m-0 mt-0.5 text-[11px] text-gray-400">{hint}</p>}
        </div>
        <div className="flex-shrink-0">{children}</div>
    </div>
);
export default SettingRow;