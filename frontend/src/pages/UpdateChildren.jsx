import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import SubmitStatus from "../components/Common_Components/SubmitStatus";

function UpdateChildren({ child, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    _id: "",
    ngoId: "",
    name: "",
    age: "",
    gender: "",
    dateOfBirth: "",
    healthStatus: "",
    educationLevel: "",
    adoptionStatus: "",
    gallery: [],
  });

  const [loading, setLoading] = useState(true);
  const navigate=useNavigate();

  const [submitStatus, setSubmitStatus] = useState({
    show: false,
    status: "loading",
    message: "",
  });

  useEffect(() => {
    if (child) {
      setFormData({
        _id: child._id,
        ngoId: child.ngoId,
        name: child.name,
        age: child.age,
        gender: child.gender,
        dateOfBirth: child.dateOfBirth?.split("T")[0] || "",
        healthStatus: child.healthStatus || "",
        educationLevel: child.educationLevel || "",
        adoptionStatus: child.adoptionStatus,
        gallery: child.gallery || [],
      });
      setLoading(false);
    }
  }, [child]);

  const handleMedicalChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, ...files],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitStatus({ show: true, status: "loading", message: "" });

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("age", Number(formData.age));
      formDataToSend.append("healthStatus", formData.healthStatus);
      formDataToSend.append("educationLevel", formData.educationLevel);

      // append ONLY new files
      formData.gallery.forEach((item) => {
        if (item instanceof File) {
          formDataToSend.append("gallery", item);
        }
      });

      const res = await fetch(`/api/children/update/${child._id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      onUpdate(data.child);

      setSubmitStatus({
        show: true,
        status: "success",
        message: "Child updated successfully.",
      });
    } catch (err) {
      console.error(err);
      setSubmitStatus({
        show: true,
        status: "error",
        message: "Error updating child. Please try again.",
      });
    }
  };

  const handleStatusOk = () => {
    setSubmitStatus({ show: false, status: "loading", message: "" });
    onClose();
  };

  if (loading) return <p>Loading...</p>;

  const getImageSrc = (item) => {
    if (typeof item === "string") return item;
    if (item instanceof File) return URL.createObjectURL(item);
    return "";
  };

  return (
    <div className="max-w-full p-6 bg-gradient-to-br from-yellow-50 via-orange-100 to-red-50 rounded-2xl shadow-lg relative font-serif overflow-y-auto max-h-[85vh]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-orange-700 uppercase">
          Update Child Details
        </h2>

        {child.adoptionStatus === "Available" && (
          <button
            onClick={() =>
              navigate(`/ngo-home/${child.ngoId}/adoption-request/${child._id}`)
            }
            className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            Mark as Adopted
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Read Only Info */}
        <div className="bg-white p-5 rounded-xl shadow-md border grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><b>Child ID:</b> {formData._id}</p>
          <p><b>NGO ID:</b> {formData.ngoId}</p>
          <p><b>Name:</b> {formData.name}</p>
          <p><b>Gender:</b> {formData.gender}</p>
          <p><b>DOB:</b> {formData.dateOfBirth}</p>
          <p><b>Status:</b> {formData.adoptionStatus}</p>
        </div>

        {/* Editable Fields (UNCHANGED) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-orange-200">
            <label className="block font-semibold mb-1">
              Age <span className="text-blue-500 text-sm">(Editable)</span>
            </label>
            <input
              type="number"
              min={formData.age}
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              className="w-full p-3 rounded-xl border"
              required
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-orange-200">
            <label className="block font-semibold mb-1">
              Health Status <span className="text-blue-500 text-sm">(Editable)</span>
            </label>
            <input
              type="text"
              value={formData.healthStatus}
              onChange={(e) =>
                setFormData({ ...formData, healthStatus: e.target.value })
              }
              className="w-full p-3 rounded-xl border"
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-orange-200">
            <label className="block font-semibold mb-1">
              Education Level <span className="text-blue-500 text-sm">(Editable)</span>
            </label>
            <input
              type="text"
              value={formData.educationLevel}
              onChange={(e) =>
                setFormData({ ...formData, educationLevel: e.target.value })
              }
              className="w-full p-3 rounded-xl border"
            />
          </div>
        </div>

        {/* Gallery Section — RESTORED */}
        <div className="bg-white p-5 rounded-xl shadow-md border">
          <h3 className="font-bold text-blue-500 mb-4">Gallery Documents</h3>

          <div className="flex flex-wrap gap-4 mb-4">
            {formData.gallery[0] && (
              <img
                src={getImageSrc(formData.gallery[0])}
                className="w-32 h-32 object-cover rounded-lg border"
              />
            )}
            {formData.gallery[1] && (
              <img
                src={getImageSrc(formData.gallery[1])}
                className="w-32 h-32 object-cover rounded-lg border"
              />
            )}
            {formData.gallery.slice(2).map((file, idx) => (
              <img
                key={idx}
                src={getImageSrc(file)}
                className="w-32 h-32 object-cover rounded-lg border"
              />
            ))}
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleMedicalChange}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-6">
          <button type="submit" className="flex-1 bg-blue-500 text-white py-3 rounded-xl">
            Update
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-300 py-3 rounded-xl">
            Cancel
          </button>
        </div>
      </form>

      {/* Status Overlay */}
      {submitStatus.show && (
        <SubmitStatus
          status={submitStatus.status}
          message={submitStatus.message}
          onOk={handleStatusOk}
        />
      )}
    </div>
  );
}

export default UpdateChildren;
