import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "../securitymiddlewares/adminFetch";

function AdoptionRequests_Admin() {

  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const statusColorMap = {
    Pending: "bg-yellow-200 text-yellow-800",
    Approved: "bg-green-200 text-green-800",
    Rejected: "bg-red-200 text-red-800",
  };

  /* ---------- FETCH REQUESTS ---------- */

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await adminFetch("/api/admin/adoption-requests");

        if (!res.ok) throw new Error("Failed to fetch requests");

        const data = await res.json();
        setRequests(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  /* ---------- STATES ---------- */

  if (loading)
    return (
      <p className="text-center mt-10 text-xl font-semibold">
        Loading Adoption Requests...
      </p>
    );

  if (error)
    return (
      <p className="text-center mt-10 text-red-500 text-lg">
        {error}
      </p>
    );

  const filteredRequests = requests.filter((req) => {

  const statusMatch =
    statusFilter === "All" || req.status === statusFilter;

  const typeMatch =
    typeFilter === "All" || req.adopterType === typeFilter;

  return statusMatch && typeMatch;
});

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-orange-50 p-6 font-serif">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">

  {/* HOME BUTTON */}
  <button
    onClick={() => navigate("/admin/home")}
    className="bg-orange-200 px-4 py-2 rounded-lg hover:shadow-xl w-fit"
  >
    ← Home
  </button>

  <h2 className="text-3xl font-bold text-center text-orange-800 flex-1">
    Adoption Requests Tracking
  </h2>

  {/* FILTERS */}
  <div className="flex gap-3">

    {/* STATUS FILTER */}
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="border rounded-lg px-3 py-2"
    >
      <option value="All">All Status</option>
      <option value="Pending">Pending</option>
      <option value="Approved">Approved</option>
      <option value="Rejected">Rejected</option>
    </select>

    {/* ADOPTER TYPE FILTER */}
    <select
      value={typeFilter}
      onChange={(e) => setTypeFilter(e.target.value)}
      className="border rounded-lg px-3 py-2"
    >
      <option value="All">All Types</option>
      <option value="Platform">Platform</option>
      <option value="External">External</option>
    </select>

  </div>
</div>

      {filteredRequests.length === 0 ? (
        <p className="text-center text-gray-600">
          No Adoption Requests Found
        </p>
      ) : (

        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">

          <table className="min-w-full border-collapse">

            {/* HEADER */}
            <thead className="bg-orange-100 text-orange-900">
              <tr>
                <th className="px-6 py-3 text-left">Child Name</th>
                <th className="px-6 py-3 text-left">NGO</th>
                <th className="px-6 py-3 text-left">Adopter</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Requested On</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>

              {filteredRequests.map((req) => (

                <tr
                  key={req._id}
                  className="border-t hover:bg-orange-50 transition"
                >

                  {/* CHILD NAME */}
                  <td className="px-6 py-4 font-semibold">
                    {req.childId?.name || "N/A"}
                  </td>

                  {/* NGO */}
                  <td className="px-6 py-4">
                    {req.ngoId?.name || "N/A"}
                  </td>

                  {/* ADOPTER */}
                  <td className="px-6 py-4">
                    {req.adopterType === "Platform"
                      ? req.adopterId?.fullName
                      : req.externalAdopter?.name}
                  </td>

                  {/* TYPE */}
                  <td className="px-6 py-4">
                    {req.adopterType}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold
                      ${statusColorMap[req.status]}`}
                    >
                      {req.status}
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        navigate(`/admin/adoption-requests/${req._id}`)
                      }
                      className="bg-amber-700 text-white px-3 py-2 rounded-lg hover:bg-orange-800"
                    >
                      View
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default AdoptionRequests_Admin;