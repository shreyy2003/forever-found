import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  EditIcon,
  ClockIcon,
  ListChecksIcon,
  FileCheck
} from "lucide-react";

function Ngo_Display() {
  const navigate = useNavigate();

  // Safely load NGO data
  let ngoData = null;
  try {
    const stored = localStorage.getItem("ngo");
    if (stored) {
      ngoData = JSON.parse(stored);
    }
  } catch (err) {
    console.error("Error reading ngo from localStorage:", err);
  }

  const ngoId = ngoData?.id || ngoData?._id || null; 

  const options = [
    { label: "Insert Child", Icon: UsersIcon, path: ngoId ? `/ngo-home/${ngoId}/insert-child` : "#" },
    { label: "Manage Children", Icon: EditIcon, path: ngoId ? `/ngo-home/${ngoId}/view-children` : "#" },
    { label: "Pending Requests", Icon: ListChecksIcon, path: ngoId ? `/ngo-home/${ngoId}/pending-requests` : "#" },
    { label: "Meetings/Status", Icon: ClockIcon, path: ngoId ? `/ngo-home/${ngoId}/meeting-status` : "#" },
    { label: "Adoption History", Icon: FileCheck, path: ngoId ? `/ngo-home/${ngoId}/adoptions` : "#" },
  ];

  // If no NGO is logged in → show a message instead of breaking
  if (!ngoId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          No NGO data found
        </h2>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-[#006D77] text-white rounded-xl shadow hover:bg-[#004f55] transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white py-5 shadow-sm">
        <h1 className="text-4xl font-serif font-bold text-center text-black tracking-wider">
          NGO Dashboard
        </h1>
      </div>

      <div className="px-4 py-10 bg-[#e3f8fd] min-h-[calc(100vh-11rem)]">
        <div className="grid grid-cols-1 py-4 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {options.map(({ label, Icon, path }) => (
            <button
              key={label}
              disabled={path === "#"}
              onClick={() => path !== "#" && navigate(path)}
              className="flex flex-col items-center justify-center bg-[#fdfdfd] rounded-2xl shadow-md hover:shadow-xl p-6 text-center transition hover:scale-105 border border-[#b2ebf2]"
            >
              <Icon className="w-12 h-14 mb-4 text-[#006D77]" />
              <span className="text-lg font-serif font-semibold text-[#006D77]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Ngo_Display;
