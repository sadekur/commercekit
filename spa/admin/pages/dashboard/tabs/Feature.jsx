import React, { useEffect, useState } from "react";
import axios from "axios";
import Toggle from "../../../common/Toggle";
import SkeletonCard from "../../../common/Skeletons/SkeletonCard";

const FEATURES = [
    {
        name: "stock-threshold-for-wc",
        icon: "📈",
        iconBg: "bg-blue-50",
        label: "Stock Threshold for WooCommerce",
        description: "Dynamically adjusts product prices based on current stock levels. Adds customer-visible low, medium, and high stock messages across product, cart, checkout, and order pages.",
        status: "complete",
        configHash: "/stock-threshold",
    },
    {
        name: "buy-button-for-woocommerce",
        icon: "🛒",
        iconBg: "bg-emerald-50",
        label: "Buy Button for WooCommerce",
        description: "Adds a customisable Buy Now button that clears the cart and redirects the customer directly to checkout. Supports single product, archive pages, and a shortcode.",
        status: "complete",
        configHash: "/buy-button-settings",
    },
    {
        name: "woocommerce-tips",
        icon: "💡",
        iconBg: "bg-amber-50",
        label: "WooCommerce Tips",
        description: "Adds a tip form to the cart and checkout pages. Customers choose a preset rate, enter a custom amount, or select cash. Tip is added as a fee to the order total.",
        status: "complete",
        configHash: "/commerce-kit-tip-settings",
    },
    {
        name: "woocommerce-faq",
        icon: "❓",
        iconBg: "bg-violet-50",
        label: "WooCommerce FAQ",
        description: "Attach frequently asked questions directly to product pages. The feature toggle is registered — PHP implementation is not yet available.",
        status: "soon",
        configHash: null,
    },
    {
        name: "woocommerce-product_barcode",
        icon: "🔖",
        iconBg: "bg-rose-50",
        label: "WooCommerce Product Barcode",
        description: "Display scannable product barcodes on product detail pages. The feature toggle is registered — PHP implementation is not yet available.",
        status: "soon",
        configHash: null,
    },
];

const STATUS = {
    complete: { label: "Complete",    dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    partial:  { label: "Partial",     dot: "bg-amber-500",   cls: "bg-amber-50  text-amber-700  border-amber-200"  },
    soon:     { label: "Coming Soon", dot: "bg-gray-400",    cls: "bg-gray-100  text-gray-500   border-gray-200"   },
};

const initValues = () => Object.fromEntries(FEATURES.map((f) => [f.name, false]));

const Features = () => {
    const [isLoading,  setIsLoading]  = useState(true);
    const [isSaving,   setIsSaving]   = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [values,     setValues]     = useState(initValues);

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(`${COMMERCEKIT.apiurl}/get-settings`)
            .then((r) => {
                const data = r.data || {};
                setValues(Object.fromEntries(FEATURES.map((f) => [f.name, data[f.name] === "on"])));
                if (!window.COMMERCEKIT.settings_data) window.COMMERCEKIT.settings_data = {};
                Object.assign(window.COMMERCEKIT.settings_data, data);
            })
            .catch((err) => console.error("Error loading settings:", err))
            .finally(() => setIsLoading(false));
    }, []);

    const handleToggle = (name) =>
        setValues((prev) => ({ ...prev, [name]: !prev[name] }));

    const setAll = (val) =>
        setValues(Object.fromEntries(FEATURES.map((f) => [f.name, val])));

    const persistSettings = (currentValues) => {
        const payload = Object.fromEntries(
            Object.entries(currentValues).map(([k, v]) => [k, v ? "on" : "off"])
        );
        return axios
            .post(
                `${COMMERCEKIT.apiurl}/post-settings`,
                { settings: payload },
                { headers: { "Content-Type": "application/json", "X-WP-Nonce": COMMERCEKIT.nonce } }
            )
            .then(() => {
                if (!window.COMMERCEKIT.settings_data) window.COMMERCEKIT.settings_data = {};
                Object.assign(window.COMMERCEKIT.settings_data, payload);
                window.dispatchEvent(
                    new CustomEvent("commerceKitSettingsUpdated", { detail: payload })
                );
                return payload;
            });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus(null);
        persistSettings(values)
            .then(() => {
                setSaveStatus("success");
                setTimeout(() => setSaveStatus(null), 3000);
            })
            .catch((err) => {
                console.error("Error saving settings:", err);
                setSaveStatus("error");
                setTimeout(() => setSaveStatus(null), 3000);
            })
            .finally(() => setIsSaving(false));
    };

    const handleConfigure = (configHash) => {
        setIsSaving(true);
        setSaveStatus(null);
        persistSettings(values)
            .then(() => { window.location.hash = configHash; })
            .catch((err) => {
                console.error("Error saving before configure:", err);
                setSaveStatus("error");
                setIsSaving(false);
                setTimeout(() => setSaveStatus(null), 3000);
            });
    };

    return (
        <form onSubmit={handleSave}>
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="m-0 text-[15px] font-bold text-gray-900">Manage Features</h2>
                    <p className="m-0 mt-0.5 text-[12px] text-gray-500">Toggle features on or off and configure each one</p>
                </div>
                <div className="flex items-center gap-2">
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
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`px-4 py-1.5 text-[13px] font-semibold rounded-lg border-0 transition-all ${
                            isSaving
                                ? "bg-blue-400 text-white cursor-wait"
                                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm hover:shadow"
                        }`}
                    >
                        {isSaving ? "Saving…" : "Save Settings"}
                    </button>
                </div>
            </div>

            {/* Save toast */}
            {saveStatus && (
                <div
                    className={`flex items-center gap-2 px-4 py-2.5 mb-5 rounded-lg text-[13px] font-semibold border ${
                        saveStatus === "success"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-600 border-red-200"
                    }`}
                >
                    <span className="text-base leading-none">
                        {saveStatus === "success" ? "✓" : "✕"}
                    </span>
                    {saveStatus === "success"
                        ? "Settings saved successfully."
                        : "Error saving settings. Please try again."}
                </div>
            )}

            {/* Feature grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                    : FEATURES.map((feature) => {
                        const badge   = STATUS[feature.status];
                        const enabled = values[feature.name];
                        const isSoon  = feature.status === "soon";
                        return (
                            <div
                                key={feature.name}
                                className={`relative bg-white rounded-xl border flex flex-col overflow-hidden transition-all duration-200 ${
                                    isSoon
                                        ? "border-gray-200 opacity-70"
                                        : enabled
                                        ? "border-blue-200 shadow-sm hover:shadow-md"
                                        : "border-gray-200 shadow-sm hover:shadow-md"
                                }`}
                            >
                                {/* Top accent bar */}
                                <div className={`h-1 w-full ${enabled && !isSoon ? "bg-blue-500" : "bg-transparent"}`} />

                                <div className="p-5 flex flex-col flex-1">
                                    {/* Icon + badge */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${feature.iconBg}`}>
                                            {feature.icon}
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.cls}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Title + description */}
                                    <div className="flex-1">
                                        <h3 className="m-0 mb-1.5 text-[13px] font-bold text-gray-900 leading-snug">
                                            {feature.label}
                                        </h3>
                                        <p className="m-0 text-[11.5px] text-gray-500 leading-relaxed line-clamp-4">
                                            {feature.description}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        {enabled && feature.configHash && !isSoon ? (
                                            <button
                                                type="button"
                                                disabled={isSaving}
                                                onClick={() => handleConfigure(feature.configHash)}
                                                className={`inline-flex items-center gap-1 text-[11.5px] font-semibold text-blue-600 bg-transparent border-0 p-0 transition-colors ${
                                                    isSaving ? "opacity-50 cursor-wait" : "hover:text-blue-800 cursor-pointer"
                                                }`}
                                            >
                                                {isSaving ? "Saving…" : "Configure"}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <span />
                                        )}
                                        <Toggle
                                            checked={enabled}
                                            onChange={() => !isSoon && handleToggle(feature.name)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </form>
    );
};

export default Features;
