import React, { useState } from "react";
import Feature from "./tabs/Feature";
import Blocks from "./tabs/Blocks";
import Settings from "./tabs/Settings";
import SkeletonCard from "../../common/Skeletons/SkeletonCard";

const STORAGE_KEY = "commercekit_dashboard_tab";

const TABS = [
    { id: "feature",  label: "Features", icon: "⚡" },
    { id: "blocks",   label: "Blocks",   icon: "🧩" },
    { id: "settings", label: "Settings", icon: "⚙️" },
];

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState(
        () => localStorage.getItem(STORAGE_KEY) || "feature"
    );
    const [isTabLoading, setIsTabLoading] = useState(false);

    const handleTabChange = (tab) => {
        if (tab === activeTab) return;
        setIsTabLoading(true);
        setTimeout(() => {
            setActiveTab(tab);
            localStorage.setItem(STORAGE_KEY, tab);
            setIsTabLoading(false);
        }, 200);
    };

    return (
        <div className="w-full">
            {/* Plugin banner */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-200">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-[17px] flex-shrink-0">
                    C
                </div>
                <div>
                    <h1 className="m-0 text-[18px] font-bold text-gray-900 leading-tight">CommerceKit</h1>
                    <p className="m-0 text-[12px] text-gray-500">WooCommerce Enhancement Toolkit · v1.0.0</p>
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 border-b border-gray-200 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-colors duration-150 bg-transparent cursor-pointer ${
                            activeTab === tab.id
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <span className="text-base leading-none">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div>
                {isTabLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <>
                        {activeTab === "feature"  && <Feature />}
                        {activeTab === "blocks"   && <Blocks />}
                        {activeTab === "settings" && <Settings />}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
