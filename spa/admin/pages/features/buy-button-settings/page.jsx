import React, { useEffect, useState } from "react";
import axios from "axios";
import TabPageSkeleton from "../../../common/Skeletons/TabPageSkeleton";
import { WarningIcon } from "../../../common/Svgs";
import Toggle from "../../../common/Toggle";
import RadioGroup from "../../../common/RadioGroup";
import SettingRow from "../../../common/SettingRow";
import ColorField from "../../../common/ColorField";
import SmallNumberInput from "../../../common/SmallNumberInput";
import DimensionFields from "../../../common/DimensionFields";
import FancyInput from "../../../common/FancyInput";
import Card from "../../../common/Card";
import CardHead from "../../../common/CardHead";

const DEFAULTS = {
    enable_single:           true,
    enable_archive:          true,
    button_position_single:  "after_add_to_cart",
    button_position_archive: "after_add_to_cart",
    redirect_location:       "checkout",
    custom_redirect_url:     "",
    button_text:             "Buy Now",
    default_shop_quantity:   1,
    reset_cart:              false,
    ajax_add_to_cart:        false,
    hide_add_to_cart:        false,
    button_style:            "default",
    button_text_color:       "",
    button_background_color: "",
    button_border_color:     "",
    button_border_size:      "",
    button_border_radius:    "",
    button_font_size:        "",
    button_margin:           { top: "", right: "", bottom: "", left: "" },
    button_padding:          { top: "", right: "", bottom: "", left: "" },
};

const Badge = ({ children, color = "blue" }) => {
    const cls = {
        blue:   "bg-blue-50 text-blue-700 border border-blue-200",
        amber:  "bg-amber-50 text-amber-700 border border-amber-200",
        green:  "bg-green-50 text-green-700 border border-green-200",
        gray:   "bg-gray-100 text-gray-500 border border-gray-200",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${cls[color] || cls.blue}`}>
            {children}
        </span>
    );
};

/** Tab button */
const TabBtn = ({ active, onClick, icon, label, count }) => (
    <button
        type="button"
        onClick={onClick}
        className={`relative flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold border-b-2 transition-all duration-150 bg-transparent cursor-pointer whitespace-nowrap ${
            active
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
        }`}
    >
        <span>{icon}</span>
        {label}
        {count !== undefined && (
            <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${
                active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
            }`}>
                {count}
            </span>
        )}
    </button>
);

/** Quantity stepper — replaces the plain number <input> for Default Shop Quantity */


const BuyButtonSettings = () => {
    const [isLoading,        setIsLoading]        = useState(true);
    const [isTabLoading,     setIsTabLoading]     = useState(false);
    const [isSaving,         setIsSaving]         = useState(false);
    const [saveStatus,       setSaveStatus]       = useState(null);
    const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
    const [activeTab,        setActiveTab]        = useState("general");
    const [formData,         setFormData]         = useState(DEFAULTS);

    const handleTabChange = (tabId) => {
        if (tabId === activeTab) return;
        setIsTabLoading(true);
        setTimeout(() => {
            setActiveTab(tabId);
            setIsTabLoading(false);
        }, 300);
    };

    const set = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

    const applyResponse = (data) =>
        setFormData({
            enable_single:           data.enable_single           === "yes",
            enable_archive:          data.enable_archive          === "yes",
            button_position_single:  data.button_position_single  || "after_add_to_cart",
            button_position_archive: data.button_position_archive || "after_add_to_cart",
            redirect_location:       data.redirect_location       || "checkout",
            custom_redirect_url:     data.custom_redirect_url     || "",
            button_text:             data.button_text             || "Buy Now",
            default_shop_quantity:   parseInt(data.default_shop_quantity) || 1,
            reset_cart:              data.reset_cart              === "yes",
            ajax_add_to_cart:        data.ajax_add_to_cart        === "yes",
            hide_add_to_cart:        data.hide_add_to_cart        === "yes",
            button_style:            data.button_style            || "default",
            button_text_color:       data.button_text_color       || "",
            button_background_color: data.button_background_color || "",
            button_border_color:     data.button_border_color     || "",
            button_border_size:      data.button_border_size      ?? "",
            button_border_radius:    data.button_border_radius    ?? "",
            button_font_size:        data.button_font_size        ?? "",
            button_margin:           data.button_margin  || { top: "", right: "", bottom: "", left: "" },
            button_padding:          data.button_padding || { top: "", right: "", bottom: "", left: "" },
        });

    const loadSettings = () => {
        setIsLoading(true);
        axios
            .get(`${COMMERCEKIT.apiurl}/get-buy-button-settings`, {
                headers: { "X-WP-Nonce": COMMERCEKIT.nonce },
            })
            .then((r) => applyResponse(r.data))
            .catch((err) => console.error("Error loading buy button settings:", err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        const settingsData   = window.COMMERCEKIT?.settings_data || {};
        const featureEnabled = settingsData["buy-button-for-woocommerce"] === "on";
        setIsFeatureEnabled(featureEnabled);
        if (featureEnabled) {
            loadSettings();
        } else {
            setIsLoading(false);
        }

        const onSettingsUpdated = (e) => {
            const updated = e.detail || {};
            const enabled = updated["buy-button-for-woocommerce"] === "on";
            setIsFeatureEnabled(enabled);
            if (enabled) loadSettings();
        };
        window.addEventListener("commerceKitSettingsUpdated", onSettingsUpdated);
        return () => window.removeEventListener("commerceKitSettingsUpdated", onSettingsUpdated);
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus(null);

        const payload = {
            enable_single:           formData.enable_single    ? "yes" : "no",
            enable_archive:          formData.enable_archive   ? "yes" : "no",
            button_position_single:  formData.button_position_single,
            button_position_archive: formData.button_position_archive,
            redirect_location:       formData.redirect_location,
            custom_redirect_url:     formData.custom_redirect_url,
            button_text:             formData.button_text,
            default_shop_quantity:   formData.default_shop_quantity,
            reset_cart:              formData.reset_cart        ? "yes" : "no",
            ajax_add_to_cart:        formData.ajax_add_to_cart  ? "yes" : "no",
            hide_add_to_cart:        formData.hide_add_to_cart  ? "yes" : "no",
            button_style:            formData.button_style,
            button_text_color:       formData.button_text_color,
            button_background_color: formData.button_background_color,
            button_border_color:     formData.button_border_color,
            button_border_size:      formData.button_border_size,
            button_border_radius:    formData.button_border_radius,
            button_font_size:        formData.button_font_size,
            button_margin:           formData.button_margin,
            button_padding:          formData.button_padding,
        };

        axios
            .post(`${COMMERCEKIT.apiurl}/save-buy-button-settings`, payload, {
                headers: { "Content-Type": "application/json", "X-WP-Nonce": COMMERCEKIT.nonce },
            })
            .then(() => {
                setSaveStatus("success");
                setTimeout(() => setSaveStatus(null), 3000);
            })
            .catch((err) => {
                console.error("Error saving buy button settings:", err);
                setSaveStatus("error");
                setTimeout(() => setSaveStatus(null), 3000);
            })
            .finally(() => setIsSaving(false));
    };

    if (isLoading) return <TabPageSkeleton />;

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
                            The Buy Button feature is currently disabled. Please enable{" "}
                            <strong>"Buy Button for WooCommerce"</strong> from the Features page first.
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

    const isCustomStyle = formData.button_style === "custom";

    return (
        <div className="max-w-2xl">

            {/* ── page title bar ── */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="m-0 text-[18px] font-bold text-gray-900 tracking-tight">Buy Button Settings</h2>
                    <p className="m-0 mt-0.5 text-[12px] text-gray-400">Configure Buy Now buttons across your store.</p>
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

            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-200 mb-4 gap-1">
                <TabBtn
                    active={activeTab === "general"}
                    onClick={() => handleTabChange("general")}
                    icon="⚙️"
                    label="General"
                    count={5}
                />
                <TabBtn
                    active={activeTab === "button_styles"}
                    onClick={() => handleTabChange("button_styles")}
                    icon="🎨"
                    label="Button Styles"
                />
            </div>

            <form onSubmit={handleSave} className="space-y-3">

                {/* ══ Tab loading skeleton ══ */}
                {isTabLoading && <TabPageSkeleton showTabs={false} cardCount={2} rowsPerCard={2} />}

                {/* ══════════════ GENERAL TAB ══════════════ */}
                {!isTabLoading && activeTab === "general" && (
                    <>
                        {/* Enable Button On */}
                        <Card>
                            <CardHead
                                icon="✅"
                                iconBg="bg-blue-50"
                                title="Enable Button On"
                                description="Choose where the Buy Now button appears in your store"
                                badge="Visibility"
                                badgeColor="blue"
                            />
                            <SettingRow
                                label="Single Product Page"
                                description="Show Buy Now button on individual product pages."
                            >
                                <Toggle
                                    checked={formData.enable_single}
                                    onChange={(e) => set("enable_single", e.target.checked)}
                                />
                            </SettingRow>
                            <SettingRow
                                label="Shop / Archive Page"
                                description="Show Buy Now button on shop and category listing pages."
                                last
                            >
                                <Toggle
                                    checked={formData.enable_archive}
                                    onChange={(e) => set("enable_archive", e.target.checked)}
                                />
                            </SettingRow>
                        </Card>

                        {/* Button Position */}
                        <Card>
                            <CardHead
                                icon="📍"
                                iconBg="bg-amber-50"
                                title="Button Position"
                                description="Control where the button appears relative to Add to Cart"
                                badge="Layout"
                                badgeColor="amber"
                            />
                            <SettingRow
                                label="Position on Single Product Page"
                                description='Or use shortcode [buy_button id="123"] to place it anywhere.'
                            >
                                <RadioGroup
                                    value={formData.button_position_single}
                                    onChange={(v) => set("button_position_single", v)}
                                    options={[
                                        { value: "after_add_to_cart",  label: "After Add to Cart Button" },
                                        { value: "before_add_to_cart", label: "Before Add to Cart Button" },
                                    ]}
                                />
                            </SettingRow>
                            <SettingRow
                                label="Position on Shop / Archive Page"
                                description="Applies to simple products only. Variable products link to the product page."
                                last
                            >
                                <RadioGroup
                                    value={formData.button_position_archive}
                                    onChange={(v) => set("button_position_archive", v)}
                                    options={[
                                        { value: "after_add_to_cart",  label: "After Add to Cart Button" },
                                        { value: "before_add_to_cart", label: "Before Add to Cart Button" },
                                    ]}
                                />
                            </SettingRow>
                        </Card>

                        {/* Redirect Location */}
                        <Card>
                            <CardHead
                                icon="🔀"
                                iconBg="bg-green-50"
                                title="Redirect Location"
                                description="Where should the customer go after clicking Buy Now?"
                                badge="Destination"
                                badgeColor="green"
                            />
                            <SettingRow
                                label="Redirect to"
                                last={formData.redirect_location !== "custom"}
                            >
                                <RadioGroup
                                    value={formData.redirect_location}
                                    onChange={(v) => set("redirect_location", v)}
                                    options={[
                                        { value: "checkout", label: "Checkout Page" },
                                        { value: "cart",     label: "Cart Page" },
                                        { value: "custom",   label: "Custom Page" },
                                    ]}
                                />
                            </SettingRow>

                            {formData.redirect_location === "custom" && (
                                <SettingRow label="Custom Redirect URL" last>
                                    <FancyInput
                                        type="url"
                                        value={formData.custom_redirect_url}
                                        onChange={(e) => set("custom_redirect_url", e.target.value)}
                                        placeholder="https://example.com/checkout"
                                    />
                                </SettingRow>
                            )}
                        </Card>

                        {/* Button Settings */}
                        <Card>
                            <CardHead
                                icon="⚙️"
                                iconBg="bg-blue-50"
                                title="Button Settings"
                                description="General behaviour and appearance options"
                                badge="Behaviour"
                                badgeColor="blue"
                            />
                            <SettingRow label="Button Text" description="Text displayed on the Buy Now button.">
                                <FancyInput
                                    type="text"
                                    value={formData.button_text}
                                    onChange={(e) => set("button_text", e.target.value)}
                                    placeholder="Buy Now"
                                />
                            </SettingRow>
                            <SettingRow
                                label="Default Shop Quantity"
                                description="Quantity added to cart when Buy Now is clicked on the shop page."
                            >
                                <QuantityStepper
                                    value={formData.default_shop_quantity}
                                    onChange={(v) => set("default_shop_quantity", Math.max(1, v))}
                                />
                            </SettingRow>
                            <SettingRow
                                label="Auto Reset Cart"
                                description="Clear the cart before adding the product when Buy Now is clicked."
                            >
                                <Toggle
                                    checked={formData.reset_cart}
                                    onChange={(e) => set("reset_cart", e.target.checked)}
                                />
                            </SettingRow>
                            <SettingRow
                                label="Ajax Add to Cart"
                                description="Use AJAX for simple products on the single product page."
                            >
                                <Toggle
                                    checked={formData.ajax_add_to_cart}
                                    onChange={(e) => set("ajax_add_to_cart", e.target.checked)}
                                />
                            </SettingRow>
                            <SettingRow
                                label="Hide Add to Cart Button"
                                description="Hide the default WooCommerce Add to Cart button on product and shop pages."
                                last
                            >
                                <Toggle
                                    checked={formData.hide_add_to_cart}
                                    onChange={(e) => set("hide_add_to_cart", e.target.checked)}
                                />
                            </SettingRow>
                        </Card>
                    </>
                )}

                {/* ══════════════ BUTTON STYLES TAB ══════════════ */}
                {!isTabLoading && activeTab === "button_styles" && (
                    <>
                        {/* Style mode */}
                        <Card>
                            <CardHead
                                icon="🎨"
                                iconBg="bg-amber-50"
                                title="Buy Now Button Styles"
                                description="Use theme default styles or define custom CSS values"
                                badge="Appearance"
                                badgeColor="amber"
                            />
                            <SettingRow label="Button Styles" last={!isCustomStyle}>
                                <RadioGroup
                                    value={formData.button_style}
                                    onChange={(v) => set("button_style", v)}
                                    options={[
                                        { value: "default", label: "Default Styles (Theme)" },
                                        { value: "custom",  label: "Custom Styles" },
                                    ]}
                                />
                            </SettingRow>

                            {isCustomStyle && (
                                <>
                                    <SettingRow label="Text Color" description="Set button text color.">
                                        <ColorField
                                            value={formData.button_text_color}
                                            onChange={(v) => set("button_text_color", v)}
                                        />
                                    </SettingRow>
                                    <SettingRow label="Background Color" description="Set button background color.">
                                        <ColorField
                                            value={formData.button_background_color}
                                            onChange={(v) => set("button_background_color", v)}
                                        />
                                    </SettingRow>
                                    <SettingRow label="Border Color" description="Set button border color.">
                                        <ColorField
                                            value={formData.button_border_color}
                                            onChange={(v) => set("button_border_color", v)}
                                        />
                                    </SettingRow>
                                    <SettingRow label="Border Size" description="Set button border width in px.">
                                        <SmallNumberInput
                                            value={formData.button_border_size}
                                            onChange={(v) => set("button_border_size", v)}
                                            placeholder="px"
                                        />
                                    </SettingRow>
                                    <SettingRow label="Border Radius" description="Set button border radius in px.">
                                        <SmallNumberInput
                                            value={formData.button_border_radius}
                                            onChange={(v) => set("button_border_radius", v)}
                                            placeholder="px"
                                        />
                                    </SettingRow>
                                    <SettingRow label="Font Size" description="Set font size in px.">
                                        <SmallNumberInput
                                            value={formData.button_font_size}
                                            onChange={(v) => set("button_font_size", v)}
                                            placeholder="px"
                                        />
                                    </SettingRow>
                                    <SettingRow label="Margin" description="Set margin values in px (top / right / bottom / left).">
                                        <DimensionFields
                                            value={formData.button_margin}
                                            onChange={(v) => set("button_margin", v)}
                                        />
                                    </SettingRow>
                                    <SettingRow label="Padding" description="Set padding values in px (top / right / bottom / left)." last>
                                        <DimensionFields
                                            value={formData.button_padding}
                                            onChange={(v) => set("button_padding", v)}
                                        />
                                    </SettingRow>
                                </>
                            )}
                        </Card>

                        {/* Live preview */}
                        <Card>
                            <CardHead
                                icon="👁"
                                iconBg="bg-gray-100"
                                title="Button Preview"
                                description="Reflects custom style values. Theme styles are not shown here."
                                badge="Preview"
                                badgeColor="gray"
                            />
                            <div className="px-5 py-5 bg-gray-50 flex items-center justify-center min-h-[80px]">
                                <button
                                    type="button"
                                    className="button alt wc-buy-now-btn cursor-default px-6 py-2.5 text-[13px] font-semibold rounded-lg"
                                    style={isCustomStyle ? {
                                        color:           formData.button_text_color       || undefined,
                                        backgroundColor: formData.button_background_color || undefined,
                                        borderColor:     formData.button_border_color     || undefined,
                                        borderWidth:     formData.button_border_size      ? `${formData.button_border_size}px` : undefined,
                                        borderStyle:     formData.button_border_size      ? "solid" : undefined,
                                        borderRadius:    formData.button_border_radius    ? `${formData.button_border_radius}px` : undefined,
                                        fontSize:        formData.button_font_size        ? `${formData.button_font_size}px` : undefined,
                                    } : {}}
                                >
                                    {formData.button_text || "Buy Now"}
                                </button>
                            </div>
                        </Card>
                    </>
                )}

                {/* ── Save bar ── */}
                {!isTabLoading && (
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
                )}

            </form>
        </div>
    );
};

export default BuyButtonSettings;