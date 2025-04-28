import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {fetchData} from '../Configuration/BaseURL'

const BranchLookupModal = ({ isOpen, onClose, customParam }) => {
  const [branches, setBranches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ branchCode: '', branchName: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);

      let adjustedParam = customParam;
      if (customParam === "apv_hd") {
        adjustedParam = "APGL";
      }

      const params = {
        PARAMS: JSON.stringify({
          search: "",
          page: 1,
          pageSize: 10,
        }),
      };

      fetchData("/lookupBranch", params)
        .then((result) => {
          if (result.success) {
            const branchData = JSON.parse(result.data[0].result);
            setBranches(branchData);
            setFiltered(branchData);
          } else {
            alert(result.message || "Failed to fetch Branch");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch Branch:", err);
          alert(`Error: ${err.message}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, customParam]);

  useEffect(() => {
    const newFiltered = branches.filter(branch =>
      (branch.branchCode || '').toLowerCase().includes((filters.branchCode || '').toLowerCase()) &&
      (branch.branchName || '').toLowerCase().includes((filters.branchName || '').toLowerCase())
    );
    setFiltered(newFiltered);
  }, [filters, branches]);

  const handleApply = (branch) => {
    onClose(branch);
  };

  const handleFilterChange = (e, key) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="global-lookup-main-div-ui">
      <div className="global-lookup-div-ui max-w-lg max-h-[90vh]">
        {/* Close Icon */}
        <button
          onClick={() => onClose(null)}
          className="global-lookup-button-close-ui"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="global-lookup-headertext-ui">Select Branch Codes</h2>

        {loading ? (
          <div className="global-lookup-loading-main-div-ui">
            <div className="global-lookup-loading-sub-div-ui"></div>
          </div>
        ) : (
          <div className="global-lookup-table-main-div-ui">
            <table className="global-lookup-table-div-ui">
              <thead className='global-lookup-thead-div-ui'>
                <tr classname="global-lookup-tr-ui">
                  <th className="global-lookup-th-ui">Branch Code</th>
                  <th className="global-lookup-th-ui">Branch Name</th>
                  <th className="global-lookup-th-ui">Action</th>
                </tr>
                <tr classname="global-lookup-tr-ui">
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.branchCode}
                      onChange={(e) => handleFilterChange(e, 'branchCode')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.branchName}
                      onChange={(e) => handleFilterChange(e, 'branchName')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="global-lookup-td-ui">
                      <div className="w-8 h-8 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-sm text-gray-500 mt-2">Loading branches...</div>
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((branch, index) => (
                    <tr key={index} className="global-lookup-tr-ui">
                      <td className="global-lookup-td-ui">{branch.branchCode}</td>
                      <td className="global-lookup-td-ui">{branch.branchName}</td>
                      <td className="global-lookup-td-apply-ui">
                        <button
                          onClick={() => handleApply(branch)}
                          className="global-lookup-apply-button-ui"
                        >
                          Apply
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="global-lookup-td-ui">
                      No matching branches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="global-lookup-count-ui">
              Showing <strong>{filtered.length}</strong> of {branches.length} entries
            </div>
          </div>
          
        )}
      </div>
      
    </div>
    
  );
};

export default BranchLookupModal;
