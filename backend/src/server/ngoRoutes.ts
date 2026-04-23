import express from "express";
import cloudUpload from "../cloudUpload";
import { registerNGO,verifyNGOEmail } from "./ngoController";
import { getAllNGOs, getNGODetails, validateNgoId, loginNGO,updateNGODetails } from "./ngoController";
import { submitAdoptionRequest, getNGOAdoptionRequests, getAdoptionRequestById } from "./ngoController";

const router = express.Router();

//signup
router.post(
  "/signup",
  cloudUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "registrationCert", maxCount: 1 },
    { name: "caraCert", maxCount: 1 },
    { name: "gallery", maxCount: 3 },
  ]),
  registerNGO
);

// EMAIL VERIFICATION
router.get("/verify-email/:token", verifyNGOEmail);

// Fetch all NGOs for cards page
router.get("/", getAllNGOs);

// Fetch full details for a single NGO
router.get("/:id", getNGODetails);

// Validate NGO ID during child insertion
router.post("/validate-ngo", validateNgoId);

//fetch adoption requests
router.get("/adoption-request/:ngoId", getNGOAdoptionRequests );

//fetch adoption details of each 
router.get("/adoption-request-details/:requestId", getAdoptionRequestById);

//adoption request upload
router.post(
  "/adoption-request/create",
  cloudUpload.fields([
    { name: "adoptionCertificate", maxCount: 1 },
    { name: "updatedBirthCertificate", maxCount: 1 },
    { name: "followUpUndertaking", maxCount: 1 },
  ]),
  submitAdoptionRequest
);

// --- NGO login route ---
router.post("/login", loginNGO);

router.put("/:id",cloudUpload.array("newGallery", 3), updateNGODetails);

export default router;
