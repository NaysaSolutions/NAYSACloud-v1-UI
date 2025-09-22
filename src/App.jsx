// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import './App.css';
// import Login from './NAYSA Cloud/Login';
// import Register from './NAYSA Cloud/Register'; // Make sure to import Register

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
import Dashboard from "./NAYSA Cloud/Components/Dashboard.jsx";
import Dashboard1 from "./NAYSA Cloud/Components/Dashboard1.jsx";

// Minimal blank landing after login (navbar + sidebar still render)
const HomeBlank = () => <div className="p-6" />;

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const toggleSidebar = () => setIsSidebarVisible((s) => !s);

  const handleLogin = (user) => {
  setCurrentUser(user);
  // localStorage.setItem("user", JSON.stringify(user)); // already done in Login.jsx if you kept it
  setIsLoggedIn(true);
  navigate("/", { replace: true });
};

  const handleLogout = () => {
    // localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsSidebarVisible(false); // ensure the drawer is closed
    navigate("/", { replace: true }); // back to Login
  };

  if (!isLoggedIn) {
    // AUTH PAGES (NO NAVBAR/SIDEBAR). LOGIN = DEFAULT
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
              onRegister={() => navigate("/")} // after register, go back to login
              onSwitchToLogin={() => navigate("/")}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // APP PAGES (WITH NAVBAR + SIDEBAR)
  return (
    <div className="relative min-h-screen flex flex-col bg-white font-roboto dark:bg-black">
      {/* Top bar */}
      <div className="sticky top-0 z-40">
        <Navbar onMenuClick={toggleSidebar} onLogout={handleLogout} />
      </div>

      {/* Slide-in Sidebar */}
      {isSidebarVisible && (
        <div className="fixed inset-0 z-50 flex">
          <Sidebar />
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={toggleSidebar}
          />
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard1 user={currentUser} />} />
          <Route path="/tran-ap-aptran" element={<APV />} /> 
          <Route path="/history" element={<APVHistory />} />
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

































































// // src/App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import EmployeeList from './Components/EmployeeList';
// import EmployeeForm from './Components/EmployeeForm';
// //import Button from './Components/Button';

// const App = () => {
//   return (
//     // <Button/>
//     <Router>
//       <div className="max-w-4xl mx-auto p-6">
//         <Routes>
//           <Route path="/" element={<EmployeeList />} />
//           <Route path="/add" element={<EmployeeForm />} />
//           <Route path="/edit/:id" element={<EmployeeForm />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// };

// export default App;
