import { Request, Response } from "express";
import Child from "../db/childrenModel";
import Meeting from "../db/meetingsModel";

// ---------------- MATCH CHILDREN ----------------
const ageGroups: Record<string, [number, number]> = {
  "2-4": [2, 4],
  "5-8": [5, 8],
  "9-11": [9, 11],
  "12-18": [12, 18],
};

export const findChildrenMatches = async (req: Request, res: Response) => {
  try {
    const { ngoId, gender, ageGroup } = req.body;

    if (!ngoId) {
      return res.status(400).json({ message: "NGO ID is required" });
    }

    const query: any = {
      ngoId,
      adoptionStatus: "Available",
      canEdit: true,
    };

    if (gender && gender !== "Any") query.gender = gender;
    if (ageGroup && ageGroup !== "Any") {
      const [minAge, maxAge] = ageGroups[ageGroup] || [0, 100];
      query.age = { $gte: minAge, $lte: maxAge };
    }

    const children = await Child.find(query);
    res.json(children);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- CHILD DETAILS ----------------
export const getChildWithEffectiveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const child = await Child.findById(id);
    if (!child) return res.status(404).json({ message: "Child not found" });

    const meetings = await Meeting.find({
      childIds: child._id,
      status: { $in: ["pending", "accepted", "fixed"] },
    });

    let effectiveStatus: string | null = null;
    if (meetings.some(m => m.status === "fixed")) effectiveStatus = "fixed";
    else if (meetings.some(m => m.status === "accepted")) effectiveStatus = "accepted";
    else if (meetings.some(m => m.status === "pending")) effectiveStatus = "pending";
    else if (child.adoptionStatus === "Available") effectiveStatus = "available";

    res.json({ child, effectiveStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- CREATE CHILD ----------------
export const createChild = async (req: Request, res: Response) => {
  try {
    const {
      ngoId,
      name,
      age,
      gender,
      dateOfBirth,
      healthStatus,
      educationLevel,
    } = req.body;

    if (!ngoId || !name || !age || !gender) {
      return res.status(400).json({
        message: "NGO ID, name, age, and gender are required",
      });
    }

    // Cloudinary URLs
    const gallery =
      req.files && Array.isArray(req.files)
        ? (req.files as Express.Multer.File[]).map(file => file.path)
        : [];

    const newChild = new Child({
      ngoId,
      name,
      age: Number(age),
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      healthStatus,
      educationLevel,
      gallery,
      adoptionStatus: "Available",
      adopterId: null,
    });

    await newChild.save();

    res.status(201).json({
      message: "Child created successfully",
      child: newChild,
    });
  } catch (error) {
    console.error("Error creating child:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- VIEW CHILDREN BY NGO ----------------
export const getChildrenByNgo = async (req: Request, res: Response) => {
  try {
    const { ngoId } = req.params;
    if (!ngoId) {
      return res.status(400).json({ message: "NGO ID is required" });
    }

    const children = await Child.find({ ngoId }).select("-adopterId");
    res.json(children);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//get single child details who are adopted
export const getChildById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const child = await Child.findById(id)
      .populate("adopterId");

    if (!child)
      return res.status(404).json({ message: "Child not found" });

    res.json(child);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- UPDATE CHILD ----------------
export const updateChild = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const child = await Child.findById(id);

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    const { age, healthStatus, educationLevel } = req.body;

    if (age !== undefined) child.age = Number(age);
    if (healthStatus !== undefined) child.healthStatus = healthStatus;
    if (educationLevel !== undefined)
      child.educationLevel = educationLevel;

    // (Edit request notification)
    child.hasEditRequest = true;
    child.editRequestedAt = new Date();

    // Append ONLY new medical certificates
    if (req.files && Array.isArray(req.files)) {
      const newImages = (req.files as Express.Multer.File[]).map(
        (file) => file.path
      );

      child.gallery.push(...newImages);
    }

    await child.save();

    res.json({
      message: "Child updated successfully",
      child,
    });
  } catch (error) {
    console.error("Error updating child:", error);
    res.status(500).json({ message: "Server error" });
  }
};