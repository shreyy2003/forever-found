import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditNgoProfile() {
  const { id } = useParams(); // NGO id from URL
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    city: "",
    state: "",
    location: "",
    contact: "",
    alternateContact: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    website: "",
    about: "",
    numberOfChildren: 0,
    gallery: [],
    testimonials: [],
  });

  useEffect(() => {
    async function fetchNgo() {
      try {
        const res = await fetch(`http://localhost:5000/api/ngos/${id}`);
        if (!res.ok) throw new Error("Failed to fetch NGO details");
        const data = await res.json();
        setNgo(data);

        setFormData({
          city: data.city || "",
          state: data.state || "",
          location: data.location || "",
          contact: data.contact || "",
          alternateContact: data.alternateContact || "",
          contactPersonName: data.contactPersonName || "",
          contactPersonDesignation: data.contactPersonDesignation || "",
          website: data.website || "",
          about: data.about || "",
          numberOfChildren: data.numberOfChildren || 0,
          gallery: (data.gallery || [])
            .filter((img) => img.type === "gallery")
            .slice(0, 3),
          testimonials: [...(data.testimonials || [])].slice(0, 3),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNgo();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* =========================
     GALLERY LOGIC (UPDATED)
     ========================= */

  const handleGalleryChange = (index, file) => {
    const newGallery = [...formData.gallery];
    newGallery[index] = file;
    setFormData((prev) => ({ ...prev, gallery: newGallery }));
  };

  const addGalleryImage = () => {
    if (formData.gallery.length < 3) {
      setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, null] }));
    }
  };

  const removeGalleryImage = (index) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, gallery: newGallery }));
  };

  /* =========================
     TESTIMONIAL LOGIC (UNCHANGED)
     ========================= */

  const handleTestimonialChange = (index, field, value) => {
    const newTestimonials = [...formData.testimonials];
    newTestimonials[index][field] = value;
    setFormData((prev) => ({ ...prev, testimonials: newTestimonials }));
  };

  const addTestimonial = () => {
    if (formData.testimonials.length < 3) {
      setFormData((prev) => ({
        ...prev,
        testimonials: [...prev.testimonials, { name: "", role: "", feedback: "" }],
      }));
    }
  };

  const removeTestimonial = (index) => {
    const newTestimonials = formData.testimonials.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, testimonials: newTestimonials }));
  };

 //save logoc
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "gallery") {
        // Upload new files
        value.forEach((img) => {
          if (img instanceof File) {
            payload.append("newGallery", img);
          }
        });

        // Send existing gallery URLs (only gallery type)
        const existingImages = value
          .filter((img) => !(img instanceof File))
          .map((img) =>
            typeof img === "string" ? img : img?.url
          );

        payload.append("existingGallery", JSON.stringify(existingImages));
      }
      else if (key === "testimonials") {
          payload.append("testimonials", JSON.stringify(value));
        } else {
          payload.append(key, value);
        }
      });

      const res = await fetch(`http://localhost:5000/api/ngos/${id}`, {
        method: "PUT",
        body: payload,
      });

      if (!res.ok) throw new Error("Failed to update NGO profile");
      navigate(`/ngo-home/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-xl font-serif font-semibold text-gray-700">Loading...</p>;
  if (error)
    return <p className="text-center mt-20 text-xl font-serif font-semibold text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-green-50 py-10 px-4 font-serif">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-10">
        <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-6">Edit NGO Profile</h2>

        {/* Read-only fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <p><span className="font-semibold text-green-700">Name:</span> {ngo.name}</p>
          <p><span className="font-semibold text-green-700">Email:</span> {ngo.email}</p>
          <p><span className="font-semibold text-green-700">NGO Registration No:</span> {ngo.registrationNumber}</p>
          <p><span className="font-semibold text-green-700">CARA Registration No:</span> {ngo.caraRegistrationNumber}</p>
        </div>


          {/* Editable fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800 text-lg md:text-xl">
          <div>
            <label className="font-semibold text-green-700">City:</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border p-2 rounded mt-1"/>
          </div>
          <div>
            <label className="font-semibold text-green-700">State:</label>
            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border p-2 rounded mt-1"/>
          </div>
          <div>
            <label className="font-semibold text-green-700">Location:</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border p-2 rounded mt-1"/>
          </div>

          <div>
            <label className="font-semibold text-green-700">Contact:</label>
            <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="w-full border p-2 rounded mt-1"/>
          </div>

          <div>
            <label className="font-semibold text-green-700">Alternate Contact:</label>
            <input type="text" name="alternateContact" value={formData.alternateContact} onChange={handleChange} className="w-full border p-2 rounded mt-1"/>
          </div>

          <div>
            <label className="font-semibold text-green-700"> Contact Person Name:</label>
            <input type="text" name="contactPersonName" value={formData.contactPersonName} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
          </div>

          <div>
            <label className="font-semibold text-green-700">Contact Person Designation:</label>
            <input type="text" name="contactPersonDesignation" value={formData.contactPersonDesignation} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
          </div>

          <div>
            <label className="font-semibold text-green-700">Website:</label>
            <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full border p-2 rounded mt-1"/>
          </div>

          <div>
            <label className="font-semibold text-green-700">Number of Children:</label>
            <input type="number" name="numberOfChildren" value={formData.numberOfChildren} onChange={handleChange} min={0} className="w-full border p-2 	     rounded mt-1"/>
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-green-700">About:</label>
            <textarea name="about" value={formData.about} onChange={handleChange} rows={4} className="w-full border p-2 rounded mt-1"/>
          </div>

          {/* Gallery Section */}
          <div className="md:col-span-2">
            <label className="font-semibold text-green-700">
              Gallery Images (max 3):
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {formData.gallery.map((img, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 flex flex-col gap-2 shadow-sm"
                >
                  {/* Image Preview */}
                  {img ? (
                    <img
                      src={
                        img instanceof File
                          ? URL.createObjectURL(img)
                          : typeof img === "string"
                          ? img
                          : img?.url
                      }
                      alt={`Gallery ${index + 1}`}
                      className="h-40 w-full object-contain rounded-md border bg-gray-50"
                    />
                  ) : (
                    <div className="h-40 w-full flex items-center justify-center border rounded-md text-gray-400 text-sm">
                      No Image Selected
                    </div>
                  )}

                  {/* File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleGalleryChange(index, e.target.files[0])
                    }
                    className="w-full border p-2 rounded"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {formData.gallery.length < 3 && (
              <button
                type="button"
                onClick={addGalleryImage}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Image
              </button>
            )}
          </div>


          {/* Testimonials Section (UNCHANGED) */}
          <div className="md:col-span-2 mt-4">
            <label className="font-semibold text-green-700">Testimonials (max 3):</label>
            {formData.testimonials.map((t, index) => (
              <div key={index} className="border p-3 rounded mt-2 flex flex-col gap-2">
                <input type="text" placeholder="Person Name" value={t.name} onChange={(e) => handleTestimonialChange(index, "name", e.target.value)} className="border p-2 rounded"/>
                <input type="text" placeholder="Role" value={t.role} onChange={(e) => handleTestimonialChange(index, "role", e.target.value)} className="border p-2 rounded"/>
                <textarea placeholder="Feedback" value={t.feedback} onChange={(e) => handleTestimonialChange(index, "feedback", e.target.value)} rows={2} className="border p-2 rounded"/>
                <button type="button" onClick={() => removeTestimonial(index)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 w-max mt-1">Remove</button>
              </div>
            ))}
            {formData.testimonials.length < 3 && (
              <button type="button" onClick={addTestimonial} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Testimonial</button>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-10">
          <button onClick={() => navigate(`/ngo-home/${id}/profile`)} className="px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors">Back</button>
          <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}
