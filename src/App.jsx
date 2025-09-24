import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { pageRegistry } from "./pageRegistry";
import { fetchData } from "@/NAYSA Cloud/Configuration/BaseURL";

import Navbar from "./NAYSA Cloud/Components/Navbar";
import Sidebar from "./NAYSA Cloud/Components/Sidebar";
import { ResetProvider } from "./NAYSA Cloud/Components/ResetContext";

import Login from "./NAYSA Cloud/Authentication/Login.jsx";
import Register from "./NAYSA Cloud/Authentication/Register.jsx";
import Dashboard1 from "./NAYSA Cloud/Components/Dashboard1.jsx";
import { AuthProvider, useAuth } from "./NAYSA Cloud/Authentication/AuthContext.jsx";



const ModalHost = ({ modalKey, onClose }) => {
  const { user } = useAuth();

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
        <Cmp isOpen={true} onClose={onClose} userCode={user?.USER_CODE} />
      </div>
    </div>
  );
};




const AppContent = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const {user, setUser } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [routeRows, setRouteRows] = useState([]);
  const [activeModalKey, setActiveModalKey] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);
  const openModal = (componentKey) => setActiveModalKey(componentKey);
  const handleCloseModal = () => {
    setActiveModalKey(null);
    navigate("/", { replace: true, state: {} });
  };

  const handleLogout = () => {
    setUser?.(null);
    localStorage.removeItem("naysa_user"); // if you persist (see #3)
    setIsSidebarVisible(false);
    navigate("/", { replace: true });
  };



  // Load menu + routes
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
    return () => {
      alive = false;
    };
  }, []);




  // Lock body scroll when a modal is open
  useEffect(() => {
    document.body.style.overflow = activeModalKey ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeModalKey]);



  // ===== Auth pages (no navbar/sidebar). Login is default. =====
  if (!user) {
    return (
      <Routes>
        <Route
          path="/"
          element={<Login onSwitchToRegister={() => navigate("/register")} />}
        />
        <Route
          path="/register"
          element={
            <Register
              onRegister={() => navigate("/")}
              onSwitchToLogin={() => navigate("/")}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }





  // ===== App pages (with navbar + sidebar) =====
  return (
    <div className="relative min-h-screen flex flex-col bg-gray-100 font-roboto dark:bg-black">
      {/* Top navbar (single render) */}
      <div className="sticky top-0 z-40">
        <Navbar onMenuClick={toggleSidebar} onLogout={handleLogout} />
      </div>

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
          <div
            className="flex-1 bg-black/50"
            onClick={toggleSidebar}
            aria-hidden
          />
        </div>
      )}

      {/* Routed pages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard1 user={user} />} />
          {routeRows
            ?.filter((r) => r.path && r.componentKey && !r.isModal)
            .map(({ code, path, componentKey }) => {
              const Cmp = pageRegistry[componentKey];
              if (!Cmp) {
                console.warn(
                  "[App] No page component for key:",
                  componentKey,
                  "path:",
                  path
                );
                return null;
              }
              return <Route key={code ?? path} path={path} element={<Cmp />} />;
            })}

          {/* Fallback: go home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Modal host */}
      <ModalHost modalKey={activeModalKey} onClose={handleCloseModal} />
    </div>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <ResetProvider>
        <AppContent />
      </ResetProvider>
    </AuthProvider>
  </Router>
);

export default App;























































































































