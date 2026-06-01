import React from "react";

const INFO_ROWS = [
    { label: "Plugin",   value: "CommerceKit" },
    { label: "Version",  value: "1.0.0" },
    { label: "Requires", value: "WordPress 5.9+ · WooCommerce 5.0+ · PHP 7.2+" },
    { label: "Author",   value: "Sadekur Rahman" },
    { label: "License",  value: "GPL v2 or later" },
];

const LINKS = [
    { label: "Plugin Website",       href: "https://commercekit.com" },
    { label: "Author Website",       href: "https://sadekurrahman.net" },
    { label: "WooCommerce.com",      href: "https://woocommerce.com" },
];

const Settings = () => {
    return (
        <div className="space-y-4">
            {/* Plugin info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                    <p className="m-0 text-[13px] font-bold text-gray-800">Plugin Information</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {INFO_ROWS.map(({ label, value }) => (
                        <div key={label} className="flex items-center px-5 py-3">
                            <span className="w-28 text-[11px] font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0">
                                {label}
                            </span>
                            <span className="text-[13px] text-gray-800">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature status */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                    <p className="m-0 text-[13px] font-bold text-gray-800">Feature Status</p>
                    <p className="m-0 mt-0.5 text-[11px] text-gray-500">Implementation status for all registered features and blocks</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {[
                        { name: "Stock Threshold for WooCommerce", type: "Feature", status: "complete" },
                        { name: "Buy Button for WooCommerce",       type: "Feature", status: "complete" },
                        { name: "WooCommerce Tips",                 type: "Feature", status: "partial"  },
                        { name: "WooCommerce FAQ",                  type: "Feature", status: "soon"     },
                        { name: "WooCommerce Product Barcode",      type: "Feature", status: "soon"     },
                        { name: "Accordion Block",                  type: "Block",   status: "complete" },
                        { name: "Category Products Slider",         type: "Block",   status: "complete" },
                        { name: "Generic FAQ Block",                type: "Block",   status: "soon"     },
                        { name: "Variant FAQ Block",                type: "Block",   status: "soon"     },
                    ].map(({ name, type, status }) => {
                        const badge = {
                            complete: { label: "Complete",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                            partial:  { label: "Partial",     cls: "bg-amber-50  text-amber-700  border-amber-200"  },
                            soon:     { label: "Coming Soon", cls: "bg-gray-100  text-gray-500   border-gray-200"   },
                        }[status];
                        return (
                            <div key={name} className="flex items-center justify-between px-5 py-3">
                                <div>
                                    <span className="text-[13px] text-gray-800 font-medium">{name}</span>
                                    <span className="ml-2 text-[11px] text-gray-400">{type}</span>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.cls}`}>
                                    {badge.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                    <p className="m-0 text-[13px] font-bold text-gray-800">Resources</p>
                </div>
                <div className="px-5 py-4 flex flex-col gap-2.5">
                    {LINKS.map(({ label, href }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-blue-600 hover:underline no-underline"
                        >
                            → {label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Settings;
