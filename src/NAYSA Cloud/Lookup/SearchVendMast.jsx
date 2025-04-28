import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const PayeeMastLookupModal = ({ isOpen, onClose, customParam }) => {
  const [payees, setPayees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    vendCode: '',
    vendName: '',
    source: '',
    vendTin: '',
    atcCode: '',
    vatCode: '',
    addr: ''
  });
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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

      // Fetch the data for the current page only
      fetchData(currentPage);
    }
  }, [isOpen, customParam, currentPage]);

  const fetchData = (page) => {
    setLoading(true);
    
    axios.get("http://127.0.0.1:8000/api/lookupVendMast", {
      params: {
        PARAMS: JSON.stringify({ search: customParam || "ActiveAll" }),
        page: page,
        itemsPerPage: itemsPerPage,
      },
    })
    .then((response) => {
      const result = response.data;
      console.log('API Response:', result);

      if (result.success) {
        const payeeData = JSON.parse(result.data[0].result);
        console.log('Fetched Payee Data:', payeeData);

        setPayees(payeeData);
        setFiltered(payeeData);
      } else {
        alert(result.message || "Failed to fetch Payee");
      }
    })
    .catch((err) => {
      console.error("Failed to fetch Payee:", err);
      alert(`Error: ${err.message}`);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const handleApply = (payee) => {
    onClose(payee); // Pass the selected payee back to the parent
  };
  

  useEffect(() => {
    const newFiltered = payees.filter(item =>
      (item.vendCode || '').toLowerCase().includes((filters.vendCode || '').toLowerCase()) &&
      (item.vendName || '').toLowerCase().includes((filters.vendName || '').toLowerCase()) &&
      (item.source || '').toLowerCase().includes((filters.source || '').toLowerCase()) &&
      (item.vendTin || '').toLowerCase().includes((filters.vendTin || '').toLowerCase()) &&
      (item.atcCode || '').toLowerCase().includes((filters.atcCode || '').toLowerCase()) &&
      (item.vatCode || '').toLowerCase().includes((filters.vatCode || '').toLowerCase()) &&
      (item.addr || '').toLowerCase().includes((filters.addr || '').toLowerCase())
    );

    if (sortConfig.key) {
      newFiltered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFiltered(newFiltered);
    console.log('Filtered Payee Data:', newFiltered);
  }, [filters, payees, sortConfig]);


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

  const handleNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prevPage => prevPage - 1);
  };

  const getPaginatedData = () => {
    return filtered.slice(0, itemsPerPage); // Display only up to itemsPerPage
  };

  if (!isOpen) return null;

  const paginatedData = getPaginatedData();

  // Showing X of Y
  const totalItems = filtered.length;
  const itemsDisplayed = paginatedData.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[100vh] overflow-auto relative">
        <button
          onClick={() => onClose(null)}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="text-lg font-semibold mb-4 uppercase">Select Payee</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] rounded scroll-y-auto">
            <table className="min-w-full border-collapse text-sm text-left border border-gray-200">
              <thead className="text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 border cursor-pointer" onClick={() => handleSort('vendCode')}>
                    Payee Code {renderSortIcon('vendCode')}
                  </th>
                  <th className="px-8 py-2 border cursor-pointer" onClick={() => handleSort('vendName')}>
                    Payee Name {renderSortIcon('vendName')}
                  </th>
                  <th className="px-4 py-2 border text-center cursor-pointer" onClick={() => handleSort('source')}>
                    Source {renderSortIcon('source')}
                  </th>
                  <th className="px-4 py-2 border text-center cursor-pointer" onClick={() => handleSort('vendTin')}>
                    TIN {renderSortIcon('vendTin')}
                  </th>
                  <th className="px-2 py-2 border text-center cursor-pointer" onClick={() => handleSort('atcCode')}>
                    ATC {renderSortIcon('atcCode')}
                  </th>
                  <th className="px-2 py-2 border text-center cursor-pointer" onClick={() => handleSort('vatCode')}>
                    VAT {renderSortIcon('vatCode')}
                  </th>
                  <th className="px-10 py-2 border text-center cursor-pointer" onClick={() => handleSort('addr')}>
                    Address {renderSortIcon('addr')}
                  </th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
                <tr className="bg-white">
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.vendCode}
                      onChange={(e) => handleFilterChange(e, 'vendCode')}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </th>
                  <th className="border px-4 py-1">
                    <input
                      type="text"
                      value={filters.vendName}
                      onChange={(e) => handleFilterChange(e, 'vendName')}
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
                      value={filters.vendTin}
                      onChange={(e) => handleFilterChange(e, 'vendTin')}
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
                      <div className="text-sm text-gray-500 mt-2">Loading payees...</div>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((payee, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-100 transition">
                      <td className="px-4 py-2 border">{payee.vendCode}</td>
                      <td className="px-4 py-2 border">{payee.vendName}</td>
                      <td className="px-4 py-2 border">{payee.source}</td>
                      <td className="px-4 py-2 border">{payee.vendTin}</td>
                      <td className="px-4 py-2 border">{payee.atcCode}</td>
                      <td className="px-4 py-2 border">{payee.vatCode}</td>
                      <td className="px-4 py-2 border">{payee.addr}</td>
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
                      No matching payees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="sticky bottom-0 bg-white z-20 flex justify-between items-center p-3">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <div className="text-sm text-gray-700">
            {startItem}-{endItem} of {totalItems}
          </div>
          <button
            onClick={handleNextPage}
            disabled={filtered.length <= currentPage * itemsPerPage}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayeeMastLookupModal;
