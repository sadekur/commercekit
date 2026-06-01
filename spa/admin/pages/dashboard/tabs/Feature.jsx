import React, { useEffect, useState } from "react";
import axios from "axios";
import Toggle from "../../../common/Toggle";
import SkeletonCard from "../../../common/Skeletons/SkeletonCard";

const FEATURES = [
    {
        name: "stock-threshold-for-wc",
        icon: "📈",
        label: "Stock Threshold for WooCommerce",
        description: "Dynamically adjusts product prices based on current stock levels. Adds customer-visible low, medium, and high stock messages across product, cart, checkout, and order pages.",
        status: "complete",
        configHash: "/stock-threshold",
    },
    {
        name: "buy-button-for-woocommerce",
        icon: "🛒",
        label: "Buy Button for WooCommerce",
        description: "Adds a customisable Buy Now button that clears the cart and redirects the customer directly to checkout. Supports single product, archive pages, and a shortcode.",
        status: "complete",
        configHash: "/buy-button-settings",
    },
    {
        name: "woocommerce-tips",
        icon: "💡",
        label: "WooCommerce Tips",
        description: "Displays a configurable tip or donation input on the cart and checkout pages. The UI renders correctly — tip amounts are not yet added to order totals.",
        status: "partial",
        configHash: "/commerce-kit-tip-settings",
    },
    {
        name: "woocommerce-faq",
        icon: "❓",
        label: "WooCommerce FAQ",
        description: "Attach frequently asked questions directly to product pages. The feature toggle is registered — PHP implementation is not yet available.",
        status: "soon",
        configHash: null,
    },
    {
        name: "woocommerce-product_barcode",
        icon: "🔖",
        label: "WooCommerce Product Barcode",
        description: "Display scannable product barcodes on product detail pages. The feature toggle is registered — PHP implementation is not yet available.",
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

    return (
        <form onSubmit={handleSave}>
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="m-0 text-[15px] font-bold text-gray-900">Manage Features</h2>
                    <p className="m-0 mt-0.5 text-[12px] text-gray-500">Toggle features on or off and configure each one</p>
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

            {/* Save toast */}
            {saveStatus && (
                <div
                    className={`flex items-center gap-2 px-4 py-2.5 mb-5 rounded-xl text-[13px] font-semibold border ${
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                    : FEATURES.map((feature) => {
                        const badge   = STATUS[feature.status];
                        const enabled = values[feature.name];
                        return (
                            <div
                                key={feature.name}
                                className={`bg-white rounded-xl border shadow-sm flex flex-col p-5 transition-shadow duration-200 hover:shadow-md ${
                                    enabled ? "border-blue-200" : "border-gray-200"
                                }`}
                            >
                                {/* Icon + badge */}
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-3xl leading-none">{feature.icon}</span>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.cls}`}
                                    >
                                        {badge.label}
                                    </span>
                                </div>

                                {/* Title + description */}
                                <div className="flex-1">
                                    <h3 className="m-0 mb-1.5 text-[14px] font-bold text-gray-900 leading-snug">
                                        {feature.label}
                                    </h3>
                                    <p className="m-0 text-[12px] text-gray-500 leading-relaxed line-clamp-4">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                    {enabled && feature.configHash ? (
                                        <button
                                            type="button"
                                            onClick={() => { window.location.hash = feature.configHash; }}
                                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                                        >
                                            Configure →
                                        </button>
                                    ) : (
                                        <span />
                                    )}
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
