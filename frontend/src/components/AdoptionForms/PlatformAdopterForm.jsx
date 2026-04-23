import { useEffect, useState } from "react";

function PlatformAdopterForm({ childId, ngoId, adopter = {}, onChange }) {

  const [adopters, setAdopters] = useState([]);

  useEffect(() => {
  const fetchAdopters = async () => {
    try {
      const res = await fetch(
        `/api/meetings/ngo/${ngoId}/status`
      );

      const meetings = await res.json();

      /* ---- only fixed meetings for THIS child ---- */
      const filtered = meetings.filter(
        m =>
          m.status === "fixed" &&
          m.childIds.some(c => c._id.toString() === childId)
      );

      /* ---- remove duplicate adopters ---- */
      const uniqueAdopters = Array.from(
        new Map(
          filtered.map(m => [
            m.adopterId._id,
            m.adopterId,
          ])
        ).values()
      );

      setAdopters(uniqueAdopters);

    } catch (err) {
      console.error(err);
    }
  };

  if (childId && ngoId) fetchAdopters();
}, [childId, ngoId]);

  /* ---------- Safe handler ---------- */
  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  return (
    <div className="bg-white border p-5 rounded-xl space-y-6">

      {/* ---------------- Select Adopter ---------------- */}
      <div>
        <p className="font-semibold mb-3 text-lg">
          Select Platform Adopter
        </p>

        <select
          className="w-full border p-3 rounded-lg"
          value={adopter?.adopterId || ""}
          onChange={(e) =>
            handleChange("adopterId", e.target.value)
          }
          required
        >
          <option value="">Select Adopter</option>

          {adopters.map((a) => (
            <option key={a._id} value={a._id}>
              {a.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* ---------------- Proof Documents ---------------- */}
      <div className="space-y-5 border-t pt-5">

        <p className="font-semibold text-lg text-orange-700">
          Upload Adoption Proof Documents
        </p>

        {/* Adoption Certificate */}
        <div>
          <label className="block font-medium mb-1">
            Adoption Certificate *
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            required
            onChange={(e) =>
              handleChange(
                "adoptionCertificate",
                e.target.files?.[0] || null
              )
            }
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Updated Birth Certificate */}
        <div>
          <label className="block font-medium mb-1">
            Updated Birth Certificate *
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            required
            onChange={(e) =>
              handleChange(
                "updatedBirthCertificate",
                e.target.files?.[0] || null
              )
            }
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Follow-up Undertaking */}
        <div>
          <label className="block font-medium mb-1">
            Follow-up Undertaking *
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            required
            onChange={(e) =>
              handleChange(
                "followUpUndertaking",
                e.target.files?.[0] || null
              )
            }
            className="w-full border p-2 rounded-lg"
          />
        </div>

      </div>

    </div>
  );
}

export default PlatformAdopterForm;