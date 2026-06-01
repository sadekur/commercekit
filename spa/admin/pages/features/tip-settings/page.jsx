import React, { useEffect, useState } from "react";
import axios from "axios";
import TabPageSkeleton from "../../../common/Skeletons/TabPageSkeleton";
import { WarningIcon } from "../../../common/Svgs";
import SectionHeader from "../../../common/SectionHeader";
import Toggle from "../../../common/Toggle";

const TipSettings = () => {
  const [isLoading, setIsLoading]   = useState(true);
  const [isSaving, setIsSaving]     = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);

  const [formData, setFormData] = useState({
    tcwt_cart:      false,
    tcwt_checkout:  false,
    tcwt_note:      false,
    tcwt_btncolor:  "#289dcc",
    tcwt_btntext:   "Add Donation",
    tcwt_textcolor: "#ffffff",
  });

  const handleChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const applyResponse = (data) =>
    setFormData({
      tcwt_cart:      data.tcwt_cart      === "on",
      tcwt_checkout:  data.tcwt_checkout  === "on",
      tcwt_note:      data.tcwt_note      === "on",
      tcwt_btncolor:  data.tcwt_btncolor  || "#289dcc",
      tcwt_btntext:   data.tcwt_btntext   || "Add Donation",
      tcwt_textcolor: data.tcwt_textcolor || "#ffffff",
    });

  const loadSettings = () => {
    setIsLoading(true);
    axios
      .get(`${COMMERCEKIT.apiurl}/get-tips`, {
        headers: { "X-WP-Nonce": COMMERCEKIT.nonce },
      })
      .then((r) => applyResponse(r.data))
      .catch((err) => console.error("Error loading tip settings:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const settingsData   = window.COMMERCEKIT?.settings_data || {};
    const featureEnabled = settingsData["woocommerce-tips"] === "on";
    setIsFeatureEnabled(featureEnabled);
    if (featureEnabled) {
      loadSettings();
    } else {
      setIsLoading(false);
    }

    const handleSettingsUpdate = (e) => {
      const updated  = e.detail || {};
      const enabled  = updated["woocommerce-tips"] === "on";
      setIsFeatureEnabled(enabled);
      if (enabled) loadSettings();
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
        `${COMMERCEKIT.apiurl}/save-tips`,
        {
          tcwt_cart:      formData.tcwt_cart      ? "on" : "off",
          tcwt_checkout:  formData.tcwt_checkout  ? "on" : "off",
          tcwt_note:      formData.tcwt_note      ? "on" : "off",
          tcwt_btncolor:  formData.tcwt_btncolor,
          tcwt_btntext:   formData.tcwt_btntext,
          tcwt_textcolor: formData.tcwt_textcolor,
        },
        { headers: { "Content-Type": "application/json", "X-WP-Nonce": COMMERCEKIT.nonce } }
      )
      .then(() => {
        setSaveStatus("success");
        setIsSaving(false);
        setTimeout(() => setSaveStatus(null), 3000);
      })
      .catch((err) => {
        console.error("Error saving tip settings:", err);
        setSaveStatus("error");
        setIsSaving(false);
        setTimeout(() => setSaveStatus(null), 3000);
      });
  };

  /* ── early returns ── */
  if (isLoading) return <SettingSkeleton />;

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

  /* ── main render ── */
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

      <form onSubmit={handleSave} className="space-y-4">

        {/* ── Display Settings card ── */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <SectionHeader
            icon="📍"
            title="Display Settings"
            description="Choose where the tip form appears in your store"
            color="blue"
          />

          {/* Cart page */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div className="pr-6">
              <p className="m-0 text-[13px] font-semibold text-gray-800">Add on Cart Page</p>
              <p className="m-0 mt-1 text-[12px] text-gray-500">
                Show the tip form above cart contents.
              </p>
              <p className="m-0 mt-1 text-[11px] text-gray-400">
                <strong>Note:</strong> For WooCommerce Blocks cart pages use the Woo donations block instead.
              </p>
            </div>
            <Toggle
              checked={formData.tcwt_cart}
              onChange={(e) => handleChange("tcwt_cart", e.target.checked)}
            />
          </div>

          {/* Checkout page */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div className="pr-6">
              <p className="m-0 text-[13px] font-semibold text-gray-800">Add on Checkout Page</p>
              <p className="m-0 mt-1 text-[12px] text-gray-500">
                Show the tip form above the payment section.
              </p>
              <p className="m-0 mt-1 text-[11px] text-gray-400">
                <strong>Note:</strong> For WooCommerce Blocks checkout pages use the Woo donations block instead.
              </p>
            </div>
            <Toggle
              checked={formData.tcwt_checkout}
              onChange={(e) => handleChange("tcwt_checkout", e.target.checked)}
            />
          </div>

          {/* Donation note */}
          <div className="flex items-start justify-between px-6 py-4">
            <div className="pr-6">
              <p className="m-0 text-[13px] font-semibold text-gray-800">Donation Note</p>
              <p className="m-0 mt-1 text-[12px] text-gray-500">
                Show a note alongside the tip form.
              </p>
            </div>
            <Toggle
              checked={formData.tcwt_note}
              onChange={(e) => handleChange("tcwt_note", e.target.checked)}
            />
          </div>
        </div>

        {/* ── Button Appearance card ── */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <SectionHeader
            icon="🎨"
            title="Button Appearance"
            description="Customize the tip submission button label and colors"
            color="amber"
          />

          {/* Button text */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <p className="m-0 text-[13px] font-semibold text-gray-800">Button Text</p>
              <p className="m-0 mt-1 text-[12px] text-gray-500">Label shown on the submit button.</p>
            </div>
            <input
              type="text"
              value={formData.tcwt_btntext}
              onChange={(e) => handleChange("tcwt_btntext", e.target.value)}
              className="w-48 px-3 py-1.5 text-[13px] text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
            />
          </div>

          {/* Button color */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <p className="m-0 text-[13px] font-semibold text-gray-800">Button Background Color</p>
              <p className="m-0 mt-1 text-[12px] text-gray-500">Background color of the submit button.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-gray-400 font-mono uppercase">
                {formData.tcwt_btncolor}
              </span>
              <input
                type="color"
                value={formData.tcwt_btncolor}
                onChange={(e) => handleChange("tcwt_btncolor", e.target.value)}
                className="w-10 h-10 p-1 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Button text color */}
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="m-0 text-[13px] font-semibold text-gray-800">Button Text Color</p>
              <p className="m-0 mt-1 text-[12px] text-gray-500">Text color of the submit button.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-gray-400 font-mono uppercase">
                {formData.tcwt_textcolor}
              </span>
              <input
                type="color"
                value={formData.tcwt_textcolor}
                onChange={(e) => handleChange("tcwt_textcolor", e.target.value)}
                className="w-10 h-10 p-1 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ── Live preview card ── */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-100">
            <p className="m-0 text-[13px] font-bold text-gray-800">👁 Button Preview</p>
            <p className="m-0 mt-0.5 text-[11px] text-gray-500">
              Live preview updates as you change settings above.
            </p>
          </div>
          <div className="px-6 py-5">
            <button
              type="button"
              className="px-5 py-2 rounded-lg text-[13px] font-semibold cursor-default"
              style={{
                backgroundColor: formData.tcwt_btncolor,
                color: formData.tcwt_textcolor,
              }}
            >
              {formData.tcwt_btntext || "Add Donation"}
            </button>
          </div>
        </div>

        {/* ── Save button row ── */}
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
