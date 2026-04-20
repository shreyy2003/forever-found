import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users } from "lucide-react";
import { adminFetch } from "../securitymiddlewares/adminFetch";

function ManageAdopters() {
  const navigate = useNavigate();

  const [adopters, setAdopters] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  /* 🔹 Fetch adopters from backend */
  useEffect(() => {
    const fetchAdopters = async () => {
      try {
        const res = await adminFetch(
          "http://localhost:5000/api/admin/adopters"
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch adopters");
        }

        setAdopters(data.adopters);
      } catch (error) {
        console.error("Error fetching adopters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdopters();
  }, []);

  /* 🔍 Search + Filter */
  const filteredAdopters = adopters.filter((adopter) => {
    const matchesSearch = adopter.fullName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "ALL" ||
      adopter.status.toUpperCase() === filter ||
      (filter === "BLOCKED" && adopter.isBlocked === true);
    return matchesSearch && matchesFilter;
  });

  /* 📊 Stats */
  const totalAdopters = adopters.length;
  const approvedCount = adopters.filter(
    (a) => a.status === "approved"
  ).length;
  const rejectedCount = adopters.filter(
    (a) => a.status === "rejected"
  ).length;
  const blockedCount = adopters.filter(
    (n) => n.isBlocked === true
  ).length;


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-serif text-slate-600">
        Loading adopters...
      </div>
    );
  }

  const handleHome=()=>{
    navigate("/admin/home");
    window.scrollTo(0,0);
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-serif">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-6 shadow-sm">
        <div>
            <h1 className="text-3xl font-bold text-center text-slate-800">
                Manage Adopters
            </h1>
            <p className="text-center text-slate-500 text-sm">
                 View and manage adopter applications
            </p>
        </div>
        <div className="absolute right-6 top-6">
            <button onClick={handleHome} className="border rounded-md bg-gray-100 border-slate-200 p-2 shadow-sm hover:bg-gray-200 hover:shadow-xl">Home</button>
        </div>
        
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Stats + Search + Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <StatCard label="Total" value={totalAdopters} color="text-slate-700" />
            <StatCard label="Approved" value={approvedCount} color="text-green-600" />
            <StatCard label="Rejected" value={rejectedCount} color="text-red-600" />
            <StatCard label="Blocked Adopters" value={blockedCount} color="text-yellow-600" />
          </div>

          {/* Search + Filter */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search adopter..."
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
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Gender</th>
                <th className="text-left px-6 py-4">Occupation</th>
                <th className="text-left px-6 py-4">Contact</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdopters.map((adopter) => (
                <tr key={adopter._id} className={`border-t transition ${adopter.hasEditRequest
                  ? "bg-yellow-50 border-l-4 border-yellow-500"
                  : "hover:bg-slate-50" } ${adopter.isBlocked === true ? "bg-red-50" : ""}`}>

                  <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                    {adopter.fullName}
                    {adopter.hasEditRequest && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 font-semibold">
                        Edit Request
                      </span>
                    )}
                    {adopter.isBlocked === true && (
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-semibold">
                        Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{adopter.gender}</td>
                  <td className="px-6 py-4">{adopter.occupation}</td>
                  <td className="px-6 py-4">{adopter.contactNumber}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={adopter.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        navigate(`/admin/adopters/${adopter._id}`)
                      }
                      className="text-teal-600 font-semibold hover:underline"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}

              {filteredAdopters.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-8 text-slate-500"
                  >
                    No adopters found
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

export default ManageAdopters;

/* 🔹 Status Badge */
function StatusBadge({ status }) {
  const styles = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-semibold ${styles[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

/* 🔹 Stat Card */
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
