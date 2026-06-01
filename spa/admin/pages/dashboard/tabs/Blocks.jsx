import React, { useEffect, useState } from "react";
import axios from "axios";
import Toggle from "../../../common/Toggle";

const BLOCKS = [
    {
        name: "accordion",
        icon: "📂",
        label: "Accordion",
        description: "Collapsible content sections with full border, font, and color styling control.",
        status: "complete",
    },
    {
        name: "category-products-slider",
        icon: "🎠",
        label: "Category Products Slider",
        description: "Sliding product carousel filtered by a WooCommerce category, with autoplay support.",
        status: "complete",
    },
    {
        name: "generic-faq",
        icon: "❓",
        label: "Generic FAQ",
        description: "FAQ block for pages and posts. Currently displays hardcoded placeholder content only.",
        status: "soon",
    },
    {
        name: "variant-faq",
        icon: "🔀",
        label: "Variant FAQ",
        description: "Variant-specific FAQ block. Currently displays hardcoded placeholder content only.",
        status: "soon",
    },
];

const STATUS = {
    complete: { label: "Complete",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    soon:     { label: "Coming Soon", cls: "bg-gray-100  text-gray-500   border-gray-200"   },
};

// saveState: 'idle' | 'saving' | 'saved' | 'error'
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

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-[76px] bg-white rounded-xl border border-gray-200 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="m-0 text-[15px] font-bold text-gray-900">Manage Blocks</h2>
                    <p className="m-0 mt-0.5 text-[12px] text-gray-500">
                        Enabled blocks appear in the Gutenberg block inserter
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Auto-save indicator */}
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
                        className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Disable All
                    </button>
                    <button
                        type="button"
                        onClick={() => setAll(true)}
                        className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Enable All
                    </button>
                </div>
            </div>

            {/* Block list */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {BLOCKS.map((block, idx) => {
                    const badge  = STATUS[block.status];
                    const isLast = idx === BLOCKS.length - 1;
                    return (
                        <div
                            key={block.name}
                            className={`flex items-center gap-4 px-5 py-4 ${
                                !isLast ? "border-b border-gray-100" : ""
                            }`}
                        >
                            {/* Icon */}
                            <span className="text-2xl w-8 text-center flex-shrink-0">{block.icon}</span>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[14px] font-semibold text-gray-900">
                                        {block.label}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.cls}`}
                                    >
                                        {badge.label}
                                    </span>
                                </div>
                                <p className="m-0 mt-0.5 text-[12px] text-gray-500 leading-relaxed">
                                    {block.description}
                                </p>
                            </div>

                            {/* Toggle */}
                            <div className="flex-shrink-0">
                                <Toggle
                                    checked={values[block.name]}
                                    onChange={() => handleToggle(block.name)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Blocks;
