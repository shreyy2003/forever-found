import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function AdoptionHistoryDetails_NGO() {

  const { requestId, id: ngoId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statusColorMap = {
    Pending: "bg-yellow-200 text-yellow-800",
    Approved: "bg-green-200 text-green-800",
    Rejected: "bg-red-200 text-red-800",
  };

  /* ---------- Fetch Details ---------- */

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/ngos/adoption-request-details/${requestId}`
        );

        if (!res.ok) throw new Error("Failed to fetch details");

        const data = await res.json();
        setRequest(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [requestId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!request) return null;

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-orange-50 p-6 font-serif">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="relative flex items-center mb-6">
        <button
            onClick={() => navigate(`/ngo-home/${ngoId}/adoptions`)}
            className="absolute left-0 bg-orange-800 text-white px-4 py-2 rounded-xl hover:bg-orange-600"
        >
            Back
        </button>
        <h2 className="w-full text-center text-2xl font-bold text-orange-800">
            Adoption Request Details
        </h2>
        <span
            className={`absolute right-0 px-4 py-1 rounded-full font-semibold ${statusColorMap[request.status]}`}
        >
            {request.status}
        </span>
        </div>

        <hr className="my-4"/>

        {request.status !== "Pending" && (
        <div className="mt-6 p-5 rounded-xl border bg-amber-50">

            <h3 className="text-lg font-bold text-orange-800 mb-2">
            Admin Decision
            </h3>

            {/* APPROVED MESSAGE */}
            {request.status === "Approved" && (
            <p className="text-green-800 font-semibold mb-2">
                🎉 Adoption Successfully Approved
            </p>
            )}

            {/* REJECTED MESSAGE */}
            {request.status === "Rejected" && (
            <p className="text-red-700 font-semibold mb-2">
                Adoption Request Rejected
            </p>
            )}

            {/* ADMIN REMARKS */}
            <div className="bg-white p-4 rounded-lg shadow-sm mt-2">
            <p className="text-gray-800 whitespace-pre-line">
                {request.adminRemarks || "No remarks provided by admin."}
            </p>
            </div>

            {/* VERIFIED DATE */}
            {request.verifiedAt && (
            <p className="text-sm text-gray-500 mt-3">
                Reviewed on: {new Date(request.verifiedAt).toLocaleDateString()}
            </p>
            )}

        </div>
        )}

    <hr className="my-4"/>

        {/* REQUEST INFO */}
        <h3 className="text-lg font-bold text-orange-700 mb-2">
          Request Information
        </h3>

        <p><b>Adopter Type:</b> {request.adopterType}</p>
        <p><b>Requested On:</b> {new Date(request.createdAt).toLocaleDateString()}</p>

        <hr className="my-4"/>

        {/* CHILD DETAILS */}
        <h3 className="text-lg font-bold text-orange-700 mb-2">
          Child Details
        </h3>

        <p><b>Name:</b> {request.childId?.name}</p>
        <p><b>Age:</b> {request.childId?.age}</p>
        <p><b>Gender:</b> {request.childId?.gender}</p>

        <hr className="my-4"/>

        {/* ADOPTER DETAILS */}
        <h3 className="text-lg font-bold text-orange-700 mb-2">
          Adopter Details
        </h3>

        {request.adopterType === "Platform" ? (
          <>
            <p><b>Name:</b> {request.adopterId?.fullName}</p>
            <p><b>Email:</b> {request.adopterId?.email}</p>
            <p><b>Phone:</b> {request.adopterId?.contactNumber}</p>
          </>
        ) : (
          <>
            <p><b>Name:</b> {request.externalAdopter?.name}</p>
            <p><b>Contact:</b> {request.externalAdopter?.contact}</p>
            <p><b>Address:</b> {request.externalAdopter?.address}</p>
          </>
        )}

        <hr className="my-4"/>

        {/* Proof Documents */}
        {request.proofDocuments && (
        <div className="mt-8 bg-slate-100 p-6 rounded-xl">
            <h3 className="text-2xl font-semibold mb-6 text-green-900">
            Adoption Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {request.proofDocuments.adoptionCertificate && (
                <img
                src={request.proofDocuments.adoptionCertificate}
                alt="Adoption Certificate"
                className="w-full h-64 object-contain rounded-lg shadow"
                />
            )}

            {request.proofDocuments.updatedBirthCertificate && (
                <img
                src={request.proofDocuments.updatedBirthCertificate}
                alt="Updated Birth Certificate"
                className="w-full h-64 object-contain rounded-lg shadow"
                />
            )}

            {request.proofDocuments.followUpUndertaking && (
                <img
                src={request.proofDocuments.followUpUndertaking}
                alt="Follow Up Undertaking"
                className="w-full h-64 object-contain rounded-lg shadow"
                />
            )}

            </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default AdoptionHistoryDetails_NGO;