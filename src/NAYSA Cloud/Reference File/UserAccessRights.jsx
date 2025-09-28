import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "@/NAYSA Cloud/Configuration/BaseURL.jsx";
import { useAuth } from "@/NAYSA Cloud/Authentication/AuthContext.jsx";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faMagnifyingGlass,
  faTrashAlt,
  faPlus,
  faMinus,
  faPrint,
  faChevronDown,
  faInfoCircle,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faVideo,
  faSave,
  faUndo,
  faUsers,
  faShield,
  faKey,
  faUserShield,
  faTimes,
  faCheck,
  faFilter,
  faSort,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { faList, faPen } from "@fortawesome/free-solid-svg-icons";

// Global
import { useReset } from "../Components/ResetContext";
import {
  reftables,
  reftablesPDFGuide,
  reftablesVideoGuide,
} from "@/NAYSA Cloud/Global/reftable";

// Exports
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { stringify } from "postcss";

/** Centralized API instance */

const API = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

/** Simple validators */
const req = (v) => String(v || "").trim().length > 0;

/** Case-insensitive "includes" that tolerates nulls */
const includesCI = (hay, needle) =>
  String(hay ?? "")
    .toLowerCase()
    .includes(String(needle ?? "").toLowerCase());

const UserAccessRights = () => {
  const docType = "UserAccRight";
  const { user } = useAuth();
  const documentTitle = reftables[docType] || "User Access Rights";
  const pdfLink = reftablesPDFGuide[docType];
  const videoLink = reftablesVideoGuide[docType];
  const [activeTab, setActiveTab] = useState("userRoles");
  const [isEditing, setIsEditing] = useState(false); 



  const [roles, setRoles] = useState([]);
  const [roleCode, setRoleCode] = useState("");
  const [roleName, setRoleName] = useState("");
  const [active, setRoleActive] = useState("Y");
  const [saving, setSaving] = useState(false); // Initializes saving state
  const [editingRole, setEditingRole] = useState(null);

  // UX state
  const [loading, setLoading] = useState(false);
  const [isOpenExport, setOpenExport] = useState(false);
  const [isOpenGuide, setOpenGuide] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // table or cards
  const [usersLoading, setUsersLoading] = useState(false);

  // Table helpers
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("code");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add these state variables with your other state declarations
  const [showModules, setShowModules] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [viewingRoles, setViewingRoles] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);

  // Per-column filters
  const [columnFilters, setColumnFilters] = useState({
    code: "",
    description: "",
    active: "",
  });

  // Refs for click-away
  const exportRef = useRef(null);
  const guideRef = useRef(null);
  const isEditingExisting = !!editingRole;
  const { setOnSave, setOnReset } = useReset();



  // Roles Group
  // Fetch roles 
  const fetchRoles = async () => {
  setLoading(true);
  try {
    const { data } = await apiClient.get("/role");
    const roleData =
      Array.isArray(data?.data) && data.data[0]?.result
        ? JSON.parse(data.data[0].result)
        : [];
    console.log("Parsed role data:", roleData);
    setRoles(roleData);
  } catch (error) {
    console.error("Error fetching roles:", error);
    setRoles([]);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchRoles();
  }, []);




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
        if (!saving && isEditing) handleSaveRole();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, isEditing, editingRole]);

  // Search + COLUMN FILTERS + sort + pagination
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1) global search (optional)
    const base = q
      ? roles.filter((r) =>
          [r.code, r.description].some((x) =>
            String(x || "")
              .toLowerCase()
              .includes(q)
          )
        )
      : roles;

    // 2) per-column filters (all must match)
    const withColFilters = base.filter((r) => {
      const f = columnFilters;
      if (f.code && !includesCI(r.code, f.code)) return false;
      if (f.description && !includesCI(r.description, f.description))
        return false;

      // select filters: exact match when a value is chosen
      if (f.active && String(r.active ?? "") !== String(f.active)) return false;

      return true;
    });

    // 3) sort
    const factor = sortDir === "asc" ? 1 : -1;
    return [...withColFilters].sort((a, b) => {
      const A = String(a?.[sortBy] ?? "");
      const B = String(b?.[sortBy] ?? "");
      return A.localeCompare(B) * factor;
    });
  }, [roles, query, columnFilters, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleDeleteRow = (index) => {
    const updatedRows = [...roles];
    updatedRows.splice(index, 1);
    setRoles(updatedRows);
  };

  const mapUserRow = (row) => {
    const userCode =
      row.USER_CODE ??
      row.userCode ??
      row.user_code ??
      row.id ??
      row.userId ??
      row.code ??
      "";
    const userName =
      row.USER_NAME ??
      row.userName ??
      row.user_name ??
      row.name ??
      row.username ??
      "";
    const userType =
      row.USER_TYPE ??
      row.userType ??
      row.user_type ??
      row.type ??
      row.usertype ??
      "";
    return {
      userCode: String(userCode ?? "").trim(),
      userName: String(userName ?? "").trim(),
      userType: String(userType ?? "").trim(),
    };
  };


  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
        const { data } = await apiClient.get("/users", {params: { Status: "ActiveRegular" }});
        const userData =
        Array.isArray(data?.data) && data.data[0]?.result
            ? JSON.parse(data.data[0].result).map(mapUserRow).filter(
                (u) => u.userCode || u.userName || u.userType
            )
            : [];
        setUsers(userData);
    } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        Swal.fire("Error", "Failed to load users.", "error");
    } finally {
        setUsersLoading(false);
    }
    };

  useEffect(() => {
    if (activeTab === "roleUserMatch" || activeTab === "userAccess") {
      fetchUsers();
    }
  }, [activeTab]);




  // Save Role
  const handleSaveRole = async () => {
    setSaving(true);

    if (!roleCode || !roleName) {
      await Swal.fire(
        "Error!",
        "Please fill out Role Code and Description.",
        "error"
      );
      setSaving(false);
      return;
    }

    try {

    const payload = {
     json_data: {roleCode: roleCode,
        roleName: roleName, 
        active: active || "Y", 
        userCode: user.USER_CODE}}

        console.log(payload)

    const { data: res } = await apiClient.post("/upsertRole", { json_data: payload});
      if (res.data?.status === "success") {
        await Swal.fire("Success!", "Role saved successfully!", "success");
        await fetchRoles(); 
        resetForm();
        setIsEditing(false);
      } else {
        await Swal.fire(
          "Error!",
          res.data?.message || "Something went wrong.",
          "error"
        );
      }
    } catch (e) {
      console.error(e);
      await Swal.fire(
        "Error!",
        e?.response?.data?.message || "Error saving role.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };



  // Delete Role
  const handleDeleteRole = async (index) => {
    const r = roles[index];
    if (!r?.roleCode) return;
    
    const confirm = await Swal.fire({
      title: "Delete this role?",
      text: `Code: ${r.code} | Description: ${r.description}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      customClass: {
        popup: "rounded-xl shadow-2xl",
      },
    });
    if (!confirm.isConfirmed) return;


    try {
      const { data: response } = await apiClient.post("/deleteRole", {ROLE_CODE: r.roleCode });

      if (response.data.status === "success") {
        setRoles((prev) => prev.filter((_, i) => i !== index));
        Swal.fire({
          title: "Deleted",
          text: "The role has been deleted.",
          icon: "success",
          customClass: {
            popup: "rounded-xl shadow-2xl",
          },
        });
      } else {
        Swal.fire(
          "Error",
          response.data.message || "Failed to delete role.",
          "error"
        );
      }
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire("Error", "Failed to delete role.", "error");
    }
  };

  const resetForm = () => {
    setRoleCode("");
    setRoleName("");
    setRoleActive("Y");
    setEditingRole(null);
    setIsEditing(false);
  };

  // Start editing a role
  const handleEditRow = (index) => {
    const role = roles[index];
    setRoleCode(role.roleCode);
    setRoleName(role.roleName);
    setRoleActive(role.active);
    setEditingRole(role);
    setIsEditing(true);
  };

  // Start new role
  const startNew = () => {
    resetForm();
    setIsEditing(true);
  };

  // Exports
  const handleExport = (type) => {
    if (!roles.length) {
      Swal.fire("No data", "There is no data to export.", "info");
      return;
    }

    const headers = ["Code", "Description", "Active"];
    const rows = roles.map((role) => [
      role.code || "",
      role.description || "",
      role.active || "",
    ]);

    if (type === "csv" || type === "excel") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "User Roles");
      if (type === "csv") {
        XLSX.writeFile(wb, "user_roles.csv", { bookType: "csv" });
      } else {
        XLSX.writeFile(wb, "user_roles.xlsx", { bookType: "xlsx" });
      }
    } else if (type === "pdf") {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "A4",
      });
      doc.setFontSize(15);
      doc.text("User Roles", 40, 40);
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 60,
        margin: { top: 50 },
        theme: "grid",
        styles: {
          fontSize: 8,
          textColor: [40, 40, 40],
          lineColor: [60, 60, 60],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [0, 0, 128],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
      });
      doc.save("user_roles.pdf");
    }
    setOpenExport(false);
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

  const handleViewRole = () => {
    if (selectedUsers.length === 0) {
      Swal.fire({
        title: "No Users Selected",
        text: "Please select at least one user before viewing roles.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    setViewingRoles(true);
  };

  const handleResetUserRoleMatching = () => {
    setSelectedUsers([]);
    setSelectedRoles([]);
    setViewingRoles(false);
  };

  const handleApplyRoles = async () => {
    if (selectedRoles.length === 0) {
      Swal.fire({
        title: "No Roles Selected",
        text: "Please select at least one role to apply.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }


     try { 
        const payload = {
          dt1: selectedRoles.map((code) => ({
                roleCode: code || "",
          })),
          dt2: selectedUsers.map((code) => ({
              userCode: code
            }))
        };

    const { data: res } = await apiClient.post("/UpsertUserRole", { json_data: {json_data : payload}});
      if (res.data?.status === "success") {
        await Swal.fire("Success!", "Users-Role saved successfully!", "success");
      } else {
        await Swal.fire(
          "Error!",
          res.data?.message || "Something went wrong.",
          "error"
        );
      }
    } catch (e) {
      console.error(e);
      await Swal.fire(
        "Error!",
        e?.response?.data?.message || "Error saving role.",
        "error"
      );
    } finally {
      handleResetUserRoleMatching();
    }
  };

  const handleSaveAccess = () => {
    if (selectedModules.length === 0) {
      Swal.fire({
        title: "No Modules Selected",
        text: "Please select at least one module/particular to apply access rights.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    Swal.fire({
      title: "Success!",
      text: `Applied access rights for ${selectedModules.length} module(s)/particular(s) to ${selectedRoles.length} role(s)`,
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      // Reset selections after successful save
      setSelectedRoles([]);
      setShowModules(false);
      setSelectedModules([]);
    });
  };
  // Define the tabs structure
  const tabs = [
    { id: "userRoles", label: "User Roles", icon: faUsers, color: "blue" },
    {
      id: "roleUserMatch",
      label: "Role-User Matching",
      icon: faUserShield,
      color: "green",
    },
    {
      id: "roleAccess",
      label: "Role Access Rights",
      icon: faShield,
      color: "purple",
    },
    {
      id: "userAccess",
      label: "User Access Rights",
      icon: faKey,
      color: "orange",
    },
  ];

  return (
    <div className="mt-10 p-6 bg-gray-100 min-h-screen font-roboto">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="global-tran-header-ui mt-5">
          <div className="global-tran-headertext-div-ui">
            <h1 className="global-tran-headertext-ui">{documentTitle}</h1>
          </div>

          {/* <div className="global-tran-headerstat-div-ui">
            <div>
              <p className="global-tran-headerstat-text-ui">Transaction Status</p>
              <h1 className={`global-tran-stat-text-ui ${activeTab === "userRoles" ? "global-tran-stat-text-active-ui" : "global-tran-stat-text-inactive-ui"}`}>
                {activeTab === "userRoles" ? "ACTIVE" : "VIEWING"}
              </h1>
            </div>
          </div> */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-16 mb-4 bg-white rounded-lg shadow-md overflow-x-auto">
        <div className="flex min-w-max ">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 flex items-center gap-2 transition-all duration-200 font-medium border-b-2 ${
                activeTab === tab.id
                  ? `border-${tab.color}-500 text-${tab.color}-600`
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FontAwesomeIcon
                icon={tab.icon}
                className={
                  activeTab === tab.id
                    ? `text-${tab.color}-600`
                    : "text-gray-400"
                }
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-1 flex flex-col gap-4">
          {activeTab === "userRoles" && (
            <div className="w-full bg-white p-4 sm:p-6 shadow-md rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
                User Roles
              </h2>

              {/* Action Buttons */}
              <div className="mb-3 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={startNew}
                  className="bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add
                </button>
                <button
                  onClick={handleSaveRole}
                  className={`${
                    !isEditing || saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600"
                  } text-white px-2 py-1 rounded flex items-center gap-1 text-xs`}
                  disabled={!isEditing || saving}
                >
                  <FontAwesomeIcon icon={faSave} />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={resetForm}
                  className={`${
                    !isEditing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gray-500"
                  } text-white px-2 py-1 rounded flex items-center gap-1 text-xs`}
                  disabled={!isEditing}
                >
                  <FontAwesomeIcon icon={faUndo} />
                  Reset
                </button>
                <div ref={exportRef} className="relative">
                  <button
                    onClick={() => setOpenExport(!isOpenExport)}
                    className="bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
                  >
                    <FontAwesomeIcon icon={faPrint} />
                    Export
                    <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                  </button>
                  {isOpenExport && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl ring-1 ring-black/10 z-50">
                      <div className="py-1">
                        <button
                          onClick={() => handleExport("csv")}
                          className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FontAwesomeIcon
                            icon={faFileCsv}
                            className="mr-3 text-green-600"
                          />
                          Export as CSV
                        </button>
                        <button
                          onClick={() => handleExport("excel")}
                          className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FontAwesomeIcon
                            icon={faFileExcel}
                            className="mr-3 text-green-600"
                          />
                          Export as Excel
                        </button>
                        <button
                          onClick={() => handleExport("pdf")}
                          className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FontAwesomeIcon
                            icon={faFilePdf}
                            className="mr-3 text-red-600"
                          />
                          Export as PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={guideRef} className="relative">
                  <button
                    onClick={() => setOpenGuide(!isOpenGuide)}
                    className="bg-purple-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Help
                    <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                  </button>
                  {isOpenGuide && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl ring-1 ring-black/10 z-50">
                      <div className="py-1">
                        <button
                          onClick={handlePDFGuide}
                          className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FontAwesomeIcon
                            icon={faFilePdf}
                            className="mr-3 text-red-600"
                          />
                          User Guide (PDF)
                        </button>
                        <button
                          onClick={handleVideoGuide}
                          className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FontAwesomeIcon
                            icon={faVideo}
                            className="mr-3 text-blue-600"
                          />
                          Video Tutorial
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Two Columns Side by Side */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* Form Column */}
                <div className="w-full md:w-1/3 overflow-x-auto">
                  <div className="border rounded-lg overflow-hidden p-4 bg-gray-50">
                    {saving && (
                      <div className="text-xs text-blue-600 mb-2">
                        Processing...
                      </div>
                    )}
                    <div className="space-y-4">
                      {/* Role Code */}
                      <div className="relative">
                        <input
                          type="text"
                          id="roleCode"
                          placeholder=" "
                          className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
    ${
      isEditing && !isEditingExisting
        ? "bg-white border border-gray-400 focus:border-blue-600 text-black"
        : "bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed"
    }`}
                          value={roleCode}
                          onChange={(e) =>
                            setRoleCode(e.target.value.toUpperCase())
                          }
                          disabled={!isEditing || isEditingExisting} // <- key line
                          readOnly={isEditingExisting} // <- extra safety
                          maxLength={10}
                        />
                        <label
                          htmlFor="roleCode"
                          className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                                      bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                                      peer-placeholder-shown:top-1/2 
                                      peer-placeholder-shown:-translate-y-1/2 
                                      peer-placeholder-shown:scale-100 
                                      peer-focus:top-2 
                                      peer-focus:-translate-y-4 
                                      peer-focus:scale-75 
                                      peer-focus:text-blue-600' 
                          ${
                            !isEditing
                              ? "bg-gray-100 text-gray-400"
                              : "bg-white text-gray-500"
                          }`}
                        >
                          Role Code <span className="text-red-500">*</span>
                        </label>
                      </div>

                      {/* Role Description */}
                      <div className="relative">
                        <input
                          type="text"
                          id="roleName"
                          placeholder=" "
                          className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                          ${
                            isEditing
                              ? "bg-white border border-gray-400 focus:border-blue-600 text-black"
                              : "bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          value={roleName}
                          onChange={(e) => setRoleName(e.target.value)}
                          disabled={!isEditing}
                        />
                        <label
                          htmlFor="roleName"
                          className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                                      bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                                      peer-placeholder-shown:top-1/2 
                                      peer-placeholder-shown:-translate-y-1/2 
                                      peer-placeholder-shown:scale-100 
                                      peer-focus:top-2 
                                      peer-focus:-translate-y-4 
                                      peer-focus:scale-75 
                                      peer-focus:text-blue-600'
                          ${
                            !isEditing
                              ? "bg-gray-100 text-gray-400"
                              : "bg-white text-gray-500"
                          }`}
                        >
                          Role Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                      </div>

                      {/* Active Status */}
                      <div className="relative mt-4">
                        <label
                          htmlFor="active"
                          className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                peer-placeholder-shown:top-1/2 
                peer-placeholder-shown:-translate-y-1/2 
                peer-placeholder-shown:scale-100 
                peer-focus:top-2 
                peer-focus:-translate-y-4 
                peer-focus:scale-75 
                peer-focus:text-blue-600'
    ${!isEditing ? "bg-gray-100 text-gray-400" : "bg-white text-gray-500"}`}
                        >
                          Active Status <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="active"
                            value={active} // make sure useState('') for blank default
                            onChange={(e) => setRoleActive(e.target.value)}
                            disabled={!isEditing}
                            className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
        ${
          isEditing
            ? "bg-white border border-gray-400 focus:border-blue-600 text-black"
            : "bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed"
        }`}
                          >
                            <option value=""></option>
                            <option value="Y">Yes</option>
                            <option value="N">No</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className="h-4 w-4 text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Roles Table */}
                <div className="w-full md:w-2/3 overflow-x-auto mt-3 md:mt-0">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Role Code
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Role Name
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {roles.length > 0 ? (
                          roles.map((role, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900">
                                {role.roleCode}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                                {role.roleName || "-"}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    role.active === "Y"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {role.active === "Y" ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                                <button
                                  className="bg-blue-500 text-white px-2 py-0.5 rounded-lg hover:bg-blue-700 transition"
                                  onClick={() => handleEditRow(index)}
                                >
                                  <FontAwesomeIcon icon={faEdit} /> Edit
                                </button>
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                                <button
                                  className="bg-red-500 text-white px-2 py-0.5 rounded-lg hover:bg-red-700 transition"
                                  onClick={() => handleDeleteRole(index)}
                                >
                                  <FontAwesomeIcon icon={faTrashAlt} /> Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-2 py-4 text-center text-gray-500 text-sm"
                            >
                              No User Roles found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "roleUserMatch" && (
            <div className="w-full bg-white p-4 sm:p-6 shadow-md rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faUserShield}
                  className="text-green-600"
                />
                Role-User Matching
              </h2>

              {/* Action Buttons */}
              <div className="mb-3 flex flex-wrap gap-2 justify-end">
                <button
                  className={`${
                    viewingRoles
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600"
                  } text-white px-2 py-1 rounded flex items-center gap-1 text-xs`}
                  onClick={handleViewRole}
                  disabled={viewingRoles}
                >
                  <FontAwesomeIcon icon={faEye} />
                  View Role
                </button>
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
                  onClick={handleResetUserRoleMatching}
                >
                  <FontAwesomeIcon icon={faUndo} />
                  Reset
                </button>
                <button
                  className={`${
                    !viewingRoles
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600"
                  } text-white px-2 py-1 rounded flex items-center gap-1 text-xs`}
                  onClick={handleApplyRoles}
                  disabled={!viewingRoles}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Apply
                </button>
              </div>

              {/* Two Tables Side by Side */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* Users Table */}
                <div className="w-full md:w-1/2 overflow-x-auto">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            USER CODE
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Username
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usersLoading ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-2 py-4 text-center text-gray-500 text-sm"
                            >
                              Loading users                            
                              </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-2 py-4 text-center text-gray-500 text-sm"
                            >
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((user, index) => (
                            <tr
                              key={user.userCode || index}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                                {user.userCode}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                                {user.userName}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                                <input
                                  type="checkbox"
                                  className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  checked={selectedUsers.includes(
                                    user.userCode
                                  )}
                                  onChange={() => {
                                    if (viewingRoles) return;
                                    setSelectedUsers((prev) =>
                                      prev.includes(user.userCode)
                                        ? prev.filter(
                                            (id) => id !== user.userCode
                                          )
                                        : [...prev, user.userCode]
                                    );
                                  }}
                                  disabled={viewingRoles}
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Roles Table */}
                <div className="w-full md:w-1/2 overflow-x-auto mt-3 md:mt-0">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Role Code
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Role Description
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={`bg-white divide-y divide-gray-200 ${
                          !viewingRoles ? "opacity-50" : ""
                        }`}
                      >
                        {roles.map((role, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900">
                              {role.roleCode}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                              {role.roleName}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                              <input
                                type="checkbox"
                                className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={selectedRoles.includes(role.roleCode)}
                                onChange={() => {
                                  setSelectedRoles((prev) => {
                                    if (prev.includes(role.roleCode)) {
                                      return prev.filter(
                                        (roleCode) => roleCode !== role.roleCode
                                      );
                                    } else {
                                      // Allow selecting multiple roles
                                      return [...prev, role.roleCode];
                                    }
                                  });
                                  // Hide modules if roles selection changes
                                  setShowModules(false);
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Status Display */}
              {selectedUsers.length > 0 && (
                <div className="mt-4 bg-blue-50 p-2 rounded text-xs">
                  {viewingRoles
                    ? `Assigning roles to ${selectedUsers.length} selected user(s). Please select roles and click Apply.`
                    : `${selectedUsers.length} user(s) selected. Click "View Role" to continue.`}
                </div>
              )}

              {viewingRoles && selectedRoles.length > 0 && (
                <div className="mt-2 bg-green-50 p-2 rounded text-xs">
                  {`${selectedRoles.length} role(s) selected to apply.`}
                </div>
              )}
            </div>
          )}

          {activeTab === "roleAccess" && (
            <div className="w-full bg-white p-4 sm:p-6 shadow-md rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faUserShield}
                  className="text-purple-600"
                />
                Role Access Rights
              </h2>

              {/* Action Buttons */}
              <div className="mb-3 flex flex-wrap gap-2 justify-end">
                <button
                  className={`${
                    selectedRoles.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600"
                  } text-white px-2 py-1 rounded flex items-center gap-1 text-xs`}
                  onClick={() => {
                    if (selectedRoles.length > 0) {
                      setShowModules(true);
                      setSelectedModules([]);
                    }
                  }}
                  disabled={selectedRoles.length === 0}
                >
                  <FontAwesomeIcon icon={faEye} />
                  View Modules
                </button>
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
                  onClick={() => {
                    setSelectedRoles([]);
                    setShowModules(false);
                    setSelectedModules([]);
                  }}
                >
                  <FontAwesomeIcon icon={faUndo} />
                  Reset
                </button>
                <button
                  className={`${
                    !showModules || selectedModules.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600"
                  } text-white px-2 py-1 rounded flex items-center gap-1 text-xs`}
                  disabled={!showModules || selectedModules.length === 0}
                  onClick={handleSaveAccess}
                >
                  <FontAwesomeIcon icon={faSave} />
                  Save Access
                </button>
              </div>

              {/* Two Tables Side by Side */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* Roles Table */}
                <div className="w-full md:w-1/3 overflow-x-auto">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Code
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Description
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map((role, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900">
                              {role.code}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                              {role.description}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                              <input
                                type="checkbox"
                                className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={selectedRoles.includes(role.code)}
                                onChange={() => {
                                  setSelectedRoles((prev) => {
                                    if (prev.includes(role.code)) {
                                      return prev.filter(
                                        (code) => code !== role.code
                                      );
                                    } else {
                                      return [...prev, role.code];
                                    }
                                  });
                                  // Hide modules if roles selection changes
                                  setShowModules(false);
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Module-Particular-Access Table */}
                <div className="w-full md:w-2/3 overflow-x-auto mt-3 md:mt-0">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Module
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Particular
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Access
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {showModules ? (
                          [
                            {
                              id: 1,
                              module: "GL",
                              particular: "General Ledger",
                            },
                            {
                              id: 2,
                              module: "GL",
                              particular: "Accounts Payable",
                            },
                            {
                              id: 3,
                              module: "GL",
                              particular: "Accounts Receivable",
                            },
                            { id: 4, module: "GL", particular: "Fixed Assets" },
                            { id: 5, module: "GL", particular: "Inventory" },
                            { id: 6, module: "GL", particular: "Banking" },
                            {
                              id: 7,
                              module: "HR",
                              particular: "Employee Management",
                            },
                            { id: 8, module: "HR", particular: "Attendance" },
                            { id: 9, module: "HR", particular: "Payroll" },
                            {
                              id: 10,
                              module: "SYS",
                              particular: "System Settings",
                            },
                          ].map((item, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900">
                                {item.module}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                                {item.particular}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                                <input
                                  type="checkbox"
                                  className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  checked={selectedModules.includes(item.id)}
                                  onChange={() => {
                                    setSelectedModules((prev) => {
                                      if (prev.includes(item.id)) {
                                        return prev.filter(
                                          (id) => id !== item.id
                                        );
                                      } else {
                                        return [...prev, item.id];
                                      }
                                    });
                                  }}
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-4 py-8 text-center text-gray-500 bg-gray-50 text-sm"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-2" />
                              Select role(s) and click "View Modules" to see
                              available modules
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Status Display */}
              {selectedRoles.length > 0 && (
                <div className="mt-4 bg-blue-50 p-2 rounded text-xs">
                  {selectedRoles.length === 1
                    ? `Selected role: ${selectedRoles[0]}`
                    : `Selected roles: ${selectedRoles.join(", ")}`}
                </div>
              )}

              {showModules && selectedModules.length > 0 && (
                <div className="mt-2 bg-green-50 p-2 rounded text-xs">
                  {`${selectedModules.length} module(s)/particular(s) selected for access rights configuration.`}
                </div>
              )}
            </div>
          )}

          {activeTab === "userAccess" && (
            <div className="w-full bg-white p-4 sm:p-6 shadow-md rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faKey} className="text-orange-600" />
                User Access Rights
              </h2>

              {/* Action Buttons */}
              <div className="mb-3 flex flex-wrap gap-2 justify-end">
                <button
                  className={`${
                    selectedUsers.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600"
                  } text-white px-2 py-1 rounded flex items-center gap-1 text-xs`}
                  onClick={() => {
                    if (selectedUsers.length > 0) {
                      setShowModules(true);
                      setSelectedModules([]);
                    }
                  }}
                  disabled={selectedUsers.length === 0}
                >
                  <FontAwesomeIcon icon={faEye} />
                  View Rights
                </button>
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
                  onClick={() => {
                    setSelectedUsers([]);
                    setShowModules(false);
                    setSelectedModules([]);
                  }}
                >
                  <FontAwesomeIcon icon={faUndo} />
                  Reset
                </button>
                <button
                  className={`${
                    !showModules || selectedModules.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600"
                  } text-white px-2 py-1 rounded flex items-center gap-1 text-xs`}
                  disabled={!showModules || selectedModules.length === 0}
                  onClick={handleSaveAccess}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Apply
                </button>
                <button className="bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs">
                  <FontAwesomeIcon icon={faPrint} />
                  Export
                </button>
                <button className="bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs">
                  <FontAwesomeIcon icon={faTrashAlt} />
                  Delete All User Access Rights
                </button>
              </div>

              {/* Two Tables Side by Side */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* Users Table */}
                <div className="w-full md:w-1/3 overflow-x-auto">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            User Type
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            User Code
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            UserName
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900">
                              {user.userType}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                              {user.userCode}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                              {user.userName}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                              <input
                                type="checkbox"
                                className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={selectedUsers.includes(user.userCode)}
                                onChange={() => {
                                  setSelectedUsers((prev) =>
                                    prev.includes(user.userCode)
                                      ? prev.filter(
                                          (id) => id !== user.userCode
                                        )
                                      : [...prev, user.userCode]
                                  );
                                  setShowModules(false);
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Module-Particular-Access Table */}
                <div className="w-full md:w-2/3 overflow-x-auto mt-3 md:mt-0">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Module
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Particular
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Access
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {showModules ? (
                          [
                            {
                              id: 1,
                              module: "GL",
                              particular: "General Ledger",
                            },
                            {
                              id: 2,
                              module: "GL",
                              particular: "Accounts Payable",
                            },
                            {
                              id: 3,
                              module: "GL",
                              particular: "Accounts Receivable",
                            },
                            { id: 4, module: "GL", particular: "Fixed Assets" },
                            { id: 5, module: "GL", particular: "Inventory" },
                            { id: 6, module: "GL", particular: "Banking" },
                            {
                              id: 7,
                              module: "HR",
                              particular: "Employee Management",
                            },
                            { id: 8, module: "HR", particular: "Attendance" },
                            { id: 9, module: "HR", particular: "Payroll" },
                            {
                              id: 10,
                              module: "SYS",
                              particular: "System Settings",
                            },
                          ].map((item, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900">
                                {item.module}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                                {item.particular}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                                <input
                                  type="checkbox"
                                  className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  checked={selectedModules.includes(item.id)}
                                  onChange={() => {
                                    setSelectedModules((prev) => {
                                      if (prev.includes(item.id)) {
                                        return prev.filter(
                                          (id) => id !== item.id
                                        );
                                      } else {
                                        return [...prev, item.id];
                                      }
                                    });
                                  }}
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-4 py-8 text-center text-gray-500 bg-gray-50 text-sm"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-2" />
                              Select role(s) and click "View Modules" to see
                              available modules
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Status Display */}
              {selectedUsers.length > 0 && (
                <div className="mt-4 bg-blue-50 p-2 rounded text-xs">
                  {selectedUsers.length === 1
                    ? `Selected user: ${
                        users.find((u) => u.id === selectedUsers[0])?.name ||
                        selectedUsers[0]
                      }`
                    : `Selected users: ${selectedUsers.length}`}
                </div>
              )}

              {showModules && selectedModules.length > 0 && (
                <div className="mt-2 bg-green-50 p-2 rounded text-xs">
                  {`${selectedModules.length} module(s)/particular(s) selected for access rights configuration.`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccessRights;
