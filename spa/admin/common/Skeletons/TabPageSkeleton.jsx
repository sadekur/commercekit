import React from "react";

const TabPageSkeleton = ({ showTabs = true, cardCount = 3, rowsPerCard = 2 }) => {
    return (
        <div className="max-w-3xl animate-pulse">
            {showTabs && (
                <div className="flex border-b border-gray-200 mb-4 gap-1">
                    <div className="h-9 w-24 bg-gray-200 rounded-t-md"></div>
                    <div className="h-9 w-28 bg-gray-100 rounded-t-md"></div>
                </div>
            )}

            <div className="space-y-4">
                {Array.from({ length: cardCount }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-100">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        </div>
                        {Array.from({ length: rowsPerCard }).map((_, j) => (
                            <div key={j} className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-b-0">
                                <div className="flex-1 pr-8">
                                    <div className="h-3.5 bg-gray-200 rounded w-2/5 mb-2"></div>
                                    <div className="h-3 bg-gray-100 rounded w-3/5"></div>
                                </div>
                                <div className="h-6 w-11 bg-gray-200 rounded-full flex-shrink-0"></div>
                            </div>
                        ))}
                    </div>
                ))}

                <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    );
};

export default TabPageSkeleton;
