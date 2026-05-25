import React, { useEffect, useState } from "react";
import axios from "axios";
import { WarningIcon } from "../../../../common/Svgs";
import SectionHeader from "../../../../common/SectionHeader";
import Toggle from "../../../../common/Toggle";
import RadioGroup from "../../../../common/RadioGroup";
import SettingRow from "../../../../common/SettingRow";
import ColorField from "../../../../common/ColorField";
import SmallNumberInput from "../../../../common/SmallNumberInput";
import DimensionFields from "../../../../common/DimensionFields";
import SaveRow from "../../../../common/SaveRow";

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


const BuyButtonSettings = () => {
    const [isLoading, setIsLoading]               = useState(true);
    const [isTabLoading, setIsTabLoading]         = useState(false);
    const [isSaving, setIsSaving]                 = useState(false);
    const [saveStatus, setSaveStatus]             = useState(null);
    const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
    const [activeTab, setActiveTab]               = useState("general");
    const [formData, setFormData]                 = useState(DEFAULTS);

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
            const updated  = e.detail || {};
            const enabled  = updated["buy-button-for-woocommerce"] === "on";
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
            reset_cart:              formData.reset_cart       ? "yes" : "no",
            ajax_add_to_cart:        formData.ajax_add_to_cart ? "yes" : "no",
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

    if (isLoading) return (
        <div className="max-w-3xl animate-pulse">
            {/* skeleton tab bar */}
            <div className="flex border-b border-gray-200 mb-4 gap-1">
                <div className="h-9 w-24 bg-gray-200 rounded-t-md"></div>
                <div className="h-9 w-28 bg-gray-100 rounded-t-md"></div>
            </div>
            {/* skeleton cards */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="mb-4 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                    <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-100">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                    {[1, 2].map((j) => (
                        <div key={j} className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1 pr-8">
                                <div className="h-3.5 bg-gray-200 rounded w-2/5 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-3/5"></div>
                            </div>
                            <div className="h-6 w-11 bg-gray-200 rounded-full flex-shrink-0"></div>
                        </div>
                    ))}
                </div>
            ))}
            {/* skeleton save button */}
            <div className="h-10 w-32 bg-gray-200 rounded-lg mt-2"></div>
        </div>
    );

    if (!isFeatureEnabled) {
        return (
            <div className="max-w-2xl">
                <div className="mt-6 flex gap-4 p-6 bg-yellow-50 border border-yellow-300 border-l-4 border-l-yellow-500 rounded-xl">
                    <WarningIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="m-0 text-[15px] font-bold text-yellow-900">Feature Not Enabled</p>
                        <p className="mt-1.5 mb-4 m-0 text-[13px] text-yellow-800 leading-relaxed">
                            The Buy Button feature is currently disabled. Please enable{" "}
                            <strong>"Buy Button for WooCommerce"</strong> from the Features page first.
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

    const isCustomStyle = formData.button_style === "custom";

    return (
        <div className="max-w-3xl">

            {/* ── Save toast ── */}
            {saveStatus && (
                <div
                    className={`flex items-center gap-2.5 px-4 py-2.5 mb-4 rounded-xl text-[13px] font-semibold border ${
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

            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-200 mb-4">
                {[
                    { id: "general",       label: "General" },
                    { id: "button_styles", label: "Button Styles" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-5 py-2.5 text-[13px] font-semibold border-b-2 transition-colors duration-150 bg-transparent cursor-pointer ${
                            activeTab === tab.id
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSave} className="space-y-4">

                {/* ══════════════ TAB SWITCHING SKELETON ══════════════ */}
                {isTabLoading && (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-100">
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                </div>
                                {[1, 2].map((j) => (
                                    <div key={j} className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-b-0">
                                        <div className="flex-1 pr-8">
                                            <div className="h-3.5 bg-gray-200 rounded w-2/5 mb-2"></div>
                                            <div className="h-3 bg-gray-100 rounded w-3/5"></div>
                                        </div>
                                        <div className="h-6 w-11 bg-gray-200 rounded-full flex-shrink-0"></div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                    </div>
                )}

                {/* ══════════════ GENERAL TAB ══════════════ */}
                {!isTabLoading && activeTab === "general" && (
                    <>
                        {/* Enable Button On */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <SectionHeader
                                icon="✅"
                                title="Enable Button On"
                                description="Choose where the Buy Now button appears in your store"
                                color="blue"
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
                                border={false}
                            >
                                <Toggle
                                    checked={formData.enable_archive}
                                    onChange={(e) => set("enable_archive", e.target.checked)}
                                />
                            </SettingRow>
                        </div>

                        {/* Button Position */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <SectionHeader
                                icon="📍"
                                title="Button Position"
                                description="Control where the button appears relative to Add to Cart"
                                color="amber"
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
                                border={false}
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
                        </div>

                        {/* Redirect Location */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <SectionHeader
                                icon="🔀"
                                title="Redirect Location"
                                description="Where should the customer go after clicking Buy Now?"
                                color="green"
                            />
                            <SettingRow
                                label="Redirect to"
                                border={formData.redirect_location !== "custom"}
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
                                <SettingRow label="Custom Redirect URL" border={false}>
                                    <input
                                        type="url"
                                        value={formData.custom_redirect_url}
                                        onChange={(e) => set("custom_redirect_url", e.target.value)}
                                        placeholder="https://example.com/checkout"
                                        className="w-64 px-3 py-1.5 text-[13px] text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
                                    />
                                </SettingRow>
                            )}
                        </div>

                        {/* Button Settings */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <SectionHeader
                                icon="⚙️"
                                title="Button Settings"
                                description="General behaviour and appearance options"
                                color="blue"
                            />
                            <SettingRow label="Button Text" description="Text displayed on the Buy Now button.">
                                <input
                                    type="text"
                                    value={formData.button_text}
                                    onChange={(e) => set("button_text", e.target.value)}
                                    className="w-40 px-3 py-1.5 text-[13px] text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
                                />
                            </SettingRow>
                            <SettingRow
                                label="Default Shop Quantity"
                                description="Quantity added to cart when Buy Now is clicked on the shop page."
                            >
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.default_shop_quantity}
                                    onChange={(e) => set("default_shop_quantity", Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20 px-3 py-1.5 text-[13px] text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150 font-mono"
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
                                description="Use AJAX for simple products on the single product page (variable products always use AJAX)."
                                border={false}
                            >
                                <Toggle
                                    checked={formData.ajax_add_to_cart}
                                    onChange={(e) => set("ajax_add_to_cart", e.target.checked)}
                                />
                            </SettingRow>
                        </div>
                    </>
                )}

                {/* ══════════════ BUTTON STYLES TAB ══════════════ */}
                {!isTabLoading && activeTab === "button_styles" && (
                    <>
                        {/* Style mode */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <SectionHeader
                                icon="🎨"
                                title="Buy Now Button Styles"
                                description="Use theme default styles or define custom CSS values"
                                color="amber"
                            />
                            <SettingRow label="Button Styles" border={isCustomStyle}>
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
                                    <SettingRow label="Padding" description="Set padding values in px (top / right / bottom / left)." border={false}>
                                        <DimensionFields
                                            value={formData.button_padding}
                                            onChange={(v) => set("button_padding", v)}
                                        />
                                    </SettingRow>
                                </>
                            )}
                        </div>

                        {/* Live preview */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-100">
                                <p className="m-0 text-[13px] font-bold text-gray-800">👁 Button Preview</p>
                                <p className="m-0 mt-0.5 text-[11px] text-gray-500">
                                    Reflects custom style values. Theme styles are not shown here.
                                </p>
                            </div>
                            <div className="px-6 py-5">
                                <button
                                    type="button"
                                    className="button alt wc-buy-now-btn cursor-default"
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
                        </div>
                    </>
                )}

                <SaveRow isSaving={isSaving} />
            </form>
        </div>
    );
};

export default BuyButtonSettings;
