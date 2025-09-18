import { useState, useEffect, useRef } from 'react';
import { fetchData  } from '@/NAYSA Cloud/Configuration/BaseURL';
import { useHandlePrintARReport,useHandleDownloadExcelARReport } from '@/NAYSA Cloud/Global/report';
import { useTopHSRptRow,useTopUserRow } from '@/NAYSA Cloud/Global/top1RefTable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";
import {useGetCurrentDay,useFormatToDate} from '@/NAYSA Cloud/Global/dates';
import BranchLookupModal from '@/NAYSA Cloud/Lookup/SearchBranchRef';
import CustomerMastLookupModal from '@/NAYSA Cloud/Lookup/SearchCustMast';
import Swal from 'sweetalert2';





const ARReportModal = ({ isOpen, onClose ,userCode }) => {
  const today = useGetCurrentDay();
  const todayDate = new Date(today);
  const firstDayOfMonth = useFormatToDate(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));


  const [reportList, setReportList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [endDate, setEndDate] = useState(today);
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [selectedReport, setSelectedReport] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(0);

  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");

  const [sCustCode, setSCustCode] = useState("");
  const [eCustCode, setECustCode] = useState("");
  const [sCustName, setSCustName] = useState("");
  const [eCustName, setECustName] = useState("");
  const [sCustMode, setCustMode] = useState("S");

  const [modalReady, setModalReady] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const alertFired = useRef(false);



  const handleCloseBranchModal = (selected) => {
    setBranchCode(selected.branchCode);
    setBranchName(selected.branchName);
    setBranchModalOpen(false);
  } 


  
 const handleCloseCustomerModal = (selected) => {
  const { custCode, custName } = selected;

  if (sCustMode === "S") {
    setSCustCode(custCode);
    setSCustName(custName);
  }

  setECustCode(custCode);
  setECustName(custName);
  setCustomerModalOpen(false);
};




const handleReset = () => {
  setSCustCode(""); setSCustName("");
  setECustCode(""); setECustName("");
};





  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      if (!isOpen) return;
      setLoading(true);
      alertFired.current = false; 

      try {
        const params = {mdl:"AR",userCode:userCode}
        const response = await fetchData("hsrpt",params);
        const userResponse = await useTopUserRow(userCode);
            if (userResponse) {
              setBranchCode(userResponse.branchCode);
              setBranchName(userResponse.branchName)
            }

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
              branchCode: branchCode,
              startDate: startDate,
              endDate: endDate,
              sCustCode: sCustCode,
              eCustCode: eCustCode,
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
    setLoading(false); 
    }
  };






 if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-2xl shadow-lg w-[900px] relative">

        {/* Left: Report List */}
        <div className="w-1/3 border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="text-sm font-medium text-blue-600">Accounts Receivable Report</span>
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
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="text-sm font-medium text-blue-600">
              {selectedReport || "Report Options"}
            </span>
            <button onClick={onClose} className="text-blue-600 hover:text-blue-800 text-sm" aria-label="Close">✕</button>
          </div>

          <div className="p-4 space-y-4 text-sm">
            {/* Branch */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Branch</label>
              <div className="relative w-full">
                <input
                  type="text"
                  value={branchName}
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
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-md px-3 py-2 w-full"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
                  value={sCustName}
                  placeholder="Enter customer code"
                  className="border rounded-md pl-3 pr-10 py-2 w-full"
                />
                <button className="absolute inset-y-0 right-0 my-auto mr-1 flex items-center justify-center w-8 h-8 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        onClick={() => {
                              setCustomerModalOpen(true);
                              setCustMode("S");
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
                  value={eCustName}
                  placeholder="Enter customer code"
                  className="border rounded-md pl-3 pr-10 py-2 w-full"
                />
                <button className="absolute inset-y-0 right-0 my-auto mr-1 flex items-center justify-center w-8 h-8 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        onClick={() => {
                              setCustomerModalOpen(true);
                              setCustMode("E");
                            }}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>
            </div>

            {/* Buttons */}
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
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>

          </div>
        </div>

        {branchModalOpen && (
          <BranchLookupModal
            isOpen={branchModalOpen}
            onClose={handleCloseBranchModal}
          />
        )}
      
        {customerModalOpen && (
          <CustomerMastLookupModal
            isOpen={customerModalOpen}
            onClose={handleCloseCustomerModal}
          />
        )}


      </div>
    </div>
  );
};


export default ARReportModal;