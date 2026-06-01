import React from "react";

const SkeletonCard = () => {
    return (
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm animate-pulse flex flex-col">
            {/* icon + badge row */}
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="w-20 h-5 bg-gray-100 rounded-full" />
            </div>
            {/* title */}
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            {/* description */}
            <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
                <div className="h-3 bg-gray-100 rounded w-4/6" />
            </div>
            {/* bottom row */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="w-20 h-6 bg-gray-100 rounded-lg" />
                <div className="w-11 h-6 bg-gray-200 rounded-full" />
            </div>
        </div>
    );
};

export default SkeletonCard;
