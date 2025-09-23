
// function App() {
//   return (
//     <Router>
//       <div className="flex">
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;




// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./NAYSA Cloud/Components/Navbar";
// import Sidebar from "./NAYSA Cloud/Components/Sidebar";
// import Dashboard from "./NAYSA Cloud/Components/Dashboard";
// import PayeeMasterData from "C:/Users/mendo/OneDrive/Desktop/NAYSACloud-v1-UI/src/NAYSA Cloud/REFERENCE FILES/PayeeMasterData.jsx";

// const App = () => {
//   const [selectedModule, setSelectedModule] = useState("");

//   return (
//     <Router>
//       <div className="h-screen flex flex-col">
//         {/* Navbar */}
//         <div className="h-[60px]">
//           <Navbar />
//         </div>

//         {/* Sidebar + Content */}
//         <div className="flex flex-1 overflow-hidden">
//           <Sidebar onMenuClick={setSelectedModule} />

//           <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
//             <Routes>
//               {/* Dashboard when Accounts Payable is selected */}
//               {selectedModule === "Accounts Payable" && (
//                 <Route path="/" element={<Dashboard />} />
//               )}

//               {/* Other static route */}
//               <Route path="/payeemasterdata" element={<PayeeMasterData />} />

//               {/* Fallback for no selection */}
//               <Route
//                 path="*"
//                 element={
//                   selectedModule ? (
//                     <div className="text-gray-600 text-lg">
//                       {selectedModule} module selected.
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-lg">
//                       Please select a module from the sidebar.
//                     </div>
//                   )
//                 }
//               />
//             </Routes>
//           </main>
//         </div>
//       </div>
//     </Router>
//   );
// };

// export default App;
// App.jsx
// App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";

import { ResetProvider } from "./NAYSA Cloud/Components/ResetContext";
import Navbar from "./NAYSA Cloud/Components/Navbar";
import Sidebar from "./NAYSA Cloud/Components/Sidebar";

import Login from "./NAYSA Cloud/Authentication/Login.jsx";
import Register from "./NAYSA Cloud/Authentication/Register.jsx";

import APV from "./NAYSA Cloud/Module/Main Module/Accounts Payable/APV.jsx";
import APVHistory from "./NAYSA Cloud/Module/Main Module/Accounts Payable/APVHistory.jsx";
import Dashboard1 from "./NAYSA Cloud/Components/Dashboard1.jsx";
import Receivable from "./NAYSA Cloud/Dashboard/Receivable.jsx";

// Minimal blank landing (not used now, kept if needed)
// const HomeBlank = () => <div className="p-6" />;

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarVisible((s) => !s);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsSidebarVisible(false);
    navigate("/", { replace: true });
  };

  // ===== Auth pages (no navbar/sidebar). Login is default. =====
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <Login
              onLogin={handleLogin}
              onSwitchToRegister={() => navigate("/register")}
            />
          }
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
      {/* Top bar */}
      <div className="sticky top-0 z-40">
        <Navbar onMenuClick={toggleSidebar} onLogout={handleLogout} />
      </div>

      {/* Slide-in Sidebar */}
      {/* Slide-in Sidebar */}
{isSidebarVisible && (
  <div className="fixed inset-0 z-50 flex">
    <Sidebar onNavigate={() => setIsSidebarVisible(false)} />
    <div className="flex-1 bg-black bg-opacity-50" onClick={toggleSidebar} />
  </div>
)}


      {/* Main content */}
      <div className="flex-1 overflow-y-auto ">
        <Routes>
  <Route path="/" element={<Dashboard1 user={currentUser} />} />
  {/* APV (Accounts Payable Voucher) */}
  <Route path="/tran-ap-aptran" element={<APV />} />
  <Route path="/history" element={<APVHistory />} />

  {/* Receivables dashboard */}
  <Route path="/receivables" element={<Receivable />} />

  {/* (Optional) keep an alias if you like */}
  {/* <Route path="/ar-dashboard" element={<Receivable />} /> */}

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

      </div>
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





















































































































