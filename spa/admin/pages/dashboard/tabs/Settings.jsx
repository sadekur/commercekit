import React from "react";

const FEATURE_STATUS = [
    { name: "Stock Threshold for WooCommerce", type: "Feature", status: "complete" },
    { name: "Buy Button for WooCommerce",       type: "Feature", status: "complete" },
    { name: "WooCommerce Tips",                 type: "Feature", status: "partial"  },
    { name: "WooCommerce FAQ",                  type: "Feature", status: "soon"     },
    { name: "WooCommerce Product Barcode",      type: "Feature", status: "soon"     },
    { name: "Accordion Block",                  type: "Block",   status: "complete" },
    { name: "Category Products Slider",         type: "Block",   status: "complete" },
    { name: "Generic FAQ Block",                type: "Block",   status: "soon"     },
    { name: "Variant FAQ Block",                type: "Block",   status: "soon"     },
];

const STATUS_BADGE = {
    complete: { label: "Complete",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    partial:  { label: "Partial",     cls: "bg-amber-50  text-amber-700  border-amber-200"  },
    soon:     { label: "Coming Soon", cls: "bg-gray-100  text-gray-500   border-gray-200"   },
};

const InfoCard = ({ icon, title, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <span className="text-lg leading-none">{icon}</span>
            <p className="m-0 text-[13px] font-bold text-gray-800">{title}</p>
        </div>
        <div className="flex-1 px-5 py-4">{children}</div>
    </div>
);

const Settings = () => {
    return (
        <div>
            <div className="mb-5">
                <h2 className="m-0 text-[15px] font-bold text-gray-900">Settings</h2>
                <p className="m-0 mt-0.5 text-[12px] text-gray-500">Plugin information, feature status, and resources</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* Plugin Info */}
                <InfoCard icon="ℹ️" title="Plugin Information">
                    <div className="space-y-2.5">
                        {[
                            { label: "Plugin",   value: "CommerceKit" },
                            { label: "Version",  value: "1.0.0" },
                            { label: "Author",   value: "Sadekur Rahman" },
                            { label: "License",  value: "GPL v2 or later" },
                            { label: "Requires", value: "WP 5.9+ · WC 5.0+ · PHP 7.2+" },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex gap-3">
                                <span className="w-16 flex-shrink-0 text-[11px] font-semibold text-gray-400 uppercase tracking-wide pt-0.5">
                                    {label}
                                </span>
                                <span className="text-[13px] text-gray-800">{value}</span>
                            </div>
                        ))}
                    </div>
                </InfoCard>

                {/* Resources */}
                <InfoCard icon="🔗" title="Resources">
                    <div className="flex flex-col gap-3">
                        {[
                            { label: "Plugin Website",  href: "https://commercekit.com" },
                            { label: "Author Website",  href: "https://sadekurrahman.net" },
                            { label: "WooCommerce.com", href: "https://woocommerce.com" },
                            { label: "WordPress.org",   href: "https://wordpress.org" },
                        ].map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[13px] text-blue-600 hover:text-blue-800 no-underline group"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600 flex-shrink-0" />
                                {label}
                            </a>
                        ))}
                    </div>
                </InfoCard>

                {/* Status overview */}
                <InfoCard icon="📋" title="Status Overview">
                    <div className="space-y-1.5">
                        {FEATURE_STATUS.map(({ name, type, status }) => {
                            const badge = STATUS_BADGE[status];
                            return (
                                <div key={name} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wide flex-shrink-0 w-10">
                                            {type === "Feature" ? "Feat" : "Block"}
                                        </span>
                                        <span className="text-[12px] text-gray-700 truncate">{name}</span>
                                    </div>
                                    <span
                                        className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.cls}`}
                                    >
                                        {badge.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </InfoCard>

            </div>
        </div>
    );
};

export default Settings;
