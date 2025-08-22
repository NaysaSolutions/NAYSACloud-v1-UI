import Swal from 'sweetalert2';

export function focusNextRowField(fieldName, currentIndex) {
  const selector = `#${fieldName}-input-${currentIndex + 1}`;
  const nextInput = document.querySelector(selector);
  if (nextInput) nextInput.focus();
}


export function formatNumber(num, decimals = 2) {
  if (isNaN(num) || num === null || num === undefined) return '0.00';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export const parseFormattedNumber = (value) => {
    if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/,/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    }
    return value || 0;
};

export const parseAndFormat = (value, decimals = 2) => {
  return formatNumber(parseFormattedNumber(value), decimals);
};




export const useSwalValidationAlert = ({ icon = "info", title = "", message = "" }) => {
  const formattedMessage = (message || "")
    .toString()
    .replace(/\r?\n/g, "<br/>");

  Swal.fire({
    icon,
    title,
    html: formattedMessage,
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        // ✅ Apply inline styles directly (no need for global CSS)
        popup.style.maxWidth = "400px";
        popup.style.width = "auto";
        popup.style.padding = "1rem";
        popup.style.fontSize = "14px"; // overall font size

        const titleEl = popup.querySelector(".swal2-title");
        if (titleEl) titleEl.style.fontSize = "16px";

        const body = popup.querySelector(".swal2-html-container");
        if (body) {
          body.style.fontSize = "13px";
          body.style.textAlign = "left";   // left align text
          body.style.whiteSpace = "pre-wrap"; // preserve line breaks
          body.style.maxHeight = "300px";  // ✅ limit height
          body.style.overflowY = "auto";   // ✅ scroll if too long
        }
      }
    },
  });
};




export const useSwalshowSaveSuccessDialog = (onConfirm, onPrint) => {
  Swal.fire({
    title: "Record Saved.",
    text: "What would you like to do next?",
    icon: "success",
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonColor: "#3085d6",
    denyButtonColor: "#6c757d",
    cancelButtonColor: "#28a745",
    confirmButtonText: "Create New Transaction",
    denyButtonText: "Print Preview",
    cancelButtonText: "Completed",
    timer: 5000, 
    timerProgressBar: true
  }).then((result) => {
    if (result.isConfirmed && typeof onConfirm === "function") {
      onConfirm(); 
    } else if (result.isDenied && typeof onPrint === "function") {
      onPrint(); 
    } else if (
      (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.timer) &&
      typeof onComplete === "function"
    ) {
      swal.close()
    }
  });
};
