import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faUndo, faCheck } from "@fortawesome/free-solid-svg-icons";

import {
  useSwalErrorAlert,
  useSwalSuccessAlert,
  useSwalWarningAlert,
} from "@/NAYSA Cloud/Global/behavior";

const UserRoleTab = ({ users }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModules, setShowModules] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);

  // Sample modules data - replace with actual API data
  const modulesData = [
    { id: 1, module: "GL", particular: "General Ledger" },
    { id: 2, module: "GL", particular: "Accounts Payable" },
    { id: 3, module: "GL", particular: "Accounts Receivable" },
    { id: 4, module: "GL", particular: "Fixed Assets" },
    { id: 5, module: "GL", particular: "Inventory" },
    { id: 6, module: "GL", particular: "Banking" },
    { id: 7, module: "HR", particular: "Employee Management" },
    { id: 8, module: "HR", particular: "Attendance" },
    { id: 9, module: "HR", particular: "Payroll" },
    { id: 10, module: "SYS", particular: "System Settings" },
  ];

  const handleSaveAccess = async () => {
    if (selectedModules.length === 0) {
      useSwalWarningAlert("No Modules Selected", "Please select at least one module to save access rights.");
      return;
    }

    try {
      const payload = {
        users: selectedUsers,
        modules: selectedModules
      };

      // Placeholder for the actual API call
      // const { data: res } = await apiClient.post("/saveUserAccess", payload);
      
      await useSwalSuccessAlert("Success!", "User access rights saved successfully!");
      
    } catch (error) {
      console.error("Error saving user access:", error);
      await useSwalErrorAlert("Error!", "Failed to save user access rights.");
    }
  };

  return (
    <div className="w-full">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 justify-end">
        <button
          className={`${
            selectedUsers.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600"
          } text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700`}
          onClick={() => {
            if (selectedUsers.length > 0) {
              setShowModules(true);
              setSelectedModules([]);
            }
          }}
          disabled={selectedUsers.length === 0}
        >
          <FontAwesomeIcon icon={faEye} /> View Rights
        </button>
        <button
          className="bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
          onClick={() => {
            setSelectedUsers([]);
            setShowModules(false);
            setSelectedModules([]);
          }}
        >
          <FontAwesomeIcon icon={faUndo} /> Reset
        </button>
        <button
          className={`${
            !showModules || selectedModules.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600"
          } text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700`}
          disabled={!showModules || selectedModules.length === 0}
          onClick={handleSaveAccess}
        >
          <FontAwesomeIcon icon={faCheck} /> Apply
        </button>
      </div>

      {/* Two Tables Side by Side */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Users Table */}
        <div className="w-full md:w-1/3">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Users</h2>
          <div className="global-ref-table-main-div-ui">
            <div className="global-ref-table-main-sub-div-ui">
              <div className="global-ref-table-div-ui">
                <table className="global-ref-table-div-ui">
                  <thead className="global-ref-thead-div-ui">
                    <tr>
                      <th className="global-ref-th-ui">User Type</th>
                      <th className="global-ref-th-ui">User Code</th>
                      <th className="global-ref-th-ui">Username</th>
                      <th className="global-ref-th-ui text-center">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <tr
                          key={index}
                          className="global-tran-tr-ui"
                        >
                          <td className="global-ref-td-ui">{user.userType}</td>
                          <td className="global-ref-td-ui">{user.userCode}</td>
                          <td className="global-ref-td-ui">{user.userName}</td>
                          <td className="global-ref-td-ui text-center">
                            <input
                              type="checkbox"
                              className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              checked={selectedUsers.includes(user.userCode)}
                              onChange={() => {
                                setSelectedUsers((prev) =>
                                  prev.includes(user.userCode)
                                    ? prev.filter((id) => id !== user.userCode)
                                    : [...prev, user.userCode]
                                );
                                setShowModules(false);
                              }}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="global-ref-norecords-ui">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Module-Particular-Access Table */}
        <div className="w-full md:w-2/3">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Modules & Access Rights</h2>
          <div className="global-ref-table-main-div-ui">
            <div className="global-ref-table-main-sub-div-ui">
              <div className="global-ref-table-div-ui">
                <table className="global-ref-table-div-ui">
                  <thead className="global-ref-thead-div-ui">
                    <tr>
                      <th className="global-ref-th-ui">Module</th>
                      <th className="global-ref-th-ui">Particular</th>
                      <th className="global-ref-th-ui text-center">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showModules ? (
                      modulesData.map((item, index) => (
                        <tr
                          key={index}
                          className="global-tran-tr-ui"
                        >
                          <td className="global-ref-td-ui">{item.module}</td>
                          <td className="global-ref-td-ui">{item.particular}</td>
                          <td className="global-ref-td-ui text-center">
                            <input
                              type="checkbox"
                              className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              checked={selectedModules.includes(item.id)}
                              onChange={() => {
                                setSelectedModules((prev) => {
                                  if (prev.includes(item.id)) {
                                    return prev.filter((id) => id !== item.id);
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
                        <td colSpan="3" className="global-ref-norecords-ui">
                          <FontAwesomeIcon icon={faEye} className="mr-2" />
                          Select user(s) and click "View Rights" to see available modules
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Display */}
      {selectedUsers.length > 0 && (
        <div className="mt-4 bg-blue-50 p-2 rounded text-xs">
          {selectedUsers.length === 1
            ? `Selected user: ${selectedUsers[0]}`
            : `Selected users: ${selectedUsers.join(", ")}`}
        </div>
      )}

      {showModules && selectedModules.length > 0 && (
        <div className="mt-2 bg-green-50 p-2 rounded text-xs">
          {`${selectedModules.length} module(s)/particular(s) selected for access rights configuration.`}
        </div>
      )}
    </div>
  );
};

export default UserRoleTab;