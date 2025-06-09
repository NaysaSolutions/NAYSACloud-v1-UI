import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {fetchData} from '../Configuration/BaseURL';


const VATLookupModal = ({ isOpen, onClose, customParam }) => {
  const [vat, setVATs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ vatCode: '', vatName: '', acctCode: '' });
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

      fetchData("/lookupVat", params)
      .then((result) => {
        console.log("Raw fetchData result:", result);
        if (result.success) {
          const vatData = JSON.parse(result.data[0].result);

          console.log("Parsed VAT data:", vatData);

          const enrichedData = vatData.map(item => ({
  ...item,
  acctCode: item.acct_code || ''  // <-- match API field
}));
          setVATs(enrichedData);
          setFiltered(enrichedData);
        } else {
          alert(result.message || "Failed to fetch VAT");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch VAT:", err);
        alert(`Error: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen]);
  

  useEffect(() => {
    const newFiltered = vat.filter(item =>
      (item.vatCode || '').toLowerCase().includes((filters.vatCode || '').toLowerCase()) &&
      (item.vatName || '').toLowerCase().includes((filters.vatName || '').toLowerCase())
    );
    setFiltered(newFiltered);
  }, [filters, vat]);

  const handleApply = (vat) => {
    onClose(vat);
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

        <h2 className="text-lg font-semibold mb-4 uppercase">Select VAT</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] rounded">
            <table className="min-w-full border-collapse text-sm border border-gray-200">
              <thead className='text-gray-700 uppercase bg-gray-100 sticky top-0 z-10'>
                <tr>
                  <th className="px-2 py-2 border">VAT Code</th>
                  <th className="px-10 py-2 border">VAT Name</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
                <tr className="bg-white">
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.vatCode}
                      onChange={(e) => handleFilterChange(e, 'vatCode')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.vatName}
                      onChange={(e) => handleFilterChange(e, 'vatName')}
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
    filtered.map((vat, index) => (
      <tr key={index} className="bg-white hover:bg-gray-100 transition">
        <td className="px-4 py-2 border">{vat.vatCode}</td>
        <td className="px-4 py-2 border">{vat.vatName}</td>
        <td className="border px-4 py-2">
          <button
            onClick={() => handleApply(vat)}
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
        No matching VAT found.
      </td>
    </tr>
  )}
</tbody>

            </table>
            <div className="p-3 text-sm text-gray-600">
              Showing <strong>{filtered.length}</strong> of {vat.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VATLookupModal;
