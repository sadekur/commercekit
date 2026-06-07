const TabBtn = ({ active, onClick, icon, label, count }) => (
    <button
        type="button"
        onClick={onClick}
        className={`relative flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold border-b-2 transition-all duration-150 bg-transparent cursor-pointer whitespace-nowrap ${
            active
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
        }`}
    >
        <span>{icon}</span>
        {label}
        {count !== undefined && (
            <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${
                active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
            }`}>
                {count}
            </span>
        )}
    </button>
);

export default TabBtn;