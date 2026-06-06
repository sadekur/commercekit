const FancyInput = (props) => (
  <input
    {...props}
    className="
      w-48 h-9 px-3 text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded-lg
      placeholder:text-gray-400
      hover:border-blue-400 hover:bg-white

      focus:!outline-none
      focus:!border-blue-500
      focus:!shadow-none
      focus:!ring-2
      focus:!ring-blue-100
      focus:!bg-white

      transition-all duration-150
    "
  />
);

export default FancyInput;
