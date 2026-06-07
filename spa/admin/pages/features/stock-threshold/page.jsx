import React, { useEffect, useState } from "react";
import axios from "axios";
import SettingSkeleton from "../../../common/Skeletons/SettingSkalaton";
import { SaveButtonIcon, WarningIcon } from "../../../common/Svgs";
import SectionHeader from "../../../common/SectionHeader";
import NumberField from "../../../common/NumberField";
import Toggle from "../../../common/Toggle";

const StockThreshold = () => {
  const [isLoading,        setIsLoading]        = useState(true);
  const [isSaving,         setIsSaving]         = useState(false);
  const [saveStatus,       setSaveStatus]       = useState(null);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [showHowItWorks,   setShowHowItWorks]   = useState(false);

  const [formData, setFormData] = useState({
    low_threshold:           5,
    low_increase:            40,
    medium_threshold:        20,
    medium_increase:         20,
    high_threshold:          100,
    high_decrease:           15,
    enable_message:          false,
    low_customer_message:    "Low stock - high demand item",
    medium_customer_message: "Medium stock - price adjusted",
    high_customer_message:   "High stock - clearance price",
  });

  const url = `${COMMERCEKIT.apiurl}/save-stock-threshold`;
  const handleChange = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const applyResponse = (data) =>
    setFormData({
      low_threshold:           data.low_threshold,
      low_increase:            data.low_increase,
      medium_threshold:        data.medium_threshold,
      medium_increase:         data.medium_increase,
      high_threshold:          data.high_threshold,
      high_decrease:           data.high_decrease,
      enable_message:          data.enable_message === "on",
      low_customer_message:    data.low_customer_message    || "Low stock - high demand item",
      medium_customer_message: data.medium_customer_message || "Medium stock - price adjusted",
      high_customer_message:   data.high_customer_message   || "High stock - clearance price",
    });

  const checkFeatureAndLoad = () => {
    const settingsData   = window.COMMERCEKIT?.settings_data || {};
    const featureEnabled = settingsData["stock-threshold-for-wc"] === "on";
    setIsFeatureEnabled(featureEnabled);
    if (featureEnabled) {
      setIsLoading(true);
      axios
        .get(`${COMMERCEKIT.apiurl}/get-stock-threshold`, {
          headers: { "X-WP-Nonce": COMMERCEKIT.nonce },
        })
        .then((r) => applyResponse(r.data))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkFeatureAndLoad();
    const handleSettingsUpdate = (e) => {
      const updated        = e.detail || {};
      const featureEnabled = updated["stock-threshold-for-wc"] === "on";
      setIsFeatureEnabled(featureEnabled);
      if (featureEnabled) {
        setIsLoading(true);
        axios
          .get(`${COMMERCEKIT.apiurl}/get-stock-threshold`, {
            headers: { "X-WP-Nonce": COMMERCEKIT.nonce },
          })
          .then((r) => applyResponse(r.data))
          .catch((err) => console.error("Error loading stock threshold:", err))
          .finally(() => setIsLoading(false));
      }
    };
    window.addEventListener("commerceKitSettingsUpdated", handleSettingsUpdate);
    return () => window.removeEventListener("commerceKitSettingsUpdated", handleSettingsUpdate);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    axios
      .post(
        url,
        { ...formData, enable_message: formData.enable_message ? "on" : "off" },
        { headers: { "Content-Type": "application/json", "X-WP-Nonce": COMMERCEKIT.nonce } }
      )
      .then(() => {
        setSaveStatus("success");
        setIsSaving(false);
        setTimeout(() => setSaveStatus(null), 3000);
      })
      .catch((err) => {
        console.error("Error saving stock threshold:", err);
        setSaveStatus("error");
        setIsSaving(false);
        setTimeout(() => setSaveStatus(null), 3000);
      });
  };

  /* ── early returns ── */
  if (isLoading) return <SettingSkeleton />;

  /* ── main render ── */
  return (
    <div className="max-w-2xl">

      {/* ── page title bar ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="m-0 text-[18px] font-bold text-gray-900 tracking-tight">Stock Threshold</h2>
          <p className="m-0 mt-0.5 text-[12px] text-gray-400">Automatically adjust prices based on inventory levels.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-700">Feature active</span>
        </div>
      </div>

      {/* ── Save toast ── */}
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

        {/* ── Pricing rules card ── */}
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200">

          {/* Low Stock */}
          <SectionHeader
            icon="🔴"
            title="Low Stock Rules"
            description="Increase price when inventory is scarce"
            color="red"
          />
          <NumberField
            label="Low Stock Threshold"
            value={formData.low_threshold}
            onChange={(e) => handleChange("low_threshold", parseInt(e.target.value) || 0)}
            helper="Items at or below this count = low stock"
            accent="red"
          />
          <NumberField
            label="Price Increase"
            value={formData.low_increase}
            onChange={(e) => handleChange("low_increase", parseFloat(e.target.value) || 0)}
            suffix="%"
            helper="% added to base price when stock is low"
            accent="red"
          />

          {/* Medium Stock */}
          <SectionHeader
            icon="🟡"
            title="Medium Stock Rules"
            description="Slight increase for moderate inventory levels"
            color="amber"
          />
          <NumberField
            label="Medium Stock Threshold"
            value={formData.medium_threshold}
            onChange={(e) => handleChange("medium_threshold", parseInt(e.target.value) || 0)}
            helper="Items at or below this count = medium stock"
            accent="amber"
          />
          <NumberField
            label="Price Increase"
            value={formData.medium_increase}
            onChange={(e) => handleChange("medium_increase", parseFloat(e.target.value) || 0)}
            suffix="%"
            helper="% added to base price when stock is medium"
            accent="amber"
          />

          {/* High Stock */}
          <SectionHeader
            icon="🟢"
            title="High Stock Rules"
            description="Decrease price to move excess inventory faster"
            color="green"
          />
          <NumberField
            label="High Stock Threshold"
            value={formData.high_threshold}
            onChange={(e) => handleChange("high_threshold", parseInt(e.target.value) || 0)}
            helper="Items at or above this count = high stock"
            accent="green"
          />
          <NumberField
            label="Price Decrease"
            value={formData.high_decrease}
            onChange={(e) => handleChange("high_decrease", parseFloat(e.target.value) || 0)}
            suffix="%"
            helper="% subtracted from base price when stock is high"
            accent="green"
            last
          />
        </div>

        {/* ── Customer messages card ── */}
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200">

          {/* Header row with toggle */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm flex-shrink-0">
                💬
              </div>
              <div>
                <p className="m-0 text-[13px] font-semibold text-gray-900 leading-tight">Customer Messages</p>
                <p className="m-0 mt-0.5 text-[11px] text-gray-400">Notify shoppers when pricing has been adjusted</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                formData.enable_message
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-400 border-gray-200"
              }`}>
                {formData.enable_message ? "On" : "Off"}
              </span>
              <Toggle
                checked={formData.enable_message}
                onChange={(e) => handleChange("enable_message", e.target.checked)}
              />
            </div>
          </div>

          {/* Message textareas */}
          <div className={`p-5 flex flex-col gap-4 transition-opacity duration-200 ${
            formData.enable_message ? "opacity-100 pointer-events-auto" : "opacity-40 pointer-events-none"
          }`}>

            {/* Low */}
            <div>
              <label className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-red-600 uppercase tracking-wider">
                <span>🔴</span> Low Stock Message
              </label>
              <textarea
                value={formData.low_customer_message}
                onChange={(e) => handleChange("low_customer_message", e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 text-[13px] text-gray-800 bg-red-50 border border-red-200 rounded-lg
                           resize-none leading-relaxed
                           hover:border-red-300
                           focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100
                           transition-all duration-150"
              />
            </div>

            {/* Medium */}
            <div>
              <label className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
                <span>🟡</span> Medium Stock Message
              </label>
              <textarea
                value={formData.medium_customer_message}
                onChange={(e) => handleChange("medium_customer_message", e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 text-[13px] text-gray-800 bg-amber-50 border border-amber-200 rounded-lg
                           resize-none leading-relaxed
                           hover:border-amber-300
                           focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100
                           transition-all duration-150"
              />
            </div>

            {/* High */}
            <div>
              <label className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-green-600 uppercase tracking-wider">
                <span>🟢</span> High Stock Message
              </label>
              <textarea
                value={formData.high_customer_message}
                onChange={(e) => handleChange("high_customer_message", e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 text-[13px] text-gray-800 bg-green-50 border border-green-200 rounded-lg
                           resize-none leading-relaxed
                           hover:border-green-300
                           focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100
                           transition-all duration-150"
              />
            </div>

            <p className="m-0 text-[11px] text-gray-400 leading-relaxed">
              Each message shows when its stock level triggers a price adjustment on product pages.
            </p>
          </div>
        </div>

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

      {/* ── How It Works accordion ── */}
      <div className="mt-4 bg-white rounded-xl overflow-hidden border border-gray-200">
        <button
          type="button"
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-transparent border-none cursor-pointer
                     hover:bg-gray-50 transition-colors duration-150 focus:outline-none"
        >
          <span className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <span>📖</span>
            How It Works
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showHowItWorks ? "rotate-180" : "rotate-0"}`}
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showHowItWorks && (
          <div className="px-5 pb-5 flex flex-col gap-2 border-t border-gray-100">
            <p className="m-0 pt-4 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pricing Logic</p>
            {[
              {
                icon: "🔴",
                label: "Low",
                text: "Stock ≤ Low Threshold → price increases by Low %",
                cls: "bg-red-50 border-red-100 text-red-800",
                badge: "bg-red-100 text-red-600",
              },
              {
                icon: "🟡",
                label: "Medium",
                text: "Stock ≤ Medium Threshold → price increases by Medium %",
                cls: "bg-amber-50 border-amber-100 text-amber-800",
                badge: "bg-amber-100 text-amber-700",
              },
              {
                icon: "🟢",
                label: "High",
                text: "Stock ≥ High Threshold → price decreases by High %",
                cls: "bg-green-50 border-green-100 text-green-800",
                badge: "bg-green-100 text-green-700",
              },
              {
                icon: "⚪",
                label: "Normal",
                text: "Otherwise → normal base price applies",
                cls: "bg-gray-50 border-gray-100 text-gray-600",
                badge: "bg-gray-100 text-gray-500",
              },
            ].map(({ icon, label, text, cls, badge }) => (
              <div key={label} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-[12px] leading-relaxed ${cls}`}>
                <span className="flex-shrink-0 text-base">{icon}</span>
                <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>{label}</span>
                <span className="leading-snug">{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default StockThreshold;