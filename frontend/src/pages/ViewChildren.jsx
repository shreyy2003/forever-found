import { useEffect, useState } from "react";
import UpdateChildren from "./UpdateChildren";
import { useNavigate } from "react-router-dom";

function ViewChildren() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingChild, setEditingChild] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate=useNavigate();
  // Fetch children on mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const ngoData = JSON.parse(localStorage.getItem("ngo"));
        const ngoId = ngoData?._id || ngoData?.id;
        const res = await fetch(`/api/children/ngo/${ngoId}`);

        if (!res.ok) throw new Error("Failed to fetch children");
        const data = await res.json();
        setChildren(data);
      } catch (err) {
        console.error(err);
        alert("Error fetching children");
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (children.length === 0) return <p>No children registered yet.</p>;

  // Update child in state after successful edit
  const handleUpdate = (updatedChild) => {
    setChildren((prev) =>
      prev.map((c) => (c._id === updatedChild._id ? updatedChild : c))
    );
    setEditingChild(null); // close modal
  };

  const ngoData = JSON.parse(localStorage.getItem("ngo")) || {};
  const handleClick = (e) => {
    e.preventDefault();
    navigate(`/ngo-home/${ngoData.id}`);
  };

  const filteredChildren =
  statusFilter === "All"
    ? children
    : children.filter(
        (child) => child.adoptionStatus === statusFilter
      );

  return (
    <div className="max-w-full font-serif p-9 bg-gradient-to-br from-yellow-50 via-orange-100 to-red-50 rounded-2xl shadow-lg relative max-h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-6">

  {/* Title */}
  <h2 className="text-3xl font-bold text-orange-700 uppercase">
    REGISTERED CHILDREN
  </h2>

  {/* Right Section */}
  <div className="flex items-center gap-6">

    {/* Adoption Status Filter */}
    <div className="flex items-center gap-2">
      <label className="font-semibold text-orange-700 whitespace-nowrap">
        Adoption Status:
      </label>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="border border-orange-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        <option value="All">All</option>
        <option value="Available">Available</option>
        <option value="Adoption Requested">Adoption Requested</option>
        <option value="Adopted">Adopted</option>
      </select>
    </div>

    {/* Home Button */}
    <button
      onClick={handleClick}
      className="bg-amber-600 border border-amber-600 rounded-md px-5 py-2 font-semibold hover:bg-amber-700 hover:shadow-lg transition"
    >
      Home
    </button>

  </div>
</div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-xl shadow-md">
          <thead>
            <tr className="bg-orange-100">
              <th className="py-2 px-4 border">Child ID</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Age</th>
              <th className="py-2 px-4 border">Gender</th>
              <th className="py-2 px-4 border">Date of Birth</th>
              <th className="py-2 px-4 border">Health Status</th>
              <th className="py-2 px-4 border">Education Level</th>
              <th className="py-2 px-4 border">Adoption Status</th>
              <th className="py-2 px-4 border">Update</th>
            </tr>
          </thead>

          <tbody>
            {filteredChildren.map((child) => (
              <tr
                key={child._id}
                className="text-center hover:bg-orange-50 transition-colors"
              >
                <td className="py-2 px-4 border">{child._id}</td>
                <td className="py-2 px-4 border">{child.name}</td>
                <td className="py-2 px-4 border">{child.age}</td>
                <td className="py-2 px-4 border">{child.gender}</td>
                <td className="py-2 px-4 border">
                  {child.dateOfBirth
                    ? new Date(child.dateOfBirth).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="py-2 px-4 border">{child.healthStatus || "N/A"}</td>
                <td className="py-2 px-4 border">{child.educationLevel || "N/A"}</td>
                <td className="py-2 px-4 border">{child.adoptionStatus}</td>
                <td className="py-2 px-4 border">
                  <button
                    onClick={() => {
                      if (child.adoptionStatus === "Adopted") {
                        navigate(`/ngo-home/${ngoData.id}/child-details/${child._id}`);
                      } else {
                        setEditingChild(child);
                      }
                    }}
                    className={`text-white rounded-xl px-4 py-1 transition
                    ${
                      child.adoptionStatus === "Adopted"
                        ? "bg-amber-900 hover:bg-amber-700"
                        : "bg-blue-800 hover:bg-blue-600"
                    }`}
                  >
                    {child.adoptionStatus === "Adopted" ? "View" : "Edit"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingChild && (
        <div
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4"
          onClick={() => setEditingChild(null)}   // close when clicking outside
        >
          <div
            className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}  // prevent close when clicking inside
          >
            <UpdateChildren
              child={editingChild}
              onClose={() => setEditingChild(null)}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewChildren;
