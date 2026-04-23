import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import AdopterTypeSelector from "../components/AdoptionForms/AdopterTypeSelector";
import PlatformAdopterForm from "../components/AdoptionForms/PlatformAdopterForm";
import ExternalAdopterForm from "../components/AdoptionForms/ExternalAdopterForm";

function AdoptionConfirmationPage() {

  /* ---------------- Route Params ---------------- */
  const { id: ngoId, childId } = useParams();
  const navigate = useNavigate();

  /* ---------------- Adopter Type ---------------- */
  const [adopterType, setAdopterType] = useState("");

  /* Validation Trigger */
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- Platform State ---------------- */
  const [platformData, setPlatformData] = useState({
    adopterId: "",
    adoptionCertificate: null,
    updatedBirthCertificate: null,
    followUpUndertaking: null,
  });

  /* ---------------- External State ---------------- */
  const [externalData, setExternalData] = useState({
    name: "",
    contact: "",
    city: "",
    adoptionCertificate: null,
    updatedBirthCertificate: null,
    followUpUndertaking: null,
  });

  /* ---------------- Handlers ---------------- */

  const handlePlatformChange = (field, value) => {
    setPlatformData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExternalChange = (field, value) => {
    setExternalData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ---------------- Validation ---------------- */

  const validateForm = () => {

    if (!adopterType) return false;

    if (adopterType === "Platform") {
      return (
        platformData.adopterId &&
        platformData.adoptionCertificate &&
        platformData.updatedBirthCertificate &&
        platformData.followUpUndertaking
      );
    }

    if (adopterType === "External") {
      return (
        externalData.name &&
        externalData.contact &&
        externalData.city &&
        externalData.adoptionCertificate &&
        externalData.updatedBirthCertificate &&
        externalData.followUpUndertaking
      );
    }

    return false;
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async () => {

    setSubmitted(true);

    if (!validateForm()) return;

    try {
    
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append("childId", childId);
      formData.append("adopterType", adopterType);

      /* ---------- PLATFORM ---------- */
      if (adopterType === "Platform") {

        formData.append("adopterId", platformData.adopterId);
        formData.append("adoptionCertificate", platformData.adoptionCertificate);
        formData.append("updatedBirthCertificate", platformData.updatedBirthCertificate);
        formData.append("followUpUndertaking", platformData.followUpUndertaking);
      }

      /* ---------- EXTERNAL ---------- */
      if (adopterType === "External") {

        formData.append(
          "externalAdopter",
          JSON.stringify({
            name: externalData.name,
            contact: externalData.contact,
            address: externalData.city,
          })
        );

        formData.append("adoptionCertificate", externalData.adoptionCertificate);
        formData.append("updatedBirthCertificate", externalData.updatedBirthCertificate);
        formData.append("followUpUndertaking", externalData.followUpUndertaking);
      }

      const res = await fetch("/api/ngos/adoption-request/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      navigate(`/ngo-home/${ngoId}/view-children`);

    } catch (err) {
      console.error(err);
      alert("Submission failed");
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-serif">

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">

        {/* ---------- Header ---------- */}
        <div className="relative mb-6">
          <h1 className="text-3xl font-bold text-center">
            Adoption Confirmation
          </h1>

          <button
            onClick={() => navigate(`/ngo-home/${ngoId}/view-children`)}
            className="absolute right-0 top-1/2 -translate-y-1/2
              border border-gray-400 px-4 py-1.5 rounded-md
              bg-slate-50 hover:bg-gray-200
              hover:shadow-md transition-all duration-200"
          >
            ← Back
          </button>
        </div>

        {/* ---------- Adopter Type ---------- */}
        <AdopterTypeSelector
          adopterType={adopterType}
          setAdopterType={setAdopterType}
        />

        {/*  Required Error */}
        {submitted && !adopterType && (
          <p className="text-red-500 text-sm mb-4">
            Please select adopter type
          </p>
        )}

        {/* ---------- Platform ---------- */}
        {adopterType === "Platform" && (
          <>
            <PlatformAdopterForm
              childId={childId}
              ngoId={ngoId}
              adopter={platformData}
              onChange={handlePlatformChange}
            />

            {submitted && !validateForm() && (
              <p className="text-red-700 text-base mt-3">
                *Please fill all the platform adopter fields on this page
              </p>
            )}
          </>
        )}

        {/* ---------- External ---------- */}
        {adopterType === "External" && (
          <>
            <ExternalAdopterForm
              adopter={externalData}
              onChange={handleExternalChange}
            />

            {submitted && !validateForm() && (
              <p className="text-red-700 text-base mt-3">
                *Please fill all the external adopter fields on this page
              </p>
            )}
          </>
        )}

        {/* ---------- Submit ---------- */}
        {adopterType && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-8 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
            {isSubmitting ? "Submitting........" : "Submit Adoption Request"}
          </button>
        )}

      </div>
    </div>
  );
}

export default AdoptionConfirmationPage;