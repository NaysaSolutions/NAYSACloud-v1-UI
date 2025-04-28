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
    <div className="global-lookup-main-div-ui">
      <div className="global-lookup-div-ui max-w-6xl max-h-[100vh]">
        <button
          onClick={() => onClose(null)}
          className="global-lookup-button-close-ui"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="global-lookup-headertext-ui">Select Payee</h2>

        {loading ? (
          <div className="global-lookup-loading-main-div-ui">
            <div className="global-lookup-loading-sub-div-ui"></div>
          </div>
        ) : (
          <div className="global-lookup-table-main-div-ui max-h-[70vh] scroll-y-auto">
            <table className="global-lookup-table-div-ui">
              <thead className="global-lookup-thead-div-ui">
              <tr classname="global-lookup-tr-ui">
                  <th className="global-lookup-th-ui" onClick={() => handleSort('vendCode')}>
                    Payee Code {renderSortIcon('vendCode')}
                  </th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('vendName')}>
                    Payee Name {renderSortIcon('vendName')}
                  </th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('source')}>
                    Source {renderSortIcon('source')}
                  </th>
                  <th className="global-lookup-th-ui" onClick={() => handleSort('vendTin')}>
                    TIN {renderSortIcon('vendTin')}
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
                      value={filters.vendCode}
                      onChange={(e) => handleFilterChange(e, 'vendCode')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.vendName}
                      onChange={(e) => handleFilterChange(e, 'vendName')}
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
                      value={filters.vendTin}
                      onChange={(e) => handleFilterChange(e, 'vendTin')}
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
                      <div className="text-sm text-gray-500 mt-2">Loading payees...</div>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((payee, index) => (
                    <tr key={index} className="global-lookup-tr-ui">
                      <td className="global-lookup-td-ui">{payee.vendCode}</td>
                      <td className="global-lookup-td-ui">{payee.vendName}</td>
                      <td className="global-lookup-td-ui">{payee.source}</td>
                      <td className="global-lookup-td-ui">{payee.vendTin}</td>
                      <td className="global-lookup-td-ui">{payee.atcCode}</td>
                      <td className="global-lookup-td-ui">{payee.vatCode}</td>
                      <td className="global-lookup-td-ui whitespace-normal">{payee.addr}</td>
                      <td className="global-lookup-td-ui">
                        <button
                          onClick={() => handleApply(payee)}
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
                      No matching payees found.
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

export default PayeeMastLookupModal;
