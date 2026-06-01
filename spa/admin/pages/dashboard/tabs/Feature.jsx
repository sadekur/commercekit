import React, { useEffect, useState } from "react";
import axios from "axios";
import Toggle from "../../../common/Toggle";

const FEATURES = [
    {
        name: "stock-threshold-for-wc",
        icon: "📈",
        label: "Stock Threshold for WooCommerce",
        description: "Adjusts product prices based on stock levels with customer-visible low / medium / high stock messages.",
        status: "complete",
        configHash: "/stock-threshold",
    },
    {
        name: "buy-button-for-woocommerce",
        icon: "🛒",
        label: "Buy Button for WooCommerce",
        description: "Adds a Buy Now button that clears the cart and redirects customers straight to checkout.",
        status: "complete",
        configHash: "/buy-button-settings",
    },
    {
        name: "woocommerce-tips",
        icon: "💡",
        label: "WooCommerce Tips",
        description: "Displays a tip or donation input on cart and checkout pages. UI renders — tip amounts are not yet added to order totals.",
        status: "partial",
        configHash: "/commerce-kit-tip-settings",
    },
    {
        name: "woocommerce-faq",
        icon: "❓",
        label: "WooCommerce FAQ",
        description: "Add frequently asked questions to product pages. PHP implementation is not yet available.",
        status: "soon",
        configHash: null,
    },
    {
        name: "woocommerce-product_barcode",
        icon: "🔖",
        label: "WooCommerce Product Barcode",
        description: "Display product barcodes on product detail pages. PHP implementation is not yet available.",
        status: "soon",
        configHash: null,
    },
];

const STATUS = {
    complete: { label: "Complete",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    partial:  { label: "Partial",     cls: "bg-amber-50  text-amber-700  border-amber-200"  },
    soon:     { label: "Coming Soon", cls: "bg-gray-100  text-gray-500   border-gray-200"   },
};

const initValues = () => Object.fromEntries(FEATURES.map((f) => [f.name, false]));

const Features = () => {
    const [isLoading,  setIsLoading]  = useState(true);
    const [isSaving,   setIsSaving]   = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
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

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus(null);

        const payload = Object.fromEntries(
            Object.entries(values).map(([k, v]) => [k, v ? "on" : "off"])
        );

        axios
            .post(
                `${COMMERCEKIT.apiurl}/post-settings`,
                { settings: payload },
                { headers: { "Content-Type": "application/json", "X-WP-Nonce": COMMERCEKIT.nonce } }
            )
            .then(() => {
                setSaveStatus("success");
                if (!window.COMMERCEKIT.settings_data) window.COMMERCEKIT.settings_data = {};
                Object.assign(window.COMMERCEKIT.settings_data, payload);
                window.dispatchEvent(
                    new CustomEvent("commerceKitSettingsUpdated", { detail: payload })
                );
                setTimeout(() => setSaveStatus(null), 3000);
            })
            .catch((err) => {
                console.error("Error saving settings:", err);
                setSaveStatus("error");
                setTimeout(() => setSaveStatus(null), 3000);
            })
            .finally(() => setIsSaving(false));
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-[76px] bg-white rounded-xl border border-gray-200 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <form onSubmit={handleSave}>
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="m-0 text-[15px] font-bold text-gray-900">Manage Features</h2>
                    <p className="m-0 mt-0.5 text-[12px] text-gray-500">Enable or disable plugin features</p>
                </div>
                <div className="flex items-center gap-2">
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
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`px-4 py-1.5 text-[13px] font-semibold rounded-lg border-none transition-colors ${
                            isSaving
                                ? "bg-blue-400 text-white cursor-wait"
                                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        }`}
                    >
                        {isSaving ? "Saving…" : "Save Settings"}
                    </button>
                </div>
            </div>

            {/* Save status toast */}
            {saveStatus && (
                <div
                    className={`flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl text-[13px] font-semibold border ${
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

            {/* Feature list */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {FEATURES.map((feature, idx) => {
                    const badge   = STATUS[feature.status];
                    const enabled = values[feature.name];
                    const isLast  = idx === FEATURES.length - 1;
                    return (
                        <div
                            key={feature.name}
                            className={`flex items-center gap-4 px-5 py-4 ${
                                !isLast ? "border-b border-gray-100" : ""
                            }`}
                        >
                            {/* Icon */}
                            <span className="text-2xl w-8 text-center flex-shrink-0">{feature.icon}</span>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[14px] font-semibold text-gray-900">
                                        {feature.label}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.cls}`}
                                    >
                                        {badge.label}
                                    </span>
                                </div>
                                <p className="m-0 mt-0.5 text-[12px] text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Configure link — only when enabled and has settings */}
                            {enabled && feature.configHash && (
                                <button
                                    type="button"
                                    onClick={() => { window.location.hash = feature.configHash; }}
                                    className="flex-shrink-0 px-3 py-1.5 text-[12px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                                >
                                    Configure →
                                </button>
                            )}

                            {/* Toggle */}
                            <div className="flex-shrink-0">
                                <Toggle
                                    checked={enabled}
                                    onChange={() => handleToggle(feature.name)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </form>
    );
};

export default Features;
