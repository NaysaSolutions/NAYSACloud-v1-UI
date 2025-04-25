import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    "Dashboard",
    "General Ledger",
    "Accounts Payable",
    "Sales",
    "Accounts Receivable",
    "Purchasing",
    "Inventory",
    "Global Reference",
    "Other Modules",
  ];

  return (
    <>
      {/* Toggle Button - only visible on small screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-2xl text-blue-800 fixed top-4 left-4 z-50 bg-white shadow rounded dark:bg-gray-800 dark:text-white"
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg p-4 z-40 transition-transform transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:block
        `}
      >
        <ul className="space-y-4 mt-12 md:mt-0">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`cursor-pointer ${
                item === "Accounts Payable"
                  ? "font-bold text-blue-800 border-l-2 border-blue-800 pl-2 mt-8 dark:text-blue-500"
                  : "text-blue-700 dark:text-white hover:font-semibold transition"
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
