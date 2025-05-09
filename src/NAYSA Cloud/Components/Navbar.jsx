import React, { useState } from "react";
import { Bell, BookOpen, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FiSun, FiMoon } from 'react-icons/fi';

const Navbar = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
  };

  // If you want to remember the user preference
  // useEffect(() => {
  //   if (localStorage.theme === 'dark') {
  //     document.documentElement.classList.add('dark');
  //   }
  // }, []);

    // const [isDark, setIsDark] = useState(false);
  
    // useEffect(() => {
    //   const storedTheme = localStorage.theme === 'dark';
    //   setIsDark(storedTheme);
    //   if (storedTheme) {
    //     document.documentElement.classList.add('dark');
    //   }
    // }, []);
  
    // const toggleDarkMode = () => {
    //   const newMode = !isDark;
    //   setIsDark(newMode);
    //   document.documentElement.classList.toggle('dark');
    //   localStorage.theme = newMode ? 'dark' : 'light';
    // };

  return (
    <div>
           {/* Top Blue Bar */}
           <div className="flex justify-center items-center bg-blue-700 text-white p-3 fixed top-0 left-0 w-full h-[30px] z-30 dark:bg-gray-900">
        <span className="font-bold text-lg">NAYSA-SOLUTIONS INC.</span>
      </div>
    <br />

    <div className="w-full bg-white h-16 flex items-center justify-between px-4 shadow-md dark:bg-gray-800 dark:text-white">
      {/* Left side: Logo and Menu */}
      <div className="flex items-center space-x-3 text-blue-900 font-extrabold dark:text-gray-800 dark:font-bold">
        
      <Menu className="text-blue-900 cursor-pointer dark:text-white" onClick={onMenuClick} /> 
        <div>
          <img 
            src="naysa_logo.png" 
            className="w-[80px] h-[50px] mb-1" 
            alt="Naysa Logo"
          />
        </div>
        {/* <Menu className="text-white cursor-pointer" onClick={onMenuClick} /> */}
        {/* <Menu className="text-blue-900 cursor-pointer" onClick={onMenuClick} />   */}
        Financials
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-5">
      
        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkMode} className="p-2 rounded-full bg-blue-400 dark:bg-gray-500 text-gray-800 hover:scale-110 transition">
          {/* {isDark ? <FiSun /> : <FiMoon />} */}
        </button>

        <BookOpen className="text-blue-900 w-5 h-5 cursor-pointer dark:text-white" />
       
        <div className="relative">
          <Bell className="text-blue-900 w-5 h-5 cursor-pointer dark:text-white" />
          <span className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full" />
        </div>
        <div
          className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden shadow-md cursor-pointer"
          onClick={toggleDropdown}
        >
          <img src="3135715.png" alt="Profile" className="w-full h-full object-cover" />
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-40 w-48 bg-white rounded-lg shadow-md py-2 z-10">
            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
              Account Management
            </button>
            <button
              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              onClick={() => navigate("/")}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Navbar;
