import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const COAMastLookupModal = ({ isOpen, onClose, customParam  }) => {
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ acctCode: '', acctName: '', acctBalance: '' , reqSL: ''  , reqRC: '' });
  const [loading, setLoading] = useState(false);

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
        if (result.success) {
          const accountData = JSON.parse(result.data[0].result);
          setAccounts(accountData);
          setFiltered(accountData);
        } else {
          alert(result.message || "Failed to fetch Chart of Accounts");
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
  };

  
  const handleFilterChange = (e, key) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-auto relative">
        {/* Close Icon */}
        <button
          onClick={() => onClose(null)}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="text-lg font-semibold mb-4 uppercase">Select Account</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] rounded">
            <table className="min-w-full border-collapse text-sm text-left border border-gray-200">
              <thead className='text-gray-700 uppercase bg-gray-100 sticky top-0 z-10'>
                <tr>
                  <th className="px-2 py-2 border">Account Code</th>
                  <th className="px-8 py-2 border">Account Name</th>
                  <th className="px-4 py-2 border text-center">Account Balance</th>
                  <th className="px-1 py-2 border text-center">Required SL?</th>
                  <th className="px-1 py-2 border text-center">Required RC?</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
                <tr className="bg-white">
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.acctCode}
                      onChange={(e) => handleFilterChange(e, 'acctCode')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.acctName}
                      onChange={(e) => handleFilterChange(e, 'acctName')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.acctBalance}
                      onChange={(e) => handleFilterChange(e, 'acctBalance')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.reqSL}
                      onChange={(e) => handleFilterChange(e, 'reqSL')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.reqRC}
                      onChange={(e) => handleFilterChange(e, 'reqRC')}
                      className="w-full border px-2 py-1 rounded text-sm"
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
