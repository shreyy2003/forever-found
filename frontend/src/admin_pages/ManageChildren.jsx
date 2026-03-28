import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { adminFetch } from "../securitymiddlewares/adminFetch";

function ManageChildren() {
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await adminFetch(
          "http://localhost:5000/api/admin/children"
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load children");
        }
        setChildren(data.children || []);
      } catch (error) {
        console.error("Error fetching children:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const isNewChild = (createdAt) => {
    if (!createdAt) return false;
    const today = new Date();
    const childDate = new Date(createdAt);
    return today.toDateString() === childDate.toDateString();
  };

  const isEditedChild = (child) => {
    return child?.hasEditRequest === true;
  };

  const filteredChildren = [...children]
    .filter((child) => {
      const matchesSearch = (child.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" ||
        (filter === "AVAILABLE" && child.adoptionStatus === "Available") ||
        (filter === "ADOPTED" && child.adoptionStatus === "Adopted") ||
        (filter === "BLOCKED" && child.canEdit === false);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (a?.hasEditRequest && !b?.hasEditRequest) return -1;
      if (!a?.hasEditRequest && b?.hasEditRequest) return 1;

      const aNew = isNewChild(a?.createdAt);
      const bNew = isNewChild(b?.createdAt);

      if (aNew && !bNew) return -1;
      if (!aNew && bNew) return 1;

      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });

  const totalChildren = children.length;
  const availableCount = children.filter(
    (c) => c.adoptionStatus === "Available"
  ).length;
  const adoptedCount = children.filter(
    (c) => c.adoptionStatus === "Adopted"
  ).length;
  const blockedCount = children.filter(
    (c) => c.canEdit === false
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600 font-serif">
        Loading children...
      </div>
    );
  }

  const handleHome = () => {
    navigate("/admin/home");
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-serif">

      <div className="bg-white border-b border-slate-200 py-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-center text-slate-800">
            Manage Children
          </h1>
          <p className="text-center text-slate-500 text-sm">
            View and manage registered children
          </p>
        </div>
        <div className="absolute right-6 top-6">
          <button
            onClick={handleHome}
            className="border rounded-md bg-gray-100 border-slate-200 p-2 shadow-sm hover:bg-gray-200 hover:shadow-xl"
          >
            Home
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

          <div className="flex flex-wrap gap-3">
            <StatCard label="Total" value={totalChildren} color="text-slate-700" />
            <StatCard label="Available" value={availableCount} color="text-green-600" />
            <StatCard label="Adopted" value={adoptedCount} color="text-blue-600" />
            <StatCard label="Blocked" value={blockedCount} color="text-red-600" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search child..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg
                           focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-44 py-2 px-3 border border-slate-300 rounded-lg
                         focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All</option>
              <option value="AVAILABLE">Available</option>
              <option value="ADOPTED">Adopted</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-6 py-4">Child Name</th>
                <th className="text-left px-6 py-4">Age</th>
                <th className="text-left px-6 py-4">Gender</th>
                <th className="text-left px-6 py-4">NGO</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map((child) => (
                <tr
                  key={child._id}
                  className={`border-t hover:bg-slate-50 transition
                    ${
                      isEditedChild(child)
                        ? "bg-orange-50 border-l-4 border-orange-500"
                        : isNewChild(child.createdAt)
                        ? "bg-yellow-50 border-l-4 border-yellow-400"
                        : ""
                    }
                  `}
                >
                  <td className="px-6 py-4 font-medium">
                    {child.name}

                    {isEditedChild(child) && (
                      <span className="ml-2 text-xs bg-orange-600 text-white px-2 py-1 rounded-full">
                        EDITED
                      </span>
                    )}

                    {!isEditedChild(child) &&
                      isNewChild(child.createdAt) && (
                        <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          NEW
                        </span>
                      )}
                  </td>

                  <td className="px-6 py-4">{child.age}</td>
                  <td className="px-6 py-4">{child.gender}</td>
                  <td className="px-6 py-4">{child.ngoName}</td>

                  <td className="px-6 py-4">
                    {child.canEdit === false ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700">
                        Blocked
                      </span>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                        {child.adoptionStatus}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        navigate(`/admin/children/${child._id}`)
                      }
                      className="text-teal-600 font-semibold hover:underline"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}

              {filteredChildren.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No children found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default ManageChildren;

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-5 py-3 shadow-sm min-w-[120px]">
      <p className="text-xs text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}