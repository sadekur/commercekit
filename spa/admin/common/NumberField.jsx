import React from 'react'

const NumberField = ({ label, value, onChange, suffix, helper }) => (
  <div className="flex items-center px-6 py-3 gap-4 border-b border-gray-100 last:border-b-0">
    <div className="w-56 flex-shrink-0">
      <p className="m-0 text-[13px] font-semibold text-gray-700">{label}</p>
      {helper && <p className="m-0 mt-0.5 text-[11px] text-gray-400">{helper}</p>}
    </div>
    <div className="flex items-stretch rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-150">
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-20 px-3 py-1.5 border-none outline-none text-sm font-semibold text-gray-800 bg-transparent font-mono"
      />
      {suffix && (
        <span className="px-3 py-1.5 text-[13px] font-bold text-white bg-gray-700 border-l border-gray-200 select-none flex items-center">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

export default NumberField
