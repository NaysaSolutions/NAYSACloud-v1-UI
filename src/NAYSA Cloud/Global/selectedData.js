import { fetchData, postRequest } from '@/NAYSA Cloud/Configuration/BaseURL';
import { formatNumber } from '@/NAYSA Cloud/Global/behavior';
import { parseFormattedNumber } from '@/NAYSA Cloud/Global/behavior';
import Swal from 'sweetalert2';




export const useSelectedOpenARBalance = async (glData) => {
  try {
    const payload = { json_data: glData };
    const response = await postRequest("getSelectedARBalance", JSON.stringify(payload));

    if (response?.success && response.data?.[0]?.result) {
      return JSON.parse(response.data[0].result);
    }

    throw new Error(response?.message || "No AR entries found.");
  } catch (error) {
    console.error("Error in useSelectedOpenARBalance:", error);
    swal.fire({
      icon: "error",
      title: "Fetch Failed",
      text: error.message || "Unknown error occurred",
      confirmButtonColor: "#3085d6",
    });
    return null;
  }
};
