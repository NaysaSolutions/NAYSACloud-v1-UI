
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
// src/App.jsx
import React from "react";
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
import Branch from "./NAYSA Cloud/Reference File/BranchRef.jsx";
import Billcode from "./NAYSA Cloud/Reference File/BillCodeRef.jsx";

import { AuthProvider, useAuth } from "./NAYSA Cloud/Authentication/AuthContext.jsx";

const AppContent = () => {
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarVisible((s) => !s);
  const handleLogout = () => {
    setUser(null);
    setIsSidebarVisible(false);
    navigate("/", { replace: true });
  };

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
      {/* Top bar */}
      <div className="sticky top-0 z-40">
        <Navbar onMenuClick={toggleSidebar} onLogout={handleLogout} />
      </div>

      {/* Slide-in Sidebar */}
      {isSidebarVisible && (
        <div className="fixed inset-0 z-50 flex">
          <Sidebar onNavigate={() => setIsSidebarVisible(false)} />
          <div className="flex-1 bg-black bg-opacity-50" onClick={toggleSidebar} />
        </div>
      )}
  
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Billcode user={user} />} />
          <Route path="/tran-ap-aptran" element={<APV />} />
          <Route path="/history" element={<APVHistory />} />
          <Route path="/receivables" element={<Receivable />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <ResetProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ResetProvider>
  </Router>
);

export default App;

















































































































