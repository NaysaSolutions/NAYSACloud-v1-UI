import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiHome,
  FiBook,
  FiCreditCard,
  FiDollarSign,
  FiGlobe,
  FiShield,
  FiSearch,
  FiSun,
  FiMoon
} from "react-icons/fi";

const NaysaLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className="w-10 h-10 text-blue-600 dark:text-blue-400"
    fill="currentColor"
  >
    <path d="M50 0L0 50l50 50L100 50zM50 15.6L15.6 50 50 84.4 84.4 50z" />
  </svg>
);

const iconMap = {
  "Dashboard": FiHome,
  "General Ledger": FiBook,
  "Accounts Payable": FiCreditCard,
  "Accounts Receivable": FiDollarSign,
  "Global Reference": FiGlobe,
  "Application Security": FiShield
};

const MenuItem = ({ item, level = 0, searchTerm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubMenu = Array.isArray(item.subMenu);
  const Icon = iconMap[item.name];
  const ChevronIcon = hasSubMenu ? (isOpen ? FiChevronDown : FiChevronRight) : null;

  const path = item.path || `/${item.name.toLowerCase().replace(/\s/g, '-')}`;

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!searchTerm) {
      setIsVisible(true);
      setIsOpen(false);
      return;
    }

    const itemMatches = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const subMenuMatches = hasSubMenu && item.subMenu.some(subItem => {
      const name = typeof subItem === 'string' ? subItem : subItem.name;
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setIsVisible(itemMatches || subMenuMatches);
    if (subMenuMatches) {
      setIsOpen(true);
    }
  }, [searchTerm, hasSubMenu, item.name, item.subMenu]);

  const toggleSubMenu = () => {
    if (hasSubMenu) {
      setIsOpen(!isOpen);
    }
  };

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part)
        ? <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 rounded px-1">{part}</mark>
        : part
    );
  };

  if (!isVisible) return null;

  const paddingLeft = level === 0 ? 'pl-3' : level === 1 ? 'pl-8' : 'pl-12';

  return (
    <li>
      <div
        className={`flex items-center justify-between cursor-pointer py-2 px-3 rounded-xl transition-all duration-200 group hover:scale-[1.02] ${paddingLeft} ${
          level === 0
            ? 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-lg'
            : level === 1
            ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-25 dark:hover:bg-gray-800/30'
        }`}
        onClick={toggleSubMenu}
        role="button"
        aria-expanded={isOpen}
        aria-controls={`submenu-${item.name.replace(/\s/g, '-')}`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {level === 0 && Icon && (
            <Icon className={`text-xl flex-shrink-0 transition-colors duration-200 ${
              isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            } group-hover:text-blue-600 dark:group-hover:text-blue-400`} />
          )}
          {level > 0 && (
            <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200 ${
              level === 1 ? 'bg-blue-300 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            } group-hover:bg-blue-400 dark:group-hover:bg-blue-500`} />
          )}
          <span className={`truncate transition-colors duration-200 ${
            level === 0 ? 'font-semibold text-sm' : level === 1 ? 'text-sm' : 'text-xs'
          }`}>
            {highlightText(item.name)}
          </span>
        </div>
        {ChevronIcon && (
          <ChevronIcon className={`text-gray-400 dark:text-gray-500 transition-all duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-0 text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
          }`} />
        )}
      </div>

      {hasSubMenu && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="mt-1 space-y-1">
            {item.subMenu.map((subItem, index) => (
              <MenuItem
                key={index}
                item={typeof subItem === "string" ? { name: subItem } : subItem}
                level={level + 1}
                searchTerm={searchTerm}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const menuItems = [
    { name: "Dashboard", subMenu: ["General Accounting", "Sales", "Receivables", "Payables", "Expense"] },
    {
      name: "General Ledger",
      subMenu: [
        {
          name: "Transactions",
          subMenu: ["Journal Voucher", "Post Journal Voucher", "Petty Cash Voucher", "Post Petty Cash Voucher"],
        },
        {
          name: "Reference Files",
          subMenu: ["Chart of Account", "FS Consolidation Codes", "Responsibility Center", "SL Masterdata", "Bank Masterdata"],
        },
        { name: "Inquiry", subMenu: ["GL Query", "GL Analysis", "SL Query"] },
        { name: "Processing", subMenu: ["Month-End Processing", "Year-End Processing"] },
        { name: "Reports", subMenu: ["GL Reports", "BIR Books"] },
      ],
    },
    {
      name: "Accounts Payable",
      subMenu: [
        {
          name: "Transactions",
          subMenu: [
            { name: "Accounts Payable Voucher", path: "/tran-ap-aptran" },
            { name: "Post Accounts Payable Voucher", path: "/tran-ap-postaptran" },
            { name: "AP Debit Memo Voucher", path: "/tran-ap-aptran" },
            { name: "Post AP Debit Memo Voucher", path: "/tran-ap-aptran" },
            { name: "AP Credit Memo Voucher", path: "/tran-ap-aptran" },
            { name: "Post AP Credit Memo Voucher", path: "/tran-ap-aptran" },
            { name: "Check Voucher", path: "/tran-ap-aptran" },
            { name: "Post Check Voucher", path: "/tran-ap-aptran" },
          ],
        },
        { name: "Reference Files", subMenu: ["Payee Masterdata", "Alphanumeric Tax Codes", "VAT Codes"] },
        {
          name: "Inquiry",
          subMenu: ["AP Query", "VAT Input Query", "EWT Query", "2307 Monitoring", "Check Releasing and Return"],
        },
        { name: "Reports", subMenu: ["AP Reports", "VAT Input Reports", "EWT Reports"] },
      ],
    },
    {
      name: "Accounts Receivable",
      subMenu: [
        {
          name: "Transactions",
          subMenu: [
            { name: "Service Invoice", path: "/tran-ar-svitran" },
            { name: "Post Service Invoice", path: "/tran-ar-postsvitran" },
            { name: "AR Debit Memo Voucher", path: "/tran-ar-ardmtran" },
            { name: "Post AR Debit Memo Voucher", path: "/tran-ar-postardmtran" },
            { name: "AR Credit Memo Voucher", path: "/tran-ar-arcmtran" },
            { name: "Post AR Credit Memo Voucher", path: "/tran-ar-postarcmtran" },
            { name: "Collection Receipt", path: "/tran-ar-crtran" },
            { name: "Post Collection Receipt", path: "/tran-ar-postcrtran" },
          ],
        },
        {
          name: "Reference Files",
          subMenu: ["Customer Masterdata", "Billing Codes", "Alphanumeric Tax Codes", "VAT Codes"],
        },
        { name: "Inquiry", subMenu: ["AR Query", "VAT Output Query", "CWT Query", "CWT Monitoring"] },
        { name: "Reports", subMenu: ["AR Reports", "VAT Output Reports", "CWT Reports"] },
      ],
    },
    {
      name: "Global Reference",
      subMenu: [
        { name: "Company ID", path: "/tran-gr-compid" },
        { name: "Cycle Period", path: "/tran-gr-cycleperiod" },
        { name: "VAT Codes", path: "/tran-gr-vatcodes" },
        { name: "Currency Codes", path: "/tran-gr-currencycodes" },
        { name: "Daily Forex", path: "/tran-gr-dailyforex" },
        { name: "Branch Code", path: "/tran-gr-branchcode" },
        { name: "Bank Type Codes", path: "/tran-gr-banktypecodes" },
        { name: "Payment Types Codes", path: "/tran-gr-paymenttypescodes" },
      ],
    },
    {
      name: "Application Security",
      subMenu: [
        {
          name: "Access Rights",
          subMenu: [
            "Update Users",
            "User Access Rights",
            "Master Data Access Rights",
            "Transaction Posting Access Rights",
            "Management Report Access Rights",
            "Database Access Rights",
            "Branch Access Rights",
            "Document Signatories",
          ],
        },
        { name: "Data Security", subMenu: ["Email Notification", "Reset # of Reprint", "Audit Trail"] },
        { name: "Account Security", subMenu: ["Log-In/Password Policy", "Audit Trail"] },
        {
          name: "System",
          subMenu: ["Beginning Balance Template", "Database Backup Logs", "Database Backup Request"],
        },
      ],
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar Container - Height set to screen height (h-screen) */}
      <div
        className={`sidebar flex flex-col fixed top-0 left-0 h-screen w-80 bg-white dark:bg-gray-900 shadow-2xl z-40 transition-transform duration-300 ease-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:block md:w-80`}
      >
        {/* Header - Fixed at the top */}
        <div className="flex-shrink-0 p-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <img
                            src="naysa_logo.png" // Ensure this path is correct if different from image_951ea3.png
                            className="w-[80px] h-[50px] mb-1 object-contain"
                            alt="Naysa Logo"
                        />
            <span className="text-blue-900 cursor-pointer dark:text-white text-lg font-bold">Financials</span>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>
        </div>

        {/* Search - Fixed below the header */}
        <div className="flex-shrink-0 p-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Menu Items - This is the scrollable container */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <nav>
            <ul className="space-y-1">
              {menuItems.map((menuItem, index) => (
                <MenuItem
                  key={index}
                  item={menuItem}
                  searchTerm={searchTerm}
                />
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer - Fixed at the bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2025 NAYSA-Solutions Inc.
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;