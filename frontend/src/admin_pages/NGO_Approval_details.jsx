import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminFetch } from "../securitymiddlewares/adminFetch";

function Ngo_Approval_Details() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const registrationImage = ngo?.gallery?.find(
      (img) => img.type === "registration"
    );

    const caraImage = ngo?.gallery?.find(
      (img) => img.type === "cara"
    );

    const galleryImages = ngo?.gallery?.filter(
      (img) => img.type === "gallery"
    );


  useEffect(() => {
    fetchNgo();
  }, []);

  const fetchNgo = async () => {
    try {
      const res = await adminFetch(`http://localhost:5000/api/admin/ngos/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNgo(data);
    } catch {
      alert("Failed to load NGO details");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- APPROVE ---------- */
  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const res = await adminFetch(
        `http://localhost:5000/api/admin/ngos/${id}/approve`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error();
      navigate("/admin/ngo-approval");
    } catch {
      alert("Failed to approve NGO");
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- REJECT ---------- */
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      return alert("Rejection reason is required");
    }

    try {
      setActionLoading(true);
      const res = await adminFetch(
        `http://localhost:5000/api/admin/ngos/${id}/reject`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );
      if (!res.ok) throw new Error();
      navigate("/admin/ngo-approval");
    } catch {
      alert("Failed to reject NGO");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!ngo) return <p className="text-center mt-10">NGO not found</p>;

  return (
    <div className="min-h-screen bg-[#fff0e5] font-serif pt-10">
      <div className="max-w-5xl mx-auto bg-[#fffdfc] p-6 rounded-md shadow-lg border">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            NGO Approval
          </h2>
          <button
            onClick={() => navigate("/admin/ngo-approval")}
            className="px-3 py-1 border rounded bg-[#fff0e5]"
          >
            ← Back
          </button>
        </div>

        {/* BASIC DETAILS */}
        <Section title="Basic NGO Details" bg="bg-[#f2e8cf]">
          <Grid>
            <Info label="NGO Name" value={ngo.name} />
            <Info label="Website" value={ngo.website || "—"} />
            <Info label="Email" value={ngo.email} />

            <Info
              label="Email Verification Status"
              value={
                ngo.emailVerified ? (
                  <span className="text-green-600 font-semibold">
                    ✅ Verified
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    ❌ Not Verified
                  </span>
                )
              }
            />

            <Info label="Contact Number" value={ngo.contact} />
            <Info label="Alternate Contact" value={ngo.alternateContact} />  
          </Grid>
        </Section>


        {/*logo*/}
        <Section title="NGO Logo" bg="bg-[#f2f7f4]">
          {ngo.logo ? (
            <img
              src={ngo.logo}
              alt="NGO Logo"
              className="h-32 object-contain border rounded-md bg-white p-2"
            />
          ) : (
            <p className="text-gray-500 italic">No logo uploaded</p>
          )}
        </Section>


        {/* LOCATION */}
        <Section title="Location Details" bg="bg-[#dbeaf3]">
          <Grid>
            <Info label="City" value={ngo.city} />
            <Info label="State" value={ngo.state} />
            <Info label="Address" value={ngo.location} wide />
          </Grid>
        </Section>

        {/* ORGANIZATION */}
        <Section title="Organizational Information" bg="bg-[#f2e8cf]">
          <Grid>
            <Info label="Contact Person" value={ngo.contactPersonName} />
            <Info label="Designation" value={ngo.contactPersonDesignation} />
            <Info label="Year of Establishment" value={ngo.yearOfEstablishment} />
            <Info label="Number of Children" value={ngo.numberOfChildren} />
            <Info label="Registration Number" value={ngo.registrationNumber} />
            <Info
              label="CARA Registration Number"
              value={ngo.caraRegistrationNumber}
            />
          </Grid>
        </Section>

        {/* ABOUT */}
        <Section title="About the NGO" bg="bg-[#dbeaf3]">
          <p className="text-gray-700 whitespace-pre-line">
            {ngo.about || "—"}
          </p>
        </Section>


        <Section title="Official Certificates" bg="bg-[#dbeaf3]">
          <div className="grid grid-cols-2 gap-6">

            {/* Registration Certificate */}
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Registration Certificate
              </p>
              {registrationImage ? (
                <img
                  src={registrationImage.url}
                  alt="Registration Certificate"
                  className="border rounded-md max-h-80"
                />
              ) : (
                <p className="text-gray-500 italic">Not uploaded</p>
              )}
            </div>

            {/* CARA Certificate */}
            <div>
              <p className="text-sm text-gray-600 mb-1">
                CARA Certificate
              </p>
              {caraImage ? (
                <img
                  src={caraImage.url}
                  alt="CARA Certificate"
                  className="border rounded-md max-h-80"
                />
              ) : (
                <p className="text-gray-500 italic">Not uploaded</p>
              )}
            </div>

          </div>
        </Section>

        {/* Gallery Images */}
        <Section title="NGO Gallery" bg="bg-[#f2f7f4]">
            {galleryImages && galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {galleryImages.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`Gallery ${index + 1}`}
                    className="border rounded-md h-40 object-cover"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No gallery images uploaded</p>
            )}
          </Section>


        
        
        {/* Testimonials */}
        <Section title="Testimonials">
        {ngo.testimonials && ngo.testimonials.length > 0 ? (
            ngo.testimonials.map((t, index) => (
            <div
                key={index}
                className="border rounded-md p-4 bg-white mb-3"
            >
                <p className="italic text-gray-700">
                “{t.feedback}”
                </p>
                <p className="text-sm text-gray-600 mt-1">
                {t.name} {t.role && `— ${t.role}`}
                </p>
            </div>
            ))
        ) : (
            <p className="text-gray-500">No testimonials available.</p>
        )}
        </Section>

        



        {/* ACTION BAR */}
        <div className="mt-10 flex items-center justify-between gap-6">
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            className="bg-green-600 text-white px-8 py-2 rounded-lg"
          >
            Approve
          </button>

          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Rejection reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="border px-3 py-2 rounded-lg w-64"
            />
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="bg-red-600 text-white px-6 py-2 rounded-lg"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ngo_Approval_Details;

/* ---------- HELPERS ---------- */

const Section = ({ title, children, bg }) => (
  <div className={`border rounded-md p-4 my-4 ${bg}`}>
    <h3 className="text-lg underline font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-2 gap-4">{children}</div>
);

const Info = ({ label, value, wide }) => (
  <div className={wide ? "col-span-2" : ""}>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-semibold">{value || "—"}</p>
  </div>
);
