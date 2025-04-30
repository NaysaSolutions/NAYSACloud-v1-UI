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
  
      axios.get("http://127.0.0.1:8000/api/lookupCurr", {
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
      (item.currCode || '').toLowerCase().includes((filters.currCode || '').toLowerCase()) &&
      (item.currName || '').toLowerCase().includes((filters.currName || '').toLowerCase())
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
    <div className="global-lookup-main-div-ui">
      <div className="global-lookup-div-ui max-w-lg max-h-[90vh]">
        {/* Close Icon */}
        <button
          onClick={() => onClose(null)}
          className="global-lookup-button-close-ui"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="global-lookup-headertext-ui">Select Currency</h2>

        {loading ? (
          <div className="global-lookup-loading-main-div-ui">
            <div className="global-lookup-loading-sub-div-ui"></div>
          </div>
        ) : (
          <div className="global-lookup-table-main-div-ui">
            <table className="global-lookup-table-div-ui">
              <thead className='global-lookup-thead-div-ui'>
              <tr classname="global-lookup-tr-ui">
                  <th className="global-lookup-th-ui">Currency Code</th>
                  <th className="global-lookup-th-ui">Currency Name</th>
                  <th className="global-lookup-th-ui">Action</th>
                </tr>
                <tr classname="global-lookup-tr-ui">
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.currCode}
                      onChange={(e) => handleFilterChange(e, 'currCode')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters.currName}
                      onChange={(e) => handleFilterChange(e, 'currName')}
                      className="global-lookup-filter-text-ui"
                    />
                  </th>
                  <th className="global-lookup-th-ui"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
  {loading ? (
    <tr>
      <td colSpan="3" className="global-lookup-td-ui">
        <div className="w-8 h-8 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm text-gray-500 mt-2">Loading currency...</div>
      </td>
    </tr>
  ) : filtered.length > 0 ? (
    filtered.map((curr, index) => (
      <tr key={index} className="global-lookup-tr-ui">
        <td className="global-lookup-td-ui text-center">{curr.currCode}</td>
        <td className="global-lookup-td-ui">{curr.currName}</td>
        <td className="global-lookup-td-apply-ui">
          <button
            onClick={() => handleApply(curr)}
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
        No matching currency found.
      </td>
    </tr>
  )}
</tbody>

            </table>
            <div className="global-lookup-count-ui">
              Showing <strong>{filtered.length}</strong> of {currency.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrLookupModal;
