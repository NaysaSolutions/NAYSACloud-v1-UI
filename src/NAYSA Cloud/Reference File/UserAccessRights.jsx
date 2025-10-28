// import { useEffect, useMemo, useRef, useState } from "react";
// import { apiClient } from "@/NAYSA Cloud/Configuration/BaseURL.jsx";
// import { useAuth } from "@/NAYSA Cloud/Authentication/AuthContext.jsx";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faEdit, faTrashAlt, faPlus, faPrint, faChevronDown, faInfoCircle,
//   faFileCsv, faFileExcel, faFilePdf, faVideo, faSave, faUndo, faUsers, faShield, faKey,
//   faUserShield, faCheck, faEye, faSpinner, faMagnifyingGlass
// } from "@fortawesome/free-solid-svg-icons";

// // Global
// import { useReset } from "../Components/ResetContext";
// import {
//   reftables,
//   reftablesPDFGuide,
//   reftablesVideoGuide,
// } from "@/NAYSA Cloud/Global/reftable";

// // Import SweetAlert utilities from behavior.js
// import {
//   useSwalErrorAlert,
//   useSwalSuccessAlert,
//   useSwalWarningAlert,
//   useSwalInfoAlert,
//   useSwalDeleteConfirm,
//   useSwalDeleteSuccess
// } from "@/NAYSA Cloud/Global/behavior";

// // Exports
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const UserAccessRights = () => {
//   const docType = "UserAccRight";
//   const { user } = useAuth();
//   const documentTitle = reftables[docType];
//   const pdfLink = reftablesPDFGuide[docType];
//   const videoLink = reftablesVideoGuide[docType];
//   const [activeTab, setActiveTab] = useState("userRoles");
//   const [isEditing, setIsEditing] = useState(false);

//   const [roles, setRoles] = useState([]);
//   const [roleCode, setRoleCode] = useState("");
//   const [roleName, setRoleName] = useState("");
//   const [active, setRoleActive] = useState("Y");
//   const [saving, setSaving] = useState(false);
//   const [editingRole, setEditingRole] = useState(null);

//   // UX state
//   const [loading, setLoading] = useState(false);
//   const [isOpenExport, setOpenExport] = useState(false);
//   const [isOpenGuide, setOpenGuide] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const [viewMode, setViewMode] = useState("table");
//   const [usersLoading, setUsersLoading] = useState(false);
//   const [showSpinner, setShowSpinner] = useState(false);

//   // Table helpers
//   const [query, setQuery] = useState("");
//   const [sortBy, setSortBy] = useState("code");
//   const [sortDir, setSortDir] = useState("asc");
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   // Add these state variables with your other state declarations
//   const [showModules, setShowModules] = useState(false);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [selectedRoles, setSelectedRoles] = useState([]);
//   const [viewingRoles, setViewingRoles] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [selectedModules, setSelectedModules] = useState([]);

//   // Add new state for tracking applied user-role relationships
//   const [appliedUserRoles, setAppliedUserRoles] = useState(new Set());

//   // Per-column filters
//   const [columnFilters, setColumnFilters] = useState({
//     code: "",
//     description: "",
//     active: "",
//   });

//   // Refs for click-away
//   const exportRef = useRef(null);
//   const guideRef = useRef(null);
//   const isEditingExisting = !!editingRole;
//   const { setOnSave, setOnReset } = useReset();

//   // Loading spinner component
//   const LoadingSpinner = () => (
//     <div className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm flex items-center justify-center">
//       <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-xl">
//         {saving ? "Saving…" : "Loading…"}
//       </div>
//     </div>
//   );

//   // Roles Group
//   // Fetch roles 
//   const fetchRoles = async () => {
//     setLoading(true);
//     try {
//       const { data } = await apiClient.get("/role");
//       const roleData =
//         Array.isArray(data?.data) && data.data[0]?.result
//           ? JSON.parse(data.data[0].result)
//           : [];
//       console.log("Parsed role data:", roleData);
//       setRoles(roleData);
//     } catch (error) {
//       console.error("Error fetching roles:", error);
//       setRoles([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRoles();
//   }, []);

//   // Close menus on outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const clickedOutsideExport =
//         exportRef.current && !exportRef.current.contains(event.target);
//       const clickedOutsideGuide =
//         guideRef.current && !guideRef.current.contains(event.target);
//       if (clickedOutsideExport) setOpenExport(false);
//       if (clickedOutsideGuide) setOpenGuide(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Global Ctrl+S
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.ctrlKey && e.key.toLowerCase() === "s") {
//         e.preventDefault();
//         if (!saving && isEditing) handleSaveRole();
//       }
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [saving, isEditing, editingRole]);

//   // Loading spinner timer
//   useEffect(() => {
//     let timer;
//     if (loading) {
//       timer = setTimeout(() => setShowSpinner(true), 200);
//     } else {
//       setShowSpinner(false);
//     }
//     return () => clearTimeout(timer);
//   }, [loading]);

//   // Helper function for case-insensitive string includes
//   const includesCI = (str, searchValue) => {
//     return String(str || "").toLowerCase().includes(String(searchValue).toLowerCase());
//   };

//   // Search + COLUMN FILTERS + sort + pagination
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();

//     // 1) global search (optional)
//     const base = q
//       ? roles.filter((r) =>
//           [r.roleCode, r.roleName].some((x) =>
//             String(x || "")
//               .toLowerCase()
//               .includes(q)
//           )
//         )
//       : roles;

//     // 2) per-column filters (all must match)
//     const withColFilters = base.filter((r) => {
//       const f = columnFilters;
//       if (f.code && !includesCI(r.roleCode, f.code)) return false;
//       if (f.description && !includesCI(r.roleName, f.description)) return false;

//       // select filters: exact match when a value is chosen
//       if (f.active && String(r.active ?? "") !== String(f.active)) return false;

//       return true;
//     });

//     // 3) sort
//     const factor = sortDir === "asc" ? 1 : -1;
//     return [...withColFilters].sort((a, b) => {
//       const A = String(a?.[sortBy] ?? "");
//       const B = String(b?.[sortBy] ?? "");
//       return A.localeCompare(B) * factor;
//     });
//   }, [roles, query, columnFilters, sortBy, sortDir]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
//   const pageRows = useMemo(() => {
//     const start = (page - 1) * pageSize;
//     return filtered.slice(start, start + pageSize);
//   }, [filtered, page, pageSize]);

//   const fetchUsers = async () => {
//     setUsersLoading(true);
//     try {
//       const response = await apiClient.get("/load", {params: { Status: "ActiveRegular" }});
//       console.log("Raw API response:", response);

//       const { data } = response;

//       // Safely extract and parse the user data
//       let userData = [];
//       if (Array.isArray(data?.data) && data.data[0]?.result) {
//         try {
//           // Handle both string JSON and already parsed JSON objects
//           const resultData = typeof data.data[0].result === 'string' 
//             ? JSON.parse(data.data[0].result)
//             : data.data[0].result;

//           if (Array.isArray(resultData)) {
//             userData = resultData.filter(u => u.userCode || u.userName || u.userType);
//           } else {
//             console.warn("Result data is not an array:", resultData);
//           }
//         } catch (parseError) {
//           console.error("Error parsing user data:", parseError);
//         }
//       } else {
//         console.warn("Unexpected API response structure:", data);
//       }

//       console.log("Processed user data:", userData);
//       setUsers(userData);

//       if (userData.length === 0) {
//         await useSwalInfoAlert("No Users", "No active users found in the system.");
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       setUsers([]);
//       await useSwalErrorAlert("Error", "Failed to load users: " + (error.response?.data?.message || error.message || "Unknown error"));
//     } finally {
//       setUsersLoading(false);
//     }
//   };

//   // Add function to fetch existing user-role relationships
//   const fetchUserRoles = async () => {
//     try {
//       const { data } = await apiClient.get("/getUserRoles");
//       const userRoleData = Array.isArray(data?.data) && data.data[0]?.result
//         ? JSON.parse(data.data[0].result)
//         : [];

//       // Create a Set of "userCode-roleCode" combinations that are already applied
//       const appliedCombinations = new Set();
//       userRoleData.forEach(ur => {
//         appliedCombinations.add(`${ur.userCode}-${ur.roleCode}`);
//       });

//       setAppliedUserRoles(appliedCombinations);
//     } catch (error) {
//       console.error("Error fetching user roles:", error);
//       setAppliedUserRoles(new Set());
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "roleUserMatch" || activeTab === "userAccess") {
//       fetchUsers();
//       if (activeTab === "roleUserMatch") {
//         fetchUserRoles();
//       }
//     }
//   }, [activeTab]);

// const handleSaveRole = async () => {
//   setSaving(true);
//   if (!roleCode || !roleName) {
//     await useSwalErrorAlert("Error!", "Please fill out Role Code and Description.");
//     setSaving(false);
//     return;
//   }
//   try {
//     // Log the payload for debugging
//     const payload = {
//       roleCode: roleCode,
//       roleName: roleName,
//       active: active || "Y",
//       userCode: user.USER_CODE
//     };
//     console.log("Sending role payload:", payload);

//     // Match the structure with your other API calls using json_data.json_data nesting
//     const { data: res } = await apiClient.post("/upsertRole", { 
//       json_data: { json_data: payload } 
//     });

//     console.log("API response:", res);

//     if (res.data?.status === "success") {
//       await useSwalSuccessAlert("Success!", "Role saved successfully!");
//       await fetchRoles();
//       resetForm();
//       setIsEditing(false);
//     } else {
//       await useSwalErrorAlert("Error!", res.data?.message || "Something went wrong.");
//     }
//   } catch (e) {
//     console.error("Error saving role:", e);
//     await useSwalErrorAlert(
//       "Error!", 
//       e?.response?.data?.message || "Error saving role. Please check the console for details."
//     );
//   } finally {
//     setSaving(false);
//   }
// };

//   const handleSaveAccess = async () => {
//     if (selectedModules.length === 0) {
//       useSwalWarningAlert("No Modules Selected", "Please select at least one module to save access rights.");
//       return;
//     }

//     try {
//       // You'll need to implement this API call based on your backend
//       const payload = {
//         users: selectedUsers,
//         modules: selectedModules
//       };

//       // Placeholder for the actual API call
//       // const { data: res } = await apiClient.post("/saveUserAccess", payload);

//       // For now, just show success
//       await useSwalSuccessAlert("Success!", "User access rights saved successfully!");

//     } catch (error) {
//       console.error("Error saving user access:", error);
//       await useSwalErrorAlert("Error!", "Failed to save user access rights.");
//     }
//   };

//   // Delete Role - Using behavior.js utilities
//   const handleDeleteRole = async (index) => {
//     const r = roles[index];
//     if (!r?.roleCode) return;

//     const confirm = await useSwalDeleteConfirm(
//       "Delete this role?",
//       `Code: ${r.roleCode} | Description: ${r.roleName || ""}`,
//       "Yes, delete it"
//     );

//     if (!confirm.isConfirmed) return;

//     try {
//       const { data: response } = await apiClient.post("/deleteRole", { ROLE_CODE: r.roleCode });

//       if (response.data.status === "success") {
//         await useSwalDeleteSuccess();
//         await fetchRoles();  // <- rely ONLY on server data
//       } else {
//         await useSwalErrorAlert("Error", response.data.message || "Failed to delete role.");
//       }
//     } catch (error) {
//       console.error("Delete error:", error);
//       await useSwalErrorAlert("Error", "Failed to delete role.");
//     }
//   };

//   const resetForm = () => {
//     setRoleCode("");
//     setRoleName("");
//     setRoleActive("Y");
//     setEditingRole(null);
//     setIsEditing(false);
//   };

//   // Start editing a role
//   const handleEditRow = (index) => {
//     const role = roles[index];
//     setRoleCode(role.roleCode);
//     setRoleName(role.roleName);
//     setRoleActive(role.active);
//     setEditingRole(role);
//     setIsEditing(true);
//   };

//   // Start new role
//   const startNew = () => {
//     resetForm();
//     setIsEditing(true);
//   };

//   // Exports - Using behavior.js utilities
//   const handleExport = (type) => {
//     if (!roles.length) {
//       useSwalInfoAlert("No data", "There is no data to export.");
//       return;
//     }

//     const headers = ["Code", "Description", "Active"];
//     const rows = roles.map((role) => [
//       role.roleCode || "",
//       role.roleName || "",
//       role.active || "",
//     ]);

//     if (type === "csv" || type === "excel") {
//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
//       XLSX.utils.book_append_sheet(wb, ws, "User Roles");
//       if (type === "csv") {
//         XLSX.writeFile(wb, "user_roles.csv", { bookType: "csv" });
//       } else {
//         XLSX.writeFile(wb, "user_roles.xlsx", { bookType: "xlsx" });
//       }
//     } else if (type === "pdf") {
//       const doc = new jsPDF({
//         orientation: "landscape",
//         unit: "pt",
//         format: "A4",
//       });
//       doc.setFontSize(15);
//       doc.text("User Roles", 40, 40);
//       autoTable(doc, {
//         head: [headers],
//         body: rows,
//         startY: 60,
//         margin: { top: 50 },
//         theme: "grid",
//         styles: {
//           fontSize: 8,
//           textColor: [40, 40, 40],
//           lineColor: [60, 60, 60],
//           lineWidth: 0.1,
//         },
//         headStyles: {
//           fillColor: [0, 0, 128],
//           textColor: [255, 255, 255],
//           fontStyle: "bold",
//           halign: "center",
//         },
//       });
//       doc.save("user_roles.pdf");
//     }
//     setOpenExport(false);
//   };

//   // Guides
//   const handlePDFGuide = () => {
//     if (pdfLink) window.open(pdfLink, "_blank");
//     setOpenGuide(false);
//   };

//   const handleVideoGuide = () => {
//     if (videoLink) window.open(videoLink, "_blank");
//     setOpenGuide(false);
//   };

//   // Using behavior.js utilities for other functions
//   const handleViewRole = () => {
//     if (selectedUsers.length === 0) {
//       useSwalWarningAlert("No Users Selected", "Please select at least one user before viewing roles.");
//       return;
//     }
//     setViewingRoles(true);
//   };

//   const handleResetUserRoleMatching = () => {
//     setSelectedUsers([]);
//     setSelectedRoles([]);
//     setViewingRoles(false);
//   };

//   // Modified handleApplyRoles function to handle both adding and removing roles
//   const handleApplyRoles = async () => {
//     if (selectedRoles.length === 0) {
//       useSwalWarningAlert("No Roles Selected", "Please select at least one role to apply.");
//       return;
//     }

//     try { 
//       const payload = {
//         dt1: selectedRoles.map((code) => ({
//               roleCode: code || "",
//         })),
//         dt2: selectedUsers.map((code) => ({
//             userCode: code
//           }))
//       };

//       const { data: res } = await apiClient.post("/UpsertUserRole", { json_data: {json_data : payload}});
//       if (res.data?.status === "success") {
//         await useSwalSuccessAlert("Success!", "Users-Role saved successfully!");

//         // Update appliedUserRoles state to persist checkboxes
//         const newAppliedCombinations = new Set(appliedUserRoles);
//         selectedUsers.forEach(userCode => {
//           selectedRoles.forEach(roleCode => {
//             newAppliedCombinations.add(`${userCode}-${roleCode}`);
//           });
//         });
//         setAppliedUserRoles(newAppliedCombinations);
//       } else {
//         await useSwalErrorAlert("Error!", res.data?.message || "Something went wrong.");
//       }
//     } catch (e) {
//       console.error(e);
//       await useSwalErrorAlert("Error!", e?.response?.data?.message || "Error saving role.");
//     }
//   };

//   const handleRemoveRole = async (userCode, roleCode) => {
//     try {
//       console.log(`Removing role ${roleCode} from user ${userCode}`);

//       // Create a more explicit delete operation payload
//       const payload = {
//         operation: "DELETE",
//         userCode: userCode,
//         roleCode: roleCode,
//         dt1: [{ roleCode: roleCode }],
//         dt2: [{ userCode: userCode }]
//       };

//       console.log("Delete payload:", payload);

//       const { data: res } = await apiClient.post("/UpsertUserRole", { 
//         json_data: { json_data: payload } 
//       });

//       console.log("Delete response:", res);

//       if (res.data?.status === "success") {
//         // Update appliedUserRoles state immediately
//         setAppliedUserRoles(prev => {
//           const newSet = new Set(prev);
//           newSet.delete(`${userCode}-${roleCode}`);
//           return newSet;
//         });

//         await useSwalSuccessAlert("Success!", `Role "${roleCode}" removed from user successfully!`);

//         // Refresh the user-role relationships from server
//         await fetchUserRoles();
//       } else {
//         await useSwalErrorAlert("Error!", res.data?.message || "Failed to remove role from user.");
//       }
//     } catch (error) {
//       console.error("Error removing role:", error);
//       await useSwalErrorAlert("Error!", "Failed to remove role from user: " + 
//         (error.response?.data?.message || error.message || "Unknown error"));
//     }
//   };

//   // Define the tabs structure
//   const tabs = [
//     { id: "userRoles", label: "User Roles", icon: faUsers, color: "blue" },
//     {
//       id: "roleUserMatch",
//       label: "Role-User Matching",
//       icon: faUserShield,
//       color: "green",
//     },
//     {
//       id: "roleAccess",
//       label: "Role Access Rights",
//       icon: faShield,
//       color: "purple",
//     },
//     {
//       id: "userAccess",
//       label: "User Access Rights",
//       icon: faKey,
//       color: "orange",
//     },
//   ];

//   // Render appropriate action buttons based on active tab
//   const renderActionButtons = () => {
//     switch (activeTab) {
//       case "userRoles":
//         return (
//           <>
//             <button
//               onClick={startNew}
//               className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
//             >
//               <FontAwesomeIcon icon={faPlus} /> Add
//             </button>
//             <button
//               onClick={handleSaveRole}
//               className={`bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 ${!isEditing || saving ? "opacity-50 cursor-not-allowed" : ""}`}
//               disabled={!isEditing || saving}
//               title="Ctrl+S to Save"
//             >
//               <FontAwesomeIcon icon={faSave} /> Save
//             </button>
//             <button
//               onClick={resetForm}
//               className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
//               disabled={saving}
//             >
//               <FontAwesomeIcon icon={faUndo} /> Reset
//             </button>
//           </>
//         );
//       case "roleUserMatch":
//         return (
//           <>
//             <button
//               className={`${
//                 viewingRoles
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-purple-600"
//               } text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700`}
//               onClick={handleViewRole}
//               disabled={viewingRoles}
//             >
//               <FontAwesomeIcon icon={faEye} /> View Role
//             </button>
//             <button
//               className="bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
//               onClick={handleResetUserRoleMatching}
//             >
//               <FontAwesomeIcon icon={faUndo} /> Reset
//             </button>
//             <button
//               className={`${
//                 !viewingRoles
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-blue-600"
//               } text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700`}
//               onClick={handleApplyRoles}
//               disabled={!viewingRoles}
//             >
//               <FontAwesomeIcon icon={faCheck} /> Apply
//             </button>
//           </>
//         );
//       case "roleAccess":
//         return (
//           <>
//             <button
//               className={`${
//                 selectedRoles.length === 0
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-blue-600"
//               } text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700`}
//               onClick={() => {
//                 if (selectedRoles.length > 0) {
//                   setShowModules(true);
//                   setSelectedModules([]);
//                 }
//               }}
//               disabled={selectedRoles.length === 0}
//             >
//               <FontAwesomeIcon icon={faEye} /> View Modules
//             </button>
//             <button
//               className="bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
//               onClick={() => {
//                 setSelectedRoles([]);
//                 setShowModules(false);
//                 setSelectedModules([]);
//               }}
//             >
//               <FontAwesomeIcon icon={faUndo} /> Reset
//             </button>
//             <button
//               className={`${
//                 !showModules || selectedModules.length === 0
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-green-600"
//               } text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700`}
//               disabled={!showModules || selectedModules.length === 0}
//             >
//               <FontAwesomeIcon icon={faSave} /> Save Access
//             </button>
//           </>
//         );
//       case "userAccess":
//         return (
//           <>
//             <button
//               className={`${
//                 selectedUsers.length === 0
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-blue-600"
//               } text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700`}
//               onClick={() => {
//                 if (selectedUsers.length > 0) {
//                   setShowModules(true);
//                   setSelectedModules([]);
//                 }
//               }}
//               disabled={selectedUsers.length === 0}
//             >
//               <FontAwesomeIcon icon={faEye} /> View Rights
//             </button>
//             <button
//               className="bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
//               onClick={() => {
//                 setSelectedUsers([]);
//                 setShowModules(false);
//                 setSelectedModules([]);
//               }}
//             >
//               <FontAwesomeIcon icon={faUndo} /> Reset
//             </button>
//             <button
//               className={`${
//                 !showModules || selectedModules.length === 0
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-green-600"
//               } text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700`}
//               disabled={!showModules || selectedModules.length === 0}
//               onClick={handleSaveAccess}
//             >
//               <FontAwesomeIcon icon={faCheck} /> Apply
//             </button>
//           </>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="global-ref-main-div-ui mt-24">
//       {(loading || saving) && <LoadingSpinner />}

//       {/* Header with Tabs */}
//       <div className="fixed mt-4 top-14 left-6 right-6 z-30 global-ref-header-ui flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//         <div className="flex items-center gap-3 w-full sm:w-auto">
//           <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
//         </div>

//         {/* Tab Navigation in Header */}
//         <div className="flex overflow-x-auto scrollbar-hide">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center px-3 py-2 rounded-md text-xs md:text-sm font-bold transition-colors duration-200 group mr-1
//           ${activeTab === tab.id
//               ? `bg-${tab.color}-100 text-${tab.color}-700 dark:bg-${tab.color}-900 dark:text-${tab.color}-300`
//               : 'text-gray-600 hover:bg-gray-100 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-300'
//           }`}
//             >
//               <FontAwesomeIcon icon={tab.icon} className="w-4 h-4 mr-2" />
//               <span className="group-hover:block whitespace-nowrap">{tab.label}</span>
//             </button>
//           ))}
//         </div>

//         <div className="flex gap-2 justify-center text-xs">
//           {/* Dynamic action buttons based on active tab */}
//           {renderActionButtons()}

//           {/* Common buttons across all tabs */}
//           <div ref={exportRef} className="relative">
//             <button
//               onClick={() => setOpenExport((v) => !v)}
//               className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
//             >
//               <FontAwesomeIcon icon={faPrint} /> Export <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
//             </button>
//             {isOpenExport && (
//               <div className="absolute right-0 mt-1 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black/10 z-[60] dark:bg-gray-800">
//                 <button
//                   onClick={() => { handleExport("csv"); setOpenExport(false); }}
//                   className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
//                 >
//                   <FontAwesomeIcon icon={faFileCsv} className="mr-2 text-green-600" /> CSV
//                 </button>
//                 <button
//                   onClick={() => { handleExport("excel"); setOpenExport(false); }}
//                   className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
//                 >
//                   <FontAwesomeIcon icon={faFileExcel} className="mr-2 text-green-600" /> Excel
//                 </button>
//                 <button
//                   onClick={() => { handleExport("pdf"); setOpenExport(false); }}
//                   className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
//                 >
//                   <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" /> PDF
//                 </button>
//               </div>
//             )}
//           </div>

//           <div ref={guideRef} className="relative">
//             <button
//               onClick={() => setOpenGuide((v) => !v)}
//               className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
//             >
//               <FontAwesomeIcon icon={faInfoCircle} /> Help <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
//             </button>
//             {isOpenGuide && (
//               <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black/10 z-[60] dark:bg-gray-800">
//                 <button
//                   onClick={() => { handlePDFGuide(); setOpenGuide(false); }}
//                   className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
//                 >
//                   <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" /> User Guide
//                 </button>
//                 <button
//                   onClick={() => { handleVideoGuide(); setOpenGuide(false); }}
//                   className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
//                 >
//                   <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-600" /> Video Guide
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="global-tran-tab-div-ui mt-5">
//         {activeTab === "userRoles" && (
//           <div className="w-full">
//             {/* Two Columns Side by Side */}
//             <div className="flex flex-col md:flex-row gap-6">
//               {/* Form Column */}
//               <div className="w-full md:w-1/3">
//                 <div className="global-ref-textbox-group-div-ui">
//                   {/* Role Code */}
//                   <div className="relative">
//                     <input
//                       type="text"
//                       id="roleCode"
//                       placeholder=" "
//                       value={roleCode}
//                       onChange={(e) => setRoleCode(e.target.value.toUpperCase())}
//                       disabled={!isEditing || isEditingExisting}
//                       className={`peer global-ref-textbox-ui ${
//                         isEditing && !isEditingExisting ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"
//                       } ${isEditingExisting ? 'bg-blue-100 cursor-not-allowed' : ''}`}
//                     />
//                     <label htmlFor="roleCode" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
//                       <span className="global-ref-asterisk-ui">*</span> Role Code
//                     </label>
//                   </div>

//                   {/* Role Name */}
//                   <div className="relative">
//                     <input
//                       type="text"
//                       id="roleName"
//                       placeholder=" "
//                       value={roleName}
//                       onChange={(e) => setRoleName(e.target.value)}
//                       disabled={!isEditing}
//                       className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
//                     />
//                     <label htmlFor="roleName" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
//                       <span className="global-ref-asterisk-ui">*</span> Role Name
//                     </label>
//                   </div>

//                   {/* Active */}
//                   <div className="relative">
//                     <select
//                       id="active"
//                       value={active}
//                       onChange={(e) => setRoleActive(e.target.value)}
//                       disabled={!isEditing}
//                       className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
//                     >
//                       <option value="Y">Yes</option>
//                       <option value="N">No</option>
//                     </select>
//                     <label htmlFor="active" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>Active?</label>
//                     <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
//                       <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Roles Table */}
//               <div className="w-full md:w-2/3">
//                 <div className="global-ref-table-main-div-ui">
//                   <div className="global-ref-table-main-sub-div-ui">
//                     <div className="global-ref-table-div-ui">
//                       <table className="global-ref-table-div-ui">
//                         <thead className="global-ref-thead-div-ui">
//                           <tr>
//                             <th className="global-ref-th-ui">Role Code</th>
//                             <th className="global-ref-th-ui">Role Name</th>
//                             <th className="global-ref-th-ui">Status</th>
//                             <th className="global-ref-th-ui">Edit</th>
//                             <th className="global-ref-th-ui">Delete</th>
//                           </tr>
//                           {/* Filter row */}
//                           <tr>
//                             <th className="global-ref-th-ui">
//                               <input
//                                 className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
//                                 placeholder="Filter…"
//                                 value={columnFilters.code}
//                                 onChange={(e) => { setColumnFilters(s => ({ ...s, code: e.target.value })); setPage(1); }}
//                               />
//                             </th>
//                             <th className="global-ref-th-ui">
//                               <input
//                                 className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
//                                 placeholder="Filter…"
//                                 value={columnFilters.description}
//                                 onChange={(e) => { setColumnFilters(s => ({ ...s, description: e.target.value })); setPage(1); }}
//                               />
//                             </th>
//                             <th className="global-ref-th-ui">
//                               <select
//                                 className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
//                                 value={columnFilters.active}
//                                 onChange={(e) => { setColumnFilters(s => ({ ...s, active: e.target.value })); setPage(1); }}
//                               >
//                                 <option value="">All</option>
//                                 <option value="Y">Yes</option>
//                                 <option value="N">No</option>
//                               </select>
//                             </th>
//                             <th className="global-ref-th-ui"></th>
//                             <th className="global-ref-th-ui"></th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {roles.length > 0 ? (
//                             roles.map((role, index) => (
//                               <tr
//                                 key={index}
//                                 className={`global-tran-tr-ui ${editingRole?.roleCode === role.roleCode ? 'bg-blue-50' : ''}`}
//                                 onClick={() => handleEditRow(index)}
//                               >
//                                 <td className="global-ref-td-ui">{role.roleCode}</td>
//                                 <td className="global-ref-td-ui">{role.roleName || "-"}</td>
//                                 <td className="global-ref-td-ui text-center">
//                                   <span
//                                     className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
//                                       role.active === "Y"
//                                         ? "bg-green-100 text-green-800"
//                                         : "bg-red-100 text-red-800"
//                                     }`}
//                                   >
//                                     {role.active === "Y" ? "Yes" : "No"}
//                                   </span>
//                                 </td>
//                                 <td className="global-ref-td-ui text-center sticky right-10">
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleEditRow(index);
//                                     }}
//                                     className="global-ref-td-button-edit-ui"
//                                   >
//                                     <FontAwesomeIcon icon={faEdit} />
//                                   </button>
//                                 </td>
//                                 <td className="global-ref-td-ui text-center sticky right-0">
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleDeleteRole(index);
//                                     }}
//                                     className="global-ref-td-button-delete-ui"
//                                   >
//                                     <FontAwesomeIcon icon={faTrashAlt} />
//                                   </button>
//                                 </td>
//                               </tr>
//                             ))
//                            ) : (
//                             <tr>
//                               <td colSpan="5" className="global-ref-norecords-ui">
//                                 No User Roles found
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>

//                       {/* Pagination */}
//                       <div className="flex items-center justify-between p-3">
//                         <div className="text-xs opacity-80 font-semibold">
//                           Total Records: {filtered.length}
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <select
//                             className="px-7 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
//                             value={pageSize}
//                             onChange={(e) => {
//                               setPageSize(Number(e.target.value));
//                               setPage(1);
//                             }}
//                           >
//                             {[10, 20, 50, 100].map((n) => (
//                               <option key={n} value={n}>
//                                 {n}/page
//                               </option>
//                             ))}
//                           </select>
//                           <div className="text-xs opacity-80 font-semibold">
//                             Page {page} of {totalPages}
//                           </div>
//                           <button
//                             disabled={page <= 1}
//                             onClick={() => setPage((p) => Math.max(1, p - 1))}
//                             className="px-7 py-2 text-xs font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
//                           >
//                             Prev
//                           </button>
//                           <button
//                             disabled={page >= totalPages}
//                             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                             className="px-7 py-2 text-xs font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
//                           >
//                             Next
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "roleUserMatch" && (
//           <div className="w-full">
//             {/* Two Tables Side by Side */}
//             <div className="flex flex-col md:flex-row gap-6">
//               {/* Users Table */}
//               <div className="w-full md:w-1/2">
//                 <h2 className="text-lg font-semibold mb-2 text-gray-700">Users</h2>
//                 <div className="global-ref-table-main-div-ui">
//                   <div className="global-ref-table-main-sub-div-ui">
//                     <div className="global-ref-table-div-ui">
//                       <table className="global-ref-table-div-ui">
//                         <thead className="global-ref-thead-div-ui">
//                           <tr>
//                             <th className="global-ref-th-ui">User Code</th>
//                             <th className="global-ref-th-ui">Username</th>
//                             <th className="global-ref-th-ui text-center">Select</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {usersLoading ? (
//                             <tr>
//                               <td colSpan="3" className="global-ref-norecords-ui">
//                                 <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
//                                 Loading users...
//                               </td>
//                             </tr>
//                           ) : users.length === 0 ? (
//                             <tr>
//                               <td colSpan="3" className="global-ref-norecords-ui">
//                                 No users found
//                               </td>
//                             </tr>
//                           ) : (
//                             users.map((user, index) => (
//                               <tr
//                                 key={user.userCode || index}
//                                 className="global-tran-tr-ui"
//                               >
//                                 <td className="global-ref-td-ui">{user.userCode}</td>
//                                 <td className="global-ref-td-ui">{user.userName}</td>
//                                 <td className="global-ref-td-ui text-center">
//                                   <input
//                                     type="checkbox"
//                                     className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                     checked={selectedUsers.includes(user.userCode)}
//                                     onChange={() => {
//                                       if (viewingRoles) return;
//                                       setSelectedUsers((prev) =>
//                                         prev.includes(user.userCode)
//                                           ? prev.filter((id) => id !== user.userCode)
//                                           : [...prev, user.userCode]
//                                       );
//                                     }}
//                                     disabled={viewingRoles}
//                                   />
//                                 </td>
//                               </tr>
//                             ))
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Roles Table */}
//               <div className="w-full md:w-1/2">
//                 <h2 className="text-lg font-semibold mb-2 text-gray-700">Roles</h2>
//                 <div className="global-ref-table-main-div-ui">
//                   <div className="global-ref-table-main-sub-div-ui">
//                     <div className="global-ref-table-div-ui">
//                       {viewingRoles ? (
//                         <table className="global-ref-table-div-ui">
//                           <thead className="global-ref-thead-div-ui">
//                             <tr>
//                               <th className="global-ref-th-ui">Role Code</th>
//                               <th className="global-ref-th-ui">Role Description</th>
//                               <th className="global-ref-th-ui text-center">Select</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {roles.map((role, index) => (
//                               <tr
//                                 key={index}
//                                 className="global-tran-tr-ui"
//                               >
//                                 <td className="global-ref-td-ui">{role.roleCode}</td>
//                                 <td className="global-ref-td-ui">{role.roleName}</td>
//                                 <td className="global-ref-td-ui text-center">
//                                   <input
//                                     type="checkbox"
//                                     className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                     checked={
//                                       selectedRoles.includes(role.roleCode) ||
//                                       (selectedUsers.length > 0 && 
//                                       selectedUsers.some(userCode => 
//                                         appliedUserRoles.has(`${userCode}-${role.roleCode}`)
//                                       ))
//                                     }
//                                     onChange={(e) => {
//                                       // Stop event propagation to prevent any parent handlers
//                                       e.stopPropagation();

//                                       // Check if this role is already applied to any selected users
//                                       const isAppliedToSelectedUsers = selectedUsers.some(userCode => 
//                                         appliedUserRoles.has(`${userCode}-${role.roleCode}`)
//                                       );

//                                       if (isAppliedToSelectedUsers) {
//                                         // If already applied, remove it from all selected users
//                                         const confirmRemoval = async () => {
//                                           const confirm = await useSwalDeleteConfirm(
//                                             "Remove Role?",
//                                             `Are you sure you want to remove role "${role.roleCode}" from selected user(s)?`,
//                                             "Yes, remove it"
//                                           );

//                                           if (confirm.isConfirmed) {
//                                             // Remove role from all selected users one by one
//                                             for (const userCode of selectedUsers) {
//                                               if (appliedUserRoles.has(`${userCode}-${role.roleCode}`)) {
//                                                 await handleRemoveRole(userCode, role.roleCode);
//                                               }
//                                             }
//                                           }
//                                         };
//                                         confirmRemoval();
//                                         return; // Important: return here to prevent further execution
//                                       }

//                                       // If not applied, handle normal selection
//                                       setSelectedRoles((prev) => {
//                                         if (prev.includes(role.roleCode)) {
//                                           return prev.filter(
//                                             (roleCode) => roleCode !== role.roleCode
//                                           );
//                                         } else {
//                                           // Allow selecting multiple roles
//                                           return [...prev, role.roleCode];
//                                         }
//                                       });
//                                       // Hide modules if roles selection changes
//                                       setShowModules(false);
//                                     }}
//                                   />
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       ) : (
//                         <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-lg">
//                           <FontAwesomeIcon icon={faUserShield} className="text-xl mb-2 text-gray-400" />
//                           <h3 className="font-medium text-sm mb-1">Role Selection Hidden</h3>
//                           <p className="text-xs">
//                             Please select user(s) from the users table and click "View Role" to see and assign roles
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Status Display */}
//             {selectedUsers.length > 0 && (
//               <div className="mt-4 bg-blue-50 p-2 rounded text-xs">
//                 {viewingRoles
//                   ? `Assigning roles to ${selectedUsers.length} selected user(s). Please select roles and click Apply.`
//                   : `${selectedUsers.length} user(s) selected. Click "View Role" to continue.`}
//               </div>
//             )}

//             {viewingRoles && selectedRoles.length > 0 && (
//               <div className="mt-2 bg-green-50 p-2 rounded text-xs">
//                 {`${selectedRoles.length} role(s) selected to apply.`}
//               </div>
//             )}

//             {/* Show applied relationships */}
//             {selectedUsers.length > 0 && appliedUserRoles.size > 0 && (
//               <div className="mt-2 bg-yellow-50 p-2 rounded text-xs">
//                 <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
//                 Some role-user combinations are already applied and will remain checked.
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === "roleAccess" && (
//           <div className="w-full">
//             {/* Two Tables Side by Side */}
//             <div className="flex flex-col md:flex-row gap-6">
//               {/* Roles Table */}
//               <div className="w-full md:w-1/3">
//                 <h2 className="text-lg font-semibold mb-2 text-gray-700">Roles</h2>
//                 <div className="global-ref-table-main-div-ui">
//                   <div className="global-ref-table-main-sub-div-ui">
//                     <div className="global-ref-table-div-ui">
//                       <table className="global-ref-table-div-ui">
//                         <thead className="global-ref-thead-div-ui">
//                           <tr>
//                             <th className="global-ref-th-ui">Role Code</th>
//                             <th className="global-ref-th-ui">Role Name</th>
//                             <th className="global-ref-th-ui text-center">Select</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {roles.length > 0 ? (
//                             roles.map((role, index) => (
//                               <tr
//                                 key={index}
//                                 className="global-tran-tr-ui"
//                               >
//                                 <td className="global-ref-td-ui">{role.roleCode}</td>
//                                 <td className="global-ref-td-ui">{role.roleName}</td>
//                                 <td className="global-ref-td-ui text-center">
//                                   <input
//                                     type="checkbox"
//                                     className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                     checked={selectedRoles.includes(role.roleCode)}
//                                     onChange={() => {
//                                       setSelectedRoles((prev) => {
//                                         if (prev.includes(role.roleCode)) {
//                                           return prev.filter(
//                                             (roleCode) => roleCode !== role.roleCode
//                                           );
//                                         } else {
//                                           return [...prev, role.roleCode];
//                                         }
//                                       });
//                                       // Hide modules if roles selection changes
//                                       setShowModules(false);
//                                     }}
//                                   />
//                                 </td>
//                               </tr>
//                             ))
//                           ) : (
//                             <tr>
//                               <td colSpan="3" className="global-ref-norecords-ui">
//                                 No roles found
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Module-Particular-Access Table */}
//               <div className="w-full md:w-2/3">
//                 <h2 className="text-lg font-semibold mb-2 text-gray-700">Modules & Access Rights</h2>
//                 <div className="global-ref-table-main-div-ui">
//                   <div className="global-ref-table-main-sub-div-ui">
//                     <div className="global-ref-table-div-ui">
//                       <table className="global-ref-table-div-ui">
//                         <thead className="global-ref-thead-div-ui">
//                           <tr>
//                             <th className="global-ref-th-ui">Module</th>
//                             <th className="global-ref-th-ui">Particular</th>
//                             <th className="global-ref-th-ui text-center">Access</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {showModules ? (
//                             [
//                               { id: 1, module: "GL", particular: "General Ledger" },
//                               { id: 2, module: "GL", particular: "Accounts Payable" },
//                               { id: 3, module: "GL", particular: "Accounts Receivable" },
//                               { id: 4, module: "GL", particular: "Fixed Assets" },
//                               { id: 5, module: "GL", particular: "Inventory" },
//                               { id: 6, module: "GL", particular: "Banking" },
//                               { id: 7, module: "HR", particular: "Employee Management" },
//                               { id: 8, module: "HR", particular: "Attendance" },
//                               { id: 9, module: "HR", particular: "Payroll" },
//                               { id: 10, module: "SYS", particular: "System Settings" },
//                             ].map((item, index) => (
//                               <tr
//                                 key={index}
//                                 className="global-tran-tr-ui"
//                               >
//                                 <td className="global-ref-td-ui">{item.module}</td>
//                                 <td className="global-ref-td-ui">{item.particular}</td>
//                                 <td className="global-ref-td-ui text-center">
//                                   <input
//                                     type="checkbox"
//                                     className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                     checked={selectedModules.includes(item.id)}
//                                     onChange={() => {
//                                       setSelectedModules((prev) => {
//                                         if (prev.includes(item.id)) {
//                                           return prev.filter((id) => id !== item.id);
//                                         } else {
//                                           return [...prev, item.id];
//                                         }
//                                       });
//                                     }}
//                                   />
//                                 </td>
//                               </tr>
//                             ))
//                           ) : (
//                             <tr>
//                               <td colSpan="3" className="global-ref-norecords-ui">
//                                 <FontAwesomeIcon icon={faEye} className="mr-2" />
//                                 Select role(s) and click "View Modules" to see available modules
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Status Display */}
//             {selectedRoles.length > 0 && (
//               <div className="mt-4 bg-blue-50 p-2 rounded text-xs">
//                 {selectedRoles.length === 1
//                   ? `Selected role: ${selectedRoles[0]}`
//                   : `Selected roles: ${selectedRoles.join(", ")}`}
//               </div>
//             )}

//             {showModules && selectedModules.length > 0 && (
//               <div className="mt-2 bg-green-50 p-2 rounded text-xs">
//                 {`${selectedModules.length} module(s)/particular(s) selected for access rights configuration.`}
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === "userAccess" && (
//           <div className="w-full">
//             {/* Two Tables Side by Side */}
//             <div className="flex flex-col md:flex-row gap-6">
//               {/* Users Table */}
//               <div className="w-full md:w-1/3">
//                 <h2 className="text-lg font-semibold mb-2 text-gray-700">Users</h2>
//                 <div className="global-ref-table-main-div-ui">
//                   <div className="global-ref-table-main-sub-div-ui">
//                     <div className="global-ref-table-div-ui">
//                       <table className="global-ref-table-div-ui">
//                         <thead className="global-ref-thead-div-ui">
//                           <tr>
//                             <th className="global-ref-th-ui">User Type</th>
//                             <th className="global-ref-th-ui">User Code</th>
//                             <th className="global-ref-th-ui">Username</th>
//                             <th className="global-ref-th-ui text-center">Select</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {users.map((user, index) => (
//                             <tr
//                               key={index}
//                               className="global-tran-tr-ui"
//                             >
//                               <td className="global-ref-td-ui">{user.userType}</td>
//                               <td className="global-ref-td-ui">{user.userCode}</td>
//                               <td className="global-ref-td-ui">{user.userName}</td>
//                               <td className="global-ref-td-ui text-center">
//                                 <input
//                                   type="checkbox"
//                                   className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                   checked={selectedUsers.includes(user.userCode)}
//                                   onChange={() => {
//                                     setSelectedUsers((prev) =>
//                                       prev.includes(user.userCode)
//                                         ? prev.filter((id) => id !== user.userCode)
//                                         : [...prev, user.userCode]
//                                     );
//                                     setShowModules(false);
//                                   }}
//                                 />
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Module-Particular-Access Table */}
//               <div className="w-full md:w-2/3">
//                 <h2 className="text-lg font-semibold mb-2 text-gray-700">Modules & Access Rights</h2>
//                 <div className="global-ref-table-main-div-ui">
//                   <div className="global-ref-table-main-sub-div-ui">
//                     <div className="global-ref-table-div-ui">
//                       <table className="global-ref-table-div-ui">
//                         <thead className="global-ref-thead-div-ui">
//                           <tr>
//                             <th className="global-ref-th-ui">Module</th>
//                             <th className="global-ref-th-ui">Particular</th>
//                             <th className="global-ref-th-ui text-center">Access</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {showModules ? (
//                             [
//                               { id: 1, module: "GL", particular: "General Ledger" },
//                               { id: 2, module: "GL", particular: "Accounts Payable" },
//                               { id: 3, module: "GL", particular: "Accounts Receivable" },
//                               { id: 4, module: "GL", particular: "Fixed Assets" },
//                               { id: 5, module: "GL", particular: "Inventory" },
//                               { id: 6, module: "GL", particular: "Banking" },
//                               { id: 7, module: "HR", particular: "Employee Management" },
//                               { id: 8, module: "HR", particular: "Attendance" },
//                               { id: 9, module: "HR", particular: "Payroll" },
//                               { id: 10, module: "SYS", particular: "System Settings" },
//                             ].map((item, index) => (
//                               <tr
//                                 key={index}
//                                 className="global-tran-tr-ui"
//                               >
//                                 <td className="global-ref-td-ui">{item.module}</td>
//                                 <td className="global-ref-td-ui">{item.particular}</td>
//                                 <td className="global-ref-td-ui text-center">
//                                   <input
//                                     type="checkbox"
//                                     className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                     checked={selectedModules.includes(item.id)}
//                                     onChange={() => {
//                                       setSelectedModules((prev) => {
//                                         if (prev.includes(item.id)) {
//                                           return prev.filter((id) => id !== item.id);
//                                         } else {
//                                           return [...prev, item.id];
//                                         }
//                                       });
//                                     }}
//                                   />
//                                 </td>
//                               </tr>
//                             ))
//                           ) : (
//                             <tr>
//                               <td colSpan="3" className="global-ref-norecords-ui">
//                                 <FontAwesomeIcon icon={faEye} className="mr-2" />
//                                 Select role(s) and click "View Modules" to see available modules
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Status Display */}
//             {selectedRoles.length > 0 && (
//               <div className="mt-4 bg-blue-50 p-2 rounded text-xs">
//                 {selectedRoles.length === 1
//                   ? `Selected role: ${selectedRoles[0]}`
//                   : `Selected roles: ${selectedRoles.join(", ")}`}
//               </div>
//             )}

//             {showModules && selectedModules.length > 0 && (
//               <div className="mt-2 bg-green-50 p-2 rounded text-xs">
//                 {`${selectedModules.length} module(s)/particular(s) selected for access rights configuration.`}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserAccessRights;

import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/NAYSA Cloud/Configuration/BaseURL.jsx";
import { useAuth } from "@/NAYSA Cloud/Authentication/AuthContext.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faPrint, faChevronDown, faInfoCircle,
  faFileCsv, faFileExcel, faFilePdf, faVideo, faSave, faUndo, faUsers, faShield, faKey,
  faUserShield, faCheck, faEye
} from "@fortawesome/free-solid-svg-icons";

// Global
import { useReset } from "../Components/ResetContext";
import {
  reftables,
  reftablesPDFGuide,
  reftablesVideoGuide,
} from "@/NAYSA Cloud/Global/reftable";

// Import SweetAlert utilities from behavior.js
import {
  useSwalInfoAlert,
} from "@/NAYSA Cloud/Global/behavior";

// Exports
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Import tab components
import UsersTab from "./UserAccessRightsTabs/UsersTab";
import RolesTab from "./UserAccessRightsTabs/RolesTab";
import RoleAccessTab from "./UserAccessRightsTabs/RoleAccessTab";
import UserRoleTab from "./UserAccessRightsTabs/UserRoleTab";

const UserAccessRights = () => {
  const docType = "UserAccRight";
  const { user } = useAuth();
  const documentTitle = reftables[docType];
  const pdfLink = reftablesPDFGuide[docType];
  const videoLink = reftablesVideoGuide[docType];
  const [activeTab, setActiveTab] = useState("userRoles");

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [appliedUserRoles, setAppliedUserRoles] = useState(new Set());

  // UX state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOpenExport, setOpenExport] = useState(false);
  const [isOpenGuide, setOpenGuide] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  // Refs for click-away
  const exportRef = useRef(null);
  const guideRef = useRef(null);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-xl">
        {saving ? "Saving…" : "Loading…"}
      </div>
    </div>
  );

  // Fetch roles 
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/role");
      const roleData =
        Array.isArray(data?.data) && data.data[0]?.result
          ? JSON.parse(data.data[0].result)
          : [];
      setRoles(roleData);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/load", { params: { Status: "ActiveRegular" } });
      const { data } = response;

      let userData = [];
      if (Array.isArray(data?.data) && data.data[0]?.result) {
        try {
          const resultData = typeof data.data[0].result === 'string'
            ? JSON.parse(data.data[0].result)
            : data.data[0].result;

          if (Array.isArray(resultData)) {
            userData = resultData.filter(u => u.userCode || u.userName || u.userType);
          }
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
        }
      }

      setUsers(userData);

      if (userData.length === 0) {
        await useSwalInfoAlert("No Users", "No active users found in the system.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async (userCodes) => {
    try {
      const { data } = await apiClient.post('/getUserRoles', {
        json_data: { users: userCodes },
      });

      const rows = data?.data ?? [];
      // Accept USER_CODE/ROLE_CODE or user_code/role_code
      const s = new Set(
        rows
          .map(r => {
            const u = r.USER_CODE ?? r.user_code ?? r.userCode;
            const rc = r.ROLE_CODE ?? r.role_code ?? r.roleCode;
            return (u && rc) ? `${u}-${rc}` : null;
          })
          .filter(Boolean)
      );

      setAppliedUserRoles(s); // <- the Set your RolesTab consumes
    } catch (e) {
      console.error('fetchUserRoles failed', e);
    }
  };


  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (activeTab === "roleUserMatch" || activeTab === "userAccess") {
      fetchUsers();
      if (activeTab === "roleUserMatch") {
        fetchUserRoles();
      }
    }
  }, [activeTab]);

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

  // Exports
  const handleExport = (type) => {
    if (!roles.length) {
      useSwalInfoAlert("No data", "There is no data to export.");
      return;
    }

    const headers = ["Code", "Description", "Active"];
    const rows = roles.map((role) => [
      role.roleCode || "",
      role.roleName || "",
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

  // Define the tabs structure
  const tabs = [
    { id: "userRoles", label: "User Roles", icon: faUsers, color: "blue" },
    { id: "roleUserMatch", label: "Role-User Matching", icon: faUserShield, color: "green" },
    { id: "roleAccess", label: "Role Access Rights", icon: faShield, color: "purple" },
    { id: "userAccess", label: "User Access Rights", icon: faKey, color: "orange" },
  ];

  return (
    <div className="global-ref-main-div-ui mt-24">
      {(loading || saving) && <LoadingSpinner />}

      {/* Header with Tabs */}
      <div className="fixed mt-4 top-14 left-6 right-6 z-30 global-ref-header-ui flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
        </div>

        {/* Tab Navigation in Header */}
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 rounded-md text-xs md:text-sm font-bold transition-colors duration-200 group mr-1
          ${activeTab === tab.id
                  ? `bg-${tab.color}-100 text-${tab.color}-700 dark:bg-${tab.color}-900 dark:text-${tab.color}-300`
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-300'
                }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="w-4 h-4 mr-2" />
              <span className="group-hover:block whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-center text-xs">
          {/* Common buttons across all tabs */}
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
              <FontAwesomeIcon icon={faInfoCircle} /> Help <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
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

      {/* Tab Content */}
      <div className="global-tran-tab-div-ui mt-5">
        {activeTab === "userRoles" && (
          <UsersTab
            roles={roles}
            fetchRoles={fetchRoles}
            user={user}
            saving={saving}
            setSaving={setSaving}
          />
        )}

        {activeTab === "roleUserMatch" && (
          <RolesTab
            users={users}
            roles={roles}
            appliedUserRoles={appliedUserRoles}
            setAppliedUserRoles={setAppliedUserRoles}
            fetchUserRoles={fetchUserRoles}
          />
        )}

        {activeTab === "roleAccess" && (
          <RoleAccessTab roles={roles} />
        )}

        {activeTab === "userAccess" && (
          <UserRoleTab users={users} />
        )}
      </div>
    </div>
  );
};

export default UserAccessRights;