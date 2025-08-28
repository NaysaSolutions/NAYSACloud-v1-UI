import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSort, faSortUp, faSortDown, faSpinner } from '@fortawesome/free-solid-svg-icons'; 
import { formatNumber } from '../Global/behavior';


const AROpenBalanceLookupModal = ({ isOpen, onClose, onCancel, params }) => {
    const { branchCode, custCode} = params;
    const [records, setRecords] = useState([]); 
    const [filtered, setFiltered] = useState([]);
    const [selected, setSelected] = useState([]); 
    const [filters, setFilters] = useState({
        branhCode: '', docCode: '', siNo: '', siDate: '',
        custCode: '', custName: '', currCode:'', currRate:'',
        debit:'', credit:'', balance:''
        // 🔹 removed groupId filter
    });
    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    useEffect(() => {
        if (!isOpen) {
            setRecords([]);
            setFiltered([]);
            setSelected([]);
            setFilters({
                branhCode: '', docCode: '', siNo: '', siDate: '',
                custCode: '', custName: '', currCode:'', currRate:'',
                debit:'', credit:'', balance:''
            });
            setSortConfig({ key: '', direction: 'asc' });
            setCurrentPage(1);
            return;
        }
        fetchData(currentPage);
    }, [isOpen, currentPage]);

    const fetchData = (page) => {
          setLoading(true);
            axios.get("http://127.0.0.1:8000/api/getOpenARBalance", {
                params: {
                PARAMS: JSON.stringify({json_data: { custCode, branchCode } }),  
                page: page,
                itemsPerPage: itemsPerPage,
            },
            })
            .then((response) => {
                const result = response.data;
                if (result.success && result.data?.[0]?.result) {
                const custData = JSON.parse(result.data[0].result);
                setRecords(custData);
                setFiltered(custData);
                } else {
                setRecords([]); 
                setFiltered([]);
                }
            })
            .catch((err) => console.error("Failed to fetch records:", err))
            .finally(() => setLoading(false));
     };

    const handleGetSelected = () => { 
         const result = selected.map(item => ({ groupId: item.groupId,  }));
         const payload = {
          data: result.map(r => r.groupId),
         };
        onClose(payload)
    };



    useEffect(() => {
        let currentFiltered = [...records];
        currentFiltered = currentFiltered.filter(item =>
            (item.branhCode || '').toLowerCase().includes((filters.branhCode || '').toLowerCase()) &&
            (item.docCode || '').toLowerCase().includes((filters.docCode || '').toLowerCase()) &&
            (item.siNo || '').toLowerCase().includes((filters.siNo || '').toLowerCase()) &&
            (item.siDate || '').toLowerCase().includes((filters.siDate || '').toLowerCase()) &&
            (item.custCode || '').toLowerCase().includes((filters.custCode || '').toLowerCase()) &&
            (item.custName || '').toLowerCase().includes((filters.custName || '').toLowerCase()) &&
            (item.currCode || '').toLowerCase().includes((filters.currCode || '').toLowerCase()) &&
            (String(item.debit ?? '').replace(/,/g, '').includes((filters.debit || '').replace(/,/g, ''))) &&
            (String(item.credit ?? '').replace(/,/g, '').includes((filters.credit || '').replace(/,/g, ''))) &&
            (String(item.balance ?? '').replace(/,/g, '').includes((filters.balance || '').replace(/,/g, '')))
        );

        if (sortConfig.key) {
            currentFiltered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFiltered(currentFiltered);
    }, [filters, records, sortConfig]);

    const handleFilterChange = (e, key) => {
        setFilters({ ...filters, [key]: e.target.value });
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (column) => {
        if (sortConfig.key === column) {
            return sortConfig.direction === 'asc'
                ? <FontAwesomeIcon icon={faSortUp} className="ml-1 text-blue-500" />
                : <FontAwesomeIcon icon={faSortDown} className="ml-1 text-blue-500" />;
        }
        return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;
    };

    const toggleSelect = (cust) => {
        if (selected.some(s => s.siNo === cust.siNo && s.docCode === cust.docCode)) {
            setSelected(selected.filter(s => !(s.siNo === cust.siNo && s.docCode === cust.docCode)));
        } else {
            setSelected([...selected, cust]);
        }
    };

    const toggleSelectAll = () => {
        if (selected.length === filtered.length) {
            setSelected([]);
        } else {
            setSelected(filtered);
        }
    };

    const handleNextPage = () => setCurrentPage(prev => prev + 1);
    const handlePrevPage = () => setCurrentPage(prev => prev - 1);

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
    };

    if (!isOpen) return null;
    const paginatedData = getPaginatedData();

    const totalItems = filtered.length;
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-8xl max-h-[90vh] flex flex-col relative overflow-hidden transform scale-95 animate-scale-in">
                {/* Close Icon */}
                <button
                    onClick={() => onCancel()}
                    className="absolute top-3 right-3 text-blue-500 hover:text-blue-700 transition duration-200 focus:outline-none p-1 rounded-full hover:bg-blue-100"
                    aria-label="Close modal"
                >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>

                <h2 className="text-sm font-semibold text-blue-800 p-3 border-b border-gray-100">Open AR Balance</h2>

                <div className="flex-grow overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-full min-h-[200px] text-blue-500">
                            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mr-3" />
                            <span>Loading Open AR Balance...</span>
                        </div>
                    ) : (
                        <div className="overflow-auto max-h-[calc(90vh-160px)] custom-scrollbar">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                                  <tr>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-blue-900">Select</th>
                                    <th onClick={() => handleSort('branchCode')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">Branch {renderSortIcon('branchCode')}</th>
                                    <th onClick={() => handleSort('docCode')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">Doc Code {renderSortIcon('docCode')}</th>
                                    <th onClick={() => handleSort('siNo')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">SI/SVI No {renderSortIcon('siNo')}</th>
                                    <th onClick={() => handleSort('siDate')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">SI/SVI Date {renderSortIcon('siDate')}</th>
                                    <th onClick={() => handleSort('custCode')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">Customer Code {renderSortIcon('custCode')}</th>
                                    <th onClick={() => handleSort('custName')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">Customer Name {renderSortIcon('custName')}</th>
                                    <th onClick={() => handleSort('currCode')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">Curr Code {renderSortIcon('currCode')}</th>
                                    <th onClick={() => handleSort('currRate')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">Curr Rate {renderSortIcon('currRate')}</th>
                                    <th onClick={() => handleSort('debit')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">Debit {renderSortIcon('debit')}</th>
                                    <th onClick={() => handleSort('credit')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">Credit {renderSortIcon('credit')}</th>
                                    <th onClick={() => handleSort('balance')} className="px-4 py-2 text-left text-xs font-bold text-blue-900 cursor-pointer">Balance {renderSortIcon('balance')}</th>
                                    {/* ❌ removed Group ID column */}
                                  </tr>

                                  {/* filter row */}
                                  <tr className="bg-white">
                                    <td></td>
                                    {['branhCode','docCode','siNo','siDate','custCode','custName','currCode','currRate','debit','credit','balance'].map((key, idx) => (
                                      <td key={idx} className="px-2 py-1">
                                        <input
                                          type="text"
                                          value={filters[key] || ""}
                                          onChange={(e) => handleFilterChange(e, key)}
                                          className="w-full border rounded px-2 py-1 text-xs"
                                          placeholder="Filter..."
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((cust, index) => (
                                            <tr key={index} className="hover:bg-blue-50 text-xs">
                                                <td className="px-2 py-1 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.some(s => s.siNo === cust.siNo && s.docCode === cust.docCode)}
                                                        onChange={() => toggleSelect(cust)}
                                                    />
                                                </td>
                                                <td className="px-4 py-1">{cust.branchCode}</td>
                                                <td className="px-4 py-1">{cust.docCode}</td>
                                                <td className="px-4 py-1">{cust.siNo}</td>
                                                <td className="px-4 py-1">{cust.siDate ? new Date(cust.siDate).toLocaleDateString("en-US") : ""}</td>
                                                <td className="px-4 py-1">{cust.custCode}</td>
                                                <td className="px-4 py-1">{cust.custName}</td>
                                                <td className="px-4 py-1">{cust.currCode}</td>
                                                <td className="px-4 py-1 text-right">{formatNumber(cust.currRate,6)}</td>
                                                <td className="px-4 py-1 text-right">{formatNumber(cust.debit)}</td>
                                                <td className="px-4 py-1 text-right">{formatNumber(cust.credit)}</td>
                                                <td className="px-4 py-1 text-right">{formatNumber(cust.balance)}</td>
                                                {/* ❌ removed groupId cell */}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="12" className="px-4 py-6 text-center text-gray-500 text-lg">
                                                No matching records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs text-gray-600">
                    {/* Left side */}
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={selected.length === filtered.length && filtered.length > 0}
                                onChange={toggleSelectAll}
                            />
                            Select All
                        </label>
                        <button
                            onClick={handleGetSelected}
                            disabled={selected.length === 0}
                            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            Get Selected Invoice
                        </button>
                    </div>

                    <div className="font-semibold">
                        Showing {startItem}-{endItem} of {totalItems} entries
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={filtered.length <= currentPage * itemsPerPage}
                            className="px-4 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AROpenBalanceLookupModal;
