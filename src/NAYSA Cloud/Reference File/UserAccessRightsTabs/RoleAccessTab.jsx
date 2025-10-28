import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faUndo, faSave } from "@fortawesome/free-solid-svg-icons";

const RoleAccessTab = ({ roles }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);
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

  return (
    <div className="w-full">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 justify-end">
        <button
          className={`${
            selectedRoles.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600"
          } text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700`}
          onClick={() => {
            if (selectedRoles.length > 0) {
              setShowModules(true);
              setSelectedModules([]);
            }
          }}
          disabled={selectedRoles.length === 0}
        >
          <FontAwesomeIcon icon={faEye} /> View Modules
        </button>
        <button
          className="bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
          onClick={() => {
            setSelectedRoles([]);
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
        >
          <FontAwesomeIcon icon={faSave} /> Save Access
        </button>
      </div>

      {/* Two Tables Side by Side */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Roles Table */}
        <div className="w-full md:w-1/3">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Roles</h2>
          <div className="global-ref-table-main-div-ui">
            <div className="global-ref-table-main-sub-div-ui">
              <div className="global-ref-table-div-ui">
                <table className="global-ref-table-div-ui">
                  <thead className="global-ref-thead-div-ui">
                    <tr>
                      <th className="global-ref-th-ui">Role Code</th>
                      <th className="global-ref-th-ui">Role Name</th>
                      <th className="global-ref-th-ui text-center">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.length > 0 ? (
                      roles.map((role, index) => (
                        <tr
                          key={index}
                          className="global-tran-tr-ui"
                        >
                          <td className="global-ref-td-ui">{role.roleCode}</td>
                          <td className="global-ref-td-ui">{role.roleName}</td>
                          <td className="global-ref-td-ui text-center">
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
                                    return [...prev, role.roleCode];
                                  }
                                });
                                setShowModules(false);
                              }}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="global-ref-norecords-ui">
                          No roles found
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
                          Select role(s) and click "View Modules" to see available modules
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
  );
};

export default RoleAccessTab;