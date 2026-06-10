import React, { useEffect, useState } from "react";
import axios from "axios";
import Toggle from "../../../common/Toggle";
import SkeletonCard from "../../../common/Skeletons/SkeletonCard";

const BLOCKS = [
    {
        name: "accordion",
        icon: "📂",
        iconBg: "bg-orange-50",
        label: "Accordion",
        description: "Collapsible content sections with full border, font, color, and button styling control. Sections remember their open/closed state between editor and frontend.",
        status: "complete",
    },
    {
        name: "category-products-slider",
        icon: "🎠",
        iconBg: "bg-purple-50",
        label: "Category Products Slider",
        description: "A sliding product carousel filtered by a WooCommerce category. Shows product image, name, short description, and price. Supports autoplay and prev/next navigation.",
        status: "complete",
    },
];

const STATUS = {
    complete: { label: "Complete",    dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    soon:     { label: "Coming Soon", dot: "bg-gray-400",    cls: "bg-gray-100  text-gray-500   border-gray-200"   },
};

const initValues = () => Object.fromEntries(BLOCKS.map((b) => [b.name, false]));

const Blocks = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [saveState, setSaveState] = useState("idle");
    const [values,    setValues]    = useState(initValues);

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(`${COMMERCEKIT.apiurl}/get-block-register`)
            .then((r) => {
                const data = r.data || {};
                setValues(Object.fromEntries(BLOCKS.map((b) => [b.name, data[b.name] === "on"])));
            })
            .catch((err) => console.error("Error loading blocks:", err))
            .finally(() => setIsLoading(false));
    }, []);

    const persist = (nextValues) => {
        setSaveState("saving");
        const payload = Object.fromEntries(
            Object.entries(nextValues).map(([k, v]) => [k, v ? "on" : "off"])
        );
        axios
            .post(
                `${COMMERCEKIT.apiurl}/block-register-save`,
                { settings: payload },
                { headers: { "Content-Type": "application/json", "X-WP-Nonce": COMMERCEKIT.nonce } }
            )
            .then(() => {
                setSaveState("saved");
                setTimeout(() => setSaveState("idle"), 2000);
            })
            .catch((err) => {
                console.error("Error saving blocks:", err);
                setSaveState("error");
                setTimeout(() => setSaveState("idle"), 2500);
            });
    };

    const handleToggle = (name) => {
        setValues((prev) => {
            const next = { ...prev, [name]: !prev[name] };
            persist(next);
            return next;
        });
    };

    const setAll = (val) => {
        const next = Object.fromEntries(BLOCKS.map((b) => [b.name, val]));
        setValues(next);
        persist(next);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="m-0 text-[15px] font-bold text-gray-900">Manage Blocks</h2>
                    <p className="m-0 mt-0.5 text-[12px] text-gray-500">
                        Enabled blocks appear in the Gutenberg block inserter
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {saveState !== "idle" && (
                        <span
                            className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border ${
                                saveState === "saving"
                                    ? "text-blue-600 bg-blue-50 border-blue-200"
                                    : saveState === "saved"
                                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                    : "text-red-600 bg-red-50 border-red-200"
                            }`}
                        >
                            {saveState === "saving" && "Saving…"}
                            {saveState === "saved"  && "✓ Saved"}
                            {saveState === "error"  && "✕ Error"}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => setAll(false)}
                        className="px-3.5 py-1.5 text-[12px] font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                    >
                        Disable All
                    </button>
                    <button
                        type="button"
                        onClick={() => setAll(true)}
                        className="px-3.5 py-1.5 text-[12px] font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                    >
                        Enable All
                    </button>
                </div>
            </div>

            {/* Block grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : BLOCKS.map((block) => {
                        const badge   = STATUS[block.status];
                        const enabled = values[block.name];
                        return (
                            <div
                                key={block.name}
                                className={`relative bg-white rounded-xl border flex flex-col overflow-hidden transition-all duration-200 ${
                                    enabled
                                        ? "border-blue-200 shadow-sm hover:shadow-md"
                                        : "border-gray-200 shadow-sm hover:shadow-md"
                                }`}
                            >
                                {/* Top accent bar */}
                                <div className={`h-1 w-full ${enabled ? "bg-blue-500" : "bg-transparent"}`} />

                                <div className="p-5 flex flex-col flex-1">
                                    {/* Icon + badge */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${block.iconBg}`}>
                                            {block.icon}
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.cls}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Title + description */}
                                    <div className="flex-1">
                                        <h3 className="m-0 mb-1.5 text-[13px] font-bold text-gray-900 leading-snug">
                                            {block.label}
                                        </h3>
                                        <p className="m-0 text-[11.5px] text-gray-500 leading-relaxed line-clamp-4">
                                            {block.description}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className={`text-[11.5px] font-semibold ${enabled ? "text-blue-600" : "text-gray-400"}`}>
                                            {enabled ? "Enabled" : "Disabled"}
                                        </span>
                                        <Toggle
                                            checked={enabled}
                                            onChange={() => handleToggle(block.name)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default Blocks;
