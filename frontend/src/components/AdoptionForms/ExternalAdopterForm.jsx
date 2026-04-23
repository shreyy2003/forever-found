function ExternalAdopterForm({ adopter, onChange }) {

  const handleFileChange = (field, file) => {
    onChange(field, file);
  };

  return (
    <div className="bg-white border p-5 rounded-xl space-y-6">

      {/* ---------------- Adopter Details ---------------- */}
      <div className="space-y-4">
        <p className="font-semibold text-lg">
          External Adopter Details
        </p>

        <input
          placeholder="Adopter Name"
          value={adopter.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="w-full border p-3 rounded-lg"
          required
        />

        <input
          placeholder="Contact Number"
          value={adopter.contact}
          onChange={(e) => onChange("contact", e.target.value)}
          className="w-full border p-3 rounded-lg"
          required
        />

        <input
          placeholder="Address"
          value={adopter.city}
          onChange={(e) => onChange("city", e.target.value)}
          className="w-full border p-3 rounded-lg"
          required
        />
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
            onChange={(e) =>
              handleFileChange(
                "adoptionCertificate",
                e.target.files[0]
              )
            }
            required
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
            onChange={(e) =>
              handleFileChange(
                "updatedBirthCertificate",
                e.target.files[0]
              )
            }
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Follow Up Undertaking */}
        <div>
          <label className="block font-medium mb-1">
            Follow-up Undertaking *
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) =>
              handleFileChange(
                "followUpUndertaking",
                e.target.files[0]
              )
            }
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>

      </div>

    </div>
  );
}

export default ExternalAdopterForm;