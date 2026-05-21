const SmallNumberInput = ({ value, onChange, placeholder = "" }) => (
    <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min="0"
        className="w-16 px-2 py-1.5 text-[13px] text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150 font-mono"
    />
);
