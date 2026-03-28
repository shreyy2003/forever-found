import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminFetch } from "../securitymiddlewares/adminFetch";

const NGODetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [adoptedChildren, setAdoptedChildren] = useState([]);

  const registrationImage = ngo?.gallery?.find(
      (img) => img.type === "registration"
    );

    const caraImage = ngo?.gallery?.find(
      (img) => img.type === "cara"
    );

    const galleryImages = ngo?.gallery?.filter(
      (img) => img.type === "gallery"
    );

  // 🔹 Block states (same as AdopterDetails)
  const [blockReason, setBlockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [ngoRes, meetingsRes, adoptedRes] = await Promise.all([
        adminFetch(`/api/admin/ngos/${id}`),
        adminFetch(`/api/admin/ngos/${id}/meetings`),
        adminFetch(`/api/admin/ngos/${id}/adopted-children`),
      ]);

      if (!ngoRes.ok || !meetingsRes.ok || !adoptedRes.ok) {
        throw new Error();
      }

      const ngoData = await ngoRes.json();
      const meetingsData = await meetingsRes.json();
      const adoptedChildrenData = await adoptedRes.json();

      setNgo(ngoData);
      setMeetings(meetingsData);
      setAdoptedChildren(adoptedChildrenData);
    } catch {
      console.error("Failed to load NGO data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  /* ---------- BLOCK ---------- */
  const handleBlock = async () => {
    if (!blockReason.trim()) return;

    try {
      setActionLoading(true);

      const res = await adminFetch(`/api/admin/ngos/${id}/block`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: blockReason }),
      });

      if (!res.ok) throw new Error();

      const updated = await adminFetch(`/api/admin/ngos/${id}`, {
        credentials: "include",
      }).then((r) => r.json());

      setNgo(updated);
      setBlockReason("");
    } catch {
      alert("Failed to block NGO");
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- UNBLOCK ---------- */
  const handleUnblock = async () => {
    try {
      setActionLoading(true);

      const res = await adminFetch(`/api/admin/ngos/${id}/unblock`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const updated = await adminFetch(`/api/admin/ngos/${id}`, {
        credentials: "include",
      }).then((r) => r.json());

      setNgo(updated);
    } catch {
      alert("Failed to unblock NGO");
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- CLEAR EDIT REQUEST ---------- */
  const handleClearEditRequest = async () => {
    try {
      const res = await adminFetch(
        `/api/admin/ngos/${id}/clear-edit-request`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error();

      await fetchData(); // refresh properly
    } catch {
      alert("Failed to clear edit request");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!ngo) return <p>NGO not found</p>;

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#fffdfc] border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate("/admin/view-ngos")}
            className="px-3 py-1 border rounded bg-[#fff0e5]"
          >
            ← Back
          </button>

          <nav className="flex flex-wrap gap-3 text-sm font-semibold justify-center ml-40">
            <a href="#admin" className="px-3 py-1 border rounded">Admin</a>
            <a href="#basic" className="px-3 py-1 border rounded">Basic</a>
            <a href="#location" className="px-3 py-1 border rounded">Location</a>
            <a href="#org" className="px-3 py-1 border rounded">Organization</a>
            <a href="#about" className="px-3 py-1 border rounded">About</a>
            <a href="#testimonials" className="px-3 py-1 border rounded">Testimonials</a>
            <a href="#meetings" className="px-3 py-1 border rounded">Meetings</a>
            <a href="#adopted" className="px-3 py-1 border rounded">Adoptions</a>
          </nav>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="pt-28 min-h-screen bg-[#fff0e5] flex justify-center font-serif">
        <div className="w-full max-w-5xl bg-[#fffdfc] m-8 p-6 rounded-md shadow-lg border">

          <h2 className="text-2xl font-bold uppercase tracking-wide mb-6">
            NGO Details
          </h2>
          {ngo.hasEditRequest && (
            <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-md mb-4">
              <p className="font-semibold text-yellow-800">
                ⚠️ This NGO has requested profile changes.
              </p>

              <button
                onClick={handleClearEditRequest}
                className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Mark as Reviewed
              </button>
            </div>
          )}

          {/* ADMIN */}
          <Section id="admin" title="Admin Controls" bg="bg-[#dbeaf3]">
            <Grid>
              <p>
                <b>Account Status:</b>{" "}
                <span className={ngo.canEdit ? "text-green-700" : "text-red-600"}>
                  {ngo.canEdit ? "Active" : "Blocked"}
                </span>
              </p>
              <Info
                label="Verification Status"
                value={ngo.verified ? "Verified" : "Pending"}
              />
            </Grid>

            <div className="flex items-start gap-6 mt-4">
              <div className="flex-1">
                {!ngo.canEdit ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-700 mb-1">
                      Block Reason
                    </p>
                    <p className="text-sm text-red-600">
                      {ngo.blockReason || "No reason provided"}
                    </p>
                  </div>
                ) : (
                  <textarea
                    className="w-full border rounded-lg p-3 text-sm"
                    rows={2}
                    placeholder="Reason for blocking this NGO..."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                )}
              </div>

              {!ngo.canEdit ? (
                <button
                  onClick={handleUnblock}
                  disabled={actionLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Unblock
                </button>
              ) : (
                <button
                  onClick={handleBlock}
                  disabled={actionLoading || !blockReason.trim()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Block
                </button>
              )}
            </div>
          </Section>

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
          <Section id="location" title="Location Details" bg="bg-[#dbeaf3]">
            <Grid>
              <Info label="City" value={ngo.city} />
              <Info label="State" value={ngo.state} />
              <Info label="Address" value={ngo.location} wide />
            </Grid>
          </Section>

          {/* ORGANIZATION */}
          <Section id="org" title="Organizational Information" bg="bg-[#f2e8cf]">
            <Grid>
              <Info label="Contact Person" value={ngo.contactPersonName} />
              <Info label="Designation" value={ngo.contactPersonDesignation} />
              <Info label="Year of Establishment" value={ngo.yearOfEstablishment} />
              <Info label="Number of Children" value={ngo.numberOfChildren} />
              <Info label="Registration Number" value={ngo.registrationNumber} />
              <Info label="CARA Registration Number" value={ngo.caraRegistrationNumber} />
            </Grid>
          </Section>

          {/* ABOUT */}
          <Section id="about" title="About the NGO" bg="bg-[#dbeaf3]">
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

          {/* TESTIMONIALS */}
          <Section id="testimonials" title="Testimonials" bg="bg-[#f2e8cf]">
            {ngo.testimonials?.length ? (
              ngo.testimonials.map((t, i) => (
                <div key={i} className="border rounded-md p-4 bg-white mb-3">
                  <p className="italic">“{t.feedback}”</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t.name} {t.role && `— ${t.role}`}
                  </p>
                </div>
              ))
            ) : (
              <p>No testimonials available.</p>
            )}
          </Section>

          

          {/* MEETINGS */}
          <Section id="meetings" title="Meetings History" bg="bg-[#fffdfc]">
            {meetings.length === 0 ? <p>No meetings found.</p> : (
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Adopter</th>
                    <th className="border p-2">Children</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Meeting Date</th>
                    <th className="border p-2">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m) => (
                    <tr key={m._id}>
                      <td className="border p-2">{m.adopterId?.fullName || "—"}</td>
                      <td className="border p-2">
                        {m.childIds?.map((c) => c.name).join(", ") || "—"}
                      </td>
                      <td className="border p-2 text-center">{m.status}</td>
                      <td className="border p-2 text-center">
                        {m.fixedMeetDate
                          ? new Date(m.fixedMeetDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="border p-2 text-center">
                        {new Date(m.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          {/* ADOPTED CHILDREN */}
          <Section id="adopted" title="Adopted Children History" bg="bg-[#f2f7f4]">
            {adoptedChildren.length === 0 ? (
              <p>No adopted children records found.</p>
            ) : (
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Child Name</th>
                    <th className="border p-2">Age</th>
                    <th className="border p-2">Gender</th>
                    <th className="border p-2">Adopter</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adoptedChildren.map((c) => (
                    <tr key={c._id}>
                      <td className="border p-2">{c.name}</td>
                      <td className="border p-2 text-center">{c.age}</td>
                      <td className="border p-2 text-center">{c.gender}</td>
                      <td className="border p-2">
                        {c.adopterId?.fullName || "—"}
                      </td>
                      <td className="border p-2 text-center font-semibold text-green-700">
                        {c.adoptionStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        </div>
      </div>
    </>
  );
};

/* ---------- Helpers ---------- */

const Section = ({ id, title, children, bg }) => (
  <div id={id} className={`border rounded-md p-4 my-4 ${bg}`}>
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

export default NGODetails;
