import express from "express";
import cloudUpload from "../cloudUpload";
import {
  findChildrenMatches,
  getChildWithEffectiveStatus,
  createChild,
  getChildrenByNgo,
  updateChild,
  getChildById
} from "./childrenController";

const router = express.Router();

// match children
router.post("/match", findChildrenMatches);

// view children by NGO
router.get("/ngo/:ngoId", getChildrenByNgo);

// view single child
router.get("/:id/details", getChildWithEffectiveStatus);

// create child → text + images
router.post("/create", cloudUpload.array("gallery"), createChild);

// update child → text + add images
router.put("/update/:id", cloudUpload.array("gallery"), updateChild);

// view single child who is adopted
router.get("/:id", getChildById);

export default router;
