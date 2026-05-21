const DimensionFields = ({ value, onChange }) => (
    <div className="flex gap-3 flex-wrap">
        {["top", "right", "bottom", "left"].map((side) => (
            <label key={side} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 capitalize">{side}</span>
                <SmallNumberInput
                    value={value[side]}
                    onChange={(v) => onChange({ ...value, [side]: v })}
                />
            </label>
        ))}
    </div>
);