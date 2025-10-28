import { useState, useEffect } from "react";
import { apiClient } from "@/NAYSA Cloud/Configuration/BaseURL.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faUserShield, faInfoCircle, faEye, faUndo, faCheck } from "@fortawesome/free-solid-svg-icons";

import {
  useSwalErrorAlert,
  useSwalSuccessAlert,
  useSwalWarningAlert,
} from "@/NAYSA Cloud/Global/behavior";

const RolesTab = ({ users, roles, appliedUserRoles, setAppliedUserRoles, fetchUserRoles }) => {
  const [selectedUsers, setSelectedUsers] = useState(
    () => JSON.parse(sessionStorage.getItem("ar_selectedUsers") || "[]")
  );
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [viewingRoles, setViewingRoles] = useState(
    () => JSON.parse(sessionStorage.getItem("ar_viewingRoles") || "false")
  );
  const [usersLoading, setUsersLoading] = useState(false);
  const [pendingUnassign, setPendingUnassign] = useState(
    () => JSON.parse(sessionStorage.getItem("ar_pendingUnassign") || "[]")
  );

  const handleRoleCheckboxChange = (role) => {
    const roleCode = role.roleCode;

    const usersWithRole = selectedUsers.filter(
      (userCode) => appliedUserRoles.has(`${userCode}-${roleCode}`)
    );

    const allUsersHaveRole = usersWithRole.length === selectedUsers.length;
    const someUsersHaveRole =
      usersWithRole.length > 0 && usersWithRole.length < selectedUsers.length;

    const isCurrentlySelected = selectedRoles.includes(roleCode);
    const isPendingUnassign = pendingUnassign.includes(roleCode);

    // A) All selected users already have the role, and it's not already queued for add
    // Unchecking means: queue for removal (toggle)
    if (allUsersHaveRole && !isCurrentlySelected) {
      setPendingUnassign((prev) =>
        isPendingUnassign ? prev.filter((c) => c !== roleCode) : [...prev, roleCode]
      );
      return;
    }

    // B) Some users have it; unchecking here means "assign to the remaining"
    if (someUsersHaveRole && !isCurrentlySelected) {
      setSelectedRoles((prev) => [...prev, roleCode]);
      return;
    }

    // C) Role was newly selected (to add) — uncheck cancels the add
    if (isCurrentlySelected) {
      setSelectedRoles((prev) => prev.filter((c) => c !== roleCode));
      return;
    }

    // D) Otherwise (nobody has it) — checking means add
    setSelectedRoles((prev) => [...prev, roleCode]);
  };

  const handleViewRole = () => {
    if (selectedUsers.length === 0) {
      useSwalWarningAlert("No Users Selected", "Please select at least one user before viewing roles.");
      return;
    }
    setViewingRoles(true);
    fetchUserRoles(selectedUsers);
  };

  const handleResetUserRoleMatching = () => {
    setSelectedUsers([]);
    setSelectedRoles([]);
    setPendingUnassign([]);
    setViewingRoles(false);
    sessionStorage.removeItem("ar_selectedUsers");
    sessionStorage.removeItem("ar_viewingRoles");
    sessionStorage.removeItem("ar_pendingUnassign");
    sessionStorage.removeItem("ar_appliedUserRoles"); // clear cached roles
  };

  const handleApplyRoles = async () => {
    if (selectedUsers.length === 0) return;

    try {
      // A. ADD new roles (selectedRoles)
      if (selectedRoles.length > 0) {
        const upsertPayload = {
          dt1: selectedRoles.map((roleCode) => ({ roleCode })),
          dt2: selectedUsers.map((userCode) => ({ userCode })),
        };

        const { data: up } = await apiClient.post("/UpsertUserRole", {
          json_data: { json_data: upsertPayload },
        });

        const upStatus = up?.data?.status ?? up?.status;
        if (upStatus !== "success") {
          await useSwalErrorAlert(
            "Error!",
            up?.data?.message || up?.message || "Error saving role."
          );
          return;
        }

        // reflect adds in UI
        setAppliedUserRoles((prev) => {
          const s = new Set(prev);
          selectedUsers.forEach((u) =>
            selectedRoles.forEach((r) => s.add(`${u}-${r}`))
          );
          return s;
        });
      }

      // B. DELETE roles queued in pendingUnassign
      if (pendingUnassign.length > 0) {
        const deletePayload = {
          dt1: pendingUnassign.map((roleCode) => ({ roleCode })),
          dt2: selectedUsers.map((userCode) => ({ userCode })),
        };

        const { data: del } = await apiClient.post("/deleteUserRole", {
          json_data: { json_data: deletePayload }, // same envelope as Upsert
        });

        const delStatus = del?.data?.status ?? del?.status;
        if (delStatus !== "success") {
          await useSwalErrorAlert(
            "Error!",
            del?.data?.message || del?.message || "Error deleting user role."
          );
          return;
        }

        // reflect deletes in UI
        setAppliedUserRoles((prev) => {
          const s = new Set(prev);
          selectedUsers.forEach((u) =>
            pendingUnassign.forEach((r) => s.delete(`${u}-${r}`))
          );
          return s;
        });
      }

      // Done
      setSelectedRoles([]);
      setPendingUnassign([]);
      await useSwalSuccessAlert("Success!", "Roles have been applied.");
    } catch (e) {
      console.error(e);
      await useSwalErrorAlert(
        "Error!",
        e?.response?.data?.message || "Something went wrong."
      );
    }
  };

  const handleRemoveRole = async (userCode, roleCode) => {
    try {
      console.log(`Removing role ${roleCode} from user ${userCode}`);

      // keep the same envelope as Upsert
      const payload = {
        dt1: [{ roleCode }],
        dt2: [{ userCode }],
      };

      const { data: res } = await apiClient.post("/deleteUserRole", {
        json_data: { json_data: payload },
      });

      // accept either {data:{status:"success"}} or {status:"success"}
      const status = res?.data?.status ?? res?.status;

      if (status === "success") {
        setAppliedUserRoles(prev => {
          const s = new Set(prev);
          s.delete(`${userCode}-${roleCode}`);
          return s;
        });
        return true;
      } else {
        await useSwalErrorAlert(
          "Error!",
          res?.data?.message || res?.message || "Failed to remove role from user."
        );
        return false;
      }
    } catch (error) {
      console.error("Error removing role:", error);
      await useSwalErrorAlert(
        "Error!",
        "Failed to remove role from user: " +
        (error.response?.data?.message || error.message || "Unknown error")
      );
      return false;
    }
  };

  const isRoleChecked = (roleCode) => {
    if (pendingUnassign.includes(roleCode)) return false; // show unchecked if queued to remove
    if (selectedRoles.includes(roleCode)) return true;

    if (selectedUsers.length === 0) return false;
    return selectedUsers.every((userCode) =>
      appliedUserRoles.has(`${userCode}-${roleCode}`)
    );
  };

  // Check if some but not all users have the role
  const isRolePartial = (roleCode) => {
    if (selectedUsers.length === 0) return false;

    const usersWithRole = selectedUsers.filter(userCode =>
      appliedUserRoles.has(`${userCode}-${roleCode}`)
    );

    return usersWithRole.length > 0 && usersWithRole.length < selectedUsers.length;
  };

  // ─────────────────────────────────────────────────────────────
  // PERSIST/RESTORE: users, flags, and appliedUserRoles (NEW)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    sessionStorage.setItem("ar_selectedUsers", JSON.stringify(selectedUsers));
  }, [selectedUsers]);

  useEffect(() => {
    sessionStorage.setItem("ar_viewingRoles", JSON.stringify(viewingRoles));
  }, [viewingRoles]);

  useEffect(() => {
    sessionStorage.setItem("ar_pendingUnassign", JSON.stringify(pendingUnassign));
  }, [pendingUnassign]);

  // ✅ NEW: Persist appliedUserRoles as an array of keys
  useEffect(() => {
    sessionStorage.setItem("ar_appliedUserRoles", JSON.stringify([...appliedUserRoles]));
  }, [appliedUserRoles]);

  // ✅ NEW: Restore appliedUserRoles on mount (so boxes are checked immediately after reload)
  useEffect(() => {
    const savedRoles = sessionStorage.getItem("ar_appliedUserRoles");
    if (savedRoles) {
      try {
        const arr = JSON.parse(savedRoles);
        if (Array.isArray(arr)) setAppliedUserRoles(new Set(arr));
      } catch {
        // ignore JSON errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If in "view roles" mode and users are selected after a reload,
  // refresh from backend so the cache stays accurate.
  useEffect(() => {
    if (viewingRoles && selectedUsers.length > 0) {
      fetchUserRoles(selectedUsers); // This should update appliedUserRoles (Set of "user-role" keys)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingRoles, selectedUsers]);
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 justify-end">
        <button
          className={`${viewingRoles
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-purple-600"
            } text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700`}
          onClick={handleViewRole}
          disabled={viewingRoles}
        >
          <FontAwesomeIcon icon={faEye} /> View Role
        </button>
        <button
          className="bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
          onClick={handleResetUserRoleMatching}
        >
          <FontAwesomeIcon icon={faUndo} /> Reset
        </button>
        <button
          type="button"
          onClick={(e) => {
            const hasChanges = selectedRoles.length > 0 || pendingUnassign.length > 0;
            if (!viewingRoles || !hasChanges) return; // hard stop
            e.stopPropagation();
            handleApplyRoles();
          }}
          disabled={!viewingRoles || (selectedRoles.length === 0 && pendingUnassign.length === 0)}
          className={`px-3 py-2 rounded-lg flex items-center gap-2 text-white
    ${!viewingRoles || (selectedRoles.length === 0 && pendingUnassign.length === 0)
              ? "bg-gray-400 cursor-not-allowed pointer-events-none"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          <FontAwesomeIcon icon={faCheck} /> Apply
        </button>

      </div>

      {/* Two Tables Side by Side */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Users Table */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Users</h2>
          <div className="global-ref-table-main-div-ui">
            <div className="global-ref-table-main-sub-div-ui">
              <div className="global-ref-table-div-ui">
                <table className="global-ref-table-div-ui">
                  <thead className="global-ref-thead-div-ui">
                    <tr>
                      <th className="global-ref-th-ui">User Code</th>
                      <th className="global-ref-th-ui">Username</th>
                      <th className="global-ref-th-ui text-center">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan="3" className="global-ref-norecords-ui">
                          <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                          Loading users...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="global-ref-norecords-ui">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <tr
                          key={user.userCode || index}
                          className="global-tran-tr-ui"
                        >
                          <td className="global-ref-td-ui">{user.userCode}</td>
                          <td className="global-ref-td-ui">{user.userName}</td>
                          <td className="global-ref-td-ui text-center">
                            <input
                              type="checkbox"
                              className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              checked={selectedUsers.includes(user.userCode)}
                              onChange={() => {
                                if (viewingRoles) return;
                                setSelectedUsers((prev) =>
                                  prev.includes(user.userCode)
                                    ? prev.filter((id) => id !== user.userCode)
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
          </div>
        </div>

        {/* Roles Table */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Roles</h2>
          <div className="global-ref-table-main-div-ui">
            <div className="global-ref-table-main-sub-div-ui">
              <div className="global-ref-table-div-ui">
                {viewingRoles ? (
                  <table className="global-ref-table-div-ui">
                    <thead className="global-ref-thead-div-ui">
                      <tr>
                        <th className="global-ref-th-ui">Role Code</th>
                        <th className="global-ref-th-ui">Role Description</th>
                        <th className="global-ref-th-ui text-center">Select</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role, index) => {
                        const isChecked = isRoleChecked(role.roleCode);
                        const isPartial = isRolePartial(role.roleCode);

                        return (
                          <tr
                            key={index}
                            className="global-tran-tr-ui"
                          >
                            <td className="global-ref-td-ui">{role.roleCode}</td>
                            <td className="global-ref-td-ui">
                              {role.roleName}
                              {isPartial && (
                                <span className="ml-2 text-xs text-orange-600" title="Some users have this role">
                                  (Partial)
                                </span>
                              )}
                            </td>
                            <td className="global-ref-td-ui text-center">
                              <input
                                type="checkbox"
                                className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={isChecked}
                                onChange={() => handleRoleCheckboxChange(role)}
                                style={isPartial ? { accentColor: 'orange' } : {}}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-lg">
                    <FontAwesomeIcon icon={faUserShield} className="text-xl mb-2 text-gray-400" />
                    <h3 className="font-medium text-sm mb-1">Role Selection Hidden</h3>
                    <p className="text-xs">
                      Please select user(s) from the users table and click "View Role" to see and assign roles
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Display */}
      {selectedUsers.length > 0 && (
        <div className="mt-4 bg-blue-50 p-2 rounded text-xs">
          {viewingRoles
            ? `Managing roles for ${selectedUsers.length} selected user(s). Check/uncheck roles and click Apply to save changes.`
            : `${selectedUsers.length} user(s) selected. Click "View Role" to continue.`}
        </div>
      )}

      {viewingRoles && selectedRoles.length > 0 && (
        <div className="mt-2 bg-green-50 p-2 rounded text-xs">
          {`${selectedRoles.length} role(s) selected to apply to selected user(s).`}
        </div>
      )}

      {selectedUsers.length > 0 && viewingRoles && (
        <div className="mt-2 bg-yellow-50 p-2 rounded text-xs">
          <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
          <strong>How it works:</strong> Checked roles are applied to ALL selected users.
          Uncheck an applied role to remove it. Roles marked "(Partial)" are only applied to some users.
        </div>
      )}
    </div>
  );
};

export default RolesTab;
