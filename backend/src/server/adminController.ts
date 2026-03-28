import { Request, Response } from "express";
import Admin from "../db/adminModel";
import NGO from "../db/ngoModel";
import Child from "../db/childrenModel";
import Adopter from "../db/adopterModel";
import Meeting from "../db/meetingsModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (admin.status !== "ACTIVE") {
      return res.status(403).json({ error: "Admin account is blocked" });
    }

    // compare hashed password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // update last login
    admin.lastLogin = new Date();
    await admin.save();

    // generate JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/* GET PENDING ADOPTERS (SUMMARY) */
export const getPendingAdopters = async (req: Request, res: Response) => {
  try {
    const adopters = await Adopter.find(
      { status: "pending" },
      "fullName gender occupation contactNumber createdAt updatedAt"
    ).sort({ createdAt: -1 });

    res.status(200).json(adopters);
  } catch {
    res.status(500).json({ message: "Failed to fetch pending adopters" });
  }
};

// GET: Count of pending adopters (approval badge)
export const getPendingAdopterCount = async (
  req: Request,
  res: Response
) => {
  try {
    const count = await Adopter.countDocuments({
      status: "pending",
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching pending adopter count:", error);
    res.status(500).json({
      message: "Failed to fetch pending adopter count",
    });
  }
};

//approve adopter
export const approveAdopter = async (req: Request, res: Response) => {
  try {
    const adopter = await Adopter.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!adopter) {
      return res.status(404).json({ message: "Adopter not found" });
    }

    res.status(200).json({ message: "Adopter approved successfully" });
  } catch {
    res.status(500).json({ message: "Failed to approve adopter" });
  }
};

//reject adopter
export const rejectAdopter = async (req: Request, res:Response) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const adopter = await Adopter.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!adopter) {
      return res.status(404).json({
        message: "Adopter not found",
      });
    }

    res.status(200).json({
      message: "Adopter rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting adopter:", error);
    res.status(500).json({
      message: "Failed to reject adopter",
    });
  }
};

/* GET PENDING NGOs (SUMMARY) */
export const getPendingNGOs = async (req: Request, res: Response) => {
  try {
    const ngos = await NGO.find(
      { status: "pending" },
      "name city contact numberOfChildren createdAt"
    ).sort({ createdAt: -1 });

    res.status(200).json(ngos);
  } catch (error) {
    console.error("Error fetching pending NGOs:", error);
    res.status(500).json({ message: "Failed to fetch pending NGOs" });
  }
};

// GET: Count of pending NGOs (approval badge)
export const getPendingNgoCount = async (
  req: Request,
  res: Response
) => {
  try {
    const count = await NGO.countDocuments({
      status: "pending",
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching pending NGO count:", error);
    res.status(500).json({
      message: "Failed to fetch pending NGO count",
    });
  }
};

// approve NGO
export const approveNgo = async (req: Request, res: Response) => {
  try {
    const ngo = await NGO.findByIdAndUpdate(
      req.params.id,
      { status: "approved", rejectionReason: null },
      { new: true }
    );

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    res.status(200).json({ message: "NGO approved successfully" });
  } catch {
    res.status(500).json({ message: "Failed to approve NGO" });
  }
};

// reject NGO
export const rejectNgo = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const ngo = await NGO.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    res.status(200).json({ message: "NGO rejected successfully" });
  } catch {
    res.status(500).json({ message: "Failed to reject NGO" });
  }
};



// Fetch approved + rejected NGOs
export const getApprovedNGOsForAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const ngos = await NGO.find({
      status: { $in: ["approved", "rejected"] }
    })
      .sort({
        hasEditRequest: -1,
        editRequestedAt: -1,
        createdAt: -1,
      })
      .select("name city numberOfChildren status canEdit hasEditRequest editRequestedAt")
      .lean();

    const formattedNGOs = ngos.map((ngo: any) => ({
      _id: ngo._id,
      name: ngo.name,
      city: ngo.city,
      numberOfChildren: ngo.numberOfChildren,
      status: ngo.status,
      canEdit: ngo.canEdit,
      hasEditRequest: ngo.hasEditRequest, 
    }));

    res.status(200).json({
      total: formattedNGOs.length,
      ngos: formattedNGOs,
    });
  } catch (error) {
    console.error("Error fetching NGOs for admin:", error);
    res.status(500).json({
      message: "Failed to fetch NGOs",
    });
  }
};


// GET: Count of NGO edit profile requests
export const getNgoEditRequestCount = async (
  req: Request,
  res: Response
) => {
  try {
    const count = await NGO.countDocuments({
      status: "approved",
      hasEditRequest: true,
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching NGO edit request count:", error);
    res.status(500).json({
      message: "Failed to fetch NGO edit request count",
    });
  }
};

// CLEAR NGO EDIT REQUEST
export const clearNgoEditRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const ngo = await NGO.findByIdAndUpdate(
      req.params.id,
      {
        hasEditRequest: false,
        editRequestedAt: null, // optional but recommended
      },
      { new: true }
    );

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    res.status(200).json({
      message: "NGO edit request cleared",
      ngo,
    });
  } catch (error) {
    console.error("Error clearing NGO edit request:", error);
    res.status(500).json({
      message: "Failed to clear NGO edit request",
    });
  }
};



// Get single NGO
export const getNGODetails = async (req: Request, res: Response) => {
  try {
    const ngo = await NGO.findById(req.params.id).select("-password");

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    res.status(200).json(ngo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch NGO" });
  }
};


// BLOCK NGO
export const blockNgo = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Blocking reason is required",
      });
    }

    const ngo = await NGO.findByIdAndUpdate(
      req.params.id,
      {
        isBlocked: true,
        canEdit: false,
        blockReason: reason,
        blockedAt: new Date(),
      },
      { new: true }
    );

    if (!ngo) {
      return res.status(404).json({
        message: "NGO not found",
      });
    }

    res.status(200).json({
      message: "NGO blocked successfully",
    });
  } catch (error) {
    console.error("Error blocking NGO:", error);
    res.status(500).json({
      message: "Failed to block NGO",
    });
  }
};



// UNBLOCK NGO
export const unblockNgo = async (req: Request, res: Response) => {
  try {
    const ngo = await NGO.findByIdAndUpdate(
      req.params.id,
      {
        isBlocked: false,
        canEdit: true,
        blockReason: null,
        blockedAt: null,
      },
      { new: true }
    );

    if (!ngo) {
      return res.status(404).json({
        message: "NGO not found",
      });
    }

    res.status(200).json({
      message: "NGO unblocked successfully",
    });
  } catch (error) {
    console.error("Error unblocking NGO:", error);
    res.status(500).json({
      message: "Failed to unblock NGO",
    });
  }
};

//ngo meeting
export const getMeetingsForNGO = async (req: Request, res: Response) => {
  try {
    const meetings = await Meeting.find({ ngoId: req.params.id })
      .populate("adopterId", "fullName email")
      .populate("childIds", "name")
      .sort({ updatedAt: -1 });

    res.status(200).json(meetings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
};

//adopted children for ngo
export const getAdoptedChildrenByNGO = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // NGO ID

    const children = await Child.find({
      adoptionStatus: "Adopted",
      ngoId: id,
    })
      .populate("adopterId", "fullName contactNumber")
      .populate("ngoId", "name");

    res.status(200).json(children);
  } catch {
    res.status(500).json({ message: "Failed to fetch adopted children" });
  }
};






/*GET: All children for admin*/
export const getAllChildrenForAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const children = await Child.find()
      .sort({ createdAt: -1 }) 
      .populate("ngoId", "name")
      .select(
        "name age gender adoptionStatus canEdit ngoId createdAt hasEditRequest editRequestedAt"
      )
      .lean();

    const formattedChildren = children.map((child: any) => ({
      _id: child._id,
      name: child.name,
      age: child.age,
      gender: child.gender,
      adoptionStatus: child.adoptionStatus,
      canEdit: child.canEdit,
      ngoName: child.ngoId?.name || "N/A",
      createdAt: child.createdAt,
      hasEditRequest: child.hasEditRequest,
      editRequestedAt: child.editRequestedAt,
    }));

    res.status(200).json({
      total: formattedChildren.length,
      children: formattedChildren,
    });
  } catch (error) {
    console.error("Error fetching children for admin:", error);
    res.status(500).json({
      message: "Failed to fetch children",
    });
  }
};

// GET: count of child edit requests
export const getChildEditRequestCount = async (
  req: Request,
  res: Response
) => {
  try {
    const count = await Child.countDocuments({
      hasEditRequest: true,
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching child edit count:", error);
    res.status(500).json({
      message: "Failed to fetch child edit count",
    });
  }
};

// GET: Single child details for admin
export const getChildDetailsForAdmin = async (req: Request, res: Response) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate("ngoId", "name email contact")
      .populate("adopterId", "fullName email")
      .lean();

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    res.status(200).json(child);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch child details" });
  }
};

//meetings for children
export const getMeetingsByChildForAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const meetings = await Meeting.find({
      childIds: req.params.id,
    })
      .populate("ngoId", "name")
      .populate("adopterId", "fullName")
      .sort({ updatedAt: -1 });

    res.status(200).json(meetings);
  } catch {
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
};

//block
export const blockChild = async (req: Request, res: Response) => {
  try {
    const { blockReason } = req.body;

    if (!blockReason) {
      return res.status(400).json({
        message: "Blocking reason is required",
      });
    }

    const child = await Child.findByIdAndUpdate(
      req.params.id,
      {
        canEdit: false,
        blockReason,
        blockedAt: new Date(),
      },
      { new: true }
    );

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    res.status(200).json(child); 
  } catch (error) {
    console.error("Error blocking child:", error);
    res.status(500).json({ message: "Failed to block child" });
  }
};

//unblock
export const unblockChild = async (req: Request, res: Response) => {
  try {
    const child = await Child.findByIdAndUpdate(
      req.params.id,
      {
        canEdit: true,
        blockReason: null,
        blockedAt: null,
      },
      { new: true }
    );

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    res.status(200).json(child); 
  } catch (error) {
    console.error("Error unblocking child:", error);
    res.status(500).json({ message: "Failed to unblock child" });
  }
};





/* GET ALL Approved and Rejected ADOPTERS */
export const getAllAdopters = async (req: Request, res: Response) => {
  try {
    const adopters = await Adopter.find(
      { status: { $in: ["approved", "rejected"] } },
      "fullName gender occupation contactNumber status hasEditRequest"
    )
      .sort({ hasEditRequest: -1, createdAt: -1 });

    res.status(200).json({
      count: adopters.length,
      adopters,
    });
  } catch (error) {
    console.error("Error fetching adopters:", error);
    res.status(500).json({
      message: "Failed to fetch adopters",
    });
  }
};


// GET: Count of adopter edit profile requests
export const getAdopterEditRequestCount = async (
  req: Request,
  res: Response
) => {
  try {
    const count = await Adopter.countDocuments({
      status: "approved",
      hasEditRequest: true,
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching adopter edit request count:", error);
    res.status(500).json({
      message: "Failed to fetch edit request count",
    });
  }
};

// CLEAR EDIT REQUEST
export const clearAdopterEditRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const adopter = await Adopter.findByIdAndUpdate(
      req.params.id,
      { hasEditRequest: false },
      { new: true }
    );

    if (!adopter) {
      return res.status(404).json({ message: "Adopter not found" });
    }

    res.status(200).json({
      message: "Edit request cleared",
      adopter,
    });

  } catch (error) {
    console.error("Error clearing edit request:", error);
    res.status(500).json({
      message: "Failed to clear edit request",
    });
  }
};


/* GET SINGLE ADOPTER DETAILS */
export const getAdopterDetails = async (req: Request, res: Response) => {
  try {
    const adopter = await Adopter.findById(req.params.id).select("-password");

    if (!adopter) {
      return res.status(404).json({ message: "Adopter not found" });
    }

    res.status(200).json(adopter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch adopter" });
  }
};

//adopter meetings
export const getAdopterMeetings = async (req: Request, res: Response) => {
  try {
    const meetings = await Meeting.find({
      adopterId: req.params.id,
    })
      .populate("ngoId", "name")
      .populate("childIds", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(meetings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
};

// BLOCK ADOPTER
export const blockAdopter = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Blocking reason is required",
      });
    }

    const adopter = await Adopter.findByIdAndUpdate(
      req.params.id,
      {
        isBlocked: true,
        blockReason: reason,
        blockedAt: new Date(),
      },
      { new: true }
    );

    if (!adopter) {
      return res.status(404).json({ message: "Adopter not found" });
    }

    res.status(200).json({
      message: "Adopter blocked successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to block adopter" });
  }
};


// UNBLOCK ADOPTER
export const unblockAdopter = async (req: Request, res: Response) => {
  try {
    const adopter = await Adopter.findByIdAndUpdate(
      req.params.id,
      {
        isBlocked: false,
        blockReason: null,
        blockedAt: null,
      },
      { new: true }
    );

    if (!adopter) {
      return res.status(404).json({ message: "Adopter not found" });
    }

    res.status(200).json(adopter);
  } catch (err) {
    res.status(500).json({ message: "Failed to unblock adopter" });
  }
};


//aadhar
export const getAdopterAadhaar = async (req: Request, res: Response) => {
  try {
    const adopter = await Adopter.findById(req.params.id).select(
      "aadharNumber aadharImage"
    );

    if (!adopter) {
      return res.status(404).json({ message: "Adopter not found" });
    }

    res.status(200).json({
      aadharNumber: adopter.aadharNumber,
      aadharImage: adopter.aadharImage,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Aadhaar details" });
  }
};

//adopted children
export const getAdoptedChildren = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const children = await Child.find({
      adoptionStatus: "Adopted",
      adopterId: id,
    })
      .populate("ngoId", "name")
      .populate("adopterId", "fullName email");

    res.status(200).json(children);
  } catch {
    res.status(500).json({ message: "Failed to fetch adopted children" });
  }
};