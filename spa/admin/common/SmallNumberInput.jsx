const SmallNumberInput = ({ value, onChange, placeholder = "" }) => (
    <div className="relative inline-flex items-center">
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            min="0"
            className="w-20 h-9 pl-3 pr-7 text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded-lg
                       placeholder:text-gray-300 font-mono
                       hover:border-blue-400 hover:bg-white
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white
                       transition-all duration-150
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {placeholder && (
            <span className="absolute right-2.5 text-[10px] text-gray-400 pointer-events-none font-medium">
                {placeholder}
            </span>
        )}
    </div>
);

export default SmallNumberInput;