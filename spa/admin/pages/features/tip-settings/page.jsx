import React, { useEffect, useState } from "react";
import axios from "axios";
import TabPageSkeleton from "../../../common/Skeletons/TabPageSkeleton";
import { WarningIcon } from "../../../common/Svgs";
import Toggle from "../../../common/Toggle";
import FancyInput from "./components/FancyInput";
import SettingRow from "./components/SettingRow";
import SegmentedControl from "./components/SegmentedControl";

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

/* ─── design-only sub-components (pure Tailwind) ─────────────────────────── */

/** Coloured pill badge */
const Badge = ({ children, color = "blue" }) => {
    const cls = {
        blue:  "bg-blue-50 text-blue-700 border border-blue-200",
        amber: "bg-amber-50 text-amber-700 border border-amber-200",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${cls[color]}`}>
            {children}
        </span>
    );
};

/** Card wrapper */
const Card = ({ children }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-3 transition-shadow duration-200 hover:shadow-md">
        {children}
    </div>
);


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

    /* ── feature disabled ── */
    if (!isFeatureEnabled) {
        return (
            <div className="max-w-2xl">
                <div className="mt-6 flex gap-4 p-5 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                        <WarningIcon className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                        <p className="m-0 text-[14px] font-semibold text-amber-900">Feature Not Enabled</p>
                        <p className="mt-1.5 mb-4 m-0 text-[13px] text-amber-800 leading-relaxed">
                            The WooCommerce Tips feature is currently disabled. Please enable{" "}
                            <strong>"WooCommerce Tip"</strong> from the Features page first.
                        </p>
                        <button
                            onClick={() => (window.location.hash = "")}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                                       text-white text-[13px] font-semibold rounded-lg border-none cursor-pointer transition-colors duration-150"
                        >
                            Go to Features Page →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl">

            {/* ── page title bar ── */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="m-0 text-[18px] font-bold text-gray-900 tracking-tight">Tip Settings</h2>
                    <p className="m-0 mt-0.5 text-[12px] text-gray-400">Configure how customers leave tips in your store.</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-semibold text-emerald-700">Feature active</span>
                </div>
            </div>

            {/* ── save status toast ── */}
            {saveStatus && (
                <div className={`flex items-center gap-3 px-4 py-3 mb-4 rounded-xl text-[13px] font-semibold border transition-all duration-300 ${
                    saveStatus === "success"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200"
                }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 font-bold ${
                        saveStatus === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-700"
                    }`}>
                        {saveStatus === "success" ? "✓" : "✕"}
                    </div>
                    {saveStatus === "success" ? "Settings saved successfully." : "Error saving settings. Please try again."}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">

                {/* ── Display Settings ── */}
                <Card>
                    <CardHead
                        icon="📍"
                        iconBg="bg-blue-50"
                        title="Display Settings"
                        description="Choose where the tip form appears in your store"
                        badge="Visibility"
                        badgeColor="blue"
                    />
                    <SettingRow label="Show on Cart Page" description="Displays the tip form after the cart product table.">
                        <Toggle checked={formData.tcwt_cart} onChange={(e) => set("tcwt_cart", e.target.checked)} />
                    </SettingRow>
                    <SettingRow label="Show on Checkout Page" description="Displays the tip form above the payment section." last>
                        <Toggle checked={formData.tcwt_checkout} onChange={(e) => set("tcwt_checkout", e.target.checked)} />
                    </SettingRow>
                </Card>

                {/* ── Tip Configuration ── */}
                <Card>
                    <CardHead
                        icon="⚙️"
                        iconBg="bg-blue-50"
                        title="Tip Configuration"
                        description="Set how tips are calculated and displayed"
                        badge="Core Setup"
                        badgeColor="blue"
                    />

                    <SettingRow label="Form Title" description="Heading shown above the tip buttons.">
                        <FancyInput
                            type="text"
                            value={formData.tcwt_title}
                            onChange={(e) => set("tcwt_title", e.target.value)}
                            placeholder="Send us a tip"
                        />
                    </SettingRow>

                    {/* Segmented control for binary tip type choice */}
                    <SettingRow label="Tip Type" description="How tip rates are calculated.">
                        <SegmentedControl
                            value={formData.tcwt_type}
                            onChange={(e) => set("tcwt_type", e.target.value)}
                            options={[
                                { value: "percent", label: "% Percent" },
                                { value: "fixed",   label: "$ Fixed"   },
                            ]}
                        />
                    </SettingRow>

                    <SettingRow
                        label="Tip Rates"
                        description="Comma-separated values shown as tip buttons."
                        hint={
                            <span>e.g.{" "}
                                <code className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                    5,10,15,20,25,30
                                </code>
                            </span>
                        }
                    >
                        <FancyInput
                            type="text"
                            value={formData.tcwt_rates}
                            onChange={(e) => set("tcwt_rates", e.target.value)}
                            placeholder="5,10,15,20,25,30"
                        />
                    </SettingRow>

                    <SettingRow label="Apply Tax to Tip" description="Tax the tip as per your WooCommerce tax settings." last>
                        <Toggle checked={formData.tcwt_taxable} onChange={(e) => set("tcwt_taxable", e.target.checked)} />
                    </SettingRow>
                </Card>

                {/* ── Options ── */}
                <Card>
                    <CardHead
                        icon="🔧"
                        iconBg="bg-amber-50"
                        title="Options"
                        description="Additional tip form behaviour"
                        badge="Behaviour"
                        badgeColor="amber"
                    />

                    <SettingRow label="Enable Custom Tip" description="Lets customers enter any tip amount.">
                        <Toggle checked={formData.tcwt_custom} onChange={(e) => set("tcwt_custom", e.target.checked)} />
                    </SettingRow>

                    <SettingRow label="Enable Cash Tip" description='Shows a "Cash" button — records tip intent without adding a charge.'>
                        <Toggle checked={formData.tcwt_cash} onChange={(e) => set("tcwt_cash", e.target.checked)} />
                    </SettingRow>

                    <SettingRow label="Clear Tip After Order Placed" description="Removes the tip from the session after a successful order." last>
                        <Toggle checked={formData.tcwt_clear} onChange={(e) => set("tcwt_clear", e.target.checked)} />
                    </SettingRow>
                </Card>

                {/* ── Save bar ── */}
                <div className="flex items-center gap-3 pt-1 pb-2">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`inline-flex items-center gap-2 px-6 py-2.5 text-white text-[13px] font-semibold rounded-lg border-none transition-all duration-150 ${
                            isSaving
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200"
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M12 2a10 10 0 0 1 10 10" />
                                </svg>
                                Saving…
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                </svg>
                                Save Changes
                            </>
                        )}
                    </button>
                    <span className="text-[11px] text-gray-400">Changes are applied immediately after saving.</span>
                </div>

            </form>
        </div>
    );
};

export default TipSettings;