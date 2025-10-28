import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/NAYSA Cloud/Configuration/BaseURL.jsx";
import { useAuth } from "@/NAYSA Cloud/Authentication/AuthContext.jsx";
// import AcctLookupModal from "@/NAYSA Cloud/Lookup/SearchAcctRef"; // You need to create this modal

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit, faTrashAlt, faPlus, faPrint, faChevronDown,
  faFileCsv, faFileExcel, faFilePdf, faSave, faUndo,
  faInfoCircle, faVideo, faMagnifyingGlass
} from "@fortawesome/free-solid-svg-icons";

import {
  reftables,
  reftablesPDFGuide,
  reftablesVideoGuide,
} from "@/NAYSA Cloud/Global/reftable";

import {
  useSwalErrorAlert,
  useSwalSuccessAlert,
  useSwalWarningAlert,
  useSwalDeleteConfirm,
  useSwalDeleteSuccess,
} from "@/NAYSA Cloud/Global/behavior";

const VATRef = () => {
  const docType = "VATRef";
   const documentTitle = reftables[docType];
  // const pdfLink = reftablesPDFGuide[docType];
  // const videoLink = reftablesVideoGuide[docType];

  // Form state
  const [vatCode, setVatCode] = useState("");
  const [description, setDescription] = useState("");
  const [vatType, setVatType] = useState("");
  const [vatClass, setVatClass] = useState("");
  const [vatRate, setVatRate] = useState("");
  const [acctCode, setAcctCode] = useState("");
  const [acctName, setAcctName] = useState("");
  const [oldCode, setOldCode] = useState("");
  const [vatCategory, setVatCategory] = useState("");
  const [registeredBy, setRegisteredBy] = useState("");
  const [registeredDate, setRegisteredDate] = useState("");
  const [lastUpdatedBy, setLastUpdatedBy] = useState("");
  const [lastUpdatedDate, setLastUpdatedDate] = useState("");

  // Modal
  const [acctModalOpen, setAcctModalOpen] = useState(false);

  // Table state
  const [vatList, setVatList] = useState([]);
  const [selectedVAT, setSelectedVAT] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Table helpers
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("vatCode");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Per-column filters
  const [columnFilters, setColumnFilters] = useState({
    vatCode: "",
    description: "",
    vatType: "",
    vatClass: "",
    vatRate: "",
    acctCode: "",
    acctName: "",
    oldCode: "",
    vatCategory: "",
  });

  // VAT Type/Class/Category options
  const vatTypeOptions = ["Input", "Output"];
  const vatClassOptions = ["Goods", "Services"];
  const vatCategoryOptions = ["EXEMPT", "VATABLE", "ZERO-RATED"];

  // Modal handlers
  const handleOpenAcctModal = () => { if (isEditing) setAcctModalOpen(true); };
  const handleCloseAcctModal = (selectedAcct = null) => {
    setAcctModalOpen(false);
    if (selectedAcct) {
      setAcctCode(selectedAcct.acctCode || "");
      setAcctName(selectedAcct.acctName || "");
    }
  };

  // Fetch VAT list
  const fetchVATList = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const { data } = await apiClient.get("/lookupVat");
      let vatData = [];
      if (data?.data && Array.isArray(data.data) && data.data[0]?.result) {
        vatData = JSON.parse(data.data[0].result);
      } else if (Array.isArray(data)) {
        vatData = data;
      }
      setVatList(Array.isArray(vatData) ? vatData : []);
    } catch (error) {
      setVatList([]);
      await useSwalErrorAlert("Error", "Failed to load VAT records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVATList(); }, []);

  // Filter/sort
  const includesCI = (str, searchValue) => String(str || "").toLowerCase().includes(String(searchValue).toLowerCase());
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? vatList.filter((v) =>
        [v.vatCode, v.description, v.vatType, v.vatClass, v.vatRate, v.acctCode, v.acctName, v.oldCode, v.vatCategory].some((x) =>
          String(x || "").toLowerCase().includes(q)
        )
      )
      : vatList;
    const f = columnFilters;
    const withColFilters = base.filter((v) => {
      if (f.vatCode && !includesCI(v.vatCode, f.vatCode)) return false;
      if (f.description && !includesCI(v.description, f.description)) return false;
      if (f.vatType && !includesCI(v.vatType, f.vatType)) return false;
      if (f.vatClass && !includesCI(v.vatClass, f.vatClass)) return false;
      if (f.vatRate && String(v.vatRate) !== "" && !includesCI(v.vatRate, f.vatRate)) return false;
      if (f.acctCode && !includesCI(v.acctCode, f.acctCode)) return false;
      if (f.acctName && !includesCI(v.acctName, f.acctName)) return false;
      if (f.oldCode && !includesCI(v.oldCode, f.oldCode)) return false;
      if (f.vatCategory && !includesCI(v.vatCategory, f.vatCategory)) return false;
      return true;
    });
    const factor = sortDir === "asc" ? 1 : -1;
    return [...withColFilters].sort((a, b) => {
      let A = String(a?.[sortBy] ?? "");
      let B = String(b?.[sortBy] ?? "");
      return A.localeCompare(B) * factor;
    });
  }, [vatList, query, columnFilters, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Reset form
  const resetForm = () => {
    setVatCode(""); setDescription(""); setVatType(""); setVatClass(""); setVatRate("");
    setAcctCode(""); setAcctName(""); setOldCode(""); setVatCategory("");
    setRegisteredBy(""); setRegisteredDate(""); setLastUpdatedBy(""); setLastUpdatedDate("");
    setSelectedVAT(null); setIsEditing(false);
    setQuery(""); setColumnFilters({
      vatCode: "", description: "", vatType: "", vatClass: "", vatRate: "",
      acctCode: "", acctName: "", oldCode: "", vatCategory: "",
    });
    setPage(1); setSortBy("vatCode"); setSortDir("asc");
  };

  // Save VAT
  const handleSaveVAT = async () => {
    setSaving(true);
    if (!vatCode || !description || !vatType || !vatClass || !vatRate || !acctCode || !vatCategory) {
      await useSwalErrorAlert("Error!", "Please fill out all required fields.");
      setSaving(false);
      return;
    }
    try {
      const payload = {
        json_data: {
          vatCode: vatCode.trim(),
          description: description.trim(),
          vatType, vatClass, vatRate,
          acctCode, acctName,
          oldCode, vatCategory,
        }
      };
      // Replace with your actual API endpoint
      const response = await apiClient.post("/vatref/upsert", payload);
      if (response.data?.success) {
        await fetchVATList();
        await useSwalSuccessAlert("Success!", "VAT record saved.");
        resetForm();
      } else {
        await useSwalErrorAlert("Error!", response.data?.message || "Failed to save VAT record.");
      }
    } catch (e) {
      await useSwalErrorAlert("Error!", "Error saving VAT record.");
    } finally {
      setSaving(false);
    }
  };

  // Edit VAT
  const handleEditVAT = (vat) => {
    setVatCode(vat.vatCode || "");
    setDescription(vat.description || "");
    setVatType(vat.vatType || "");
    setVatClass(vat.vatClass || "");
    setVatRate(vat.vatRate || "");
    setAcctCode(vat.acctCode || "");
    setAcctName(vat.acctName || "");
    setOldCode(vat.oldCode || "");
    setVatCategory(vat.vatCategory || "");
    setSelectedVAT(vat);
    setIsEditing(true);
  };

  // Delete VAT
  const handleDeleteVAT = async (vatToDelete = null) => {
    const target = vatToDelete || selectedVAT;
    if (!target?.vatCode) {
      await useSwalErrorAlert("Error", "Please select a VAT record to delete.");
      return;
    }
    const confirm = await useSwalDeleteConfirm(
      "Delete this VAT record?",
      `Code: ${target.vatCode} | Desc: ${target.description}`,
      "Yes, delete it"
    );
    if (!confirm.isConfirmed) return;
    try {
      // Replace with your actual API endpoint
      await apiClient.post("/vatref/delete", { vatCode: target.vatCode });
      await useSwalDeleteSuccess();
      await fetchVATList();
      if (selectedVAT?.vatCode === target.vatCode) resetForm();
    } catch {
      await useSwalErrorAlert("Error", "Failed to delete VAT record.");
    }
  };

  // Start new VAT
  const startNew = () => { resetForm(); setIsEditing(true); };

  return (
    <div className="global-ref-main-div-ui mt-24">
      {loading && <div className="fixed inset-0 z-[70] bg-black/20 flex items-center justify-center"><div className="bg-white rounded-xl px-6 py-4 shadow-xl">Loading…</div></div>}
      {acctModalOpen && (
        <AcctLookupModal isOpen={acctModalOpen} onClose={handleCloseAcctModal} />
      )}

      {/* Header */}
      <div className="fixed mt-4 top-14 left-6 right-6 z-30 global-ref-header-ui flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
        </div>
        <div className="flex gap-2 justify-center text-xs">
          <button onClick={startNew} className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <FontAwesomeIcon icon={faPlus} /> Add
          </button>
          <button onClick={handleSaveVAT} className={`bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 ${!isEditing || saving ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!isEditing || saving}>
            <FontAwesomeIcon icon={faSave} /> Save
          </button>
          <button onClick={resetForm} className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700" disabled={saving}>
            <FontAwesomeIcon icon={faUndo} /> Reset
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="global-tran-tab-div-ui">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="global-ref-textbox-group-div-ui">
            <div className="relative">
              <input type="text" id="vatCode" placeholder=" " value={vatCode} onChange={e => setVatCode(e.target.value)} disabled={isEditing && selectedVAT} className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"} ${isEditing && selectedVAT ? 'bg-blue-100 cursor-not-allowed' : ''}`} />
              <label htmlFor="vatCode" className="global-ref-floating-label"><span className="global-ref-asterisk-ui">*</span> VAT Code</label>
            </div>
            <div className="relative">
              <input type="text" id="description" placeholder=" " value={description} onChange={e => setDescription(e.target.value)} disabled={!isEditing} className="peer global-ref-textbox-ui global-ref-textbox-enabled" />
              <label htmlFor="description" className="global-ref-floating-label"><span className="global-ref-asterisk-ui">*</span> Description</label>
            </div>
            <div className="relative">
              <select id="vatType" value={vatType} onChange={e => setVatType(e.target.value)} disabled={!isEditing} className="peer global-ref-textbox-ui global-ref-textbox-enabled">
                <option value="">Select Type</option>
                {vatTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <label htmlFor="vatType" className="global-ref-floating-label"><span className="global-ref-asterisk-ui">*</span> VAT Type</label>
            </div>
            <div className="relative">
              <select id="vatClass" value={vatClass} onChange={e => setVatClass(e.target.value)} disabled={!isEditing} className="peer global-ref-textbox-ui global-ref-textbox-enabled">
                <option value="">Select Class</option>
                {vatClassOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
              <label htmlFor="vatClass" className="global-ref-floating-label"><span className="global-ref-asterisk-ui">*</span> VAT Class</label>
            </div>
            <div className="relative">
              <input type="number" id="vatRate" placeholder=" " value={vatRate} onChange={e => setVatRate(e.target.value)} disabled={!isEditing} className="peer global-ref-textbox-ui global-ref-textbox-enabled" />
              <label htmlFor="vatRate" className="global-ref-floating-label"><span className="global-ref-asterisk-ui">*</span> VAT Rate</label>
            </div>
          </div>
          {/* Column 2 */}
          <div className="global-ref-textbox-group-div-ui">
            <div className="relative">
              <div className={`flex items-center global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled cursor-pointer" : "global-ref-textbox-disabled"}`} onClick={handleOpenAcctModal}>
                <input type="text" id="acctCode" placeholder=" " value={acctCode} readOnly className="flex-grow bg-transparent border-none focus:outline-none cursor-pointer" />
                <FontAwesomeIcon icon={faMagnifyingGlass} className={`ml-2 ${isEditing ? "text-blue-600" : "text-gray-400"}`} />
              </div>
              <label htmlFor="acctCode" className="global-ref-floating-label"><span className="global-ref-asterisk-ui">*</span> Acct Code</label>
            </div>
            <div className="relative">
              <input type="text" id="acctName" placeholder=" " value={acctName} readOnly className="peer global-ref-textbox-ui global-ref-textbox-disabled" />
              <label htmlFor="acctName" className="global-ref-floating-label">Acct Name</label>
            </div>
            <div className="relative">
              <input type="text" id="oldCode" placeholder=" " value={oldCode} onChange={e => setOldCode(e.target.value)} disabled={!isEditing} className="peer global-ref-textbox-ui global-ref-textbox-enabled" />
              <label htmlFor="oldCode" className="global-ref-floating-label">Old Code</label>
            </div>
            <div className="relative">
              <select id="vatCategory" value={vatCategory} onChange={e => setVatCategory(e.target.value)} disabled={!isEditing} className="peer global-ref-textbox-ui global-ref-textbox-enabled">
                <option value="">Select Category</option>
                {vatCategoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <label htmlFor="vatCategory" className="global-ref-floating-label"><span className="global-ref-asterisk-ui">*</span> VAT Category</label>
            </div>
          </div>
          {/* Column 3 */}
          <div className="global-ref-textbox-group-div-ui">
            <div className="relative">
              <select id="registeredBy" value={registeredBy} disabled className="peer global-ref-textbox-ui global-ref-textbox-disabled">
                <option value="">{registeredBy}</option>
              </select>
              <label htmlFor="registeredBy" className="global-ref-floating-label">Registered By</label>
            </div>
            <div className="relative">
              <input type="text" id="registeredDate" value={registeredDate} disabled className="peer global-ref-textbox-ui global-ref-textbox-disabled" />
              <label htmlFor="registeredDate" className="global-ref-floating-label">Registered Date</label>
            </div>
            <div className="relative">
              <select id="lastUpdatedBy" value={lastUpdatedBy} disabled className="peer global-ref-textbox-ui global-ref-textbox-disabled">
                <option value="">{lastUpdatedBy}</option>
              </select>
              <label htmlFor="lastUpdatedBy" className="global-ref-floating-label">Last Updated By</label>
            </div>
            <div className="relative">
              <input type="text" id="lastUpdatedDate" value={lastUpdatedDate} disabled className="peer global-ref-textbox-ui global-ref-textbox-disabled" />
              <label htmlFor="lastUpdatedDate" className="global-ref-floating-label">Last Updated Date</label>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="global-ref-tab-div-ui mt-6">
        <div className="global-ref-table-main-div-ui">
          <div className="global-ref-table-main-sub-div-ui">
            <div className="global-ref-table-div-ui">
              <table className="global-ref-table-div-ui">
                <thead className="global-ref-thead-div-ui">
                  <tr>
                    {[
                      ["vatCode", "VAT Code"],
                      ["description", "Description"],
                      ["vatType", "Type"],
                      ["vatClass", "Class"],
                      ["vatRate", "Rate"],
                      ["acctCode", "Acct Code"],
                      ["acctName", "Acct Name"],
                      ["oldCode", "Old Code"],
                      ["vatCategory", "VAT Category"],
                      ["_edit", "Edit"],
                      ["_delete", "Delete"],
                    ].map(([key, label]) => (
                      <th key={key} className={`global-ref-th-ui ${key.startsWith("_") ? "" : "cursor-pointer select-none"}`}
                        onClick={() => {
                          if (key.startsWith("_")) return;
                          setSortBy(key);
                          setSortDir((prev) => (sortBy === key && prev === "asc" ? "desc" : "asc"));
                        }}
                        title={!key.startsWith("_") ? "Click to sort" : undefined}
                      >
                        {label} {sortBy === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="global-ref-th-ui">
                      <input className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled" placeholder="Filter…" value={columnFilters.vatCode} onChange={e => { setColumnFilters(s => ({ ...s, vatCode: e.target.value })); setPage(1); }} />
                    </th>
                    <th className="global-ref-th-ui">
                      <input className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled" placeholder="Filter…" value={columnFilters.description} onChange={e => { setColumnFilters(s => ({ ...s, description: e.target.value })); setPage(1); }} />
                    </th>
                    <th className="global-ref-th-ui">
                      <select className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled" value={columnFilters.vatType} onChange={e => { setColumnFilters(s => ({ ...s, vatType: e.target.value })); setPage(1); }}>
                        <option value="">All</option>
                        {vatTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </th>
                    <th className="global-ref-th-ui">
                      <select className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled" value={columnFilters.vatClass} onChange={e => { setColumnFilters(s => ({ ...s, vatClass: e.target.value })); setPage(1); }}>
                        <option value="">All</option>
                        {vatClassOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                      </select>
                    </th>
                    <th className="global-ref-th-ui">
                      <input className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled" placeholder="Equals…" value={columnFilters.vatRate} onChange={e => { setColumnFilters(s => ({ ...s, vatRate: e.target.value })); setPage(1); }} />
                    </th>
                    <th className="global-ref-th-ui">
                      <input className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled" placeholder="Filter…" value={columnFilters.acctCode} onChange={e => { setColumnFilters(s => ({ ...s, acctCode: e.target.value })); setPage(1); }} />
                    </th>
                    <th className="global-ref-th-ui">
                      <input className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled" placeholder="Filter…" value={columnFilters.acctName} onChange={e => { setColumnFilters(s => ({ ...s, acctName: e.target.value })); setPage(1); }} />
                    </th>
                    <th className="global-ref-th-ui">
                      <input className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled" placeholder="Filter…" value={columnFilters.oldCode} onChange={e => { setColumnFilters(s => ({ ...s, oldCode: e.target.value })); setPage(1); }} />
                    </th>
                    <th className="global-ref-th-ui">
                      <select className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled" value={columnFilters.vatCategory} onChange={e => { setColumnFilters(s => ({ ...s, vatCategory: e.target.value })); setPage(1); }}>
                        <option value="">All</option>
                        {vatCategoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </th>
                    <th className="global-ref-th-ui"></th>
                    <th className="global-ref-th-ui"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="11" className="global-ref-norecords-ui">Loading…</td></tr>
                  ) : pageRows.length === 0 ? (
                    <tr><td colSpan="11" className="global-ref-norecords-ui">No records found</td></tr>
                  ) : (
                    pageRows.map((vat, idx) => (
                      <tr key={idx} className={`global-tran-tr-ui ${selectedVAT?.vatCode === vat.vatCode ? 'bg-blue-50' : ''}`} onClick={() => handleEditVAT(vat)}>
                        <td className="global-ref-td-ui">{vat.vatCode || "-"}</td>
                        <td className="global-ref-td-ui">{vat.description || "-"}</td>
                        <td className="global-ref-td-ui">{vat.vatType || "-"}</td>
                        <td className="global-ref-td-ui">{vat.vatClass || "-"}</td>
                        <td className="global-ref-td-ui">{vat.vatRate || "-"}</td>
                        <td className="global-ref-td-ui">{vat.acctCode || "-"}</td>
                        <td className="global-ref-td-ui">{vat.acctName || "-"}</td>
                        <td className="global-ref-td-ui">{vat.oldCode || "-"}</td>
                        <td className="global-ref-td-ui">{vat.vatCategory || "-"}</td>
                        <td className="global-ref-td-ui text-center sticky right-10">
                          <button onClick={e => { e.stopPropagation(); handleEditVAT(vat); }} className="global-ref-td-button-edit-ui">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </td>
                        <td className="global-ref-td-ui text-center sticky right-0">
                          <button onClick={e => { e.stopPropagation(); setSelectedVAT(vat); handleDeleteVAT(vat); }} className="global-ref-td-button-delete-ui" title={`Delete ${vat.vatCode}`}>
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex items-center justify-between p-3">
                <div className="text-xs opacity-80 font-semibold">
                  Total Records: {filtered.length}
                </div>
                <div className="flex items-center gap-2">
                  <select className="px-7 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-900" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
                  </select>
                  <div className="text-xs opacity-80 font-semibold">
                    Page {page} of {totalPages}
                  </div>
                  <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-7 py-2 text-xs font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700">Prev</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-7 py-2 text-xs font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VATRef;