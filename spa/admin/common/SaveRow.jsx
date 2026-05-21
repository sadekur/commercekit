const SaveRow = ({ isSaving }) => (
    <div className="flex items-center gap-3 pt-1">
        <button
            type="submit"
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-6 py-2.5 text-white text-[13px] font-bold rounded-lg border-none transition-all duration-200 ${
                isSaving
                    ? "bg-gray-400 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-200"
            }`}
        >
            {isSaving ? "Saving…" : "Save Changes"}
        </button>
        <span className="text-xs text-gray-400">Changes are applied immediately after saving.</span>
    </div>
);
export default SaveRow;