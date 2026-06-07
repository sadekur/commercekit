import React from "react";

const NumberField = ({ label, value, onChange, suffix, helper, accent = "blue", last = false }) => {
  const accentFocus = {
    red:   "focus-within:border-red-400   focus-within:ring-2 focus-within:ring-red-100",
    amber: "focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100",
    green: "focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100",
    blue:  "focus-within:border-blue-400  focus-within:ring-2 focus-within:ring-blue-100",
  };
  const suffixStyle = {
    red:   "bg-red-500   text-white",
    amber: "bg-amber-500 text-white",
    green: "bg-green-500 text-white",
    blue:  "bg-blue-500  text-white",
  };

  return (
    <div className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors duration-100 ${
      !last ? "border-b border-gray-100" : ""
    }`}>
      <div className="pr-6 min-w-0">
        <p className="m-0 text-[13px] font-semibold text-gray-800 leading-tight">{label}</p>
        {helper && (
          <p className="m-0 mt-1 text-[11px] text-gray-400 leading-relaxed">{helper}</p>
        )}
      </div>

      <div className={`flex items-stretch rounded-lg border border-gray-200 overflow-hidden bg-white flex-shrink-0 transition-all duration-150 ${accentFocus[accent] || accentFocus.blue}`}>
        <input
          type="number"
          value={value}
          onChange={onChange}
          className="w-20 px-3 py-1.5 border-none outline-none text-[13px] font-semibold text-gray-800 bg-transparent font-mono
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className={`px-3 py-1.5 text-[12px] font-bold select-none flex items-center border-l border-gray-200 ${suffixStyle[accent] || suffixStyle.blue}`}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default NumberField;