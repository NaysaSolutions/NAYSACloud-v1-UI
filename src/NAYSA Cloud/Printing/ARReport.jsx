import { useState, useEffect, useRef } from 'react';
import { fetchData  } from '@/NAYSA Cloud/Configuration/BaseURL';
import { useHandlePrintARReport,useHandleDownloadExcelARReport } from '@/NAYSA Cloud/Global/report';
import { useTopHSRptRow } from '@/NAYSA Cloud/Global/top1RefTable';
import Swal from 'sweetalert2';



const ARReportModal = ({ isOpen, onClose ,userCode }) => {
  const [reportList, setReportList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [endDate, setEndDate] = useState("2025-09-02")
  const [startDate, setStartDate] = useState("2025-09-02")
  const [selectedReport, setSelectedReport] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(0);
  const [modalReady, setModalReady] = useState(false);
  const alertFired = useRef(false);


  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      if (!isOpen) return;
      setLoading(true);
      alertFired.current = false; // reset alert flag when modal opens

      try {

        const params = {mdl:"AR",userCode:userCode}
        const response = await fetchData("hsrpt",params);


        const custData = response?.data?.[0]?.result
          ? JSON.parse(response.data[0].result)
          : [];

        if (custData.length === 0 && !alertFired.current) {
          Swal.fire({
            icon: "info",
            title: "No Records Found",
            text: "Management report not Defined.",
          });
          alertFired.current = true; 
          onClose();
        }

    
        if (isMounted) {
          setReportList(custData);
          console.log(reportList)
          setModalReady(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
    

    return () => {
      isMounted = false;
      setModalReady(false);
    };
  }, [isOpen]);





  const handlePreview = async () => {
    try {
      setLoading(true)

      const params ={
              reportId:selectedReportId,
              branchCode: "",
              startDate: startDate,
              endDate: endDate,
              sCustCode: "",
              eCustCode: "",
              userCode:userCode
      }

      const responseDocRpt = await useTopHSRptRow(params.reportId);

      if (!responseDocRpt?.crptName && responseDocRpt.export !== "Y") {
        Swal.fire({
          icon: "info",
          title: "No Records Found",
          text: "Report File not Defined.",
        });
        return;
      }
            
      const response = responseDocRpt.export === "Y"
        ? await useHandleDownloadExcelARReport(params)
        : await useHandlePrintARReport(params);

   
      if (responseDocRpt.crptName =="" && responseDocRpt.export !== "Y") {
        console.error("⚠️ Failed to generate report:", response);
      }
    } catch (error) {
      console.error("❌ Error generating report:", error);
    
    } finally {
    setLoading(false); // hide loading state after complete
    }
  };






  if (!isOpen) return null; // Hide modal if not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-2xl shadow-lg w-[900px] relative">
        
        {/* Close button (top-right) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        {/* Left: Report List */}
        <div className="w-1/3 border rounded-lg shadow-sm">
          <div className="px-4 py-2 border-b font-semibold text-blue-600">
            Accounts Receivable Report
          </div>
          <div className="h-[400px] overflow-y-auto">
              {reportList.map((report, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 text-sm cursor-pointer ${
                    selectedReport === report.reportName
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                        setSelectedReport(report.reportName);
                        setSelectedReportId(report.reportId); 
                      }}
                >
                  {report.reportName}
                </div>
              ))}
              </div>
        </div>

        {/* Right: Report Options */}
        <div className="w-2/3 border rounded-lg shadow-sm">
          <div className="px-4 py-2 border-b font-semibold text-lg">
            {selectedReport}
          </div>
          <div className="p-4 space-y-4 text-sm">
            {/* Branch */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Branch</label>
              <select className="border rounded px-2 py-1 w-full">
                <option>HEAD OFFICE</option>
                <option>BRANCH 1</option>
                <option>BRANCH 2</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>

            {/* Starting Customer */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Starting Customer</label>
              <input
                type="text"
                placeholder="Enter customer code"
                className="border rounded px-2 py-1 w-full"
              />
            </div>

            {/* Ending Customer */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Ending Customer</label>
              <input
                type="text"
                placeholder="Enter customer code"
                className="border rounded px-2 py-1 w-full"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200">
                Reset
              </button>
              <button 
                  onClick={handlePreview}
                  disabled={loading}
                  className={`px-4 py-2 rounded text-white ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Generating..." : "Generate"}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARReportModal;
