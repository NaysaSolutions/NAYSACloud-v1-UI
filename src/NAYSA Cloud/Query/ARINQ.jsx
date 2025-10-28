import { useMemo, useState, useEffect, useCallback,useLayoutEffect  } from "react";
import ARINQActionBar from "./ARINQActionBar";
import ARInquiryTab from "./ARInquiryTab";
import ARAdvancesTab from "./ARAdvancesTab";
import ARAgingSummaryTab from "./ARAgingSummaryTab";

const TABS = [
  { key: "inquiry",  label: "AR Inquiry",       component: ARInquiryTab },
  { key: "advances", label: "AR Advances",      component: ARAdvancesTab },
  { key: "aging",    label: "AR Aging Summary", component: ARAgingSummaryTab },
];

export default function ARINQ() {
  const documentTitle = "AR Query";

  const [activeTab, setActiveTab] = useState("inquiry");
  const ActiveComp = useMemo(
    () => TABS.find((t) => t.key === activeTab)?.component ?? null,
    [activeTab]
  );

  // Actions registered by the active tab
  const [actions, setActions] = useState({});


  // ✅ Clear caches BEFORE children mount effects run
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // Clear the two others (if you want a fresh start)
    delete window.__NAYSA_ARADV_CACHE__;     // ARAdvancesTab
    delete window.__NAYSA_ARAGE_CACHE__;        // ARAgingSummaryTab

    // 🔴 ARInquiryTab stores under a nested key inside __NAYSA_ARINQ_CACHE__
    //    baseKey = "AR_INQUIRY"
    if (window.__NAYSA_ARINQ_CACHE__) {
      delete window.__NAYSA_ARINQ_CACHE__.AR_INQUIRY;
    }
    // Optionally also reset the container object so getGlobalCache() creates a fresh one
    window.__NAYSA_ARINQ_CACHE__ = {};
  }, []); // runs once when ARINQ mounts




  // ✅ Memoize so the child doesn't see a new function each render
  const registerActions = useCallback((tabActions) => {
    setActions(tabActions || {});
  }, []);

  // Ensure safe defaults whenever the active tab changes
  useEffect(() => {
    setActions((prev) => ({
      onFind:           prev.onFind           ?? (() => {}),
      onReset:          prev.onReset          ?? (() => {}),
      onPrint:          prev.onPrint          ?? (() => window.print()),
      onViewDoc:        prev.onViewDoc        ?? (() => window.open("/public/NAYSA AR Inquiry.pdf", "_blank")),
      onOpenBal:        prev.onOpenBal        ?? (() => {}),
      onExport:         prev.onExport         ?? (() => {}),
      onExportSummary:  prev.onExportSummary  ?? (() => {}),
      onExportDetailed: prev.onExportDetailed ?? (() => {}),
    }));
  }, [activeTab]);

  // Route ActionBar button IDs → registered handlers
  const handleAction = (id) => {
    switch (id) {
      case "find":
      case "reprocess":
        return actions.onFind?.();
      case "reset":
        return actions.onReset?.();
      case "print":
        return actions.onPrint?.();
      case "viewDoc":
        return actions.onViewDoc?.();
      case "export":
      case "exportSummary":
        return actions.onExportSummary?.();
      case "exportDetailed":
        return actions.onExportDetailed?.();
      default:
        return;
    }
  };

  return (
    <div className="global-tran-main-div-ui">
      {/* Title */}
      <div className="flex items-center gap-3 px-6 pt-4">
        <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
      </div>

      {/* Sticky ACTION BAR */}
      <ARINQActionBar
        activeTab={activeTab}
        onAction={handleAction}
        help={{ pdfLink: "/public/NAYSA AR Inquiry.pdf" }}
      />

      {/* Tabs */}
      <div className="flex flex-row gap-2 border-b bg-white px-4 py-2 mt-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center px-3 py-2 rounded-t-md text-xs md:text-sm font-bold
              ${activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {ActiveComp && <ActiveComp registerActions={registerActions} />}
      </div>
    </div>
  );
}
