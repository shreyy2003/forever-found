import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function NgoProfile() {
  const { id } = useParams(); // NGO id from URL
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNgo() {
      try {
        const res = await fetch(`http://localhost:5000/api/ngos/${id}`);
        if (!res.ok) throw new Error("Failed to fetch NGO details");
        const data = await res.json();
        setNgo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNgo();
  }, [id]);

  if (loading)
    return <p className="text-center mt-20 text-xl font-serif font-semibold text-gray-700">Loading...</p>;
  if (error)
    return (
      <p className="text-center mt-20 text-xl font-serif font-semibold text-red-500">{error}</p>
    );
  if (!ngo)
    return (
      <p className="text-center mt-20 text-xl font-serif font-semibold text-gray-700">No NGO data available.</p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-green-50 py-10 px-4 font-serif">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 border-b pb-8 mb-8">
          <div className="w-36 h-36 rounded-full overflow-hidden shadow-lg border">
            {ngo.logo ? (
              <img
                src={ngo.logo}
                alt="NGO Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-green-200 text-green-800 flex items-center justify-center text-5xl font-bold">
                {ngo.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0">
            <h2 className="text-3xl md:text-4xl font-bold capitalize text-green-900">{ngo.name}</h2>
            <p className="text-lg md:text-xl text-gray-600 mt-2">{ngo.email}</p>
            <p className="text-md text-gray-500">{ngo.location}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-gray-800 text-lg md:text-xl">
          <p><span className="font-semibold text-green-700">City:</span> {ngo.city}</p>
          <p><span className="font-semibold text-green-700">State:</span> {ngo.state}</p>
          <p><span className="font-semibold text-green-700">Website:</span> <a href={ngo.website} target="_blank" className="underline text-blue-600">{ngo.website}</a></p>
          <p><span className="font-semibold text-green-700">Contact:</span> {ngo.contact}</p>
          <p><span className="font-semibold text-green-700">Year Established:</span> {ngo.yearOfEstablishment}</p>
          <p><span className="font-semibold text-green-700">Alternate Contact:</span> {ngo.alternateContact || "N/A"}</p>
          <p><span className="font-semibold text-green-700">NGO Registration No:</span> {ngo.registrationNumber}</p>
          <p><span className="font-semibold text-green-700">CARA Registration No:</span> {ngo.caraRegistrationNumber}</p>
          <p><span className="font-semibold text-green-700">Contact Person:</span> {ngo.contactPersonName || "N/A"}</p>
          <p><span className="font-semibold text-green-700">Designation:</span> {ngo.contactPersonDesignation || "N/A"}</p>
          <p><span className="font-semibold text-green-700">Number of Children:</span> {ngo.numberOfChildren}</p>
          <p><span className="font-semibold text-green-700">Verified:</span> {ngo.verified ? "Yes ✅" : "No ❌"}</p>
          <p className="md:col-span-2"><span className="font-semibold text-green-700">About:</span> {ngo.about}</p>
        </div>

        {/* Gallery Images */}
        {ngo.gallery && ngo.gallery.filter(img => img.type === "gallery").length > 0 && (
          <div className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg">
            <h3 className="text-3xl font-bold mb-8 text-green-900 tracking-wide">
              NGO Gallery
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {ngo.gallery
                .filter(img => img.type === "gallery")
                .map((img, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-xl group"
                  >
                    <img
                      src={img.url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-64 object-contain shadow-md transform group-hover:scale-110 transition duration-500 ease-in-out"
                    />

                    {/* Soft overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-500"></div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {ngo.testimonials &&
          ngo.testimonials.filter(t => t.name || t.feedback).length > 0 && (
            <div className="mt-12 bg-green-50 p-8 rounded-xl">

              <h3 className="text-3xl font-semibold mb-8 text-green-900">
                Testimonials
              </h3>

              <div className="space-y-6">
                {ngo.testimonials
                  .filter(t => t.name || t.feedback)
                  .map((t, idx) => (
                    <div
                      key={idx}
                      className="w-full bg-white p-6 rounded-xl shadow-sm border"
                    >
                      {t.name && (
                        <p className="font-semibold text-lg text-green-900">
                          {t.name}
                        </p>
                      )}

                      {t.role && (
                        <p className="text-sm text-gray-500 mb-3">
                          {t.role}
                        </p>
                      )}

                      {t.feedback && (
                        <p className="text-gray-800 leading-relaxed">
                          "{t.feedback}"
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
        )}

        {/* Back & Edit Buttons */}
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={() => navigate(`/ngo-home/${id}`)}
            className="px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors"
          >
            Back To Home
          </button>
          <button
            onClick={() => navigate(`/ngo-home/${id}/profile/edit`)}
            className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
