import express from "express";
import { adminAuth } from "../securitymiddlewares/adminAuth";
import { loginAdmin,getApprovedNGOsForAdmin,getAllChildrenForAdmin,getAllAdopters } from "./adminController";
import { getPendingAdopters,approveAdopter,rejectAdopter,getPendingNGOs,approveNgo,rejectNgo } from "./adminController";
import { getAdopterDetails,getAdopterMeetings,blockAdopter,unblockAdopter,getAdopterAadhaar,getAdoptedChildren } from "./adminController";
import { getNGODetails,blockNgo,unblockNgo,getMeetingsForNGO,getAdoptedChildrenByNGO } from "./adminController";
import { getChildDetailsForAdmin,getMeetingsByChildForAdmin,blockChild,unblockChild, reviewChildEdit } from "./adminController";
import { getAdopterEditRequestCount,clearAdopterEditRequest } from "./adminController";
import { getPendingAdopterCount,getPendingNgoCount,getNgoEditRequestCount,clearNgoEditRequest,getChildEditRequestCount } from "./adminController";
import { getAllAdoptionRequests,getAdoptionRequestById, verifyAdoptionRequest, getAdoptionRequestCount } from "./adminController";
const router = express.Router();

router.post("/login", loginAdmin);

router.get("/adopters/pending/count",adminAuth,getPendingAdopterCount);
router.get("/pending-adopters",adminAuth, getPendingAdopters);
router.patch("/adopters/:id/approve",adminAuth, approveAdopter);
router.patch("/adopters/:id/reject",adminAuth, rejectAdopter);

router.get("/ngos/pending/count",adminAuth,getPendingNgoCount);
router.get("/pending-ngos",adminAuth, getPendingNGOs);
router.patch("/ngos/:id/approve",adminAuth, approveNgo);
router.patch("/ngos/:id/reject",adminAuth, rejectNgo);

router.get("/ngos/edit-requests/count",adminAuth,getNgoEditRequestCount);
router.get("/ngos",adminAuth, getApprovedNGOsForAdmin);
router.get("/ngos/:id",adminAuth, getNGODetails);
router.patch("/ngos/:id/clear-edit-request",adminAuth, clearNgoEditRequest);
router.patch("/ngos/:id/block",adminAuth, blockNgo);
router.patch("/ngos/:id/unblock",adminAuth, unblockNgo);
router.get("/ngos/:id/meetings",adminAuth, getMeetingsForNGO);
router.get("/ngos/:id/adopted-children",adminAuth, getAdoptedChildrenByNGO);

router.get("/children/edit-requests/count",adminAuth,getChildEditRequestCount);
router.get("/children",adminAuth, getAllChildrenForAdmin);
router.get("/children/:id",adminAuth, getChildDetailsForAdmin);
router.get("/children/:id/meetings",adminAuth, getMeetingsByChildForAdmin);
router.patch("/children/:id/block",adminAuth, blockChild);
router.patch("/children/:id/unblock",adminAuth, unblockChild);
router.patch("/children/:id/review-edit",adminAuth, reviewChildEdit);

router.get("/adopters/edit-requests/count",adminAuth, getAdopterEditRequestCount);
router.get("/adopters",adminAuth, getAllAdopters);
router.get("/adopters/:id",adminAuth, getAdopterDetails);
router.patch("/adopters/:id/clear-edit-request", adminAuth, clearAdopterEditRequest);
router.get("/adopters/:id/meetings",adminAuth, getAdopterMeetings);
router.patch("/adopters/:id/block",adminAuth, blockAdopter);
router.patch("/adopters/:id/unblock",adminAuth, unblockAdopter);
router.get("/adopters/:id/aadhaar",adminAuth, getAdopterAadhaar);
router.get("/adopters/:id/adopted-children",adminAuth, getAdoptedChildren);

router.get("/adoption-requests/count", adminAuth, getAdoptionRequestCount);
router.get("/adoption-requests",adminAuth, getAllAdoptionRequests);
router.get("/adoption-requests/:requestId", adminAuth, getAdoptionRequestById);
router.patch("/adoption-requests/:requestId/verify", adminAuth, verifyAdoptionRequest);

export default router;
