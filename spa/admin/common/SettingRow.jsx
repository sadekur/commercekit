
const SettingRow = ({ label, description, children, border = true }) => (
    <div className={`flex items-start justify-between px-6 py-4 ${border ? "border-b border-gray-100" : ""}`}>
        <div className="pr-6 flex-1">
            <p className="m-0 text-[13px] font-semibold text-gray-800">{label}</p>
            {description && <p className="m-0 mt-1 text-[12px] text-gray-500">{description}</p>}
        </div>
        <div className="flex-shrink-0">{children}</div>
    </div>
);

export default SettingRow;