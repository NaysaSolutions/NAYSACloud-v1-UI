import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const CustomerMastLookupModal = ({ isOpen, onClose, customParam }) => {
  const [customers, setcustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    custCode: '',
    custName: '',
    source: '',
    custTin: '',
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

      // switch (customParam) {
      //   case "apv_hd":
      //     customParam = "APGL";
      //     break;
      //   default:
      //     break;
      // }

      // Fetch the data for the current page only
      fetchData(currentPage);
    }
  }, [isOpen, customParam, currentPage]);

  const fetchData = (page) => {
    setLoading(true);
    
    axios.get("http://127.0.0.1:8000/api/lookupCustomer", {
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
        const custData = JSON.parse(result.data[0].result);
        console.log('Fetched cust Data:', custData);

        setcustomers(custData);
        setFiltered(custData);
      } else {
        alert(result.message || "Failed to fetch cust");
      }
    })
    .catch((err) => {
      console.error("Failed to fetch cust:", err);
      alert(`Error: ${err.message}`);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const handleApply = (cust) => {
    onClose(cust); // Pass the selected cust back to the parent
  };
  

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

    if (sortConfig.key) {
      newFiltered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFiltered(newFiltered);
    console.log('Filtered cust Data:', newFiltered);
  }, [filters, customers, sortConfig]);


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
    <div className="global-lookup-main-div-ui">
      <div className="global-lookup-div-ui max-w-6xl max-h-[100vh]">
        <button
          onClick={() => onClose(null)}
          className="global-lookup-button-close-ui"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="global-lookup-headertext-ui">Select Customer</h2>

        {loading ? (
          <div className="global-lookup-loading-main-div-ui">
            <div className="global-lookup-loading-sub-div-ui"></div>
          </div>
        ) : (
          <div className="global-lookup-table-main-div-ui max-h-[70vh] scroll-y-auto">
            <table className="global-lookup-table-div-ui">
              <thead className="global-lookup-thead-div-ui">
              <tr classname="global-lookup-tr-ui">
                  <th className="global-lookup-th-ui" onClick={() => handleSort('custCode')}>
                    cust Code {renderSortIcon('custCode')}
                  </th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('custName')}>
                    cust Name {renderSortIcon('custName')}
                  </th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('source')}>
                    Source {renderSortIcon('source')}
                  </th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('custTin')}>
                    TIN {renderSortIcon('custTin')}
                  </th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('atcCode')}>
                    ATC {renderSortIcon('atcCode')}
                  </th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('vatCode')}>
                    VAT {renderSortIcon('vatCode')}
                  </th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('addr')}>
                    Address {renderSortIcon('addr')}
                  </th>
                  <th className="global-lookup-th-ui">Action</th>
                </tr>
                <tr classname="global-lookup-tr-ui">
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.custCode}
                      onChange={(e) => handleFilterChange(e, 'custCode')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.custName}
                      onChange={(e) => handleFilterChange(e, 'custName')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.source}
                      onChange={(e) => handleFilterChange(e, 'source')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.custTin}
                      onChange={(e) => handleFilterChange(e, 'custTin')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.atcCode}
                      onChange={(e) => handleFilterChange(e, 'atcCode')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.vatCode}
                      onChange={(e) => handleFilterChange(e, 'vatCode')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.addr}
                      onChange={(e) => handleFilterChange(e, 'addr')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="py-10 text-center">
                      <div className="w-8 h-8 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-sm text-gray-500 mt-2">Loading customers...</div>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((cust, index) => (
                    <tr key={index} className="global-lookup-tr-ui">
                      <td className="global-lookup-td-ui">{cust.custCode}</td>
                      <td className="global-lookup-td-ui">{cust.custName}</td>
                      <td className="global-lookup-td-ui">{cust.source}</td>
                      <td className="global-lookup-td-ui">{cust.custTin}</td>
                      <td className="global-lookup-td-ui">{cust.atcCode}</td>
                      <td className="global-lookup-td-ui">{cust.vatCode}</td>
                      <td className="global-lookup-td-ui whitespace-normal">{cust.addr}</td>
                      <td className="global-lookup-td-ui">
                        <button
                          onClick={() => handleApply(cust)}
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
                      No matching customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="global-lookup-footer-div-ui">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="global-lookup-footer-button-prevnext-ui"
          >
            Previous
          </button>
          <div className="global-lookup-count-ui">
            {startItem}-{endItem} of {totalItems}
          </div>
          <button
            onClick={handleNextPage}
            disabled={filtered.length <= currentPage * itemsPerPage}
            className="global-lookup-footer-button-prevnext-ui"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerMastLookupModal;
