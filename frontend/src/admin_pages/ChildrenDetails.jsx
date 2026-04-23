import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminFetch } from "../securitymiddlewares/adminFetch";

function ChildrenDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [childRes, meetingsRes] = await Promise.all([
          adminFetch(`/api/admin/children/${id}`, { credentials: "include" }),
          adminFetch(`/api/admin/children/${id}/meetings`, { credentials: "include" }),
        ]);

        if (!childRes.ok || !meetingsRes.ok) {
          throw new Error("Failed to fetch child data");
        }

        const childData = await childRes.json();
        const meetingsData = await meetingsRes.json();

        if (isMounted) {
          setChild(childData);
          setMeetings(meetingsData);
        }
      } catch (err) {
        console.error("Failed to load child details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!child) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Child not found</div>;
  }

  // ✅ STATUS LOGIC (unchanged)
  const statusLabel = !child.canEdit
    ? "Blocked"
    : child.adopterId
    ? "Adopted"
    : "Available";

  const statusClass =
    statusLabel === "Blocked"
      ? "bg-red-100 text-red-700"
      : statusLabel === "Adopted"
      ? "bg-green-100 text-green-700"
      : "bg-blue-100 text-blue-700";

  // block child
  const handleBlockChild = async () => {
    if (!blockReason.trim()) {
      alert("Block reason is required");
      return;
    }

    setActionLoading(true);
    try {
      const res = await adminFetch(`/api/admin/children/${id}/block`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockReason }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      setChild(updated);
      setBlockReason("");
    } catch {
      alert("Failed to block child");
    } finally {
      setActionLoading(false);
    }
  };

  //  unblock child
  const handleUnblockChild = async () => {
    setActionLoading(true);
    try {
      const res = await adminFetch(`/api/admin/children/${id}/unblock`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      setChild(updated);
    } catch {
      alert("Failed to unblock child");
    } finally {
      setActionLoading(false);
    }
  };

  //edit review
  const handleMarkReviewed = async () => {
  setReviewLoading(true);

  try {
    const res = await adminFetch(
      `/api/admin/children/${id}/review-edit`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );

    if (!res.ok) throw new Error();

    const updated = await res.json();
    setChild(updated);
  } catch {
    alert("Failed to mark as reviewed");
  } finally {
    setReviewLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 font-serif p-8">

      {/* 🔝 STICKY HEADER + NAV */}
      <div className="sticky top-0 z-50 bg-slate-100 border-b shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/manage-children")}
              className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold text-slate-800 ml-96">
              Child Details
            </h1>

            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center pb-3 text-sm font-semibold">
          <a href="#basic" className="px-3 py-1 border rounded hover:bg-gray-100">Personal Info</a>
          <a href="#adoption" className="px-3 py-1 border rounded hover:bg-gray-100">Adoption Info</a>
          <a href="#meetings" className="px-3 py-1 border rounded hover:bg-gray-100">Meetings</a>
          <a href="#gallery" className="px-3 py-1 border rounded hover:bg-gray-100">Gallery</a>
        </div>
      </div>

      {/* 🔒 ADMIN BLOCK CONTROLS */}
<section className="bg-white rounded-xl shadow-md p-6 mb-6 border">
  <h2 className="text-lg font-semibold mb-4 text-gray-800">
    Admin Controls
  </h2>

 <div className="flex flex-col gap-4">

  {/* REVIEW SECTION */}
  {child.hasEditRequest && (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
      <p className="text-sm text-blue-700 font-medium">
        Have you reviewed the latest child profile edits?
      </p>

      <button
        onClick={handleMarkReviewed}
        disabled={reviewLoading}
        className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        Mark As Reviewed
      </button>
    </div>
  )}

  {/* BLOCK SECTION */}
  <div className="flex items-start justify-between gap-6">

    {/* LEFT SIDE */}
    <div className="flex-1">
      {!child.canEdit ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-red-700 mb-1">
            Block Reason
          </p>
          <p className="text-sm text-red-600">
            {child.blockReason || "No reason provided"}
          </p>
        </div>
      ) : (
        <textarea
          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-300 focus:outline-none"
          rows={2}
          placeholder="Reason for blocking this child..."
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
        />
      )}
    </div>

    {/* RIGHT SIDE BUTTON */}
    <div className="flex items-center">
      {!child.canEdit ? (
        <button
          onClick={handleUnblockChild}
          disabled={actionLoading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          Unblock
        </button>
      ) : (
        <button
          onClick={handleBlockChild}
          disabled={actionLoading || !blockReason.trim()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
        >
          Block
        </button>
      )}
    </div>

  </div>
</div>


</section>

      {/* BASIC INFO */}
      <section id="basic" className="bg-white rounded-xl shadow p-6 mb-6 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Info label="Name" value={child.name} />
          <Info label="Age" value={child.age} />
          <Info label="Gender" value={child.gender} />
          <Info label="Date of Birth" value={child.dateOfBirth || "N/A"} />
          <Info label="Health Status" value={child.healthStatus || "N/A"} />
          <Info label="Education Level" value={child.educationLevel || "N/A"} />
        </div>
      </section>

      {/* ADOPTION INFO */}
      <section id="adoption" className="bg-white rounded-xl shadow p-6 mb-6 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4">Adoption Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Info label="Status" value={child.adoptionStatus} />
          <Info label="NGO" value={child.ngoId?.name || "N/A"} />
          <Info label="Adopter" value={child.adopterId?.fullName || child.externalAdopterName || "N/A"} />
          <Info label="Editable" value={child.canEdit ? "Yes" : "Blocked"} />
        </div>
      </section>

      {/* MEETINGS */}
      <section id="meetings" className="bg-white rounded-xl shadow p-6 mb-6 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4">Meetings</h2>

        {meetings.length === 0 ? (
          <p className="text-slate-500">No meetings found</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">NGO</th>
                <th className="border p-2">Adopter</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Meeting Date</th>
                <th className="border p-2">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m._id}>
                  <td className="border p-2">{m.ngoId?.name || "—"}</td>
                  <td className="border p-2">{m.adopterId?.fullName || "—"}</td>
                  <td className="border p-2 text-center">{m.status}</td>
                  <td className="border p-2 text-center">
                    {m.fixedMeetDate ? new Date(m.fixedMeetDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="border p-2 text-center">
                    {new Date(m.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* GALLERY */}
      <section id="gallery" className="bg-white rounded-xl shadow p-6 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4">Gallery</h2>

        {child.gallery?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {child.gallery.map((img, index) => (
              <img key={index} src={img} alt="child" className="rounded-lg border object-cover h-40 w-full" />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No images available</p>
        )}
      </section>

    </div>
  );
}

export default ChildrenDetails;

/* INFO CARD */
function Info({ label, value }) {
  return (
    <div className="border rounded-lg p-4 bg-slate-50">
      <p className="text-xs text-slate-500 uppercase">{label}</p>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
    </div>
  );
}
