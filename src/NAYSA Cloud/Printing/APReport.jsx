import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { fetchData } from "@/NAYSA Cloud/Configuration/BaseURL";
import { useHandlePrintARReport, useHandleDownloadExcelARReport } from "@/NAYSA Cloud/Global/report";
import { useTopHSRptRow, useTopUserRow } from "@/NAYSA Cloud/Global/top1RefTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark, faCircleNotch, faRotateLeft, faBroom, faDownload, faPrint, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { useGetCurrentDay, useFormatToDate } from "@/NAYSA Cloud/Global/dates";
import BranchLookupModal from "@/NAYSA Cloud/Lookup/SearchBranchRef";
import PayeeMastLookupModal from "@/NAYSA Cloud/Lookup/SearchVendMast";
import Swal from "sweetalert2";

/** -----------------------------------------------------------
 * APReportModal — Enhanced, responsive, accessible
 * ----------------------------------------------------------*/
const APReportModal = ({ isOpen, onClose, userCode, closeOnBackdrop = true }) => {
  const today = useGetCurrentDay();
  const firstDayOfMonth = useMemo(() => {
    const d = new Date(today);
    return useFormatToDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [today, useFormatToDate]);

  const [loading, setLoading] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [payeeModalOpen, setPayeeModalOpen] = useState(false);
  const [sPayeeMode, setPayeeMode] = useState("S");

  const [reportList, setReportList] = useState([]);
  const [reportQuery, setReportQuery] = useState("");
  const [selected, setSelected] = useState({ id: 0, name: "" });

  const [filters, setFilters] = useState({
    branchCode: "",
    branchName: "",
    startDate: firstDayOfMonth,
    endDate: today,
    sPayeeCode: "",
    sPayeeName: "",
    ePayeeCode: "",
    ePayeeName: "",
  });

  const updateState = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const alertFired = useRef(false);

  // Focus trap
  const dialogRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const backdropRef = useRef(null);

  // Lock scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [isOpen]);

  // Fetch report list + user’s default branch
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    alertFired.current = false;
    setLoading(true);

    (async () => {
      try {
        const params = { mdl: "AP", userCode };
        const [rptRes, userRes] = await Promise.all([
          fetchData("hsrpt", params),
          useTopUserRow(userCode),
        ]);

        if (!cancelled && userRes) {
          updateState({
            branchCode: userRes.branchCode,
            branchName: userRes.branchName,
          });
        }

        const list = rptRes?.data?.[0]?.result ? JSON.parse(rptRes.data[0].result) : [];
        if (!cancelled) {
          if (list.length === 0 && !alertFired.current) {
            Swal.fire({ icon: "info", title: "No Records Found", text: "Management report not defined." });
            alertFired.current = true;
            onClose?.();
            return;
          }
          setReportList(list);
          if (list.length > 0) setSelected({ id: list[0].reportId, name: list[0].reportName });
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Error fetching data:", e);
          Swal.fire({ icon: "error", title: "Load failed", text: e?.message ?? "Unable to load reports." });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, userCode, onClose]);

  // Keyboard handlers (ESC to close, focus trap with Tab)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
      if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Backdrop click to close
  const handleBackdropClick = (e) => {
    if (!closeOnBackdrop) return;
    if (e.target === backdropRef.current) onClose?.();
  };

  // Helpers
  const normalizeDates = useCallback((start, end) => {
    // If accidentally swapped, auto-correct (and warn lightly)
    if (start && end && new Date(start) > new Date(end)) {
      Swal.fire({
        icon: "info",
        title: "Adjusted Dates",
        text: "Start Date is later than End Date. Dates have been swapped.",
        timer: 1800,
        showConfirmButton: false,
      });
      return { startDate: end, endDate: start };
    }
    return { startDate: start, endDate: end };
  }, []);

  // Filtered list
  const filteredReports = useMemo(() => {
    const q = reportQuery.trim().toLowerCase();
    if (!q) return reportList;
    return reportList.filter((r) => (r.reportName || "").toLowerCase().includes(q));
  }, [reportList, reportQuery]);

  // Field handlers
  const handleCloseBranchModal = ({ branchCode, branchName }) => {
    updateState({ branchCode, branchName });
    setBranchModalOpen(false);
  };

const handleClosePayeeModal = (payload) => {
  // Closed without picking
  if (!payload) {
    setPayeeModalOpen(false);
    return;
  }

  // Normalize keys from the modal
  const payeeCode = payload.payeeCode ?? payload.vendCode ?? "";
  const payeeName = payload.payeeName ?? payload.vendName ?? "";

  if (sPayeeMode === "S") {
    updateState({
      sPayeeCode: payeeCode,
      sPayeeName: payeeName,
      ePayeeCode: payeeCode,
      ePayeeName: payeeName,
    });
  } else {
    updateState({ ePayeeCode: payeeCode, ePayeeName: payeeName });
  }

  setPayeeModalOpen(false);
};


  const clearSPayee = () => updateState({ sPayeeCode: "", sPayeeName: "" });
  const clearEPayee = () => updateState({ ePayeeCode: "", ePayeeName: "" });

  const handleReset = () => {
    // Keep dates/branch, clear payees only
    updateState({
      sPayeeCode: "",
      sPayeeName: "",
      ePayeeCode: "",
      ePayeeName: "",
    });
  };

  const handlePreview = async () => {
    try {
      if (!selected.id) {
        Swal.fire({ icon: "info", title: "Select a report", text: "Please choose a report first." });
        return;
      }

      const { startDate, endDate } = normalizeDates(filters.startDate, filters.endDate);
      updateState({ startDate, endDate });

      setLoading(true);

      const params = {
        reportId: selected.id,
        branchCode: filters.branchCode,
        startDate,
        endDate,
        sPayeeCode: filters.sPayeeCode,
        ePayeeCode: filters.ePayeeCode,
        userCode,
      };

      const meta = await useTopHSRptRow(params.reportId);

      if (!meta?.crptName && meta?.export !== "Y") {
        Swal.fire({ icon: "info", title: "No Records Found", text: "Report file not defined." });
        return;
      }

      const response =
        meta.export === "Y"
          ? await useHandleDownloadExcelARReport(params)
          : await useHandlePrintARReport(params);

      if (!meta.crptName && meta.export !== "Y") {
        console.error("⚠️ Failed to generate report:", response);
      }
    } catch (err) {
      console.error("❌ Error generating report:", err);
      Swal.fire({ icon: "error", title: "Generate failed", text: err?.message ?? "Unexpected error." });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-3 md:px-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby="ap-report-title"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-[1000px] md:rounded-2xl bg-white shadow-2xl md:my-8
                   h-[100svh] md:h-auto md:max-h-[75vh] flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()} // prevent backdrop close when clicking inside
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 md:px-6 py-3 border-b bg-gradient-to-r from-white to-blue-100">
          <h2 id="ap-report-title" className="text-sm md:text-base font-semibold text-blue-700">
            Accounts Payable Reports
          </h2>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Close"
            ref={firstFocusableRef}
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-2 p-2 md:p-4 overflow-hidden">
          {/* Left: Report list */}
          <div className="md:col-span-1 border rounded-xl overflow-hidden flex flex-col">
            <div className="p-1 border-b bg-white/60 sticky top-0 z-10">
              <div className="relative">
                <input
                  type="text"
                  value={reportQuery}
                  onChange={(e) => setReportQuery(e.target.value)}
                  placeholder="Search report…"
                  className="w-full border rounded-lg pl-9 pr-3 py-2 text-xs md:text-xs focus:ring-2 focus:ring-blue-300 outline-none"
                  aria-label="Search report"
                />
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div
              role="listbox"
              aria-label="Report list"
              className="flex-1 overflow-y-auto"
            >
              {loading && reportList.length === 0 ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-8 rounded-md bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="p-4 text-xs text-gray-500">No reports match your search.</div>
              ) : (
                filteredReports.map((r, idx) => {
                  const active = selected.name === r.reportName;
                  return (
                    <button
                      key={`${r.reportId}-${idx}`}
                      role="option"
                      aria-selected={active}
                      onClick={() => setSelected({ id: r.reportId, name: r.reportName })}
                      className={`w-full text-left px-3 py-2 text-xs md:text-[12px] border-b last:border-b-0
                        ${active ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{r.reportName}</span>
                        {/* tiny affordance based on export flag if present */}
                        {r.export === "Y" ? (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] md:text-[11px] text-emerald-600">
                            <FontAwesomeIcon icon={faDownload} /> Excel
                          </span>
                        ) : (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] md:text-[11px] text-blue-600">
                            {/* <FontAwesomeIcon icon={faPrint} /> Print */}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Options */}
          <div className="md:col-span-2 border rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-2 md:px-4 py-2 border-b bg-white/60">
              <span className="text-xs md:text-[16px] font-semibold text-blue-700 truncate">
                {selected.name || "Report Options"}
              </span>
            </div>

            <div className="p-3 md:p-5 space-y-2 md:space-y-3 overflow-y-auto">
              {/* Branch */}
              <div className="grid grid-cols-1 md:grid-cols-[7.5rem_1fr] items-center gap-2 md:gap-4">
                <label className="text-xs md:text-sm font-medium">Branch</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.branchName}
                    readOnly
                    placeholder="Select branch"
                    className="border rounded-lg pl-3 pr-10 py-2 w-full text-xs md:text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                  />
                  <button
                    className="absolute inset-y-0 right-1 my-auto w-8 h-8 inline-flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => setBranchModalOpen(true)}
                    aria-label="Find branch"
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>
              </div>

              {/* Start Date */}
              <div className="grid grid-cols-1 md:grid-cols-[7.5rem_1fr] items-center gap-2 md:gap-4">
                <label className="text-xs md:text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateState({ startDate: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full text-xs md:text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>

              {/* End Date */}
              <div className="grid grid-cols-1 md:grid-cols-[7.5rem_1fr] items-center gap-2 md:gap-4">
                <label className="text-xs md:text-sm font-medium">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateState({ endDate: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full text-xs md:text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>

              {/* Starting Payee */}
              <div className="grid grid-cols-1 md:grid-cols-[7.5rem_1fr] items-center gap-2 md:gap-4">
                <label className="text-xs md:text-sm font-medium">Starting Payee</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={filters.sPayeeName}
                    placeholder="Select payee"
                    className="border rounded-lg pl-3 pr-20 py-2 w-full text-xs md:text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                  />
                  {filters.sPayeeName && (
                    <button
                      type="button"
                      onClick={clearSPayee}
                      className="absolute right-9 inset-y-0 my-auto w-8 h-8 inline-flex items-center justify-center text-gray-500 hover:text-red-600 rounded-md"
                      aria-label="Clear starting payee"
                      title="Clear"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  )}
                  <button
                    className="absolute inset-y-0 right-1 my-auto w-8 h-8 inline-flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => { setPayeeMode("S"); setPayeeModalOpen(true); }}
                    aria-label="Find starting payee"
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>
              </div>

              {/* Ending Payee */}
              <div className="grid grid-cols-1 md:grid-cols-[7.5rem_1fr] items-center gap-2 md:gap-4">
                <label className="text-xs md:text-sm font-medium">Ending Payee</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={filters.ePayeeName}
                    placeholder="Select payee"
                    className="border rounded-lg pl-3 pr-20 py-2 w-full text-xs md:text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                  />
                  {filters.ePayeeName && (
                    <button
                      type="button"
                      onClick={clearEPayee}
                      className="absolute right-9 inset-y-0 my-auto w-8 h-8 inline-flex items-center justify-center text-gray-500 hover:text-red-600 rounded-md"
                      aria-label="Clear ending payee"
                      title="Clear"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  )}
                  <button
                    className="absolute inset-y-0 right-1 my-auto w-8 h-8 inline-flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => { setPayeeMode("E"); setPayeeModalOpen(true); }}
                    aria-label="Find ending payee"
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 md:pt-4">
                <div className="grid grid-cols-3 md:flex md:justify-center gap-2 md:gap-3">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 w-full md:w-40 py-2 border rounded-lg text-white bg-blue-600 hover:bg-gray-700 text-xs md:text-sm"
                  >
                    {/* <FontAwesomeIcon icon={faRotateLeft} /> */}
                    Reset
                  </button>
                  {/* <button
                    onClick={() => {
                      // quick convenience: reset dates to current month
                      const d = new Date(today);
                      const start = useFormatToDate(new Date(d.getFullYear(), d.getMonth(), 1));
                      updateState({ startDate: start, endDate: today });
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full md:w-40 py-2 border rounded-lg bg-white hover:bg-gray-50 text-xs md:text-sm"
                    title="Set to current month"
                  >
                    <FontAwesomeIcon icon={faRotateLeft} />
                    This Month
                  </button> */}
                  <button
                    onClick={handlePreview}
                    disabled={loading || !selected.id}
                    className={`inline-flex items-center justify-center gap-2 w-full md:w-40 py-2 rounded-lg text-white text-xs md:text-sm
                      ${loading || !selected.id ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    ref={lastFocusableRef}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faCircleNotch} spin />
                        Generating…
                      </>
                    ) : (
                      <>
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] grid place-items-center pointer-events-none">
            <div className="inline-flex items-center gap-3 text-blue-700 text-sm font-medium">
              <FontAwesomeIcon icon={faCircleNotch} spin />
              Processing…
            </div>
          </div>
        )}

        {/* Child modals */}
        {branchModalOpen && (
          <BranchLookupModal isOpen={branchModalOpen} onClose={handleCloseBranchModal} />
        )}
        {payeeModalOpen && (
          <PayeeMastLookupModal isOpen={payeeModalOpen} onClose={handleClosePayeeModal} />
        )}
      </div>
    </div>
  );
};

export default APReportModal;
