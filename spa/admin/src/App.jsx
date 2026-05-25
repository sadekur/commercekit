import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import StockThreshold from "./pages/features/stock-threshold/page";
import TipSettings from "./pages/features/tip-settings/page";
import BuyButtonSettings from "./pages/features/buy-button-settings/page";
import Dashboard from "./pages/dashboard/page";

const FEATURE_SUBMENUS = {
    "stock-threshold-for-wc":    'a[href*="#/stock-threshold"]',
    "woocommerce-tips":          'a[href*="#/commerce-kit-tip-settings"]',
    "buy-button-for-woocommerce":'a[href*="#/buy-button-settings"]',
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
        onHashChange();
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    // ── 2. Sidebar submenu visibility ────────────────────────────────────────
    // PHP hides disabled submenus on page load (every admin page). This effect
    // re-syncs on the CommerceKit page whenever features are saved so the
    // sidebar updates instantly without a reload.
    useEffect(() => {
        const menu = document.querySelector(
            "#adminmenu li.toplevel_page_commerce-kit"
        );
        if (!menu) return;

        const syncSubmenus = (settings) => {
            Object.keys(FEATURE_SUBMENUS).forEach((featureKey) => {
                const anchor = menu.querySelector(FEATURE_SUBMENUS[featureKey]);
                if (!anchor) return;
                const li = anchor.closest("li");
                if (!li) return;
                li.style.display = settings[featureKey] === "on" ? "" : "none";
            });
        };

        syncSubmenus(
            (window.COMMERCEKIT && window.COMMERCEKIT.settings_data) || {}
        );

        const onSettingsUpdated = (e) => syncSubmenus(e.detail || {});
        window.addEventListener("commerceKitSettingsUpdated", onSettingsUpdated);
        return () =>
            window.removeEventListener("commerceKitSettingsUpdated", onSettingsUpdated);
    }, []);

    // ── 3. Sidebar active-item highlight ────────────────────────────────────
    useEffect(() => {
        if (!isCommerceKitScreen()) return;
        const menu = document.querySelector(
            "#adminmenu li.toplevel_page_commerce-kit"
        );
        if (!menu) return;

        menu.querySelectorAll(".wp-submenu li").forEach((li) =>
            li.classList.remove("current")
        );

        const hash = window.location.hash;
        if (hash && hash !== "#/") {
            const anchor = menu.querySelector(`a[href*="${hash}"]`);
            anchor?.closest("li")?.classList.add("current");
        } else {
            const anchor = menu.querySelector(
                'a[href="admin.php?page=commerce-kit"]'
            );
            anchor?.closest("li")?.classList.add("current");
        }
    }, [currentPage]);

    // ── 4. Dashboard-link click handler ─────────────────────────────────────
    // Both the top-level menu link and the Dashboard submenu link share the
    // same href. Attach the handler to all of them so clicking either one
    // resets the hash instead of triggering a full page reload.
    useEffect(() => {
        if (!isCommerceKitScreen()) return;
        const anchors = document.querySelectorAll(
            '#adminmenu a[href="admin.php?page=commerce-kit"]'
        );
        if (!anchors.length) return;

        const onClick = (e) => {
            e.preventDefault();
            window.location.hash = "";
            setCurrentPage("");
        };
        anchors.forEach((a) => a.addEventListener("click", onClick));
        return () => anchors.forEach((a) => a.removeEventListener("click", onClick));
    }, []);

    // ── Page renderer ────────────────────────────────────────────────────────
    const renderPage = () => {
        switch (currentPage) {
            case "":
            case "/":
                return <Dashboard />;
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
