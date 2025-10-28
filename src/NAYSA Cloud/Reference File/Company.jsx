import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/NAYSA Cloud/Configuration/BaseURL.jsx";
import { useAuth } from "@/NAYSA Cloud/Authentication/AuthContext.jsx";
import BranchLookupModal from "@/NAYSA Cloud/Lookup/SearchBranchRef";

// FontAwesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit, faTrashAlt, faPlus, faPrint, faChevronDown,
    faFileCsv, faFileExcel, faFilePdf, faSave, faUndo,
    faMagnifyingGlass, faSpinner, faInfoCircle, faVideo
} from "@fortawesome/free-solid-svg-icons";

// Global components and utilities
import { useReset } from "@/NAYSA Cloud/Components/ResetContext";
import {
    reftables,
    reftablesPDFGuide,
    reftablesVideoGuide,
} from "@/NAYSA Cloud/Global/reftable";

// Alert utilities
import {
    useSwalErrorAlert,
    useSwalSuccessAlert,
    useSwalWarningAlert,
    useSwalDeleteConfirm,
    useSwalDeleteSuccess,
    useSwalshowSaveSuccessDialog
} from "@/NAYSA Cloud/Global/behavior";

const Company = () => {
    const docType = "Company";
    const { user } = useAuth();
    const documentTitle = reftables[docType];
    const pdfLink = reftablesPDFGuide[docType];
    const videoLink = reftablesVideoGuide[docType];

    // Form state
    const [compCode, setCompCode] = useState("");
    const [compName, setCompName] = useState("");
    const [compAddr1, setCompAddr1] = useState("");
    const [compAddr2, setCompAddr2] = useState("");
    const [compAddr3, setCompAddr3] = useState("");
    const [compTin, setCompTin] = useState("");
    const [compEmail, setCompEmail] = useState("");
    const [telNo, setTelNo] = useState("");
    const [faxNo, setFaxNo] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [cutoffCode, setCutoffCode] = useState("");
    const [branchCode, setBranchCode] = useState("");
    const [branchName, setBranchName] = useState("");
    const [classification, setClassification] = useState("");
    const [rdoCode, setRdoCode] = useState("");
    const [currency, setCurrency] = useState("");
    const [disbursementBank, setDisbursementBank] = useState("");
    const [depositBank, setDepositBank] = useState("");
    const [staleCheckDueDays, setStaleCheckDueDays] = useState("");

    // For Email Notification Modal
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [emailNotifier, setEmailNotifier] = useState("");
    const [smtpHost, setSmtpHost] = useState("");
    const [smtpPort, setSmtpPort] = useState("");
    const [smtpPassword, setSmtpPassword] = useState("");
    const [smtpSSL, setSmtpSSL] = useState(false);

    // Branch modal state
    const [branchModalOpen, setBranchModalOpen] = useState(false);

    // UX state
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isOpenExport, setOpenExport] = useState(false);
    const [isOpenGuide, setOpenGuide] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [companyData, setCompanyData] = useState(null);

    // Add new state for additional modal fields
    const [profileName, setProfileName] = useState("");
    const [notificationReceiver, setNotificationReceiver] = useState("");
    const [hostAddress, setHostAddress] = useState("");
    const [hostShared, setHostShared] = useState("");
    const [localDestination, setLocalDestination] = useState("");

    // Refs for click-away
    const exportRef = useRef(null);
    const guideRef = useRef(null);

    // Handle Branch Lookup Modal
    const handleOpenBranchModal = () => {
        if (isEditing) {
            setBranchModalOpen(true);
        }
    };

    const handleCloseBranchModal = (selectedBranch = null) => {
        setBranchModalOpen(false);
        if (selectedBranch) {
            console.log("Selected branch:", selectedBranch);
            setBranchCode(selectedBranch.branchCode || "");
            setBranchName(selectedBranch.branchName || "");
        }
    };

    // Loading spinner component
    const LoadingSpinner = () => (
        <div className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-xl">
                {saving ? "Saving…" : "Loading…"}
            </div>
        </div>
    );

    // Fetch company data
    const fetchCompanyData = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get("/company", {
                params: {
                    mode: "get"
                }
            });

            console.log("API Response:", data);

            let companyInfo = null;

            if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
                if (data.data[0]?.result) {
                    try {
                        const parsedResult = JSON.parse(data.data[0].result);
                        if (Array.isArray(parsedResult) && parsedResult.length > 0) {
                            companyInfo = parsedResult[0];
                        }
                    } catch (parseError) {
                        console.error("Error parsing JSON result:", parseError);
                    }
                }
            } else if (data?.result) {
                try {
                    const parsedResult = JSON.parse(data.result);
                    if (Array.isArray(parsedResult) && parsedResult.length > 0) {
                        companyInfo = parsedResult[0];
                    }
                } catch (parseError) {
                    console.error("Error parsing JSON result:", parseError);
                }
            }

            if (companyInfo) {
                setCompanyData(companyInfo);
                populateForm(companyInfo);
            } else {
                // No company data found, start with empty form
                setCompanyData(null);
                setIsEditing(true);
            }

        } catch (error) {
            console.error("Error fetching company data:", error);
            await useSwalErrorAlert("Error", `Failed to load company data: ${error?.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Populate form with company data
    const populateForm = (data) => {
        setCompCode(data.compCode || "");
        setCompName(data.compName || "");
        setCompAddr1(data.compAddr1 || "");
        setCompAddr2(data.compAddr2 || "");
        setCompAddr3(data.compAddr3 || "");
        setCompTin(data.compTin || "");
        setCompEmail(data.compEmail || "");
        setTelNo(data.telNo || "");
        setFaxNo(data.faxNo || "");
        setZipCode(data.zipCode || "");
        setCutoffCode(data.cutoffCode || "");
        setBranchCode(data.branchCode || "");
        setBranchName(data.branchName || "");
        setClassification(data.classification || "");
        setRdoCode(data.rdoCode || "");
        setCurrency(data.currency || "");
        setDisbursementBank(data.disbursementBank || "");
        setDepositBank(data.depositBank || "");
        setStaleCheckDueDays(data.staleCheckDueDays || "");
        // ...add all new fields...
        setEmailNotifier(data.emailNotifier || "");
        setSmtpHost(data.smtpHost || "");
        setSmtpPort(data.smtpPort || "");
        setSmtpPassword(data.smtpPassword || "");
        setSmtpSSL(data.smtpSSL || false);
    };

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedOutsideExport =
                exportRef.current && !exportRef.current.contains(event.target);
            const clickedOutsideGuide =
                guideRef.current && !guideRef.current.contains(event.target);
            if (clickedOutsideExport) setOpenExport(false);
            if (clickedOutsideGuide) setOpenGuide(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Global Ctrl+S
    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === "s") {
                e.preventDefault();
                if (!saving && isEditing) {
                    console.log("Ctrl+S triggered - calling handleSaveCompany");
                    handleSaveCompany();
                } else {
                    console.log("Ctrl+S blocked:", { saving, isEditing });
                }
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    // Loading spinner timer
    useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => setShowSpinner(true), 200);
        } else {
            setShowSpinner(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    // Load company data when component mounts
    useEffect(() => {
        fetchCompanyData();
    }, []);

    const resetForm = () => {
        setCompCode("");
        setCompName("");
        setCompAddr1("");
        setCompAddr2("");
        setCompAddr3("");
        setCompTin("");
        setCompEmail("");
        setTelNo("");
        setFaxNo("");
        setZipCode("");
        setCutoffCode("");
        setBranchCode("");
        setBranchName("");
        setIsEditing(false);

        // If we have existing company data, repopulate the form
        if (companyData) {
            populateForm(companyData);
        }

        console.log("Form has been reset");
    };

    const handleSaveCompany = async () => {
        setSaving(true);
        if (!compCode || !compName) {
            await useSwalErrorAlert("Error!", "Please fill out Company Code and Company Name.");
            setSaving(false);
            return;
        }
        try {
            const payload = {
                json_data: JSON.stringify([
                    {
                        compCode: compCode.trim(),
                        compName: compName.trim(),
                        compAddr1: compAddr1.trim(),
                        compAddr2: compAddr2.trim(),
                        compAddr3: compAddr3.trim(),
                        compTin: compTin.trim(),
                        compEmail: compEmail.trim(),
                        telNo: telNo.trim(),
                        faxNo: faxNo.trim(),
                        zipCode: zipCode.trim(),
                        cutoffCode: cutoffCode.trim(),
                        branchCode: branchCode.trim(),
                        classification,
                        rdoCode,
                        currency,
                        disbursementBank,
                        depositBank,
                        staleCheckDueDays,
                        // ...add all new fields...
                        emailNotifier,
                        smtpHost,
                        smtpPort,
                        smtpPassword,
                        smtpSSL,
                    }
                ])
            };

            console.log("Sending payload:", payload);

            const response = await apiClient.post("/upsert", payload);

            const res = response.data;

            if (res?.success === true || res?.status === "success") {
                await fetchCompanyData();

                await useSwalSuccessAlert(
                    "Success!",
                    "Company information saved successfully."
                );

                setIsEditing(false);
            } else {
                const errorMsg = res?.message || res?.details || "Failed to save company information.";
                await useSwalErrorAlert("Error!", errorMsg);
            }
        } catch (e) {
            console.error("Save error:", e);
            await useSwalErrorAlert("Error!", e?.response?.data?.message || e.message || "Error saving company information.");
        } finally {
            setSaving(false);
        }
    };

    // Start editing
    const startEdit = () => {
        setIsEditing(true);
    };

    const handleExport = (format) => {
        setOpenExport(false);
        // Export functionality can be implemented here
        console.log(`Exporting to ${format}`);
    };

    // Guides
    const handlePDFGuide = () => {
        if (pdfLink) window.open(pdfLink, "_blank");
        setOpenGuide(false);
    };

    const handleVideoGuide = () => {
        if (videoLink) window.open(videoLink, "_blank");
        setOpenGuide(false);
    };

    return (
        <div className="global-ref-main-div-ui mt-24">
            {(loading || saving) && <LoadingSpinner />}

            {/* Branch Lookup Modal */}
            {branchModalOpen && (
                <BranchLookupModal
                    isOpen={branchModalOpen}
                    onClose={handleCloseBranchModal}
                />
            )}

            <div className="fixed mt-4 top-14 left-6 right-6 z-30 global-ref-header-ui flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
                </div>

                <div className="flex gap-2 justify-center text-xs">
                    <button
                        onClick={startEdit}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                        disabled={isEditing}
                    >
                        <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>

                    <button
                        onClick={handleSaveCompany}
                        className={`bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 ${!isEditing || saving ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={!isEditing || saving}
                        title="Ctrl+S to Save"
                    >
                        <FontAwesomeIcon icon={faSave} /> Save
                    </button>

                    <button
                        onClick={resetForm}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                        disabled={saving}
                    >
                        <FontAwesomeIcon icon={faUndo} /> Reset
                    </button>

                    <div ref={exportRef} className="relative">
                        <button
                            onClick={() => setOpenExport((v) => !v)}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                        >
                            <FontAwesomeIcon icon={faPrint} /> Export <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                        </button>
                        {isOpenExport && (
                            <div className="absolute right-0 mt-1 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black/10 z-[60] dark:bg-gray-800">
                                <button
                                    onClick={() => { handleExport("csv"); setOpenExport(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
                                >
                                    <FontAwesomeIcon icon={faFileCsv} className="mr-2 text-green-600" /> CSV
                                </button>
                                <button
                                    onClick={() => { handleExport("excel"); setOpenExport(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
                                >
                                    <FontAwesomeIcon icon={faFileExcel} className="mr-2 text-green-600" /> Excel
                                </button>
                                <button
                                    onClick={() => { handleExport("pdf"); setOpenExport(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
                                >
                                    <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" /> PDF
                                </button>
                            </div>
                        )}
                    </div>

                    <div ref={guideRef} className="relative">
                        <button
                            onClick={() => setOpenGuide((v) => !v)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                        >
                            <FontAwesomeIcon icon={faInfoCircle} /> Info <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                        </button>
                        {isOpenGuide && (
                            <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black/10 z-[60] dark:bg-gray-800">
                                <button
                                    onClick={() => { handlePDFGuide(); setOpenGuide(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
                                >
                                    <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" /> User Guide
                                </button>
                                <button
                                    onClick={() => { handleVideoGuide(); setOpenGuide(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
                                >
                                    <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-600" /> Video Guide
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Layout */}
            <div className="global-tran-tab-div-ui">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1 - Basic Information */}
                    <div className="global-ref-textbox-group-div-ui">
                        {/* Company Code */}
                        <div className="relative">
                            <input
                                type="text"
                                id="compCode"
                                placeholder=" "
                                value={compCode}
                                onChange={(e) => setCompCode(e.target.value)}
                                disabled={!isEditing || (companyData && companyData.compCode)}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"} ${(companyData && companyData.compCode) ? 'bg-blue-100 cursor-not-allowed' : ''}`}
                            />
                            <label htmlFor="compCode" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                <span className="global-ref-asterisk-ui">*</span> Company Code
                            </label>
                        </div>

                        {/* Company Name */}
                        <div className="relative">
                            <input
                                type="text"
                                id="compName"
                                placeholder=" "
                                value={compName}
                                onChange={(e) => setCompName(e.target.value)}
                                disabled={!isEditing || (companyData && companyData.compCode)}
                               className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"} ${(companyData && companyData.compCode) ? 'bg-blue-100 cursor-not-allowed' : ''}`}
                            />
                            <label htmlFor="compName" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                <span className="global-ref-asterisk-ui">*</span> Company Name
                            </label>
                        </div>

                        {/* Company TIN */}
                        <div className="relative">
                            <input
                                type="text"
                                id="compTin"
                                placeholder=" "
                                value={compTin}
                                onChange={(e) => setCompTin(e.target.value)}
                                disabled={!isEditing}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                            />
                            <label htmlFor="compTin" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                Company TIN
                            </label>
                        </div>

                        {/* ZIP Code */}
                        <div className="relative">
                            <input
                                type="text"
                                id="zipCode"
                                placeholder=" "
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                disabled={!isEditing}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                            />
                            <label htmlFor="zipCode" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                ZIP Code
                            </label>
                        </div>
                    </div>

                    {/* Column 2 - Address Information */}
                    <div className="global-ref-textbox-group-div-ui">
                        {/* Address 1 */}
                        <div className="relative">
                            <input
                                type="text"
                                id="compAddr1"
                                placeholder=" "
                                value={compAddr1}
                                onChange={(e) => setCompAddr1(e.target.value)}
                                disabled={!isEditing}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                            />
                            <label htmlFor="compAddr1" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                Address 1
                            </label>
                        </div>

                        {/* Address 2 */}
                        <div className="relative">
                            <input
                                type="text"
                                id="compAddr2"
                                placeholder=" "
                                value={compAddr2}
                                onChange={(e) => setCompAddr2(e.target.value)}
                                disabled={!isEditing}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                            />
                            <label htmlFor="compAddr2" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                Address 2
                            </label>
                        </div>

                        {/* Address 3 */}
                        <div className="relative">
                            <input
                                type="text"
                                id="compAddr3"
                                placeholder=" "
                                value={compAddr3}
                                onChange={(e) => setCompAddr3(e.target.value)}
                                disabled={!isEditing}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                            />
                            <label htmlFor="compAddr3" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                Address 3
                            </label>
                        </div>

                        {/* Branch */}
                        <div className="relative">
                            <div className={`flex items-center global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled cursor-pointer" : "global-ref-textbox-disabled"}`}
                                onClick={handleOpenBranchModal}>
                                <input
                                    type="text"
                                    id="branchName"
                                    placeholder=" "
                                    value={branchName || branchCode || ""}
                                    readOnly
                                    className="flex-grow bg-transparent border-none focus:outline-none cursor-pointer"
                                />
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className={`ml-2 ${isEditing ? "text-blue-600" : "text-gray-400"}`}
                                />
                            </div>
                            <label htmlFor="branchCode" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                Branch
                            </label>
                        </div>
                    </div>

                    {/* Column 3 - Contact Information */}
                    <div className="global-ref-textbox-group-div-ui">
                        {/* Telephone No */}
                        <div className="relative">
                            <input
                                type="text"
                                id="telNo"
                                placeholder=" "
                                value={telNo}
                                onChange={(e) => setTelNo(e.target.value)}
                                disabled={!isEditing}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                            />
                            <label htmlFor="telNo" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                Telephone No
                            </label>
                        </div>

                        {/* Fax No */}
                        <div className="relative">
                            <input
                                type="text"
                                id="faxNo"
                                placeholder=" "
                                value={faxNo}
                                onChange={(e) => setFaxNo(e.target.value)}
                                disabled={!isEditing}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                            />
                            <label htmlFor="faxNo" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                Fax No
                            </label>
                        </div>

                        {/* Company Email */}
                        <div className="relative">
                            <input
                                type="email"
                                id="compEmail"
                                placeholder=" "
                                value={compEmail}
                                onChange={(e) => setCompEmail(e.target.value)}
                                disabled={!isEditing}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                            />
                            <label htmlFor="compEmail" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                Company Email
                            </label>
                        </div>

                        {/* Cut-off Code */}
                        <div className="relative">
                            <input
                                type="text"
                                id="cutoffCode"
                                placeholder=" "
                                value={cutoffCode}
                                onChange={(e) => setCutoffCode(e.target.value)}
                                disabled={!isEditing}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                            />
                            <label htmlFor="cutoffCode" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                Cut-off Code
                            </label>
                        </div>
                        {/* Email Notification (Host) */}
                        <div className="relative">
                            <input
                                type="text"
                                id="emailNotifier"
                                value={emailNotifier}
                                readOnly
                                onClick={() => isEditing && setEmailModalOpen(true)}
                                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled cursor-pointer" : "global-ref-textbox-disabled"}`}
                                placeholder=" "
                            />
                            <label htmlFor="emailNotifier" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                                Email Notification (Host)
                            </label>
                            <FontAwesomeIcon
                                icon={faInfoCircle}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 cursor-pointer"
                                onClick={() => isEditing && setEmailModalOpen(true)}
                            />
                        </div>

                        {/* Email Notification Modal */}
                        {emailModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-full p-0">
                                    <div className="flex items-center justify-between px-5 py-3 border-b">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
                                            <span className="font-semibold text-base">Email Notification Parameter</span>
                                        </div>
                                        <button
                                            className="text-gray-500 hover:text-red-500 text-lg"
                                            onClick={() => setEmailModalOpen(false)}
                                            title="Close"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <div className="px-6 py-4 space-y-4">
                                        {/* Application Set-up */}
                                        <div>
                                            <div className="font-semibold text-blue-700 mb-2 text-sm">Application Set-up</div>
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                <div className="col-span-2">
                                                    <label className="text-xs text-gray-600">Email Notifier (Host)</label>
                                                    <input
                                                        type="email"
                                                        value={emailNotifier}
                                                        onChange={e => setEmailNotifier(e.target.value)}
                                                        className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-200"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-600">SMTP Host</label>
                                                    <input
                                                        type="text"
                                                        value={smtpHost}
                                                        onChange={e => setSmtpHost(e.target.value)}
                                                        className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-200"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-600">Port</label>
                                                    <input
                                                        type="number"
                                                        value={smtpPort}
                                                        onChange={e => setSmtpPort(e.target.value)}
                                                        className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-200"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-600">Password</label>
                                                    <input
                                                        type="password"
                                                        value={smtpPassword}
                                                        onChange={e => setSmtpPassword(e.target.value)}
                                                        className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-200"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div className="flex items-center mt-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={smtpSSL}
                                                        onChange={e => setSmtpSSL(e.target.checked)}
                                                        disabled={!isEditing}
                                                        id="smtpSSL"
                                                    />
                                                    <label htmlFor="smtpSSL" className="ml-2 text-xs text-gray-600 select-none">SSL</label>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Database Set-up */}
                                        <div>
                                            <div className="font-semibold text-blue-700 mb-2 text-sm">Database Set-up</div>
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                <div>
                                                    <label className="text-xs text-gray-600">Profile Name</label>
                                                    <input
                                                        type="text"
                                                        value={profileName}
                                                        onChange={e => setProfileName(e.target.value)}
                                                        className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-200"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-600">Notification Receiver</label>
                                                    <input
                                                        type="text"
                                                        value={notificationReceiver}
                                                        onChange={e => setNotificationReceiver(e.target.value)}
                                                        className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-200"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Application File Update Set-up */}
                                        <div>
                                            <div className="font-semibold text-blue-700 mb-2 text-sm">Application File Update Set-up</div>
                                            <div className="grid grid-cols-1 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-600">Host Address</label>
                                                    <input
                                                        type="text"
                                                        value={hostAddress}
                                                        onChange={e => setHostAddress(e.target.value)}
                                                        className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-200"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-600">Host Shared</label>
                                                    <input
                                                        type="text"
                                                        value={hostShared}
                                                        onChange={e => setHostShared(e.target.value)}
                                                        className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-200"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-600">Local Destination</label>
                                                    <input
                                                        type="text"
                                                        value={localDestination}
                                                        onChange={e => setLocalDestination(e.target.value)}
                                                        className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-200"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <button
                                                onClick={() => setEmailModalOpen(false)}
                                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                                            >
                                                Close
                                            </button>
                                            <button
                                                onClick={() => setEmailModalOpen(false)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                                disabled={!isEditing}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Company;
