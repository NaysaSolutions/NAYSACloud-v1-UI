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
import { faSort, faSortUp, faSortDown, faEye, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { formatNumber, parseFormattedNumber } from "@/NAYSA Cloud/Global/behavior";
import { useReturnToDate } from "@/NAYSA Cloud/Global/dates";


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
      initialState,           // NEW
      onStateChange,          // NEW
    },
    ref
  ) => {
    // Optional “lock once” header if you use that pattern; keep as-is if you already have it.
    const visibleCols = useMemo(() => (columns || []).filter((c) => !c.hidden), [columns]);

    const hasActionCol = Boolean(onRowAction || rightActionLabel);

    // Scroll container ref (parent reads this to preserve scroll)
    const scrollRef = useRef(null);

    // State (hydrate once from initialState)
    const [filters, setFilters] = useState(() => initialState?.filters || {});
    const [sortConfig, setSortConfig] = useState(() => initialState?.sortConfig || { key: null, direction: null });
    const [currentPage, setCurrentPage] = useState(() => {
      const p = Number(initialState?.currentPage) || 1;
      return p < 1 ? 1 : p;
    });

    // Re-emit state whenever it changes so parent can cache it
    useEffect(() => {
      onStateChange?.({ filters, sortConfig, currentPage });
    }, [filters, sortConfig, currentPage, onStateChange]);

    // --- Common formatting (GLOBAL BEHAVIOR) ---
    const parseNumber = (v) => {
      if (typeof parseFormattedNumber === "function") {
        const n = parseFormattedNumber(v);
        return typeof n === "number" ? n : Number(String(v ?? "").replace(/,/g, ""));
      }
      return typeof v === "number" ? v : Number(String(v ?? "").replace(/,/g, ""));
    };

    const formatValue = (value, col) => {
      if (value === null || value === undefined) return "—";

      switch (col?.renderType) {
        case "number":
        case "currency": {
          const digits = typeof col?.roundingOff === "number" ? col.roundingOff : 2;
          return typeof formatNumber === "function"
            ? formatNumber(value, digits)
            : (() => {
                const n = parseNumber(value);
                return Number.isFinite(n)
                  ? n.toLocaleString("en-US", {
                      minimumFractionDigits: digits,
                      maximumFractionDigits: digits,
                    })
                  : String(value);
              })();
        }
        case "date": {
          try {
            const datePart = String(value).split("T")[0];
            return typeof useReturnToDate === "function" ? useReturnToDate(datePart) : datePart;
          } catch {
            return String(value);
          }
        }
        default:
          return String(value);
      }
    };

    // Sticky columns planning (unchanged)
    const stickyPlan = useMemo(() => {
      let left = 0;
      return visibleCols.map((c) => {
        if (c.stickyLeft) {
          const width = Number(c.width) || 120;
          const meta = { sticky: true, left, width };
          left += width;
          return meta;
        }
        return { sticky: false, left: 0, width: undefined };
      });
    }, [visibleCols]);

    // Filtering + sorting
    const filtered = useMemo(() => {
      const active = Object.entries(filters).filter(([, v]) => String(v || "").trim() !== "");
      let rows = Array.isArray(data) ? data : [];

      if (active.length) {
        rows = rows.filter((r) =>
          active.every(([k, v]) =>
            String(r?.[k] ?? "").toLowerCase().includes(String(v).toLowerCase())
          )
        );
      }

      if (sortConfig?.key && sortConfig?.direction) {
        const { key, direction } = sortConfig;
        const col = visibleCols.find((c) => c.key === key);
        const isNumeric = col?.renderType === "number" || col?.renderType === "currency";

        const norm = (val) =>
          isNumeric
            ? Number.isFinite(parseNumber(val))
              ? parseNumber(val)
              : 0
            : String(val ?? "").toLowerCase();

        rows = [...rows].sort((a, b) => {
          const A = norm(a?.[key]);
          const B = norm(b?.[key]);
          const cmp = isNumeric
            ? A - B
            : String(A).localeCompare(String(B), undefined, { numeric: true });
          return direction === "asc" ? cmp : -cmp;
        });
      }
      return rows;
    }, [data, filters, sortConfig, visibleCols]);

    // Pagination (do NOT auto-reset page anymore)
    const paginationEnabled = itemsPerPage > 0;
    const totalPages = paginationEnabled ? Math.max(1, Math.ceil(filtered.length / itemsPerPage)) : 1;
    const safePage = paginationEnabled ? Math.min(Math.max(1, currentPage), totalPages) : 1;

    const paginated = useMemo(() => {
      if (!paginationEnabled) return filtered;
      const start = (safePage - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    }, [filtered, safePage, itemsPerPage, paginationEnabled]);

    const handleSort = useCallback((key, sortable) => {
      if (sortable === false) return;
      setSortConfig((prev) => {
        if (prev.key === key) {
          if (prev.direction === "asc") return { key, direction: "desc" };
          if (prev.direction === "desc") return { key: null, direction: null };
        }
        return { key, direction: "asc" };
      });
    }, []);

    const renderSortIcon = (columnKey) => {
      if (sortConfig.key === columnKey) {
        return sortConfig.direction === "asc" ? (
          <FontAwesomeIcon icon={faSortUp} className="ml-1" />
        ) : (
          <FontAwesomeIcon icon={faSortDown} className="ml-1" />
        );
      }
      return <FontAwesomeIcon icon={faSort} className="ml-1 opacity-50" />;
    };

    const numberAlignClass = (col) =>
      col?.renderType === "number" || col?.renderType === "currency"
        ? "text-right tabular-nums"
        : "";

    // Expose API to parent
    useImperativeHandle(ref, () => ({
      getState: () => ({ filters, sortConfig, currentPage: safePage }),
      scrollRef, // parent can read/write scrollRef.current.scrollTop/Left
      resetFilters: () => setFilters({}),
      clearSort: () => setSortConfig({ key: null, direction: null }),
      goToPage: (p) => setCurrentPage(Math.max(1, Number(p) || 1)),
    }));


    const scrollContainerClass = useMemo(() => {
        const baseClasses = "overflow-auto custom-scrollbar overscroll-x-contain";
        const noRecordsHeight = showFilters ? "max-h-[100px]" : "max-h-[40px]";
        if (filtered.length === 0) {
            return `${baseClasses} ${noRecordsHeight}`;
        }
        return `${baseClasses} max-h-[calc(100vh-220px)]`;
    }, [filtered.length, showFilters]);


    return (
      <div className={["flex flex-col border rounded-md overflow-hidden", className].join(" ")}>
        <div
          ref={scrollRef}
          // UPDATED: Use the dynamically calculated class
          className={scrollContainerClass}
        >
          <table className="min-w-full table-fixed">
            <thead className="sticky top-0 z-30">
              <tr className="bg-blue-700 text-white whitespace-nowrap text-[10px] sm:text-[11px]">
                {visibleCols.map((col, i) => {
                  const meta = stickyPlan[i];
                  const classes = [
                    "px-3 py-2 font-bold select-none",
                    col.sortable === false ? "cursor-default" : "cursor-pointer",
                    meta.sticky ? "sticky z-30 bg-blue-700 text-white top-0" : "text-white-900",
                    numberAlignClass(col),
                  ].join(" ");
                  const style = meta.sticky ? { left: meta.left, width: meta.width } : undefined;
                  return (
                    <th
                      key={col.key}
                      className={classes}
                      style={style}
                      onClick={() => handleSort(col.key, col.sortable)}
                    >
                      <span className="inline-flex items-center">
                        {col.label} {renderSortIcon(col.key)}
                      </span>
                    </th>
                  );
                })}
                {hasActionCol && (
                  <th
                    className="sticky right-0 top-0 z-40 px-2 py-1 font-bold text-white text-center border-l border-blue-800 bg-blue-800"
                    style={{ width: 64 }}
                  >
                    {rightActionLabel ?? ""}
                  </th>
                )}
              </tr>

              {showFilters && (
                <tr className="bg-white border-b border-gray-100 text-[10px] sm:text-[11px]">
                  {visibleCols.map((col, i) => {
                    const meta = stickyPlan[i];
                    const style = meta.sticky ? { left: meta.left, width: meta.width } : undefined;
                    return (
                      <td
                        key={col.key}
                        className={["px-2 py-1", meta.sticky ? "sticky z-30 bg-white" : ""].join(" ")}
                        style={style}
                      >
                        <input
                          type="text"
                          value={filters[col.key] || ""}
                          onChange={(e) => {
                            setFilters((prev) => ({ ...prev, [col.key]: e.target.value }));
                            setCurrentPage(1); // reset page only when user changes filters
                          }}
                          placeholder="Filter ..."
                          className="w-full border rounded px-2 py-1 text-[10px] sm:text-[10px] focus:ring-2 focus:ring-blue-200"
                        />
                      </td>
                    );
                  })}
                  {hasActionCol && (
                    <td className="sticky right-0 z-40 px-2 py-1 border-l border-gray-100 bg-white" />
                  )}
                </tr>
              )}
            </thead>

            <tbody className="bg-white whitespace-nowrap">
              {paginated.length > 0 ? (
                paginated.map((row, rIdx) => (
                  <tr
                    key={row.__idx ?? rIdx}
                    className={`text-[10px] sm:text-[11px] hover:bg-blue-50 ${
                      rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                    onDoubleClick={() => onRowDoubleClick?.(row)}
                  >
                    {visibleCols.map((col, i) => {
                      const meta = stickyPlan[i];
                      const style = meta.sticky ? { left: meta.left, width: meta.width } : undefined;
                      const isRemarks =
                        /remarks/i.test(String(col.key)) || /remarks/i.test(String(col.label));
                      const title = isRemarks ? String(row[col.key] ?? "") : undefined;

                      return (
                        <td
                          key={col.key}
                          className={[
                            "px-3 py-[6px]",
                            numberAlignClass(col),
                            isRemarks ? "max-w-[400px] truncate md:whitespace-nowrap" : "",
                            meta.sticky ? "sticky z-10 bg-inherit" : "",
                          ].join(" ")}
                          style={style}
                          title={title}
                        >
                          {formatValue(row[col.key], col)}
                        </td>
                      );
                    })}
                    {hasActionCol && (
                     <td
                          className="sticky right-0 z-20 px-2 py-[2px] text-center border-l border-gray-200 bg-inherit"
                          style={{ width: 64 }}
                          >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowAction?.(row);
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            title={rightActionLabel ?? "Open"}
                            disabled={!onRowAction}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={visibleCols.length + (hasActionCol ? 1 : 0)}
                    className="px-4 py-10 text-center"
                  >
                    <div className="inline-flex items-center gap-3 text-gray-500">
                      <FontAwesomeIcon icon={faCircleExclamation} />
                      <span className="text-sm">No matching records found.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pager (hidden if itemsPerPage === 0) */}
        {paginationEnabled && (
          <div className="flex items-center justify-end gap-2 p-2 border-t bg-white text-[11px]">
            <span className="mr-2 opacity-70">
              {filtered.length
                ? `${(safePage - 1) * itemsPerPage + 1}–${Math.min(
                    safePage * itemsPerPage,
                    filtered.length
                  )} of ${filtered.length}`
                : "0 of 0"}
            </span>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, (p || 1) - 1))}
              disabled={safePage === 1}
            >
              Prev
            </button>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() =>
                setCurrentPage((p) =>
                  p * itemsPerPage < filtered.length ? (p || 1) + 1 : (p || 1)
                )
              }
              disabled={safePage * itemsPerPage >= filtered.length}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  

  }
);

export default SearchGlobalReportTable;
