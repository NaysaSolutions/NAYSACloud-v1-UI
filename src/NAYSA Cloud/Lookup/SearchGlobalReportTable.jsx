
import {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faEye,
  faChevronRight,
  faChevronDown,
  faTimes,
  faLayerGroup,
  faCompressArrowsAlt,
  faExpandArrowsAlt,
  faFileExcel,
  faColumns,
} from "@fortawesome/free-solid-svg-icons";
// Assuming formatNumber and parseFormattedNumber are available globally or imported correctly
import {
  formatNumber,
  parseFormattedNumber,
} from "@/NAYSA Cloud/Global/behavior";
// Assuming useReturnToDate is available globally or imported correctly
import { useReturnToDate } from "@/NAYSA Cloud/Global/dates";
import { useAuth } from "@/NAYSA Cloud/Authentication/AuthContext.jsx";
// 🔹 Import your Excel export helper
import { exportGenericQueryExcel } from "@/NAYSA Cloud/Global/report";
import Swal from 'sweetalert2';


const ACTION_COL_WIDTH = 64;

// Loader (unchanged)
const TableLoader = () => (
  <div className="flex flex-col items-center justify-center h-32 bg-gray-50 border border-gray-200 rounded-lg shadow-md p-4">
    <div className="w-8 h-8 border-4 border-t-blue-500 border-r-green-500 border-b-red-500 border-l-yellow-500 rounded-full animate-spin"></div>
    <p className="mt-3 text-sm text-blue-600 font-semibold">
      Loading Report...
    </p>
  </div>
);

const SearchGlobalReportTable = forwardRef(
  (
    {
      columns = [],
      data = [],
      itemsPerPage = 50,
      showFilters = true,
      rightActionLabel = null,
      onRowAction,
      onRowDoubleClick,
      className = "",
      initialState,
      onStateChange,
      totalExemptions = ["rate", "percent", "ratio", "id", "code"],
      // optional loading flag from parent
      isLoading = false,
    },
    ref
  ) => {
    const scrollRef = useRef(null);
    const [filters, setFilters] = useState(() => initialState?.filters || {});
    const [sortConfig, setSortConfig] = useState(
      () => initialState?.sortConfig || { key: null, direction: null }
    );
    const [currentPage, setCurrentPage] = useState(
      () => Number(initialState?.currentPage) || 1
    );

    const [columnOrder, setColumnOrder] = useState([]);
    const [groupBy, setGroupBy] = useState(() => initialState?.groupBy || []);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [draggedCol, setDraggedCol] = useState(null);

    // Column widths only after resize
    const [colWidths, setColWidths] = useState({});
    const resizingRef = useRef(null);

    // NEW: user-controlled hidden columns (on top of col.hidden)
    const [userHiddenCols, setUserHiddenCols] = useState(
      () => initialState?.userHiddenCols || []
    );
    const [showColumnChooser, setShowColumnChooser] = useState(false);
    const { user,companyInfo, currentUserRow, refsLoaded, refsLoading } = useAuth();


    // Initial column order setup
    useEffect(() => {
      if (columns.length && columnOrder.length === 0) {
        setColumnOrder(columns.map((c) => c.key));
      }
    }, [columns, columnOrder.length]);

    // Notify parent component on state change
    useEffect(() => {
      onStateChange?.({
        filters,
        sortConfig,
        currentPage,
        groupBy,
        userHiddenCols,
      });
    }, [filters, sortConfig, currentPage, groupBy, userHiddenCols, onStateChange]);

    // whenever grouping changes, reset expansions and page
    useEffect(() => {
      setExpandedGroups({});
      setCurrentPage(1);
    }, [groupBy]);

    // Clear grouping state when data is empty
    useEffect(() => {
      if (Array.isArray(data) && data.length === 0) {
        if (groupBy.length > 0) {
          setGroupBy([]);
        }
      }
    }, [data.length, groupBy.length]);

    // --- Utility Functions ---
    const parseNumber = (v) => {
      if (typeof parseFormattedNumber === "function") {
        const n = parseFormattedNumber(v);
        return typeof n === "number"
          ? n
          : Number(String(v ?? "").replace(/,/g, ""));
      }
      return typeof v === "number"
        ? v
        : Number(String(v ?? "").replace(/,/g, ""));
    };

    const formatValue = (value, col) => {
      if (value === null || value === undefined) return "—";
      switch (col?.renderType) {
        case "number":
        case "currency": {
          const digits =
            typeof col?.roundingOff === "number" ? col.roundingOff : 2;
          return typeof formatNumber === "function"
            ? formatNumber(value, digits)
            : Number(parseNumber(value)).toLocaleString("en-US", {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits,
              });
        }
        case "date": {
          try {
            const datePart = String(value).split("T")[0];
            return typeof useReturnToDate === "function"
              ? useReturnToDate(datePart)
              : datePart;
          } catch {
            return String(value);
          }
        }
        default:
          return String(value);
      }
    };

    // --- Column & Data Processing Memos ---
    const orderedCols = useMemo(() => {
      if (columnOrder.length === 0) return columns;
      return columnOrder
        .map((key) => columns.find((c) => c.key === key))
        .filter(Boolean);
    }, [columns, columnOrder]);

    // Columns that are "allowed" to show in chooser: not config-hidden
    const baseVisibleColumns = useMemo(
      () => orderedCols.filter((c) => !c.hidden),
      [orderedCols]
    );

    // Final visible columns = baseVisibleColumns minus userHiddenCols minus grouped columns
    const visibleCols = useMemo(
      () =>
        baseVisibleColumns.filter(
          (c) => !userHiddenCols.includes(c.key) && !groupBy.includes(c.key)
        ),
      [baseVisibleColumns, groupBy, userHiddenCols]
    );

    const hasActionCol = Boolean(onRowAction || rightActionLabel);

    // Only allow removing a group chip when there is 0 or 1 group
    const canRemoveSingleGroup = groupBy.length <= 1;

    const handleColDragStart = (e, key) => {
      setDraggedCol(key);
      e.dataTransfer.effectAllowed = "move";
    };

    const handleColDrop = (e, targetKey, isDropZone = false) => {
      e.preventDefault();
      if (!draggedCol) return;

      if (isDropZone) {
        if (!groupBy.includes(draggedCol)) {
          setGroupBy((prev) => [...prev, draggedCol]);
        }
      } else {
        if (groupBy.includes(draggedCol)) return;
        if (draggedCol === targetKey) return;
        const newOrder = [...columnOrder];
        const oldIdx = newOrder.indexOf(draggedCol);
        const newIdx = newOrder.indexOf(targetKey);
        if (oldIdx > -1 && newIdx > -1) {
          newOrder.splice(oldIdx, 1);
          newOrder.splice(newIdx, 0, draggedCol);
          setColumnOrder(newOrder);
        }
      }
      setDraggedCol(null);
    };

    const handleSort = useCallback((key, sortable) => {
      if (sortable === false) return;
      setSortConfig((prev) => {
        if (prev.key === key) {
          if (prev.direction === "asc") return { key, direction: "desc" };
          if (prev.direction === "desc")
            return { key: null, direction: null };
        }
        return { key, direction: "asc" };
      });
      setCurrentPage(1);
    }, []);

    const filteredData = useMemo(() => {
      const active = Object.entries(filters).filter(
        ([, v]) => String(v || "").trim() !== ""
      );
      let rows = Array.isArray(data) ? data : [];

      if (active.length) {
        rows = rows.filter((r) =>
          active.every(([k, v]) =>
            String(r?.[k] ?? "")
              .toLowerCase()
              .includes(String(v).toLowerCase())
          )
        );
      }

      if (sortConfig?.key && sortConfig?.direction) {
        const { key, direction } = sortConfig;
        const col = columns.find((c) => c.key === key);
        const isNumeric =
          col?.renderType === "number" || col?.renderType === "currency";
        const norm = (val) =>
          isNumeric ? parseNumber(val) || 0 : String(val ?? "").toLowerCase();

        rows = [...rows].sort((a, b) => {
          const A = norm(a?.[key]);
          const B = norm(b?.[key]);
          const cmp = isNumeric
            ? A - B
            : String(A).localeCompare(String(B), undefined, {
                numeric: true,
              });
          return direction === "asc" ? cmp : -cmp;
        });
      }

      return rows.map((row) => {
        const cleanRow = { ...row };
        delete cleanRow.isGroup;
        delete cleanRow.isSubtotal;
        delete cleanRow.children;
        return cleanRow;
      });
    }, [data, filters, sortConfig, columns]);

    const shouldSumColumn = (col) => {
      if (col.renderType !== "number" && col.renderType !== "currency")
        return false;
      const label = col.label.toLowerCase();
      const key = col.key.toLowerCase();
      if (totalExemptions.some((ex) => label.includes(ex) || key.includes(ex)))
        return false;
      return true;
    };

    const calculateAggregates = (rows) => {
      const sums = {};
      visibleCols.forEach((col) => {
        if (shouldSumColumn(col)) {
          sums[col.key] = rows.reduce(
            (acc, curr) => acc + (parseNumber(curr[col.key]) || 0),
            0
          );
        }
      });
      return sums;
    };

    const groupData = (rows, level = 0) => {
      if (level >= groupBy.length) {
        return rows.map((row) => ({ ...row }));
      }
      const groupKey = groupBy[level];
      const groups = {};
      rows.forEach((row) => {
        const val = String(row[groupKey] ?? "(Blank)");
        if (!groups[val]) groups[val] = [];
        groups[val].push(row);
      });

      const result = [];
      Object.keys(groups)
        .sort()
        .forEach((key) => {
          result.push({
            isGroup: true,
            key: groupKey,
            value: key,
            level,
            children: groupData(groups[key], level + 1),
            count: groups[key].length,
            aggregates: calculateAggregates(groups[key]),
          });
        });
      return result;
    };

    const processRenderList = (nodes) => {
      let list = [];
      nodes.forEach((node) => {
        if (node.isGroup) {
          list.push(node);
          const uniqueId = `${node.key}-${node.value}-${node.level}`;
          if (expandedGroups[uniqueId]) {
            if (node.level === groupBy.length - 1) {
              list = list.concat(node.children);
            } else {
              list = list.concat(processRenderList(node.children));
            }
            list.push({
              isSubtotal: true,
              groupLabel: columns.find((c) => c.key === node.key)?.label,
              groupValue: node.value,
              aggregates: node.aggregates,
              level: node.level,
            });
          }
        } else {
          list.push(node);
        }
      });
      return list;
    };

    const groupedStructure = useMemo(() => {
      if (groupBy.length === 0) return filteredData;
      return groupData(filteredData);
    }, [filteredData, groupBy]);

    // --- Pagination Logic ---
    const totalItems =
      groupBy.length > 0 ? groupedStructure.length : filteredData.length;
    const totalPages =
      itemsPerPage > 0
        ? Math.max(1, Math.ceil(totalItems / itemsPerPage))
        : 1;
    const safePage = Math.min(Math.max(1, currentPage), totalPages);

    useEffect(() => {
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else if (currentPage < 1 && totalPages > 0) {
        setCurrentPage(1);
      }
    }, [currentPage, totalPages]);

    const displayRows = useMemo(() => {
      const start = (safePage - 1) * itemsPerPage;

      if (groupBy.length === 0) {
        return itemsPerPage > 0
          ? filteredData.slice(start, start + itemsPerPage)
          : filteredData;
      }

      const pagedGroups =
        itemsPerPage > 0
          ? groupedStructure.slice(start, start + itemsPerPage)
          : groupedStructure;

      return processRenderList(pagedGroups);
    }, [
      filteredData,
      groupedStructure,
      safePage,
      itemsPerPage,
      expandedGroups,
      groupBy,
    ]);

    const grandTotals = useMemo(
      () => calculateAggregates(filteredData),
      [filteredData, visibleCols]
    );



  const getDateTimeStamp = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
  };



    // 🔹 Export handler using your global function
    const handleExportClick = async () => {
      try {


    const getDateTimeStamp = () => {
    // Example implementation: YYYYMMDD_HHmmss
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
    return `${datePart}_${timePart}`;
};

    const defaultFileName = `Query Report ${getDateTimeStamp()}`;
    const { value: fileName } = await Swal.fire({
        title: 'Enter File Name',
        input: 'text',
        inputLabel: 'Export File Name:',
        inputValue: defaultFileName, 
        width: '400px',
        showCancelButton: true,
        confirmButtonText: 'Export',
        inputValidator: (value) => {
            if (!value || value.trim() === '') {
                return 'File name cannot be empty!';
            }
        }
    });



  if (!fileName) {
      return;
  }

      const exportData =
          groupBy.length > 0 ? groupedStructure : filteredData;

       await exportGenericQueryExcel(
          exportData,
          grandTotals,
          visibleCols,
          groupBy,
          columns,
          expandedGroups,
          7,
          fileName,
          currentUserRow?.userName,
          companyInfo?.compName,
          companyInfo?.compAddr,
          companyInfo?.telNo,
        );
      } catch (err) {
        console.error("Error exporting Excel:", err);
      }
    };




    const toggleGroup = (node) => {
      const uniqueId = `${node.key}-${node.value}-${node.level}`;
      setExpandedGroups((prev) => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
    };

    const toggleAll = (expand) => {
      if (!expand) {
        setExpandedGroups({});
        return;
      }
      const allKeys = {};
      const traverse = (nodes) => {
        nodes.forEach((n) => {
          if (n.isGroup) {
            allKeys[`${n.key}-${n.value}-${n.level}`] = true;
            if (Array.isArray(n.children) && n.children[0]?.isGroup)
              traverse(n.children);
          }
        });
      };
      traverse(groupedStructure);
      setExpandedGroups(allKeys);
    };

    // --- Column resizing: mouse handlers ---
    const handleMouseMove = useCallback((e) => {
      if (!resizingRef.current) return;
      const { startX, startWidth, key } = resizingRef.current;
      const delta = e.clientX - startX;
      const newWidth = Math.max(0, startWidth + delta);
      setColWidths((prev) => ({
        ...prev,
        [key]: newWidth,
      }));
    }, []);

    const handleMouseUp = useCallback(() => {
      if (resizingRef.current) {
        resizingRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    }, [handleMouseMove]);

    const startResizing = (e, key) => {
      e.preventDefault();
      e.stopPropagation(); // avoid triggering sort / drag
      const th = e.currentTarget?.parentElement;
      const currentWidth =
        th?.offsetWidth ||
        colWidths[key] ||
        Number(columns.find((c) => c.key === key)?.width) ||
        120;

      resizingRef.current = {
        startX: e.clientX,
        startWidth: currentWidth,
        key,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // --- Sticky Plan (reverted initial widths, only override after resize) ---
    // const stickyPlan = useMemo(() => {
    //   let left = hasActionCol ? ACTION_COL_WIDTH : 0;
    //   return visibleCols.map((c) => {
    //     const resizedWidth = colWidths[c.key];

    //     if (c.stickyLeft) {
    //       const width =
    //         resizedWidth ?? (Number(c.width) || 120);
    //       const meta = { sticky: true, left, width };
    //       left += width;
    //       return meta;
    //     }

    //     return { sticky: false, left: 0, width: resizedWidth || undefined };
    //   });
    // }, [visibleCols, hasActionCol, colWidths]);

    // --- Sticky Plan (reverted initial widths, only override after resize) ---
    const stickyPlan = useMemo(() => {
      let left = hasActionCol ? ACTION_COL_WIDTH : 0;

      // 1. Determine the maximum number of data columns to freeze
      // Freeze up to 2 columns if grouped, otherwise only 1
      const maxStickyCols = groupBy.length > 0 ? 1 : 0;
      
      return visibleCols.map((col, index) => {
        const resizedWidth = colWidths[col.key];
        
        // 2. Check if the current column is one of the designated sticky columns
        const isSticky = index < maxStickyCols;

        if (isSticky) {
          // Use resized width, or fallback to config width, or default 120
          const width = resizedWidth ?? (Number(col.width) || 120);
          const meta = { sticky: true, left, width };
          
          // Accumulate the 'left' offset for the next sticky column
          left += width;
          return meta;
        }

        // For non-sticky columns, return width if resized, otherwise undefined
        return { sticky: false, left: 0, width: resizedWidth || undefined };
      });
      // 3. Added groupBy.length to dependencies to recalculate when grouping changes
    }, [visibleCols, hasActionCol, colWidths, groupBy.length]);


    const numberAlignClass = (col) =>
      col?.renderType === "number" || col?.renderType === "currency"
        ? "text-right tabular-nums"
        : "text-left";

    const commonCellClass =
      "px-3 py-[6px] whitespace-nowrap max-w-[400px] truncate";

    useImperativeHandle(ref, () => ({
      getState: () => ({
        filters,
        sortConfig,
        currentPage: safePage,
        groupBy,
        userHiddenCols,
      }),
      scrollRef,

      clearAllState: () => {
        setFilters({});
        setSortConfig({ key: null, direction: null });
        setGroupBy([]);
        setUserHiddenCols([]);
      },

      resetFilters: () => setFilters({}),
      clearSort: () => setSortConfig({ key: null, direction: null }),
      goToPage: (p) => setCurrentPage(Math.max(1, Number(p) || 1)),
    }));

    const hasData = Array.isArray(filteredData) && filteredData.length > 0;

    // loader while dynamic columns are still loading (or parent says loading)
    const isLoadingColumns = isLoading || columns.length === 0;

    // --- Column chooser helpers ---
    const allChooserKeys = baseVisibleColumns.map((c) => c.key);
    const allChecked = userHiddenCols.length === 0;

    const toggleSelectAll = () => {
      if (allChecked) {
        setUserHiddenCols(allChooserKeys);
      } else {
        setUserHiddenCols([]);
      }
    };

    // --- Render ---
    return (
      <div
        className={[
          "flex flex-col border rounded-md max-h-[590px] bg-white",
          className,
        ].join(" ")}
      >
        {isLoadingColumns ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <TableLoader />
          </div>
        ) : (
          <>
            {hasData && (
              <div
                className="p-2 bg-gray-50 border-b flex flex-wrap gap-2 items-center min-h-[45px] shrink-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleColDrop(e, null, true)}
              >
                {/* Left side: Group By */}
                <div className="flex-1 flex flex-wrap gap-2 items-center">
                  <div className="text-xs font-bold text-gray-500 flex items-center">
                    <FontAwesomeIcon icon={faLayerGroup} className="mr-2" />
                    Group By:
                  </div>
                  {groupBy.length === 0 && (
                    <div className="text-xs text-gray-400 italic border border-dashed border-gray-300 rounded px-3 py-1">
                      Drag Header Here...
                    </div>
                  )}
                  {groupBy.map((gKey) => (
                    <div
                      key={gKey}
                      className="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200"
                    >
                      <span>{columns.find((c) => c.key === gKey)?.label}</span>

                      {canRemoveSingleGroup && (
                        <button
                          onClick={() => {
                            setGroupBy((prev) => prev.filter((k) => k !== gKey));
                          }}
                          className="ml-2 text-blue-500 hover:text-red-500"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Right side: group controls + export + column chooser */}
                <div className="flex items-center gap-2">
                  {groupBy.length > 0 && (
                    <>
                      <button
                        onClick={() => toggleAll(true)}
                        className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100"
                        title="Expand All"
                      >
                        <FontAwesomeIcon icon={faExpandArrowsAlt} /> Expand
                      </button>
                      <button
                        onClick={() => toggleAll(false)}
                        className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100"
                        title="Collapse All"
                      >
                        <FontAwesomeIcon icon={faCompressArrowsAlt} /> Collapse
                      </button>
                      <button
                        onClick={() => setGroupBy([])}
                        className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100"
                        title="Remove All Groups"
                      >
                       <FontAwesomeIcon icon={faTimes} className="text-red-600 mr-1" />Remove
                      </button>
                    </>
                  )}

                  {/* 🔹 Export button (beside Columns) */}
                 <button
                    type="button"
                    onClick={handleExportClick}
                    disabled={!hasData}
                    className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    title="Export to Excel"
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="text-green-600" /> Export
                  </button>

                  {/* Column chooser */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColumnChooser((prev) => !prev)}
                      className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100"
                    >
                        <FontAwesomeIcon icon={faColumns} className="text-green-600" /> Columns
                    </button>
                    {showColumnChooser && (
                      <div className="absolute right-0 mt-1 bg-white border rounded shadow-lg p-2 max-h-64 overflow-auto z-50 min-w-[200px]">
                        <div className="flex items-center justify-between text-[11px] font-semibold mb-1 border-b pb-1">
                          <span>Show / Hide Columns</span>
                          <label className="flex items-center gap-1 text-[11px]">
                            <input
                              type="checkbox"
                              className="h-3 w-3"
                              checked={allChecked}
                              onChange={toggleSelectAll}
                            />
                            <span>Select All</span>
                          </label>
                        </div>
                        {baseVisibleColumns.map((col) => (
                          <label
                            key={col.key}
                            className="flex items-center text-[11px] gap-2 mb-1"
                          >
                            <input
                              type="checkbox"
                              className="h-3 w-3"
                              checked={!userHiddenCols.includes(col.key)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setUserHiddenCols((prev) => {
                                  if (checked) {
                                    return prev.filter((k) => k !== col.key);
                                  } else {
                                    return [...prev, col.key];
                                  }
                                });
                              }}
                            />
                            <span className="truncate">{col.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>


                
              </div>
            )}

            <div
              ref={scrollRef}
              key={`table-view-${groupBy.length > 0 ? "grouped" : "flat"}`}
              className={`flex-grow w-full overscroll-x-contain relative ${
                hasData ? "overflow-auto" : "overflow-hidden"
              }`}
            >
              <table className="min-w-full border-collapse relative table-fixed">
                <thead className="sticky top-0 z-20 shadow-sm">
                  <tr className="bg-blue-700 text-white text-[10px] sm:text-[11px]">
                    {hasActionCol && (
                      <th
                        className="sticky left-0 top-0 z-50 px-2 py-2 font-bold border-r border-blue-800 bg-blue-700 w-[64px]"
                        style={{
                          minWidth: ACTION_COL_WIDTH,
                          maxWidth: ACTION_COL_WIDTH,
                        }}
                      >
                        {rightActionLabel ?? ""}
                      </th>
                    )}
                    {visibleCols.map((col, i) => {
                      const meta = stickyPlan[i];

                      const style = meta.sticky
                        ? {
                            left: meta.left,
                            ...(meta.width
                              ? {
                                  width: meta.width,
                                  minWidth: meta.width,
                                }
                              : {}),
                          }
                        : {
                            maxWidth: 400,
                            ...(meta.width
                              ? {
                                  width: meta.width,
                                  minWidth: meta.width,
                                }
                              : {}),
                          };

                      return (
                        <th
                          key={col.key}
                          draggable={!groupBy.includes(col.key)}
                          onDragStart={(e) => handleColDragStart(e, col.key)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleColDrop(e, col.key)}
                          className={`px-3 py-3 font-bold select-none cursor-grab whitespace-nowrap overflow-hidden text-ellipsis ${
                            meta.sticky ? "sticky z-40 bg-blue-700" : ""
                          } ${numberAlignClass(col)} relative`}
                          style={style}
                          onClick={() => handleSort(col.key, col.sortable)}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">{col.label}</span>
                            {sortConfig.key === col.key ? (
                              <FontAwesomeIcon
                                icon={
                                  sortConfig.direction === "asc"
                                    ? faSortUp
                                    : faSortDown
                                }
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faSort}
                                className="opacity-30"
                              />
                            )}
                          </div>

                          {/* Resize handle */}
                          <div
                            className="absolute top-0 right-0 h-full w-1 cursor-col-resize select-none"
                            onMouseDown={(e) => startResizing(e, col.key)}
                          />
                        </th>
                      );
                    })}
                  </tr>

                  {showFilters && hasData && (
                    <tr className="bg-white border-b border-gray-200 text-[10px]">
                      {hasActionCol && (
                        <td className="sticky left-0 z-50 px-2 py-1 border-r bg-white" />
                      )}
                      {visibleCols.map((col, i) => {
                        const meta = stickyPlan[i];
                        const style = meta.sticky
                          ? {
                              left: meta.left,
                              ...(meta.width ? { width: meta.width } : {}),
                            }
                          : meta.width
                          ? { width: meta.width }
                          : undefined;

                        return (
                          <td
                            key={col.key}
                            className={`px-2 py-1 ${
                              meta.sticky ? "sticky z-40 bg-white" : ""
                            }`}
                            style={style}
                          >
                            <input
                              type="text"
                              value={filters[col.key] || ""}
                              onChange={(e) => {
                                setFilters((prev) => ({
                                  ...prev,
                                  [col.key]: e.target.value,
                                }));
                                setCurrentPage(1);
                              }}
                              className="w-full border rounded px-2 py-1 text-[10px] focus:outline-none focus:border-blue-400"
                              placeholder="Filter..."
                            />
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </thead>

                <tbody className="bg-white text-[10px] sm:text-[11px]">
                  {displayRows.length > 0 && (
                    <>
                      {displayRows.map((row, rIdx) => {
                        const isRenderingGroup = groupBy.length > 0;

                        if (isRenderingGroup && row.isGroup) {
                          const uniqueId = `${row.key}-${row.value}-${row.level}`;
                          const isExpanded = expandedGroups[uniqueId];
                          const colSpan =
                            visibleCols.length + (hasActionCol ? 1 : 0);
                          return (
                            <tr
                              key={`g-${uniqueId}`}
                              className="bg-gray-100 hover:bg-gray-200 cursor-pointer"
                              onClick={() => toggleGroup(row)}
                            >
                              <td
                                colSpan={colSpan}
                                className="px-2 py-2 font-semibold border-b border-gray-300 text-blue-900 whitespace-nowrap"
                              >
                                <div
                                  className="flex items-center"
                                  style={{ paddingLeft: row.level * 20 }}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      isExpanded
                                        ? faChevronDown
                                        : faChevronRight
                                    }
                                    className="w-3 h-3 mr-2 text-gray-500"
                                  />
                                  <span className="mr-2 text-gray-600">
                                    {
                                      columns.find(
                                        (c) => c.key === row.key
                                      )?.label
                                    }
                                    :
                                  </span>
                                  <span className="mr-2 font-bold">
                                    {row.value}
                                  </span>
                                  <span className="bg-blue-200 text-blue-800 text-[9px] px-1.5 rounded-full">
                                    {row.count}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        if (isRenderingGroup && row.isSubtotal) {
                          return (
                            <tr
                              key={`sub-${row.groupValue}-${rIdx}`}
                              className="bg-yellow-50 font-bold border-b border-gray-300"
                            >
                              {hasActionCol && (
                                <td className="sticky left-0 bg-yellow-50 border-r border-gray-300 z-10" />
                              )}
                              {visibleCols.map((col, i) => {
                                const meta = stickyPlan[i];
                                const val = row.aggregates[col.key];
                                const style = meta.sticky
                                  ? {
                                      left: meta.left,
                                      ...(meta.width
                                        ? { width: meta.width }
                                        : {}),
                                    }
                                  : meta.width
                                  ? { width: meta.width }
                                  : undefined;

                                return (
                                  <td
                                    key={col.key}
                                    className={`${commonCellClass} ${numberAlignClass(
                                      col
                                    )} ${
                                      meta.sticky
                                        ? "sticky z-10 bg-yellow-50"
                                        : ""
                                    }`}
                                    style={style}
                                  >
                                    {i === 0 && (
                                      <div
                                        className="float-left text-left font-bold"
                                        style={{
                                          paddingLeft: row.level * 20,
                                        }}
                                      >
                                        <span className="text-gray-600">
                                          Sub Total for {row.groupLabel}:
                                        </span>
                                        <span className="ml-1 text-blue-900">
                                          {row.groupValue}
                                        </span>
                                      </div>
                                    )}
                                    {val !== undefined
                                      ? formatValue(val, col)
                                      : ""}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        }

                        const isEven = rIdx % 2 === 0;
                        return (
                          <tr
                            key={row.__idx ?? rIdx}
                            className={`hover:bg-blue-50 ${
                              isEven ? "bg-white" : "bg-gray-50"
                            }`}
                            onDoubleClick={() => onRowDoubleClick?.(row)}
                          >
                            {hasActionCol && (
                              <td className="sticky left-0 z-10 px-2 py-[2px] text-center border-r border-gray-200 bg-inherit w-[64px] min-w-[64px]">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRowAction?.(row);
                                  }}
                                  className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                  title={rightActionLabel ?? "Open"}
                                >
                                  <FontAwesomeIcon
                                    icon={faEye}
                                    className="w-4 h-3"
                                  />
                                </button>
                              </td>
                            )}

                            {visibleCols.map((col, i) => {
                              const meta = stickyPlan[i];
                              const style = meta.sticky
                                ? {
                                    left: meta.left,
                                    ...(meta.width
                                      ? {
                                          width: meta.width,
                                          minWidth: meta.width,
                                        }
                                      : {}),
                                  }
                                : meta.width
                                ? {
                                    width: meta.width,
                                    minWidth: meta.width,
                                  }
                                : undefined;

                              return (
                                <td
                                  key={col.key}
                                  className={`${commonCellClass} ${numberAlignClass(
                                    col
                                  )} ${
                                    meta.sticky ? "sticky z-10 bg-inherit" : ""
                                  }`}
                                  style={style}
                                  title={String(row[col.key] ?? "")}
                                >
                                  {formatValue(row[col.key], col)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      <tr className="h-12 border-0 bg-transparent">
                        <td
                          colSpan={visibleCols.length + (hasActionCol ? 1 : 0)}
                          className="border-0 p-0"
                        />
                      </tr>
                    </>
                  )}
                </tbody>

                {hasData && (
                  <tfoot className="sticky bottom-0 z-30 shadow-[0_-4px_6px_rgba(0,0,0,0.1)] text-[10px] sm:text-[11px]">
                    <tr className="bg-gray-100 font-bold border-t border-blue-400">
                      {hasActionCol && (
                        <td className="sticky left-0 bg-gray-100 border-r border-gray-300 z-40" />
                      )}
                      {visibleCols.map((col, i) => {
                        const meta = stickyPlan[i];
                        const val = grandTotals[col.key];
                        const style = meta.sticky
                          ? {
                              left: meta.left,
                              ...(meta.width ? { width: meta.width } : {}),
                            }
                          : meta.width
                          ? { width: meta.width }
                          : undefined;

                        return (
                          <td
                            key={col.key}
                            className={`${commonCellClass} ${numberAlignClass(
                              col
                            )} ${
                              meta.sticky ? "sticky z-30 bg-gray-100" : ""
                            }`}
                            style={style}
                          >
                            {i === 0 && (
                              <span className="text-gray-700 uppercase tracking-wide">
                                {groupBy.length > 0 ? "Grand Total" : "Total"}
                              </span>
                            )}
                            {val !== undefined
                              ? formatValue(val, col)
                              : ""}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* No data (but data array exists) */}
            {!hasData && Array.isArray(data) && data.length > 0 && (
              <div className="p-4 text-center text-gray-500">
                No results found matching the current filters.
              </div>
            )}

            {/* Pagination Controls */}
            {itemsPerPage > 0 && hasData && (
              <div className="flex items-center justify-end gap-2 p-2 border-t bg-white text-[11px] shrink-0">
                <span className="mr-2 opacity-70">
                  {groupBy.length > 0 ? "Groups: " : "Rows: "}
                  {safePage} of {totalPages} ({totalItems} total)
                </span>
                <button
                  className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={safePage === 1}
                >
                  Prev
                </button>
                <button
                  className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((p) =>
                      p < totalPages ? p + 1 : p
                    )
                  }
                  disabled={safePage >= totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

export default SearchGlobalReportTable;

