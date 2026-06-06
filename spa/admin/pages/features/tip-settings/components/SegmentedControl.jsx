
/**
 * Segmented control — replaces the Tip Type <select> for a binary choice.
 * Fires onChange({ target: { value } }) so the parent set() call is identical.
 */
const SegmentedControl = ({ value, onChange, options }) => (
    <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        {options.map((opt) => {
            const active = value === opt.value;
            return (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ target: { value: opt.value } })}
                    className={`px-4 py-1.5 text-[12px] font-semibold transition-all duration-150 border-none cursor-pointer
                        ${active
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        }`}
                >
                    {opt.label}
                </button>
            );
        })}
    </div>
);

export default SegmentedControl;