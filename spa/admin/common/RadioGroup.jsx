const RadioGroup = ({ options, value, onChange }) => (
    <div className="flex flex-col gap-1.5">
        {options.map((opt) => {
            const active = value === opt.value;
            return (
                <label
                    key={opt.value}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer border transition-all duration-150 ${
                        active
                            ? "bg-blue-50 border-blue-300 shadow-sm"
                            : "bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300"
                    }`}
                >
                    {/* hidden native radio keeps full functionality */}
                    <input
                        type="radio"
                        value={opt.value}
                        checked={active}
                        onChange={() => onChange(opt.value)}
                        className="sr-only"
                    />
                    {/* custom dot */}
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                        active ? "border-blue-600 bg-white" : "border-gray-300 bg-white"
                    }`}>
                        {active && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 block" />
                        )}
                    </span>
                    <span className={`text-[13px] font-medium leading-tight ${active ? "text-blue-700" : "text-gray-600"}`}>
                        {opt.label}
                    </span>
                </label>
            );
        })}
    </div>
);

export default RadioGroup;