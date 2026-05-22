import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Tabs from "./pages/Tabs";
import StockThreshold from "./pages/StockThreshold";
import TipSettings from "./pages/TipSettings";
import BuyButtonSettings from "./pages/BuyButtonSettings";

// Add an entry here whenever a new feature gets its own submenu page.
// key      = commerce_kit_settings feature key
// selector = CSS attribute selector that matches the submenu <a> element
// label    = menu label shown in the sidebar
// href     = relative href WordPress uses for this submenu anchor
const FEATURE_SUBMENUS = {
    "stock-threshold-for-wc": {
        selector: 'a[href*="#/stock-threshold"]',
        label:    "Stock Threshold",
        href:     "admin.php?page=commerce-kit#/stock-threshold",
    },
    "woocommerce-tips": {
        selector: 'a[href*="#/commerce-kit-tip-settings"]',
        label:    "Tips Settings",
        href:     "admin.php?page=commerce-kit#/commerce-kit-tip-settings",
    },
    "buy-button-for-woocommerce": {
        selector: 'a[href*="#/buy-button-settings"]',
        label:    "Buy Button",
        href:     "admin.php?page=commerce-kit#/buy-button-settings",
    },
};

const isCommerceKitScreen = () =>
    new URLSearchParams(window.location.search).get("page") === "commerce-kit";

const App = () => {
    const [currentPage, setCurrentPage] = useState("");

    // ── 1. Hash routing ──────────────────────────────────────────────────────
    useEffect(() => {
        const onHashChange = () => {
            const hash = window.location.hash.replace("#", "") || "";
            setCurrentPage(hash);
        };
        window.addEventListener("hashchange", onHashChange);
        onHashChange(); // run immediately on mount
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    // ── 2. Sidebar submenu visibility ────────────────────────────────────────
    // Runs once on mount. Hides/shows feature-gated submenus based on saved
    // settings and re-syncs whenever Feature.jsx dispatches the update event.
    useEffect(() => {
        const menu = document.querySelector(
            "#adminmenu li.toplevel_page_commerce-kit"
        );
        if (!menu) return;

        const submenuList = menu.querySelector("ul.wp-submenu");

        const syncSubmenus = (settings) => {
            if (!submenuList) return;
            Object.keys(FEATURE_SUBMENUS).forEach((featureKey) => {
                const { selector, label, href } = FEATURE_SUBMENUS[featureKey];
                const isEnabled = settings[featureKey] === "on";
                const existingLi = menu.querySelector(selector)?.closest("li");

                if (isEnabled && !existingLi) {
                    // PHP didn't register this submenu (was disabled on load) — create it now.
                    const li = document.createElement("li");
                    li.innerHTML = `<a href="${href}">${label}</a>`;
                    submenuList.appendChild(li);
                } else if (!isEnabled && existingLi) {
                    existingLi.remove();
                }
            });
        };

        // Initial sync from PHP-localized COMMERCEKIT.settings_data
        syncSubmenus(
            (window.COMMERCEKIT && window.COMMERCEKIT.settings_data) || {}
        );

        // Re-sync every time features are saved (dispatched by Feature.jsx)
        const onSettingsUpdated = (e) => syncSubmenus(e.detail || {});
        window.addEventListener("commerceKitSettingsUpdated", onSettingsUpdated);
        return () =>
            window.removeEventListener("commerceKitSettingsUpdated", onSettingsUpdated);
    }, []);

    // ── 3. Sidebar active-item highlight ────────────────────────────────────
    // Runs on every hash/page change to keep the .current class in sync.
    useEffect(() => {
        if (!isCommerceKitScreen()) return;
        const menu = document.querySelector(
            "#adminmenu li.toplevel_page_commerce-kit"
        );
        if (!menu) return;

        // Clear all current highlights first
        menu.querySelectorAll(".wp-submenu li").forEach((li) =>
            li.classList.remove("current")
        );

        const hash = window.location.hash; // e.g. "#/stock-threshold"
        if (hash && hash !== "#/") {
            const anchor = menu.querySelector(`a[href*="${hash}"]`);
            anchor?.closest("li")?.classList.add("current");
        } else {
            // No hash → highlight the top-level Dashboard item
            const anchor = menu.querySelector(
                'a[href="admin.php?page=commerce-kit"]'
            );
            anchor?.closest("li")?.classList.add("current");
        }
    }, [currentPage]);

    // ── 4. Sidebar Dashboard-link click handler ──────────────────────────────
    // Prevents a full page reload when clicking the Dashboard menu item while
    // already on the CommerceKit screen — just resets the hash instead.
    useEffect(() => {
        if (!isCommerceKitScreen()) return;
        const anchor = document.querySelector(
            '#adminmenu a[href="admin.php?page=commerce-kit"]'
        );
        if (!anchor) return;

        const onClick = (e) => {
            e.preventDefault();
            window.location.hash = "";
            setCurrentPage("");
        };
        anchor.addEventListener("click", onClick);
        return () => anchor.removeEventListener("click", onClick);
    }, []);

    // ── Page renderer ────────────────────────────────────────────────────────
    const renderPage = () => {
        switch (currentPage) {
            case "":
            case "/":
                return <Tabs />;
            case "/stock-threshold":
                return <StockThreshold />;
            case "/commerce-kit-tip-settings":
                return <TipSettings />;
            case "/buy-button-settings":
                return <BuyButtonSettings />;
            default:
                return (
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-red-600">
                            404 - Page not found
                        </h2>
                    </div>
                );
        }
    };

    return <div>{renderPage()}</div>;
};

const rootElement = document.getElementById("commerce_kit_render");
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<App />);
}

export default App;
