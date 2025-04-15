import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const CustomerMastLookupModal = ({ isOpen, onClose, customParam  }) => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ custCode: '', custName: '', source: '' , custTin: ''  , atcCode: '' , vatCode: '', addr: ''});
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


      axios.post("http://127.0.0.1:8000/api/lookupCustomer", {
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

       // console.log(result);

        if (result.success) {
          const resultData = JSON.parse(result.data[0].result);
          setCustomers(resultData);
          setFiltered(resultData);
        } else {
          alert(result.message || "Failed to fetch Customer");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch Chart of Customer:", err);
        alert(`Error: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen]);
  

  useEffect(() => {
    const newFiltered = customers.filter(item =>
      (item.custCode || '').toLowerCase().includes((filters.custCode || '').toLowerCase()) &&
      (item.custName || '').toLowerCase().includes((filters.custName || '').toLowerCase()) &&
      (item.source || '').toLowerCase().includes((filters.source || '').toLowerCase()) &&
      (item.custTin || '').toLowerCase().includes((filters.custTin || '').toLowerCase()) &&
      (item.atcCode || '').toLowerCase().includes((filters.atcCode || '').toLowerCase()) &&
      (item.vatCode || '').toLowerCase().includes((filters.vatCode || '').toLowerCase()) &&
      (item.addr || '').toLowerCase().includes((filters.addr || '').toLowerCase())
    );
    setFiltered(newFiltered);
  }, [filters, customers]);

  const handleApply = (customer) => { 
    onClose(customer);
  };

  
  const handleFilterChange = (e, key) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-auto relative">
        {/* Close Icon */}
        <button
          onClick={() => onClose(null)}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="text-lg font-semibold mb-4 uppercase">Select Customer</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] rounded">
            <table className="min-w-full border-collapse text-sm text-left border border-gray-200">
              <thead className='text-gray-700 uppercase bg-gray-100 sticky top-0 z-10'>
                <tr>
                  <th className="px-2 py-2 border">Customer Code</th>
                  <th className="px-8 py-2 border">Customer Name</th>
                  <th className="px-4 py-2 border text-center">Source</th>
                  <th className="px-4 py-2 border text-center">TIN</th>
                  <th className="px-2 py-2 border text-center">ATC</th>
                  <th className="px-2 py-2 border text-center">VAT</th>
                  <th className="px-10 py-2 border text-center">Address</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
                <tr className="bg-white">
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.custCode}
                      onChange={(e) => handleFilterChange(e, 'custCode')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.custName}
                      onChange={(e) => handleFilterChange(e, 'custName')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.source}
                      onChange={(e) => handleFilterChange(e, 'source')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.custTin}
                      onChange={(e) => handleFilterChange(e, 'custTin')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.atcCode}
                      onChange={(e) => handleFilterChange(e, 'atcCode')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
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
                      value={filters.addr}
                      onChange={(e) => handleFilterChange(e, 'addr')}
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
        <div className="text-sm text-gray-500 mt-2">Loading Customer...</div>
      </td>
    </tr>
  ) : filtered.length > 0 ? (
    filtered.map((customer, index) => (
      <tr key={index} className="bg-white hover:bg-gray-100 transition">
        <td className="px-4 py-2 border">{customer.custCode}</td>
        <td className="px-4 py-2 border">{customer.custName}</td>
        <td className="px-4 py-2 border">{customer.source}</td>
        <td className="px-4 py-2 border">{customer.custTin}</td>
        <td className="px-4 py-2 border">{customer.atcCode}</td>
        <td className="px-4 py-2 border">{customer.vatCode}</td>
        <td className="px-4 py-2 border">{customer.addr}</td>
        <td className="border px-4 py-2">
          <button
            onClick={() => handleApply(payee)}
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
        No matching Customer found.
      </td>
    </tr>
  )}
</tbody>

            </table>
            <div className="p-3 text-sm text-gray-600">
              Showing <strong>{filtered.length}</strong> of {customers.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMastLookupModal;
