// src/pageRegistry.js
// Maps DB componentKey -> React component

import SVI       from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/SVI.jsx";
import PostSVI   from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostSVI.jsx";
import AllTranHistory from "./NAYSA Cloud/Lookup/SearchGlobalTranHistory.jsx";

import SOA       from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/SOA.jsx";
import PostSOA   from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostSOA.jsx";
import ARCM      from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/ARCM.jsx";
import PostARCM  from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostARCM.jsx";
import ARDM      from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/ARDM.jsx";
import PostARDM  from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostARDM.jsx";
import CR        from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/CR.jsx";
import PostCR    from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostCR.jsx";
import AR        from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/AR.jsx";
import PostAR    from "./NAYSA Cloud/Module/Main Module/Accounts Receivable/PostAR.jsx";

import APV       from "./NAYSA Cloud/Module/Main Module/Accounts Payable/APV.jsx";
import PostAPV   from "./NAYSA Cloud/Module/Main Module/Accounts Payable/PostAPV.jsx";

import APCM      from "./NAYSA Cloud/Module/Main Module/Accounts Payable/APCM.jsx";
// import PostAPCM  from "./NAYSA Cloud/Module/Main Module/Accounts Payable/PostAPCM.jsx";

import APDM      from "./NAYSA Cloud/Module/Main Module/Accounts Payable/APDM.jsx";
// import PostAPDM  from "./NAYSA Cloud/Module/Main Module/Accounts Payable/PostAPDM.jsx";

import PCV       from "./NAYSA Cloud/Module/Main Module/Accounts Payable/PCV.jsx";
import PostPCV   from "./NAYSA Cloud/Module/Main Module/Accounts Payable/PostPCV.jsx";

import CV        from "./NAYSA Cloud/Module/Main Module/Accounts Payable/CV.jsx";
import PostCV    from "./NAYSA Cloud/Module/Main Module/Accounts Payable/PostCV.jsx";
import CVHistory from "./NAYSA Cloud/Module/Main Module/Accounts Payable/CVHistory.jsx";

import JV        from "./NAYSA Cloud/Module/Main Module/General Ledger/JV.jsx";
import PostJV    from "./NAYSA Cloud/Module/Main Module/General Ledger/PostJV.jsx";

import BranchRef from "./NAYSA Cloud/Reference File/BranchRef.jsx";
import BankRef   from "./NAYSA Cloud/Reference File/BankRef.jsx";
import UserAccessRights   from "./NAYSA Cloud/Reference File/UserAccessRights.jsx";
import BillCodeRef from "./NAYSA Cloud/Reference File/BillCodeRef.jsx";

import ARReportModal from "./NAYSA Cloud/Printing/ARReport.jsx";
import APReportModal from "./NAYSA Cloud/Printing/APReport.jsx";
import GLReportModal from "./NAYSA Cloud/Printing/GLReport.jsx";
import VIReportModal from "./NAYSA Cloud/Printing/VIReport.jsx";
import EWTReportModal from "./NAYSA Cloud/Printing/EWTReport.jsx";




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
  APCM,
  // PostAPCM,
  APDM,
  PCV,
  CV,
  CVHistory,

  // General Ledger
  JV,


  //Global
  AllTranHistory,

  // Global Reference
  BranchRef,
  BankRef,
  UserAccessRights,
  BillCodeRef,


 
  //Posting
  PostSVI,PostSOA,PostARCM,PostARDM,PostCR,PostAR,
  PostCV,PostPCV,PostJV,PostAPV,



  //Printing
  GLReportModal,
  ARReportModal,
  APReportModal,
  VIReportModal,
  EWTReportModal,
};
