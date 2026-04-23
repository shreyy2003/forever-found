function AdopterTypeSelector({ adopterType, setAdopterType }) {

  return (
    <div className="bg-slate-50 p-5 rounded-xl border mb-6">

      <p className="font-semibold mb-3">
        Choose Adopter Type
      </p>

      <label className="mr-8">
        <input
          type="radio"
          value="Platform"
          checked={adopterType === "Platform"}
          onChange={(e) => setAdopterType(e.target.value)}
        />
        <span className="ml-2">Platform Adopter</span>
      </label>

      <label>
        <input
          type="radio"
          value="External"
          checked={adopterType === "External"}
          onChange={(e) => setAdopterType(e.target.value)}
        />
        <span className="ml-2">External Adopter</span>
      </label>

    </div>
  );
}

export default AdopterTypeSelector;