import React, { useState } from "react";
import Feature from "./components/Feature";
import Blocks from "./components/Blocks";
import Settings from "./components/Settings";
import SkeletonCard from "../../common/Skeletons/SkeletonCard";

const STORAGE_KEY = "commercekit_dashboard_tab";
const tabs = ["feature", "blocks", "settings"];

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
        }, 300);
    };

    return (
        <div>
            <div className="border-b border-gray-300 mb-4">
                <ul className="flex items-center justify-start">
                    {tabs.map((tab) => (
                        <li key={tab}>
                            <button
                                className={`py-2 px-4 ${
                                    activeTab === tab
                                        ? "border-b-2 border-[#0029af] text-[#0029af]"
                                        : "text-[#0029af] hover:text-[#0842ff]"
                                }`}
                                onClick={() => handleTabChange(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-6">
                {isTabLoading ? (
                    <div className="mt-4 grid grid-cols-4 md:grid-cols-4 sm:grid-cols-1 gap-6">
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
