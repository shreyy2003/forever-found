import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AdoptionHistory_NGO() {

  const navigate = useNavigate();
  const { id: ngoId } = useParams();

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [adopterFilter, setAdopterFilter] = useState("All");

  /* ---------------- Status Mapping ---------------- */

  const statusMap = {
    Pending: "Requested",
    Approved: "Approved",
    Rejected: "Rejected",
  };

  const statusColorMap = {
    Pending: "bg-yellow-200 text-yellow-800",
    Approved: "bg-green-200 text-green-800",
    Rejected: "bg-red-200 text-red-800",
  };

  /* ---------------- Fetch Requests ---------------- */

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/ngos/adoption-request/${ngoId}`
        );

        if (!res.ok) throw new Error("Failed to fetch adoption history");

        const data = await res.json();

        setRequests(data);
        setFilteredRequests(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [ngoId]);

  /* ---------------- Filter Logic ---------------- */

  useEffect(() => {

  let filtered = [...requests];
  if (filter !== "All") {
    const statusKey = Object.keys(statusMap).find(
      key => statusMap[key] === filter
    );

    filtered = filtered.filter(r => r.status === statusKey);
  }
  if (adopterFilter !== "All") {
    filtered = filtered.filter(
      r => r.adopterType === adopterFilter
    );
  }

  setFilteredRequests(filtered);

}, [filter, adopterFilter, requests]);

  /* ---------------- States ---------------- */

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  const handleHome = () => {
    const ngoData = JSON.parse(localStorage.getItem("ngo") || "{}");
    navigate(`/ngo-home/${ngoData.id}`);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="w-screen p-6 bg-gradient-to-br from-orange-50 to-amber-100 min-h-screen font-serif">

      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-orange-800">
            Adoption History
        </h2>
        <div className="flex items-center gap-4">
            <div>
            <label className="mr-2 font-semibold text-orange-700">
                Status:
            </label>

            <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 rounded-lg border border-amber-300 shadow-sm"
            >
                <option>All</option>
                <option>Requested</option>
                <option>Approved</option>
                <option>Rejected</option>
            </select>
            </div>
            <div>
            <label className="mr-2 font-semibold text-orange-700">
                Adopter:
            </label>

            <select
                value={adopterFilter}
                onChange={(e) => setAdopterFilter(e.target.value)}
                className="px-3 py-1 rounded-lg border border-amber-300 shadow-sm"
            >
                <option>All</option>
                <option value="Platform">Platform</option>
                <option value="External">External</option>
            </select>
            </div>
            <button
            onClick={handleHome}
            className="px-3 py-2 bg-amber-700 text-white font-semibold rounded-2xl shadow-md hover:bg-amber-800"
            >
            Home
            </button>

        </div>
        </div>

      {/* Empty State */}
      {filteredRequests.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No adoption requests found.
        </p>
      ) : (

        <div className="space-y-5 w-full mx-auto max-w-5xl">

          {filteredRequests.map((req) => (

            <div
              key={req._id}
              onClick={() =>
                navigate(
                  `/ngo-home/${ngoId}/adoption-history-details/${req._id}`
                )
              }
              className="bg-white rounded-2xl p-5 border border-amber-200 shadow-lg hover:shadow-xl transition cursor-pointer"
            >

              {/* Top Row */}
              <div className="flex justify-between items-center">

                <h3 className="text-xl font-semibold text-orange-900">
                {req.adopterType === "Platform"
                    ? req.adopterId?.fullName || "Unknown Platform Adopter"
                    : req.externalAdopter?.name || "External Adopter"}
                </h3>

                <p
                  className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
                    statusColorMap[req.status]
                  }`}
                >
                  {statusMap[req.status]}
                </p>

              </div>

              {/* Details */}
              <div className="mt-2 space-y-1 text-gray-700">

                <p>
                  <span className="font-semibold text-orange-700">
                    Child:
                  </span>{" "}
                  {req.childId?.name}
                </p>

                <p>
                  <span className="font-semibold text-orange-700">
                    Adopter Type:
                  </span>{" "}
                  {req.adopterType}
                </p>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default AdoptionHistory_NGO;