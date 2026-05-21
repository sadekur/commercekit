const ColorField = ({ value, onChange }) => (
    <div className="flex items-center gap-3">
        <span className="text-[12px] text-gray-400 font-mono uppercase w-16">
            {value || "—"}
        </span>
        <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 p-1 rounded border border-gray-300 cursor-pointer"
        />
    </div>
);