import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminFetch } from "../../securitymiddlewares/adminFetch";

import {
  UserCheck,
  Building2,
  Users,
  Baby,
  ListChecks,
  ClipboardListIcon
} from "lucide-react";

function Admin_Dashboard() {
  const navigate = useNavigate();

  const [pendingAdopterCount, setPendingAdopterCount] = useState(0);
  const [pendingNgoCount, setPendingNgoCount] = useState(0);
  const [editRequestCount, setEditRequestCount] = useState(0);
  const [ngoEditRequestCount, setNgoEditRequestCount] = useState(0);
  const [childEditCount, setChildEditCount] = useState(0);
  const [adoptionRequestCount, setAdoptionRequestCount] = useState(0);

  const options = [
    {
      label: "Adopter Approval",
      Icon: UserCheck,
      path: "/admin/adopter-approval",
    },
    {
      label: "NGO Approval",
      Icon: Building2,
      path: "/admin/ngo-approval",
    },
    {
      label: "View NGOs",
      Icon: ListChecks,
      path: "/admin/view-ngos",
    },
    {
      label: "Manage Adopters",
      Icon: Users,
      path: "/admin/manage-adopters",
    },
    {
      label: "Manage Children",
      Icon: Baby,
      path: "/admin/manage-children",
    },
    {
      label: "Adoption Requests",
      Icon: ClipboardListIcon,
      path: "/admin/adoption-requests",
    },
  ];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          pendingAdopterRes,
          pendingNgoRes,
          adopterRes,
          ngoRes,
          childRes,
          adoptionReqRes,
        ] = await Promise.all([
          adminFetch("http://localhost:5000/api/admin/adopters/pending/count"),
          adminFetch("http://localhost:5000/api/admin/ngos/pending/count"),
          adminFetch("http://localhost:5000/api/admin/adopters/edit-requests/count"),
          adminFetch("http://localhost:5000/api/admin/ngos/edit-requests/count"),
          adminFetch("http://localhost:5000/api/admin/children/edit-requests/count"),
          adminFetch("http://localhost:5000/api/admin/adoption-requests/count"),
        ]);

        const pendingAdopterData = await pendingAdopterRes.json();
        const pendingNgoData = await pendingNgoRes.json();
        const adopterData = await adopterRes.json();
        const ngoData = await ngoRes.json();
        const childData = await childRes.json();
        const adoptionReqData = await adoptionReqRes.json();

        setPendingAdopterCount(pendingAdopterData.count || 0);
        setPendingNgoCount(pendingNgoData.count || 0);
        setEditRequestCount(adopterData.count || 0);
        setNgoEditRequestCount(ngoData.count || 0);
        setChildEditCount(childData.count || 0);
        setAdoptionRequestCount(adoptionReqData.count || 0);

      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <div className="bg-white py-5 shadow-sm">
        <h1 className="text-4xl font-serif font-bold text-center tracking-wider">
          Admin Dashboard
        </h1>
      </div>

      <div className="px-4 py-10 bg-[#e3f8fd] min-h-[calc(100vh-11rem)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {options.map(({ label, Icon, path }) => {
            const isAdopterApproval = label === "Adopter Approval";
            const isNgoApproval = label === "NGO Approval";
            const isManageAdopters = label === "Manage Adopters";
            const isViewNgos = label === "View NGOs";
            const isManageChildren = label === "Manage Children";
            const isAdoptionRequests = label === "Adoption Requests";

            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="relative flex flex-col items-center justify-center bg-white rounded-2xl shadow-md hover:shadow-xl p-8 transition hover:scale-105 border border-[#b2ebf2]"
              >
                {/* Pending Approval Badge */}
                {isAdopterApproval && pendingAdopterCount > 0 && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {pendingAdopterCount}
                  </span>
                )}
                {/* Pending NGO Approval Badge */}
                {isNgoApproval && pendingNgoCount > 0 && (
                  <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {pendingNgoCount}
                  </span>
                )}
                {/* Adopter Edit Request Badge */}
                {isManageAdopters && editRequestCount > 0 && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {editRequestCount}
                  </span>
                )}

                {/* NGO Edit Request Badge */}
                {isViewNgos && ngoEditRequestCount > 0 && (
                  <span className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {ngoEditRequestCount}
                  </span>
                )}
                {/*Manage Children Badge Count*/}
                {isManageChildren && childEditCount > 0 && (
                  <span className="absolute top-3 right-3 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {childEditCount}
                  </span>
                )}
                {/*Adoption Request Badge Count*/}
                {isAdoptionRequests && adoptionRequestCount > 0 && (
                  <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {adoptionRequestCount}
                  </span>
                )}

                <Icon className="w-12 h-12 text-[#006D77] mb-4" />

                <span className="text-lg font-serif font-semibold text-[#006D77]">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin_Dashboard;