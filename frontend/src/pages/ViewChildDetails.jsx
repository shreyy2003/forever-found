import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ViewChildDetails() {

  const { childId, id: ngoId } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const res = await fetch(`/api/children/${childId}`);

        if (!res.ok) throw new Error("Failed to fetch child");

        const data = await res.json();
        setChild(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChild();
  }, [childId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!child) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-100 to-red-50 p-6 font-serif">

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <button
            onClick={() => navigate(`/ngo-home/${ngoId}/view-children`)}
            className="bg-orange-700 text-white px-4 py-2 rounded-xl hover:bg-orange-800"
          >
            Back
          </button>

          <h2 className="text-3xl font-bold text-orange-700">
            Child Details
          </h2>

          <span className="px-4 py-1 rounded-full bg-green-200 text-green-800 font-semibold">
            Adopted ✔
          </span>

        </div>

        <hr className="mb-6"/>

        {/* ADOPTION MESSAGE */}
        <div className="bg-green-50 border border-green-200 p-5 rounded-xl mb-6">

          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Adoption Completed ❤️
          </h3>

          <p className="text-green-700">
            This child has successfully found a loving family.
            The record is now preserved as an official adoption history
            and can no longer be modified.
          </p>

        </div>

        {/* BASIC INFO */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">

          <p><b>Name:</b> {child.name}</p>
          <p><b>Age:</b> {child.age}</p>
          <p><b>Gender:</b> {child.gender}</p>

          <p>
            <b>Date of Birth:</b>{" "}
            {child.dateOfBirth
              ? new Date(child.dateOfBirth).toLocaleDateString()
              : "N/A"}
          </p>

          <p><b>Health Status:</b> {child.healthStatus || "N/A"}</p>
          <p><b>Education Level:</b> {child.educationLevel || "N/A"}</p>
          <p><b>Adopter:</b>{" "}{child.adopterId?.fullName || child.externalAdopterName || "N/A"}</p>
        </div>

        <hr className="mb-6"/>

        {/* GALLERY */}
        {child.gallery?.length > 0 && (
          <div>

            <h3 className="text-xl font-semibold text-orange-700 mb-4">
              Gallery
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {child.gallery.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="child"
                  className="w-full h-40 object-cover rounded-lg shadow"
                />
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default ViewChildDetails;