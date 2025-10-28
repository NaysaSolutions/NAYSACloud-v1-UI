
import { useEffect, useState, useRef, useCallback, forwardRef } from "react";
import { fetchData } from "@/NAYSA Cloud/Configuration/BaseURL.jsx";
import { useAuth } from "@/NAYSA Cloud/Authentication/AuthContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { LoadingSpinner } from "@/NAYSA Cloud/Global/utilities.jsx";
import {
  exportToTabbedJson,
  exportBuildJsonSheets,
  exportHistoryExcel,
  makeSheet,
} from "@/NAYSA Cloud/Global/report";
import BranchLookupModal from "@/NAYSA Cloud/Lookup/SearchBranchRef";
import CustomerMastLookupModal from "@/NAYSA Cloud/Lookup/SearchCustMast";
import COAMastLookupModal from "@/NAYSA Cloud/Lookup/SearchCOAMast.jsx";
import { useTopUserRow, useTopBranchRow } from "@/NAYSA Cloud/Global/top1RefTable";
import { useGetCurrentDay } from "@/NAYSA Cloud/Global/dates";
import { useSelectedHSColConfig } from "@/NAYSA Cloud/Global/selectedData";
import SearchGlobalReportTable from "@/NAYSA Cloud/Lookup/SearchGlobalReportTable.jsx";

const ENDPOINT = "getARAging";          
const COLS_KEY_BOTTOM = "getARAging";   
const COLS_KEY_TOP    = "getARInquiryS"; 


function getGlobalCache() {
  if (typeof window !== "undefined") {
    if (!window.__NAYSA_ARAGE_CACHE__) window.__NAYSA_ARAGE_CACHE__ = {};
    return window.__NAYSA_ARAGE_CACHE__;
  }
  return {};
}



/** Column-config loader with fallback to direct API call */
async function getHSColsSafe(endpointKey) {
  try {
    const cols = await useSelectedHSColConfig(endpointKey);
    if (Array.isArray(cols)) return cols;
  } catch (e) {
    console.warn("useSelectedHSColConfig failed; falling back to /getHSColConfig:", e);
  }


  try {
    const res = await fetchData("getHSColConfig", { params: { endpoint: endpointKey } });
    const data = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
    if (!Array.isArray(data)) throw new Error("Invalid getHSColConfig response shape");
    return data;
  } catch (e) {
    const res2 = await fetchData("getHSColConfig", { endpoint: endpointKey });
    const data2 = Array.isArray(res2?.data) ? res2.data : (res2?.data?.data ?? []);
    if (!Array.isArray(data2)) throw new Error("Invalid getHSColConfig (POST) response shape");
    return data2;
  }
}



/** Small helper: deduplicate in-flight requests + 429-aware retry */
function useRequestCoalescer() {
  const inflightMap = useRef(new Map());
  const resultCache = useRef(new Map());

  const requestOnce = useCallback(async (key, fn, { attempts = 3 } = {}) => {
    if (resultCache.current.has(key)) return resultCache.current.get(key);
    if (inflightMap.current.has(key)) return inflightMap.current.get(key);

    const run = async () => {
      let lastErr;
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await fn();
          resultCache.current.set(key, res);
          return res;
        } catch (e) {
          lastErr = e;
          const status = e?.response?.status ?? e?.status;
          if (status !== 429 || i === attempts - 1) throw e;
          const ra = Number(e?.response?.headers?.["retry-after"]);
          const backoff = Number.isFinite(ra) ? ra * 1000 : 500 * 2 ** i; // 0.5s,1s,2s...
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
      throw lastErr;
    };

    const p = run().finally(() => inflightMap.current.delete(key));
    inflightMap.current.set(key, p);
    return p;
  }, []);

  return { requestOnce, inflightMap, resultCache };
}

const ARAgingSummaryTab = forwardRef(function ARInquiryTab({ registerActions }, ref) {
  const { user } = useAuth();
  const baseKey = "AR_AGING";
  const hydratedRef = useRef(false);

  const [state, setState] = useState({
    branchCode: "",
    branchName: "",
    custCode: "",
    custName: "",
    refDate: useGetCurrentDay(),
    arAgingDataUnfiltered: [],  // keep full detail for export
    arAgingData: [],            // BOTTOM table (detail)
    arAgingDataS: [],           // TOP table (summary)
    columnConfig: [],           // BOTTOM columns
    columnConfigS: [],          // TOP columns
    acctCode: "",
    acctName: "",
    showBranchModal: false,
    showCustomerModal: false,
    showAccountModal: false,
    isLoading: false,
    showSpinner: false,
  });
  const updateState = (u) => setState((p) => ({ ...p, ...u }));
  const {
    branchCode, branchName, custCode, custName, refDate,
    arAgingData, arAgingDataS, columnConfig, columnConfigS, arAgingDataUnfiltered,
    acctCode, acctName, isLoading, showSpinner,
    showBranchModal, showCustomerModal, showAccountModal,
  } = state;

  // ── table refs & state refs
  const tableRefTop = useRef(null);     // TOP summary table (arAgingDataS/columnConfigS)
  const tableRefBottom = useRef(null);  // BOTTOM detail table (arAgingData/columnConfig)
  const tableStateTopRef = useRef({ filters: {}, sortConfig: { key: null, direction: null }, currentPage: 1 });
  const tableStateBottomRef = useRef({ filters: {}, sortConfig: { key: null, direction: null }, currentPage: 1 });

  // smooth spinner
  useEffect(() => {
    let t;
    if (isLoading) t = setTimeout(() => updateState({ showSpinner: true }), 200);
    else updateState({ showSpinner: false });
    return () => clearTimeout(t);
  }, [isLoading]);

  // defaults (user/branch)
  const loadDefaults = useCallback(async () => {
    updateState({ showSpinner: true });
    try {
      const hsUser = await useTopUserRow(user?.USER_CODE);
      if (hsUser) {
        const hsBranch = await useTopBranchRow(hsUser.branchCode);
        updateState({
          branchCode: hsUser.branchCode,
          branchName: hsBranch?.branchName || hsUser.branchName,
        });
      }
    } catch (err) {
      console.error("Error loading defaults data:", err);
    } finally {
      updateState({ showSpinner: false });
    }
  }, [user?.USER_CODE]);

  const handleReset = useCallback(async () => {
    updateState({
      custCode: "",
      custName: "",
      acctCode: "",
      acctName: "",
      refDate: useGetCurrentDay(),
      arAgingData: [],
      arAgingDataS: [],
      arAgingDataUnfiltered: [],
    });
  }, []);

  /** Request de-duplication hook */
  const { requestOnce } = useRequestCoalescer();




  // ── load columns once (StrictMode-safe + deduped)
  const loadedColsOnceRef = useRef(false);
  useEffect(() => {
    if (loadedColsOnceRef.current) return;
    let alive = true;

    (async () => {
      try {
        const [colsBottom, colsTop] = await Promise.all([
          requestOnce(`cols:${COLS_KEY_BOTTOM}`, () => getHSColsSafe(COLS_KEY_BOTTOM)),
          requestOnce(`cols:${COLS_KEY_TOP}`,    () => getHSColsSafe(COLS_KEY_TOP)),
        ]);

        if (!alive) return;

        setState((prev) => ({
          ...prev,
          columnConfig:  Array.isArray(colsBottom) ? colsBottom.map(c => ({ ...c })) : [],
          columnConfigS: Array.isArray(colsTop)    ? colsTop.map(c => ({ ...c }))    : [],
        }));

        loadedColsOnceRef.current = true;
      } catch (e) {
        console.error("Load column config failed:", e);
      }
    })();

    return () => { alive = false; };
  }, [requestOnce]);




  // find (rows only) – fetch both summary & detail from the same endpoint’s payload
  const fetchRecord = useCallback(async () => {
    updateState({ isLoading: true });
    try {
      const response = await requestOnce(
        `rows:${ENDPOINT}:${branchCode}:${custCode}:${refDate}:${acctCode}`,
        () => fetchData(ENDPOINT, {
          json_data: { json_data: { branchCode, custCode, refDate, acctCode } },
        })
      );

      const custData = response?.data?.[0]?.result
        ? JSON.parse(response.data[0].result)
        : [];
      const rowsBottom = custData?.[0]?.dt1 ?? []; // detail
      const rowsTop    = custData?.[0]?.dt2 ?? []; // summary

      updateState({
        arAgingData: Array.isArray(rowsBottom) ? rowsBottom : [],
        arAgingDataUnfiltered: Array.isArray(rowsBottom) ? rowsBottom : [],
        arAgingDataS: Array.isArray(rowsTop) ? rowsTop : [],
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      updateState({ isLoading: false });
    }
  }, [branchCode, custCode, refDate, acctCode, requestOnce]);



 
   const fetchRecordperCustomer = useCallback(async (selectedCustomer) => {

    updateState({ isLoading: true });
    try {
      const response = await fetchData(ENDPOINT, {
        json_data: { json_data: { branchCode, custCode: selectedCustomer, refDate, acctCode } },
      });
      const custData = response?.data?.[0]?.result
        ? JSON.parse(response.data[0].result)
        : [];
      const rowsBottom = custData?.[0]?.dt1 ?? []; // detail
      updateState({
        arAgingData: Array.isArray(rowsBottom) ? rowsBottom : [],
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      updateState({ isLoading: false });
    }
  }, [branchCode, refDate, acctCode]);




  // ── hydrate from cache OR load defaults once
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (hydratedRef.current) return;

      const cache = getGlobalCache();
      const snap = cache[baseKey];

      const hasValidCache =
        !!snap &&
        (snap.branchCode ||
         snap.refDate ||
         snap.acctCode ||
         (Array.isArray(snap.arAgingData) && snap.arAgingData.length > 0) ||
         (Array.isArray(snap.arAgingDataS) && snap.arAgingDataS.length > 0));

      if (hasValidCache) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            branchCode: snap.branchCode ?? prev.branchCode,
            branchName: snap.branchName ?? prev.branchName,
            custCode: snap.custCode ?? prev.custCode,
            custName: snap.custName ?? prev.custName,
            refDate: snap.refDate ?? prev.refDate,
            acctCode: snap.acctCode ?? prev.acctCode,
            acctName: snap.acctName ?? prev.acctName,
            arAgingData: Array.isArray(snap.arAgingData) ? snap.arAgingData : prev.arAgingData,
            arAgingDataS: Array.isArray(snap.arAgingDataS) ? snap.arAgingDataS : prev.arAgingDataS,
            columnConfig: Array.isArray(snap.columnConfig) ? snap.columnConfig : prev.columnConfig,
            columnConfigS: Array.isArray(snap.columnConfigS) ? snap.columnConfigS : prev.columnConfigS,
          }));
          // hydrate table UI states (filters/sort/page) independently
          tableStateTopRef.current = snap.tableTop || tableStateTopRef.current;
          tableStateBottomRef.current = snap.tableBottom || tableStateBottomRef.current;
          hydratedRef.current = true;
        }
        return;
      }

      if (!user?.USER_CODE) return;
      await loadDefaults();
      await handleReset();
      hydratedRef.current = true;
    };
    run();
    return () => { cancelled = true; };
  }, [user?.USER_CODE, loadDefaults, handleReset]);




  // ── snapshot into cache whenever important things change
  useEffect(() => {
    if (!hydratedRef.current) return;
    const cache = getGlobalCache();
    const prev = cache[baseKey] || {};
    cache[baseKey] = {
      ...prev,
      branchCode,
      branchName,
      custCode,
      custName,
      refDate,
      acctCode,
      acctName,
      arAgingData,
      arAgingDataS,
      columnConfig,
      columnConfigS,
      tableTop: tableStateTopRef.current,
      tableBottom: tableStateBottomRef.current,
      // keep any existing scroll positions
      scrollTop: prev.scrollTop || { top: 0, left: 0 },
      scrollBottom: prev.scrollBottom || { top: 0, left: 0 },
    };
  }, [
    branchCode, branchName, custCode, custName,
    refDate, acctCode, acctName,
    arAgingData, arAgingDataS, columnConfig, columnConfigS,
  ]);




  // ── restore & persist scroll: TOP table
  useEffect(() => {
    const cache = getGlobalCache();
    const snap = cache[baseKey] || {};
    const targetTop = Number(snap?.scrollTop?.top) || 0;
    const targetLeft = Number(snap?.scrollTop?.left) || 0;

    let tries = 0;
    const maxTries = 8;

    const tryRestore = () => {
      const scroller = tableRefTop.current?.scrollRef?.current;
      if (!scroller) {
        if (tries++ < maxTries) requestAnimationFrame(tryRestore);
        return;
      }
      const ready =
        scroller.scrollHeight > scroller.clientHeight ||
        scroller.scrollWidth > scroller.clientWidth;
      if (!ready && tries++ < maxTries) {
        requestAnimationFrame(tryRestore);
        return;
      }
      scroller.scrollTop = targetTop;
      scroller.scrollLeft = targetLeft;
    };

    requestAnimationFrame(() => requestAnimationFrame(tryRestore));

    const scroller = tableRefTop.current?.scrollRef?.current;
    if (!scroller) return;
    const onScroll = () => {
      const cacheNow = getGlobalCache();
      const prev = cacheNow[baseKey] || {};
      cacheNow[baseKey] = {
        ...prev,
        scrollTop: { top: scroller.scrollTop, left: scroller.scrollLeft },
      };
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [arAgingDataS.length, columnConfigS.length]);


  
  // ── restore & persist scroll: BOTTOM table
  useEffect(() => {
    const cache = getGlobalCache();
    const snap = cache[baseKey] || {};
    const targetTop = Number(snap?.scrollBottom?.top) || 0;
    const targetLeft = Number(snap?.scrollBottom?.left) || 0;

    let tries = 0;
    const maxTries = 8;

    const tryRestore = () => {
      const scroller = tableRefBottom.current?.scrollRef?.current;
      if (!scroller) {
        if (tries++ < maxTries) requestAnimationFrame(tryRestore);
        return;
      }
      const ready =
        scroller.scrollHeight > scroller.clientHeight ||
        scroller.scrollWidth > scroller.clientWidth;
      if (!ready && tries++ < maxTries) {
        requestAnimationFrame(tryRestore);
        return;
      }
      scroller.scrollTop = targetTop;
      scroller.scrollLeft = targetLeft;
    };

    requestAnimationFrame(() => requestAnimationFrame(tryRestore));

    const scroller = tableRefBottom.current?.scrollRef?.current;
    if (!scroller) return;
    const onScroll = () => {
      const cacheNow = getGlobalCache();
      const prev = cacheNow[baseKey] || {};
      cacheNow[baseKey] = {
        ...prev,
        scrollBottom: { top: scroller.scrollTop, left: scroller.scrollLeft },
      };
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [arAgingData.length, columnConfig.length]);

  // export
  const handleExport = useCallback(async () => {
    try {
      updateState({ isLoading: true });
      const sheetConfigs = [
        makeSheet("AR Aging Detailed", arAgingDataUnfiltered, columnConfig),
        makeSheet("AR Aging Summary",  arAgingDataS,          columnConfigS),
      ];
      const sheets = exportBuildJsonSheets(sheetConfigs);
      const jsonResult = exportToTabbedJson(sheets);
      const payload = {
        Branch: branchCode,
        ReportName: `AR Aging Report as of ${refDate || ""}`,
        UserCode: user?.USER_CODE,
        JsonData: jsonResult,
      };
      await exportHistoryExcel("/exportHistoryReport", JSON.stringify(payload), () => {}, "AR Aging Report");
    } catch (e) {
      console.error("❌ Export failed:", e);
    } finally {
      updateState({ isLoading: false });
    }
  }, [arAgingDataUnfiltered, arAgingDataS, columnConfig, columnConfigS, branchCode, refDate, user]);

  // register action bar handlers
  useEffect(() => {
    registerActions?.({
      onFind: fetchRecord,
      onReset: handleReset,
      onPrint: () => window.print(),
      onExportSummary: handleExport,
      onViewDoc: undefined,
    });
  }, [registerActions, fetchRecord, handleReset, handleExport]);

  const handleViewTop = useCallback((row) => {
    fetchRecordperCustomer(row.custCode);
    updateState({ custName: row.custName, custCode: row.custCode });
  }, [fetchRecordperCustomer]);

  const handleViewRow = useCallback((row) => {
    const url = `${window.location.origin}${row.pathUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  // initial table UI states from cache (if any) — separate
  const initialStateTop = getGlobalCache()[baseKey]?.tableTop || undefined;
  const initialStateBottom = getGlobalCache()[baseKey]?.tableBottom || undefined;

  return (
    <div>
      {showSpinner && <LoadingSpinner />}
      <div id="summary" className="global-tran-tab-div-ui">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg relative p-4">
          {/* Branch */}
          <div className="global-tran-textbox-group-div-ui">
            <div className="relative">
              <input
                type="text"
                id="branchName"
                placeholder=" "
                value={branchName}
                readOnly
                className="peer global-tran-textbox-ui cursor-pointer"
              />
              <label htmlFor="branchName" className="global-tran-floating-label">Branch</label>
              <button
                type="button"
                className="global-tran-textbox-button-search-padding-ui global-tran-textbox-button-search-enabled-ui global-tran-textbox-button-search-ui"
                onClick={() => updateState({ showBranchModal: true })}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>

            {/* Ref Date */}
            <div className="relative">
              <input
                type="date"
                className="peer global-tran-textbox-ui"
                value={refDate}
                onChange={(e) => updateState({ refDate: e.target.value })}
              />
              <label htmlFor="SVIDate" className="global-tran-floating-label">Reference Date</label>
            </div>

            {/* AP Account */}
            <div className="relative">
              <input
                type="text"
                id="acctName"
                placeholder=" "
                value={acctName}
                readOnly
                className="peer global-tran-textbox-ui cursor-pointer"
              />
              <label htmlFor="acctName" className="global-tran-floating-label">AP Account</label>
              <button
                type="button"
                className="global-tran-textbox-button-search-padding-ui global-tran-textbox-button-search-enabled-ui global-tran-textbox-button-search-ui"
                onClick={() => updateState({ showAccountModal: true })}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>

          {/* Customer */}
          <div className="global-tran-textbox-group-div-ui">
            <div className="relative">
              <input
                type="text"
                id="custCode"
                placeholder=" "
                value={custCode}
                onChange={(e) => updateState({ custCode: e.target.value })}
                className="peer global-tran-textbox-ui"
                disabled={isLoading}
              />
              <label htmlFor="custCode" className="global-tran-floating-label">Customer Code</label>
              <button
                type="button"
                className="global-tran-textbox-button-search-padding-ui global-tran-textbox-button-search-enabled-ui global-tran-textbox-button-search-ui"
                onClick={() => updateState({ showCustomerModal: true })}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                id="custName"
                placeholder=" "
                value={custName}
                readOnly
                className="peer global-tran-textbox-ui"
              />
              <label htmlFor="custName" className="global-tran-floating-label">Customer Name</label>
            </div>
          </div>

          <div className="global-tran-textbox-group-div-ui"></div>
          <div className="global-tran-textbox-group-div-ui"></div>
        </div>
      </div>

      {/* Summary (TOP) */}
      <div id="summary" className="global-tran-tab-div-ui">
        <div className="global-tran-tab-nav-ui">
          <div className="flex flex-row sm:flex-row">
            <button className="global-tran-tab-padding-ui global-tran-tab-text_active-ui">Summary</button>
          </div>
        </div>

        <div className="global-tran-table-main-div-ui">
          <div className="max-h-[600px] overflow-y-auto relative">
            <SearchGlobalReportTable
              ref={tableRefTop}
              columns={columnConfigS}
              data={arAgingDataS}
              itemsPerPage={50}
              showFilters={true}
              rightActionLabel="View"
              onRowAction={handleViewTop}
              className="mt-2"
              initialState={initialStateTop}
              onStateChange={(tbl) => {
                tableStateTopRef.current = tbl;
                const cache = getGlobalCache();
                const prev = cache[baseKey] || {};
                cache[baseKey] = { ...prev, tableTop: tbl };
              }}
            />
          </div>
        </div>
      </div>

      {/* Detailed (BOTTOM) */}
      <div id="detail" className="global-tran-tab-div-ui">
        <div className="global-tran-tab-nav-ui">
          <div className="flex flex-row sm:flex-row">
            <button className="global-tran-tab-padding-ui global-tran-tab-text_active-ui">Detailed</button>
          </div>
        </div>

        <div className="global-tran-table-main-div-ui">
          <div className="max-h-[600px] overflow-y-auto relative">
            <SearchGlobalReportTable
              ref={tableRefBottom}
              columns={columnConfig}
              data={arAgingData}
              itemsPerPage={50}
              showFilters={true}
              rightActionLabel="View"
              onRowAction={handleViewRow}
              className="mt-2"
              initialState={initialStateBottom}
              onStateChange={(tbl) => {
                tableStateBottomRef.current = tbl;
                const cache = getGlobalCache();
                const prev = cache[baseKey] || {};
                cache[baseKey] = { ...prev, tableBottom: tbl };
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBranchModal && (
        <BranchLookupModal
          isOpen={showBranchModal}
          onClose={(selectedBranch) => {
            if (selectedBranch) {
              updateState({
                branchCode: selectedBranch.branchCode,
                branchName: selectedBranch.branchName,
              });
            }
            updateState({ showBranchModal: false });
          }}
        />
      )}

      {showAccountModal && (
        <COAMastLookupModal
          isOpen={showAccountModal}
          customParam={"ARGL"}
          onClose={(selectedAccount) => {
            if (selectedAccount) {
              updateState({
                acctCode: selectedAccount.acctCode,
                acctName: selectedAccount.acctName,
              });
            }
            updateState({ showAccountModal: false });
          }}
        />
      )}

      {showCustomerModal && (
        <CustomerMastLookupModal
          isOpen={showCustomerModal}
          onClose={(selectedCustomer) => {
            if (selectedCustomer) {
              updateState({
                custCode: selectedCustomer.custCode,
                custName: selectedCustomer.custName,
                arAgingData: [],
                arAgingDataS: [],
                arAgingDataUnfiltered: [],
              });
            }
            updateState({ showCustomerModal: false });
          }}
        />
      )}
    </div>
  );
});

export default ARAgingSummaryTab;
