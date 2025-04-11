import React from "react";

const Sidebar = () => {
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
    <div className="w-64 bg-white shadow-lg p-4 h-full z-50 relative">
      <ul className="space-y-4">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`cursor-pointer ${
              item === "Accounts Payable"
                ? "font-bold text-blue-800 border-l-2 border-blue-800 pl-2 mt-8"
                : "text-blue-700 hover:font-semibold transition"
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
