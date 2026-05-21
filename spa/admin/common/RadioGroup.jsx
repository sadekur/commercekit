const RadioGroup = ({ options, value, onChange }) => (
    <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                    type="radio"
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={() => onChange(opt.value)}
                    className="accent-blue-600"
                />
                <span className="text-[13px] text-gray-700">{opt.label}</span>
            </label>
        ))}
    </div>
);