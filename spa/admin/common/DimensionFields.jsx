import SmallNumberInput from "./SmallNumberInput";

const SIDES = ["top", "right", "bottom", "left"];

const sideIcon = {
    top:    "↑",
    right:  "→",
    bottom: "↓",
    left:   "←",
};

const DimensionFields = ({ value, onChange }) => (
    <div className="flex items-end gap-2">
        {SIDES.map((side) => (
            <div key={side} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-0.5">
                    <span className="text-[11px] text-gray-300">{sideIcon[side]}</span>
                    {side}
                </span>
                <SmallNumberInput
                    value={value[side]}
                    onChange={(v) => onChange({ ...value, [side]: v })}
                    placeholder="px"
                />
            </div>
        ))}
    </div>
);

export default DimensionFields;