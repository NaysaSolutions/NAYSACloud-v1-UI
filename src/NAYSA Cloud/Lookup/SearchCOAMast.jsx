import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const COAMastLookupModal = ({ isOpen, onClose, customParam  }) => {
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ acctCode: '', acctName: '', acctBalance: '' , reqSL: ''  , reqRC: '' });
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  useEffect(() => {
    if (isOpen) {
      setLoading(true);


      switch (customParam) {
        case "apv_hd":
          customParam = "APGL";
          break;         
        default:
          break;
      }


      axios.post("http://127.0.0.1:8000/api/lookupCOA", {
        PARAMS: JSON.stringify({
          search: customParam || "",
          page: 1,
          pageSize: 10
        })
      }, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      })
      .then((response) => {
        const result = response.data;
        if (result.success && result.data && result.data.length > 0 && result.data[0].result) {
          const accountData = JSON.parse(result.data[0].result);
          setAccounts(accountData);
          setFiltered(accountData);
        } else {
          alert(result.message || "No Chart of Accounts found.");
        }
      })      
      .catch((err) => {
        console.error("Failed to fetch Chart of Accounts:", err);
        alert(`Error: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen]);
  

  useEffect(() => {
    const newFiltered = accounts.filter(item =>
      (item.acctCode || '').toLowerCase().includes((filters.acctCode || '').toLowerCase()) &&
      (item.acctName || '').toLowerCase().includes((filters.acctName || '').toLowerCase()) &&
      (item.acctBalance || '').toLowerCase().includes((filters.acctBalance || '').toLowerCase()) &&
      (item.reqSL || '').toLowerCase().includes((filters.reqSL || '').toLowerCase()) &&
      (item.reqRC || '').toLowerCase().includes((filters.reqRC || '').toLowerCase())
    );
    setFiltered(newFiltered);
  }, [filters, accounts]);

  const handleApply = (coa) => {  
    onClose(coa);
  // Include requirement flags in the returned data
  const accountData = {
    acctCode: coa.acctCode,
    acctName: coa.acctName,
    rcReq: coa.reqRC,  // Make sure this matches your API response
    slReq: coa.reqSL   // Make sure this matches your API response
  };
  onClose(accountData);
};

  
  const handleFilterChange = (e, key) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  const handleSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };
  
    const renderSortIcon = (column) => {
      if (sortConfig.key === column) {
        return sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />;
      }
      return <FontAwesomeIcon icon={faSort} />;
    };
  

  if (!isOpen) return null;

  return (
    <div className="global-lookup-main-div-ui">
      <div className="global-lookup-div-ui max-w-6xl max-h-[100vh]">
        {/* Close Icon */}
        <button
          onClick={() => onClose(null)}
         className="global-lookup-button-close-ui"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="global-lookup-headertext-ui">Select Account</h2>

        {loading ? (
          <div className="global-lookup-loading-main-div-ui">
            <div className="global-lookup-loading-sub-div-ui"></div>
          </div>
        ) : (
          <div className="global-lookup-table-main-div-ui max-h-[70vh] scroll-y-auto">
            <table className="global-lookup-table-div-ui">
              <thead className="global-lookup-thead-div-ui">
                <tr classname="global-lookup-tr-ui">
                  <th className="global-lookup-th-ui" onClick={() => handleSort('acctCode')}>
                    Account Code {renderSortIcon('acctCode')}</th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('acctName')}>
                    Account Name {renderSortIcon('acctName')}</th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('acctBalance')}>
                    Account Balance {renderSortIcon('acctBalance')}</th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('reqSL')}>
                    Required SL? {renderSortIcon('reqSL')}</th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('reqRC')}>
                    Required RC? {renderSortIcon('reqRC')}</th>
                  <th className="global-lookup-th-ui">
                    Action</th>
                </tr>
                <tr className="global-lookup-tr-ui">
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.acctCode}
                      onChange={(e) => handleFilterChange(e, 'acctCode')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.acctName}
                      onChange={(e) => handleFilterChange(e, 'acctName')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.acctBalance}
                      onChange={(e) => handleFilterChange(e, 'acctBalance')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.reqSL}
                      onChange={(e) => handleFilterChange(e, 'reqSL')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.reqRC}
                      onChange={(e) => handleFilterChange(e, 'reqRC')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>

                  <th className="border px-4 py-1"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
  {loading ? (
    <tr>
      <td colSpan="3" className="py-10 text-center">
        <div className="w-8 h-8 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm text-gray-500 mt-2">Loading accounts...</div>
      </td>
    </tr>
  ) : filtered.length > 0 ? (
    filtered.map((coa, index) => (
      <tr key={index} className="bg-white hover:bg-gray-100 transition">
        <td className="px-4 py-2 border">{coa.acctCode}</td>
        <td className="px-4 py-2 border">{coa.acctName}</td>
        <td className="px-4 py-2 border">{coa.acctBalance}</td>
        <td className="px-4 py-2 border">{coa.reqSL}</td>
        <td className="px-4 py-2 border">{coa.reqRC}</td>
        <td className="border px-4 py-2">
          <button
            onClick={() => handleApply(coa)}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3" className="px-4 py-6 text-center text-gray-500">
        No matching accounts found.
      </td>
    </tr>
  )}
</tbody>

            </table>
            <div className="p-3 text-sm text-gray-600">
              Showing <strong>{filtered.length}</strong> of {accounts.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default COAMastLookupModal;
