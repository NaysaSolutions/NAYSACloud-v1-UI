import { useState, useEffect, useMemo, useRef } from "react";
import { fetchData } from "@/NAYSA Cloud/Configuration/BaseURL";
import { useHandlePrintARReport, useHandleDownloadExcelARReport } from "@/NAYSA Cloud/Global/report";
import { useTopHSRptRow, useTopUserRow } from "@/NAYSA Cloud/Global/top1RefTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useGetCurrentDay, useFormatToDate } from "@/NAYSA Cloud/Global/dates";
import BranchLookupModal from "@/NAYSA Cloud/Lookup/SearchBranchRef";
import CustomerMastLookupModal from "@/NAYSA Cloud/Lookup/SearchCustMast";
import Swal from "sweetalert2";


const ARReportModal = ({ isOpen, onClose, userCode }) => {

  const today = useGetCurrentDay();
  const firstDayOfMonth = useMemo(() => {
    const d = new Date(today);
    return useFormatToDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [today, useFormatToDate]);


  const [loading, setLoading] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [sCustMode, setCustMode] = useState("S"); 

  const [reportList, setReportList] = useState([]);
  const [selected, setSelected] = useState({ id: 0, name: "" });

  const [filters, setFilters] = useState({
    branchCode: "",
    branchName: "",
    startDate: firstDayOfMonth,
    endDate: today,
    sCustCode: "",
    sCustName: "",
    eCustCode: "",
    eCustName: "",
  });


  const updateState = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const alertFired = useRef(false);


  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    alertFired.current = false;
    setLoading(true);

    (async () => {
      try {
        const params = { mdl: "AR", userCode };
        const [rptRes, userRes] = await Promise.all([
          fetchData("hsrpt", params),
          useTopUserRow(userCode),
        ]);

        if (!cancelled && userRes) {
          updateState({ branchCode: userRes.branchCode, branchName: userRes.branchName });
        }

        const list = rptRes?.data?.[0]?.result ? JSON.parse(rptRes.data[0].result) : [];
        if (!cancelled) {
          if (list.length === 0 && !alertFired.current) {
            Swal.fire({ icon: "info", title: "No Records Found", text: "Management report not Defined." });
            alertFired.current = true;
            onClose();
            return;
          }
          setReportList(list);
          if (list.length > 0) setSelected({ id: list[0].reportId, name: list[0].reportName });
        }
      } catch (e) {
        if (!cancelled) console.error("Error fetching data:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, userCode]); 



  // Handlers
  const handleCloseBranchModal = ({ branchCode, branchName }) => {
    updateState({ branchCode, branchName });
    setBranchModalOpen(false);
  };

  const handleCloseCustomerModal = ({ custCode, custName }) => {
    if (sCustMode === "S") {
      updateState({ sCustCode: custCode, sCustName: custName, eCustCode: custCode, eCustName: custName });
    } else {
      updateState({ eCustCode: custCode, eCustName: custName });
    }
    setCustomerModalOpen(false);
  };


  const handleReset = () => {
    updateState({ sCustCode: "", sCustName: "", eCustCode: "", eCustName: "" });
  };


  
  const handlePreview = async () => {
    try {
      setLoading(true);

      const params = {
        reportId: selected.id,
        branchCode: filters.branchCode,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sCustCode: filters.sCustCode,
        eCustCode: filters.eCustCode,
        userCode,
      };

      const meta = await useTopHSRptRow(params.reportId);

      if (!meta?.crptName && meta?.export !== "Y") {
        Swal.fire({ icon: "info", title: "No Records Found", text: "Report File not Defined." });
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
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-2xl shadow-lg w-[900px] relative">
        {/* Left: Report List */}
        <div className="w-1/3 border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="text-sm font-medium text-blue-600">Accounts Receivable Report</span>
          </div>

          <div className="h-[400px] overflow-y-auto">
            {reportList.map((r, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  selected.name === r.reportName ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100"
                }`}
                onClick={() => setSelected({ id: r.reportId, name: r.reportName })}
              >
                {r.reportName}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Report Options */}
        <div className="w-2/3 border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="text-sm font-medium text-blue-600">{selected.name || "Report Options"}</span>
            <button onClick={onClose} className="text-blue-600 hover:text-blue-800 text-sm" aria-label="Close">
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4 text-sm">
            {/* Branch */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Branch</label>
              <div className="relative w-full">
                <input
                  type="text"
                  value={filters.branchName}
                  readOnly
                  placeholder="Select branch"
                  className="border rounded-md pl-3 pr-10 py-2 w-full"
                />
                <button
                  className="absolute inset-y-0 right-0 my-auto mr-1 flex items-center justify-center w-8 h-8 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  onClick={() => setBranchModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateState({ startDate: e.target.value })}
                className="border rounded-md px-3 py-2 w-full"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateState({ endDate: e.target.value })}
                className="border rounded-md px-3 py-2 w-full"
              />
            </div>

            {/* Starting Customer */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Starting Customer</label>
              <div className="relative w-full">
                <input
                  type="text"
                  readOnly
                  value={filters.sCustName}
                  placeholder="Select customer"
                  className="border rounded-md pl-3 pr-10 py-2 w-full"
                />
                <button
                  className="absolute inset-y-0 right-0 my-auto mr-1 flex items-center justify-center w-8 h-8 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  onClick={() => {
                    setCustMode("S");
                    setCustomerModalOpen(true);
                  }}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>
            </div>

            {/* Ending Customer */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Ending Customer</label>
              <div className="relative w-full">
                <input
                  type="text"
                  readOnly
                  value={filters.eCustName}
                  placeholder="Select customer"
                  className="border rounded-md pl-3 pr-10 py-2 w-full"
                />
                <button
                  className="absolute inset-y-0 right-0 my-auto mr-1 flex items-center justify-center w-8 h-8 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  onClick={() => {
                    setCustMode("E");
                    setCustomerModalOpen(true);
                  }}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>
            </div>

            {/* Buttons (equal width) */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleReset}
                className="w-32 py-2 border rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Reset
              </button>
              <button
                onClick={handlePreview}
                disabled={loading}
                className={`w-32 py-2 rounded-md text-white ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>

        {branchModalOpen && (
          <BranchLookupModal isOpen={branchModalOpen} onClose={handleCloseBranchModal} />
        )}

        {customerModalOpen && (
          <CustomerMastLookupModal isOpen={customerModalOpen} onClose={handleCloseCustomerModal} />
        )}
      </div>
    </div>
  );
};

export default ARReportModal;
