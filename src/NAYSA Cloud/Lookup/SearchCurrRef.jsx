import React, { useState, useEffect, customParam } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const CurrLookupModal = ({ isOpen, onClose }) => {
  const [currency, setCurr] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ currCode: '', currName: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
  
      axios.post("http://127.0.0.1:8000/api/lookupCurr", {
        PARAMS: JSON.stringify({
          search: "",
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
          const currData = JSON.parse(result.data[0].result);
          setCurr(currData);
          setFiltered(currData);
        } else {
          alert(result.message || "Failed to fetch Currency");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch currency:", err);
        alert(`Error: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen]);
  

  useEffect(() => {
    const newFiltered = currency.filter(item =>
      item.currCode.toLowerCase().includes(filters.currCode.toLowerCase()) &&
      item.currName.toLowerCase().includes(filters.currName.toLowerCase())
    );
    setFiltered(newFiltered);
  }, [filters, currency]);

  const handleApply = (curr) => {

    
    onClose(curr);
  };

  const handleFilterChange = (e, key) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
        {/* Close Icon */}
        <button
          onClick={() => onClose(null)}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="text-lg font-semibold mb-4 uppercase">Select Currency</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded">
            <table className="min-w-full border-collapse text-sm text-center border border-gray-200">
              <thead className='text-gray-700 uppercase bg-gray-100'>
                <tr>
                  <th className="px-2 py-2 border">Currency Code</th>
                  <th className="px-6 py-2 border">Currency Name</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
                <tr className="bg-white">
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.currCode}
                      onChange={(e) => handleFilterChange(e, 'currCode')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.currName}
                      onChange={(e) => handleFilterChange(e, 'currName')}
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
        <div className="text-sm text-gray-500 mt-2">Loading currency...</div>
      </td>
    </tr>
  ) : filtered.length > 0 ? (
    filtered.map((curr, index) => (
      <tr key={index} className="bg-white hover:bg-gray-100 transition">
        <td className="px-4 py-2 border">{curr.currCode}</td>
        <td className="px-4 py-2 border">{curr.currName}</td>
        <td className="border px-4 py-2">
          <button
            onClick={() => handleApply(curr)}
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
        No matching currency found.
      </td>
    </tr>
  )}
</tbody>

            </table>
            <div className="p-3 text-sm text-gray-600">
              Showing <strong>{filtered.length}</strong> of {currency.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrLookupModal;
