const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <span
      onClick={() => onChange({ target: { checked: !checked } })}
      className={`relative inline-block w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer ${
        checked ? "bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-md transition-left duration-200 ${
          checked ? "left-[23px]" : "left-[3px]"
        }`}
      />
    </span>
    <span className="text-sm text-gray-600 font-medium">{label}</span>
  </label>
);

export default Toggle;