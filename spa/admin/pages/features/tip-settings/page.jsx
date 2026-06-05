import React, { useEffect, useState } from "react";
import axios from "axios";
import TabPageSkeleton from "../../../common/Skeletons/TabPageSkeleton";
import { WarningIcon } from "../../../common/Svgs";
import SectionHeader from "../../../common/SectionHeader";
import Toggle from "../../../common/Toggle";

const DEFAULTS = {
    tcwt_cart:     false,
    tcwt_checkout: false,
    tcwt_taxable:  false,
    tcwt_title:    "Send us a tip",
    tcwt_type:     "percent",
    tcwt_rates:    "5,10,15,20,25,30",
    tcwt_custom:   true,
    tcwt_cash:     true,
    tcwt_clear:    true,
};

const fromApi = (data) => ({
    tcwt_cart:     data.tcwt_cart     === "on",
    tcwt_checkout: data.tcwt_checkout === "on",
    tcwt_taxable:  data.tcwt_taxable  === "on",
    tcwt_title:    data.tcwt_title    || DEFAULTS.tcwt_title,
    tcwt_type:     data.tcwt_type     || DEFAULTS.tcwt_type,
    tcwt_rates:    data.tcwt_rates    || DEFAULTS.tcwt_rates,
    tcwt_custom:   data.tcwt_custom   !== "no",
    tcwt_cash:     data.tcwt_cash     !== "no",
    tcwt_clear:    data.tcwt_clear    !== "no",
});

const toApi = (f) => ({
    tcwt_cart:     f.tcwt_cart     ? "on"  : "off",
    tcwt_checkout: f.tcwt_checkout ? "on"  : "off",
    tcwt_taxable:  f.tcwt_taxable  ? "on"  : "off",
    tcwt_title:    f.tcwt_title,
    tcwt_type:     f.tcwt_type,
    tcwt_rates:    f.tcwt_rates,
    tcwt_custom:   f.tcwt_custom   ? "yes" : "no",
    tcwt_cash:     f.tcwt_cash     ? "yes" : "no",
    tcwt_clear:    f.tcwt_clear    ? "yes" : "no",
});

const TipSettings = () => {
    const [isLoading,        setIsLoading]        = useState(true);
    const [isSaving,         setIsSaving]         = useState(false);
    const [saveStatus,       setSaveStatus]       = useState(null);
    const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
    const [formData,         setFormData]         = useState(DEFAULTS);

    const set = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

    const loadSettings = () => {
        setIsLoading(true);
        axios
            .get(`${COMMERCEKIT.apiurl}/get-tips`, {
                headers: { "X-WP-Nonce": COMMERCEKIT.nonce },
            })
            .then((r) => setFormData(fromApi(r.data)))
            .catch((err) => console.error("Error loading tip settings:", err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        const enabled = (window.COMMERCEKIT?.settings_data || {})["woocommerce-tips"] === "on";
        setIsFeatureEnabled(enabled);
        if (enabled) {
            loadSettings();
        } else {
            setIsLoading(false);
        }

        const onUpdate = (e) => {
            const nowEnabled = (e.detail || {})["woocommerce-tips"] === "on";
            setIsFeatureEnabled(nowEnabled);
            if (nowEnabled) loadSettings();
        };
        window.addEventListener("commerceKitSettingsUpdated", onUpdate);
        return () => window.removeEventListener("commerceKitSettingsUpdated", onUpdate);
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus(null);
        axios
            .post(
                `${COMMERCEKIT.apiurl}/save-tips`,
                toApi(formData),
                { headers: { "Content-Type": "application/json", "X-WP-Nonce": COMMERCEKIT.nonce } }
            )
            .then(() => {
                setSaveStatus("success");
                setTimeout(() => setSaveStatus(null), 3000);
            })
            .catch((err) => {
                console.error("Error saving tip settings:", err);
                setSaveStatus("error");
                setTimeout(() => setSaveStatus(null), 3000);
            })
            .finally(() => setIsSaving(false));
    };

    if (isLoading) return <TabPageSkeleton showTabs={false} cardCount={3} rowsPerCard={3} />;

    if (!isFeatureEnabled) {
        return (
            <div className="max-w-2xl">
                <div className="mt-6 flex gap-4 p-6 bg-yellow-50 border border-yellow-300 border-l-4 border-l-yellow-500 rounded-xl">
                    <WarningIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="m-0 text-[15px] font-bold text-yellow-900">Feature Not Enabled</p>
                        <p className="mt-1.5 mb-4 m-0 text-[13px] text-yellow-800 leading-relaxed">
                            The WooCommerce Tips feature is currently disabled. Please enable{" "}
                            <strong>"WooCommerce Tip"</strong> from the Features page first.
                        </p>
                        <button
                            onClick={() => (window.location.hash = "")}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors duration-150 cursor-pointer border-none"
                        >
                            Go to Features Page →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const inputCls = "w-52 px-3 py-1.5 text-[13px] text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";

    return (
        <div className="max-w-3xl">

            {saveStatus && (
                <div className={`flex items-center gap-2.5 px-4 py-2.5 mb-4 rounded-xl text-[13px] font-semibold border ${
                    saveStatus === "success"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200"
                }`}>
                    <span className="text-base leading-none">{saveStatus === "success" ? "✓" : "✕"}</span>
                    {saveStatus === "success"
                        ? "Settings saved successfully."
                        : "Error saving settings. Please try again."}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">

                {/* ── Display Settings ── */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                    <SectionHeader
                        icon="📍"
                        title="Display Settings"
                        description="Choose where the tip form appears in your store"
                        color="blue"
                    />
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <p className="m-0 text-[13px] font-semibold text-gray-800">Show on Cart Page</p>
                            <p className="m-0 mt-1 text-[12px] text-gray-500">Displays the tip form after the cart product table.</p>
                        </div>
                        <Toggle checked={formData.tcwt_cart} onChange={(e) => set("tcwt_cart", e.target.checked)} />
                    </div>
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <p className="m-0 text-[13px] font-semibold text-gray-800">Show on Checkout Page</p>
                            <p className="m-0 mt-1 text-[12px] text-gray-500">Displays the tip form above the payment section.</p>
                        </div>
                        <Toggle checked={formData.tcwt_checkout} onChange={(e) => set("tcwt_checkout", e.target.checked)} />
                    </div>
                </div>

                {/* ── Tip Configuration ── */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                    <SectionHeader
                        icon="⚙️"
                        title="Tip Configuration"
                        description="Set how tips are calculated and displayed"
                        color="blue"
                    />

                    {/* Form title */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <p className="m-0 text-[13px] font-semibold text-gray-800">Form Title</p>
                            <p className="m-0 mt-1 text-[12px] text-gray-500">Heading shown above the tip buttons.</p>
                        </div>
                        <input
                            type="text"
                            value={formData.tcwt_title}
                            onChange={(e) => set("tcwt_title", e.target.value)}
                            className={inputCls}
                            placeholder="Send us a tip"
                        />
                    </div>

                    {/* Tip type */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <p className="m-0 text-[13px] font-semibold text-gray-800">Tip Type</p>
                            <p className="m-0 mt-1 text-[12px] text-gray-500">How tip rates are calculated.</p>
                        </div>
                        <select
                            value={formData.tcwt_type}
                            onChange={(e) => set("tcwt_type", e.target.value)}
                            className={inputCls}
                        >
                            <option value="percent">Percent of order total</option>
                            <option value="fixed">Fixed amount</option>
                        </select>
                    </div>

                    {/* Tip rates */}
                    <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                        <div className="pr-6">
                            <p className="m-0 text-[13px] font-semibold text-gray-800">Tip Rates</p>
                            <p className="m-0 mt-1 text-[12px] text-gray-500">
                                Comma-separated values shown as buttons.
                            </p>
                            <p className="m-0 mt-0.5 text-[11px] text-gray-400">
                                e.g. <code>5,10,15,20,25,30</code>
                            </p>
                        </div>
                        <input
                            type="text"
                            value={formData.tcwt_rates}
                            onChange={(e) => set("tcwt_rates", e.target.value)}
                            className={inputCls}
                            placeholder="5,10,15,20,25,30"
                        />
                    </div>

                    {/* Taxable */}
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <p className="m-0 text-[13px] font-semibold text-gray-800">Apply Tax to Tip</p>
                            <p className="m-0 mt-1 text-[12px] text-gray-500">
                                Tax the tip as per your WooCommerce tax settings.
                            </p>
                        </div>
                        <Toggle checked={formData.tcwt_taxable} onChange={(e) => set("tcwt_taxable", e.target.checked)} />
                    </div>
                </div>

                {/* ── Options ── */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                    <SectionHeader
                        icon="🔧"
                        title="Options"
                        description="Additional tip form behaviour"
                        color="amber"
                    />

                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <p className="m-0 text-[13px] font-semibold text-gray-800">Enable Custom Tip</p>
                            <p className="m-0 mt-1 text-[12px] text-gray-500">Lets customers enter any tip amount.</p>
                        </div>
                        <Toggle checked={formData.tcwt_custom} onChange={(e) => set("tcwt_custom", e.target.checked)} />
                    </div>

                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <p className="m-0 text-[13px] font-semibold text-gray-800">Enable Cash Tip</p>
                            <p className="m-0 mt-1 text-[12px] text-gray-500">
                                Shows a "Cash" button — records tip intent without adding a charge.
                            </p>
                        </div>
                        <Toggle checked={formData.tcwt_cash} onChange={(e) => set("tcwt_cash", e.target.checked)} />
                    </div>

                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <p className="m-0 text-[13px] font-semibold text-gray-800">Clear Tip After Order Placed</p>
                            <p className="m-0 mt-1 text-[12px] text-gray-500">Removes the tip from the session after a successful order.</p>
                        </div>
                        <Toggle checked={formData.tcwt_clear} onChange={(e) => set("tcwt_clear", e.target.checked)} />
                    </div>
                </div>

                {/* ── Save ── */}
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

            </form>
        </div>
    );
};

export default TipSettings;
