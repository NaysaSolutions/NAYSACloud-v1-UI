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

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./NAYSA Cloud/Components/Header";
import APV from "./NAYSA Cloud/Module/Main Module/Accounts Payable/APV";
import Navbar from "./NAYSA Cloud/Components/Navbar";
import Sidebar from "./NAYSA Cloud/Components/Sidebar";
import CV from "./NAYSA Cloud/Module/Main Module/Accounts Payable/CV";
import { ResetProvider } from "./NAYSA Cloud/Components/ResetContext";

const App = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  return (
    <Router>
      <ResetProvider>
        <div className="relative min-h-screen flex flex-col bg-gray-100 font-roboto">
          {/* Sidebar overlay for mobile view */}
          {isSidebarVisible && (
            <div className="fixed inset-0 z-50 flex">
              <Sidebar />
              <div
                className="flex-1 bg-black bg-opacity-50"
                onClick={toggleSidebar}
              />
            </div>
          )}

          {/* Fixed Navbar */}
          <div className="sticky top-0 z-40">
            <Navbar onMenuClick={toggleSidebar} />
          </div>

          {/* Header */}
          <Header />
{/* Main scrollable content area */}
<div className="flex-1 p-4 overflow-y-auto">
            <Routes>
              <Route path="/" element={<APV />} />
              {/* <Route path="/cv" element={<CV />} /> */}
            </Routes>
          </div>
        </div>
        </ResetProvider>
    </Router>
  );
};

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
