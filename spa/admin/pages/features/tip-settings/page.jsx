import React, { useEffect, useState } from "react";
import axios from "axios";
import TabPageSkeleton from "../../../common/Skeletons/TabPageSkeleton";
import { WarningIcon } from "../../../common/Svgs";
import Toggle from "../../../common/Toggle";

/* ─── unchanged data helpers ─────────────────────────────────────────────── */

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

/* ─── design sub-components ──────────────────────────────────────────────── */

/** Coloured pill badge */
const Badge = ({ children, color = "blue" }) => {
    const styles = {
        blue:  { background: "#E6F1FB", color: "#185FA5", border: "0.5px solid #B5D4F4" },
        amber: { background: "#FAEEDA", color: "#854F0B", border: "0.5px solid #FAC775" },
    };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "3px 10px", borderRadius: "100px",
            fontSize: "10px", fontWeight: 500,
            ...styles[color],
        }}>
            {children}
        </span>
    );
};

/** Card section wrapper */
const Card = ({ children }) => (
    <div style={{
        background: "var(--color-background-primary, #fff)",
        border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,.12))",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 12,
        transition: "box-shadow .2s",
    }}>
        {children}
    </div>
);

/** Card header */
const CardHead = ({ icon, iconBg, title, description, badge, badgeColor }) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "13px 20px",
        borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,.12))",
    }}>
        <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, background: iconBg,
        }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</p>
            {description && <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--color-text-tertiary)" }}>{description}</p>}
        </div>
        {badge && <Badge color={badgeColor}>{badge}</Badge>}
    </div>
);

/** Individual setting row */
const SettingRow = ({ label, description, hint, last, children }) => (
    <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 20px",
        borderBottom: last ? "none" : "0.5px solid var(--color-border-tertiary, rgba(0,0,0,.12))",
        transition: "background .12s",
    }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary,#f7f7f7)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
        <div style={{ paddingRight: 24, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</p>
            {description && <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--color-text-tertiary)" }}>{description}</p>}
            {hint && <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--color-text-tertiary)" }}>{hint}</p>}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
);

/**
 * Styled text / number input
 * Drop-in replacement: same props as <input>, same value/onChange API.
 */
const FancyInput = ({ style, ...props }) => {
    const [focused, setFocused] = useState(false);
    return (
        <input
            {...props}
            onFocus={e => { setFocused(true); props.onFocus?.(e); }}
            onBlur={e => { setFocused(false); props.onBlur?.(e); }}
            style={{
                width: 200, height: 38,
                padding: "0 13px",
                fontSize: 13, fontFamily: "inherit",
                color: "var(--color-text-primary)",
                background: focused
                    ? "var(--color-background-primary, #fff)"
                    : "var(--color-background-secondary, #f5f5f5)",
                border: `1.5px solid ${focused ? "#378ADD" : "var(--color-border-secondary, rgba(0,0,0,.22))"}`,
                borderRadius: 10,
                outline: "none",
                boxShadow: focused ? "0 0 0 3px rgba(55,138,221,.15)" : "none",
                transition: "border-color .15s, background .15s, box-shadow .15s",
                ...style,
            }}
        />
    );
};

/**
 * Segmented control used for "Tip Type" — replaces the plain <select>.
 * Passes the same onChange({ target: { value } }) shape so the parent set() call is unchanged.
 */
const SegmentedControl = ({ value, onChange, options }) => (
    <div style={{
        display: "inline-flex",
        border: "1.5px solid var(--color-border-secondary, rgba(0,0,0,.22))",
        borderRadius: 10,
        overflow: "hidden",
        background: "var(--color-background-secondary, #f5f5f5)",
    }}>
        {options.map((opt) => {
            const active = value === opt.value;
            return (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ target: { value: opt.value } })}
                    style={{
                        padding: "7px 16px",
                        fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                        border: "none", cursor: "pointer",
                        transition: "background .12s, color .12s",
                        background: active ? "#378ADD" : "transparent",
                        color: active ? "#fff" : "var(--color-text-secondary)",
                    }}
                >
                    {opt.label}
                </button>
            );
        })}
    </div>
);

/**
 * Styled <select> dropdown — same props/value/onChange as native <select>.
 */
const FancySelect = ({ children, style, ...props }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <select
                {...props}
                onFocus={e => { setFocused(true); props.onFocus?.(e); }}
                onBlur={e => { setFocused(false); props.onBlur?.(e); }}
                style={{
                    appearance: "none", WebkitAppearance: "none",
                    width: 200, height: 38,
                    padding: "0 36px 0 13px",
                    fontSize: 13, fontFamily: "inherit",
                    color: "var(--color-text-primary)",
                    background: focused
                        ? "var(--color-background-primary, #fff)"
                        : "var(--color-background-secondary, #f5f5f5)",
                    border: `1.5px solid ${focused ? "#378ADD" : "var(--color-border-secondary, rgba(0,0,0,.22))"}`,
                    borderRadius: 10,
                    outline: "none",
                    boxShadow: focused ? "0 0 0 3px rgba(55,138,221,.15)" : "none",
                    cursor: "pointer",
                    transition: "border-color .15s, background .15s, box-shadow .15s",
                    ...style,
                }}
            >
                {children}
            </select>
            {/* custom chevron */}
            <svg
                style={{ position: "absolute", right: 11, pointerEvents: "none", flexShrink: 0 }}
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
            >
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </div>
    );
};

/* ─── main component ─────────────────────────────────────────────────────── */

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
                <div style={{
                    marginTop: 24, display: "flex", gap: 14, padding: 20,
                    background: "#FAEEDA", border: "0.5px solid #FAC775",
                    borderLeft: "4px solid #BA7517", borderRadius: 12,
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                        background: "#FAC775", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <WarningIcon className="w-4 h-4" style={{ color: "#854F0B" }} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#412402" }}>Feature Not Enabled</p>
                        <p style={{ margin: "6px 0 14px", fontSize: 13, color: "#633806", lineHeight: 1.6 }}>
                            The WooCommerce Tips feature is currently disabled. Please enable{" "}
                            <strong>"WooCommerce Tip"</strong> from the Features page first.
                        </p>
                        <button
                            onClick={() => (window.location.hash = "")}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "8px 16px", background: "#185FA5", color: "#fff",
                                fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                                border: "none", borderRadius: 10, cursor: "pointer",
                            }}
                        >
                            Go to Features Page →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 680 }}>

            {/* ── page title bar ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>
                        Tip Settings
                    </h2>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--color-text-tertiary)" }}>
                        Configure how customers leave tips in your store.
                    </p>
                </div>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", borderRadius: 100,
                    background: "#E1F5EE", border: "0.5px solid #0F6E56",
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: "50%", background: "#1D9E75",
                        animation: "ck-pulse 2s infinite",
                    }} />
                    <style>{`@keyframes ck-pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#0F6E56" }}>Feature active</span>
                </div>
            </div>

            {/* ── save status toast ── */}
            {saveStatus && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 16px", marginBottom: 16, borderRadius: 10,
                    fontSize: 13, fontWeight: 500,
                    ...(saveStatus === "success"
                        ? { background: "#EAF3DE", color: "#3B6D11", border: "0.5px solid #C0DD97" }
                        : { background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #F7C1C1" }),
                }}>
                    <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                        background: saveStatus === "success" ? "#C0DD97" : "#F7C1C1",
                    }}>
                        {saveStatus === "success" ? "✓" : "✕"}
                    </div>
                    {saveStatus === "success"
                        ? "Settings saved successfully."
                        : "Error saving settings. Please try again."}
                </div>
            )}

            <form onSubmit={handleSave}>

                {/* ── Display Settings ── */}
                <Card>
                    <CardHead
                        icon="📍" iconBg="#E6F1FB"
                        title="Display Settings"
                        description="Choose where the tip form appears in your store"
                        badge="Visibility" badgeColor="blue"
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
                        icon="⚙️" iconBg="#E6F1FB"
                        title="Tip Configuration"
                        description="Set how tips are calculated and displayed"
                        badge="Core Setup" badgeColor="blue"
                    />

                    <SettingRow label="Form Title" description="Heading shown above the tip buttons.">
                        <FancyInput
                            type="text"
                            value={formData.tcwt_title}
                            onChange={(e) => set("tcwt_title", e.target.value)}
                            placeholder="Send us a tip"
                        />
                    </SettingRow>

                    {/* Segmented control replaces the plain <select> for tip type */}
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
                        hint={<>e.g. <code style={{ fontSize: 11, background: "var(--color-background-secondary)", padding: "1px 5px", borderRadius: 4 }}>5,10,15,20,25,30</code></>}
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
                        icon="🔧" iconBg="#FAEEDA"
                        title="Options"
                        description="Additional tip form behaviour"
                        badge="Behaviour" badgeColor="amber"
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
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 6, paddingBottom: 8 }}>
                    <button
                        type="submit"
                        disabled={isSaving}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            padding: "9px 22px",
                            fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                            color: "#fff", border: "none", borderRadius: 10, cursor: isSaving ? "not-allowed" : "pointer",
                            background: isSaving ? "var(--color-border-secondary)" : "#185FA5",
                            transition: "background .15s",
                        }}
                        onMouseEnter={e => { if (!isSaving) e.currentTarget.style.background = "#0C447C"; }}
                        onMouseLeave={e => { if (!isSaving) e.currentTarget.style.background = "#185FA5"; }}
                    >
                        {isSaving ? (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: "ck-spin 1s linear infinite" }} />
                                    <style>{`@keyframes ck-spin{to{transform:rotate(360deg)}}`}</style>
                                </svg>
                                Saving…
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                </svg>
                                Save Changes
                            </>
                        )}
                    </button>
                    <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                        Changes are applied immediately after saving.
                    </span>
                </div>

            </form>
        </div>
    );
};

export default TipSettings;