import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {fetchData} from '../Configuration/BaseURL';

const BillCodeLookupModal = ({ isOpen, onClose, customParam }) => {
  const [billcode, setBillCodes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ billCode: '', billName: '', uomCode: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);

      const params = {
        PARAMS: JSON.stringify({
          search: "",
          page: 1,
          pageSize: 10,
        }),
      };
  
      fetchData("/lookupBillcode", params)
      .then((result) => {
        if (result.success) {
          const resultData = JSON.parse(result.data[0].result);
          setBillCodes(resultData);
          setFiltered(resultData);
        } else {
          alert(result.message || "Failed to fetch Billing Code");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch Billing Code", err);
        alert(`Error: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }   
  }, [isOpen]);
  

  

  useEffect(() => {
    const newFiltered = billcode.filter(item =>
      (item.billCode || '').toLowerCase().includes((filters.billCode || '').toLowerCase()) &&
      (item.billName || '').toLowerCase().includes((filters.billName || '').toLowerCase()) &&
      (item.uomCode || '').toLowerCase().includes((filters.uomCode || '').toLowerCase())
    );
    setFiltered(newFiltered);
  }, [filters, billcode]);

  const handleApply = (billcode) => {
    onClose(billcode);
  };

  
  const handleFilterChange = (e, key) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-auto relative">
        {/* Close Icon */}
        <button
          onClick={() => onClose(null)}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="text-lg font-semibold mb-4 uppercase">Select Bill Code</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] rounded">
            <table className="min-w-full border-collapse text-sm border border-gray-200">
              <thead className='text-gray-700 uppercase bg-gray-100 sticky top-0 z-10'>
                <tr>
                  <th className="px-2 py-2 border">Bill Code</th>
                  <th className="px-10 py-2 border">Description</th>
                  <th className="px-4 py-2 border text-right">UOM</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
                <tr className="bg-white">
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.billCode}
                      onChange={(e) => handleFilterChange(e, 'billCode')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.billName}
                      onChange={(e) => handleFilterChange(e, 'billName')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.uomCode}
                      onChange={(e) => handleFilterChange(e, 'uomCode')}
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
        <div className="text-sm text-gray-500 mt-2">Loading Billing Code...</div>
      </td>
    </tr>
  ) : filtered.length > 0 ? (
    filtered.map((billcode, index) => (
      <tr key={index} className="bg-white hover:bg-gray-100 transition">
        <td className="px-4 py-2 border">{billcode.billCode}</td>
        <td className="px-4 py-2 border">{billcode.billName}</td>
        <td className="px-4 py-2 border">{billcode.uomCode}</td>
        <td className="border px-4 py-2">
          <button
            onClick={() => handleApply(billcode)}
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
        No matching Billing Code found.
      </td>
    </tr>
  )}
</tbody>

            </table>
            <div className="p-3 text-sm text-gray-600">
              Showing <strong>{filtered.length}</strong> of {billcode.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillCodeLookupModal;
