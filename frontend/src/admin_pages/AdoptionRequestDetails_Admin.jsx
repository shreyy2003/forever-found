import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminFetch } from "../securitymiddlewares/adminFetch";

function AdoptionRequestDetails_Admin() {

  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const statusColorMap = {
    Pending: "bg-yellow-200 text-yellow-800",
    Approved: "bg-green-200 text-green-800",
    Rejected: "bg-red-200 text-red-800",
  };

  /* ================= FETCH REQUEST ================= */

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await adminFetch(
          `/api/admin/adoption-requests/${requestId}`
        );

        if (!res.ok) throw new Error("Failed to fetch request");

        const data = await res.json();
        setRequest(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  /* ================= VERIFY HANDLER ================= */

  const handleVerification = async (status) => {

    if (!remarks.trim()) {
      alert("Admin remarks are mandatory");
      return;
    }

    try {
      setSubmitting(true);

      const res = await adminFetch(
        `/api/admin/adoption-requests/${requestId}/verify`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            adminRemarks: remarks,
          }),
        }
      );

      if (!res.ok) throw new Error("Verification failed");

      alert(`Adoption ${status}`);

      navigate("/admin/adoption-requests");

    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= STATES ================= */

  if (loading)
    return <p className="text-center mt-10">Loading...</p>;

  if (error)
    return <p className="text-center mt-10 text-red-500">{error}</p>;

  if (!request) return null;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-orange-50 p-6 font-serif">

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">

          <button
            onClick={() => navigate("/admin/adoption-requests")}
            className="bg-gray-200 px-4 py-2 rounded-lg"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-orange-800 text-center flex-1">
            Adoption Request Details
          </h2>

          <span className={`px-4 py-1 rounded-full font-semibold ${statusColorMap[request.status]}`}>
            {request.status}
          </span>

        </div>

        {/* ================= REQUEST INFO ================= */}

        <h3 className="font-bold text-orange-700 mb-2">Request Info</h3>

        <p><b>Adopter Type:</b> {request.adopterType}</p>
        <p><b>Date:</b> {new Date(request.createdAt).toLocaleDateString()}</p>

        <hr className="my-4"/>

        {/* ================= CHILD ================= */}

        <h3 className="font-bold text-orange-700 mb-2">Child Details</h3>

        <p><b>Name:</b> {request.childId?.name}</p>
        <p><b>Age:</b> {request.childId?.age}</p>
        <p><b>Gender:</b> {request.childId?.gender}</p>

        <hr className="my-4"/>

        {/* ================= NGO ================= */}

        <h3 className="font-bold text-orange-700 mb-2">NGO Details</h3>

        <p><b>Name:</b> {request.ngoId?.name}</p>
        <p><b>Email:</b> {request.ngoId?.email}</p>

        <hr className="my-4"/>

        {/* ================= ADOPTER ================= */}

        <h3 className="font-bold text-orange-700 mb-2">Adopter Details</h3>

        {request.adopterType === "Platform" ? (
          <>
            <p><b>Name:</b> {request.adopterId?.fullName}</p>
            <p><b>Email:</b> {request.adopterId?.email}</p>
            <p><b>Contact:</b> {request.adopterId?.contactNumber}</p>
          </>
        ) : (
          <>
            <p><b>Name:</b> {request.externalAdopter?.name}</p>
            <p><b>Contact:</b> {request.externalAdopter?.contact}</p>
            <p><b>Address:</b> {request.externalAdopter?.address}</p>
          </>
        )}

        <hr className="my-6"/>

        {/* ================= DOCUMENTS ================= */}

        <h3 className="text-xl font-semibold text-green-900 mb-4">
          Verification Documents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {request.proofDocuments?.adoptionCertificate && (
            <img
              src={request.proofDocuments.adoptionCertificate}
              alt="Adoption Certificate"
              className="w-full h-64 object-contain rounded-lg shadow"
            />
          )}

          {request.proofDocuments?.updatedBirthCertificate && (
            <img
              src={request.proofDocuments.updatedBirthCertificate}
              alt="Birth Certificate"
              className="w-full h-64 object-contain rounded-lg shadow"
            />
          )}

          {request.proofDocuments?.followUpUndertaking && (
            <img
              src={request.proofDocuments.followUpUndertaking}
              alt="Follow Up"
              className="w-full h-64 object-contain rounded-lg shadow"
            />
          )}

        </div>

        {/* ================= ADMIN ACTION ================= */}

        {request.status === "Pending" && (
          <div className="mt-8">

            <textarea
              placeholder="Provide verification remarks (Compulsory). 
              For approvals: include encouraging or appreciative message.
              For rejection: clearly mention reason and next steps."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4"
              rows={4}
            />

            <div className="flex gap-4 justify-center">

              <button
                disabled={submitting}
                onClick={() => handleVerification("Approved")}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Approve
              </button>

              <button
                disabled={submitting}
                onClick={() => handleVerification("Rejected")}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Reject
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default AdoptionRequestDetails_Admin;