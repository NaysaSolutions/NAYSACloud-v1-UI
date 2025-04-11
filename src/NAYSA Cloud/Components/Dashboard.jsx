import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tabContent = {
  'Transactions': {
    'ACCOUNTS PAYABLE': ['Account Payable Voucher']
  },
  'Reference Files': {
    'ACCOUNTS PAYABLE': ['Payee Master Data'],
  },
  'POST Transaction': {
    'POST Options': ['Post AP', 'Post Inventory'],
  },
  'Queries': {
    'AP Queries': ['Voucher Status', 'Payee History'],
  },
  'Reports': {
    'AP Reports': ['Monthly Summary', 'Vendor Report'],
  },
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Transactions');
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    if (item === 'Payee Master Data') {
      navigate('/payeemasterdata');
    }
    // You can expand this condition for more navigable items
  };

  return (
    <div className="flex max-w-6xl mx-auto mt-10 shadow-md rounded-xl overflow-hidden">
      {/* Sidebar Tabs */}
      <div className="w-1/4 bg-[#e8f0fc] p-4 text-sm font-semibold text-blue-800 space-y-4">
        {Object.keys(tabContent).map((tab, idx) => (
          <div
            key={idx}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer transition ${
              activeTab === tab
                ? 'border-l-4 border-blue-600 pl-2 text-blue-900 font-bold'
                : 'pl-2 hover:text-blue-600'
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Main Tab Content */}
      <div className="w-3/4 bg-white p-6 grid grid-cols-2 gap-6 text-sm text-gray-800">
        {Object.entries(tabContent[activeTab]).map(([category, items], index) => (
          <div key={index}>
            <h3 className="font-semibold mb-2 text-gray-700">{category}</h3>
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleItemClick(item)}
                  className="hover:text-blue-600 cursor-pointer transition"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
