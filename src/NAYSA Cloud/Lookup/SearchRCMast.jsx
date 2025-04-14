import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const RCLookupModal = ({ isOpen, onClose, customParam }) => {
  const [rc, setRCs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ rcCode: '', rcName: '', rcType: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
  


      switch (customParam) {
        case "apv_hd":
          customParam = "ActiveAll";
          break;         
        default:
          break;
      }

      axios.post("http://127.0.0.1:8000/api/lookupRCMast", {
        PARAMS: JSON.stringify({
          search: customParam || "ActiveAll",
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
          const rcData = JSON.parse(result.data[0].result);
          setRCs(rcData);
          setFiltered(rcData);
        } else {
          alert(result.message || "Failed to fetch RC");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch RC:", err);
        alert(`Error: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen]);
  

  useEffect(() => {
    const newFiltered = rc.filter(item =>
        item.rcCode.toLowerCase().includes(filters.rcCode.toLowerCase()) &&
        item.rcName.toLowerCase().includes(filters.rcName.toLowerCase()) &&
        item.rcType.toLowerCase().includes(filters.rcType.toLowerCase())
    );
    setFiltered(newFiltered);
  }, [filters, rc]);

  const handleApply = (rc) => {
    onClose(rc);
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

        <h2 className="text-lg font-semibold mb-4 uppercase">Select RC</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] rounded">
            <table className="min-w-full border-collapse text-sm border border-gray-200">
              <thead className='text-gray-700 uppercase bg-gray-100 sticky top-0 z-10'>
                <tr>
                  <th className="px-2 py-2 border">RC Code</th>
                  <th className="px-10 py-2 border">Description</th>
                  <th className="px-4 py-2 border text-right">RC Type</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
                <tr className="bg-white">
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.rcCode}
                      onChange={(e) => handleFilterChange(e, 'rcCode')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.rcName}
                      onChange={(e) => handleFilterChange(e, 'rcName')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.rcType}
                      onChange={(e) => handleFilterChange(e, 'rcType')}
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
        <div className="text-sm text-gray-500 mt-2">Loading ATC...</div>
      </td>
    </tr>
  ) : filtered.length > 0 ? (
    filtered.map((rc, index) => (
      <tr key={index} className="bg-white hover:bg-gray-100 transition">
        <td className="px-4 py-2 border">{rc.rcCode}</td>
        <td className="px-4 py-2 border">{rc.rcName}</td>
        <td className="px-4 py-2 border">{rc.rcType}</td>
        <td className="border px-4 py-2">
          <button
            onClick={() => handleApply(rc)}
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
        No matching RC found.
      </td>
    </tr>
  )}
</tbody>

            </table>
            <div className="p-3 text-sm text-gray-600">
              Showing <strong>{filtered.length}</strong> of {rc.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RCLookupModal;
