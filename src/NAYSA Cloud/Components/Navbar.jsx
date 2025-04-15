import React, { useState } from "react";
import { Bell, BookOpen, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  return (
    <div className="w-full bg-blue-500 h-16 flex items-center justify-between px-4 shadow-md">
      {/* Left side: Logo and Menu */}
      <div className="flex items-center space-x-3">
        <div>
          <img 
            src="naysa_logo.png" 
            className="w-[80px] h-[50px] mb-1" 
            alt="Naysa Logo"
          />
        </div>
        <Menu className="text-white cursor-pointer" onClick={onMenuClick} />
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-5">
        <BookOpen className="text-white w-5 h-5 cursor-pointer" />
        <div className="relative">
          <Bell className="text-white w-5 h-5 cursor-pointer" />
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
  );
};

export default Navbar;
