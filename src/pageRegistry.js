// src/pageRegistry.js
// Maps DB componentKey -> React component

import SVI       from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/SVI.jsx";
import PostSVI   from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostSVI.jsx";
import SOA       from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/SOA.jsx";
import PostSOA   from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostSOA.jsx";
import ARCM      from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/ARCM.jsx";
import PostARCM  from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostARCM.jsx";
import ARDM      from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/ARDM.jsx";
import PostARDM  from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostARDM.jsx";
import CR        from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/CR.jsx";
import PostCR    from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostCR.jsx";
import AR        from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/AR.jsx";
import PostAR        from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostAR.jsx";

import APV       from "./NAYSA Cloud/Module/Main Module/Accounts Payable/APV.jsx";
import PCV       from "./NAYSA Cloud/Module/Main Module/Accounts Payable/PCV.jsx";
import CV        from "./NAYSA Cloud/Module/Main Module/Accounts Payable/CV.jsx";
import CVHistory from "./NAYSA Cloud/Module/Main Module/Accounts Payable/CVHistory.jsx";

import JV        from "./NAYSA Cloud/Module/Main Module/General Ledger/JV.jsx";


import BranchRef from "./NAYSA Cloud/Reference File/BranchRef.jsx";
import BankRef   from "./NAYSA Cloud/Reference File/BankRef.jsx";


import ARReportModal from "./NAYSA Cloud/Printing/ARReport.jsx";

// Add more imports as you create pages…

export const pageRegistry = {
  // Accounts Receivable
  SVI,
  SOA,
  ARCM,
  ARDM,
  CR,
  AR,

  // Accounts Payable
  APV,
  PCV,
  CV,
  CVHistory,

  // General Ledger
  JV,

  // Global Reference
  BranchRef,
  BankRef,

 
  //Posting
  PostSVI,PostSOA,PostARCM,PostARDM,PostCR,PostAR,



  //Printing
  ARReportModal,
};
