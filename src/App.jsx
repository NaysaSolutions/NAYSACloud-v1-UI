
// import { useEffect, useState } from "react";
// import { pageRegistry } from "./pageRegistry";
// import { fetchData } from '@/NAYSA Cloud/Configuration/BaseURL';
// import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
// import Header from "./NAYSA Cloud/Components/Header";
// import Navbar from "./NAYSA Cloud/Components/Navbar";
// import Sidebar from "./NAYSA Cloud/Components/Sidebar";
// import { ResetProvider } from "./NAYSA Cloud/Components/ResetContext";



// const AppContent = () => {
//   const [isSidebarVisible, setIsSidebarVisible] = useState(false);
//   const location = useLocation();
//   const [menuItems, setMenuItems] = useState([]);
//   const [routeRows, setRouteRows] = useState([]);

//   const toggleSidebar = () => {
//     setIsSidebarVisible((prev) => !prev);
//   };


  
//   useEffect(() => {
//     let alive = true; 

//     (async () => {
//       try {
//         const [menuResp, routesResp] = await Promise.all([
//           fetchData("menu-items"),
//           fetchData("menu-routes"),
//         ]);

//         if (!alive) return;
//         setMenuItems(menuResp?.menuItems ?? []);
//         setRouteRows(routesResp?.routes ?? []);
//       } catch (e) {
//         if (!alive) return;
//         setMenuItems([]);
//         setRouteRows([]);
//       }
//     })();

//     return () => { alive = false; };
//   }, []);




//   return (
//     <div className="relative min-h-screen flex flex-col bg-gray-100 font-roboto dark:bg-black">
//       {isSidebarVisible && (
//         <div className="fixed inset-0 z-50 flex">
//           <Sidebar onNavigate={() => setIsSidebarVisible(false)} />   
//           <div className="flex-1 bg-black bg-opacity-50" onClick={toggleSidebar} />
//         </div>
//       )}


//       <div className="sticky top-0 z-40">
//         <Navbar onMenuClick={toggleSidebar} />
//       </div>

//       <div className="flex-1 p-4 overflow-y-auto">
//         <Routes>
//         {routeRows.map(({ code, path, componentKey }) => {
//           const Cmp = pageRegistry[componentKey];
//           return Cmp ? <Route key={code} path={path} element={<Cmp />} /> : null;
//         })}
//       </Routes>
//       </div>
//     </div>
//   );
// };

// const App = () => (
//   <Router>
//     <ResetProvider>
//       <AppContent />
//     </ResetProvider>
//   </Router>
// );

// export default App;
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { pageRegistry } from "./pageRegistry";
import { fetchData } from "@/NAYSA Cloud/Configuration/BaseURL";

import Navbar from "./NAYSA Cloud/Components/Navbar";
import Sidebar from "./NAYSA Cloud/Components/Sidebar";
import { ResetProvider } from "./NAYSA Cloud/Components/ResetContext";

/* Simple modal host (renders any component by its key from pageRegistry) */
const ModalHost = ({ modalKey, onClose }) => {
  if (!modalKey) return null;
  const Cmp = pageRegistry[modalKey];

  if (!Cmp) {
    console.warn("[ModalHost] No component found for key:", modalKey);
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* If your modal component accepts onClose, this will work; otherwise it will be ignored */}
        <Cmp isOpen={true} onClose={onClose} userCode={"NSI"} />
      </div>
    </div>
  );
};

const AppContent = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [routeRows, setRouteRows] = useState([]);
  const [activeModalKey, setActiveModalKey] = useState(null);

  const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);
  const openModal = (componentKey) => setActiveModalKey(componentKey);
  const closeModal = () => setActiveModalKey(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [menuResp, routesResp] = await Promise.all([
          fetchData("menu-items"),
          fetchData("menu-routes"),
        ]);
        if (!alive) return;
        setMenuItems(menuResp?.menuItems ?? []);
        setRouteRows(routesResp?.routes ?? []);
      } catch (e) {
        if (!alive) return;
        console.error("[App] Failed to load menu/routes:", e);
        setMenuItems([]);
        setRouteRows([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = activeModalKey ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [activeModalKey]);



  const handleCloseModal = () => {
    setActiveModalKey(null);
    // Go "home" after closing modal:
    const homePath = "/" || (routeRows.find(r => !r.isModal)?.path ?? "/");
    navigate(homePath, { replace: true });   // replace=true avoids a useless back-step
  };



  return (
    <div className="relative min-h-screen flex flex-col bg-gray-100 font-roboto dark:bg-black">
      {/* Sidebar overlay (mobile) */}
      {isSidebarVisible && (
        <div className="fixed inset-0 z-50 flex">
          <Sidebar
            menuItems={menuItems}
            onNavigate={() => setIsSidebarVisible(false)}
            onOpenModal={(key) => {
              setIsSidebarVisible(false);
              openModal(key);
            }}
          />
          <div className="flex-1 bg-black bg-opacity-50" onClick={toggleSidebar} />
        </div>
      )}

      {/* Top navbar */}
      <div className="sticky top-0 z-40">
        <Navbar onMenuClick={toggleSidebar} />
      </div>

      {/* Routed pages (only non-modals) */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Routes>
          {routeRows
            .filter(r => r.path && r.componentKey && !r.isModal)   // <-- use API flag
            .map(({ code, path, componentKey }) => {
              const Cmp = pageRegistry[componentKey];
              if (!Cmp) {
                console.warn("[App] No page component for key:", componentKey, "path:", path);
                return null;
              }
              return <Route key={code} path={path} element={<Cmp />} />;
            })}
        </Routes>
      </div>

      {/* Modal host */}
      <ModalHost modalKey={activeModalKey} onClose={handleCloseModal} />
    </div>
  );
};

const App = () => (
  <Router>
    <ResetProvider>
      <AppContent />
    </ResetProvider>
  </Router>
);

export default App;





















































































































