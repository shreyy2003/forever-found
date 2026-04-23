import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import NGO from "../db/ngoModel";
import Child from "../db/childrenModel";
import AdoptionRequest from "../db/AdoptionRequestModel";
import crypto from "crypto";
import { sendVerificationEmail } from "../sendEmail";


export const registerNGO = async (req: Request, res: Response) => {
  try {
    const {
      name,
      location,
      city,
      state,
      yearOfEstablishment,
      website,
      contact,
      alternateContact,
      contactPersonName,
      contactPersonDesignation,
      email,
      registrationNumber,
      caraRegistrationNumber,
      about,
      pass,
      numberOfChildren,
      testimonials,
      socialId,
    } = req.body;

    const existing = await NGO.findOne({
      $or: [{ email }, { registrationNumber }, { caraRegistrationNumber }],
    });

    if (existing) {
      return res.status(400).json({
        message: "NGO already registered with provided details",
      });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const logo = files?.logo?.[0]?.path;
    const registrationCert = files?.registrationCert?.[0]?.path;
    const caraCert = files?.caraCert?.[0]?.path;

    if (!logo || !registrationCert || !caraCert) {
      return res.status(400).json({
        message:
          "Logo, Registration Certificate & CARA Certificate are required",
      });
    }

    const gallery = [
      { type: "registration", url: registrationCert },
      { type: "cara", url: caraCert },
    ];

    if (files?.gallery) {
      files.gallery.slice(0, 3).forEach((file) => {
        gallery.push({ type: "gallery", url: file.path });
      });
    }

    let parsedTestimonials = [];
    if (testimonials) {
      try {
        parsedTestimonials = JSON.parse(testimonials);
      } catch {
        return res.status(400).json({
          message: "Invalid testimonials format",
        });
      }
    }

    // ✅ Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    const ngo = await NGO.create({
      name,
      location,
      city,
      state,
      yearOfEstablishment: yearOfEstablishment
        ? Number(yearOfEstablishment)
        : undefined,
      numberOfChildren: numberOfChildren
        ? Number(numberOfChildren)
        : 0,
      website,
      contact,
      alternateContact,
      contactPersonName,
      contactPersonDesignation,
      email,
      registrationNumber,
      caraRegistrationNumber,
      about,
      logo,
      gallery,
      testimonials: parsedTestimonials,
      socialId,
      password: hashedPassword,
      status: "pending",
      rejectionReason: null,
      canEdit: true,

      // Email verification fields
      emailVerified: false,
      emailVerificationToken,
      emailVerificationExpires: Date.now() + 2 * 60 * 60 * 1000,
    });

    // Send verification email
    await sendVerificationEmail(
      email,
      emailVerificationToken,
      "ngos",
      ngo._id.toString()
    );

    return res.status(201).json({
      message: "NGO registration successful. Await admin approval.",
      ngoId: ngo._id,
    });
  } catch (error) {
    console.error("REGISTER NGO ERROR:", error);
    return res.status(500).json({
      message: "NGO registration failed",
    });
  }
};

// verifying email
export const verifyNGOEmail = async (req: Request, res: Response) => {
  try {
    const ngo = await NGO.findOne({
      emailVerificationToken: req.params.token,
    });

    // If token not found (already used OR invalid)
    if (!ngo) {
      return res.json({
        message: "Email already verified or invalid token",
      });
    }

    // If already verified
    if (ngo.emailVerified) {
      return res.json({ message: "Email already verified" });
    }

    // If token expired
    if (
      !ngo.emailVerificationExpires ||
      ngo.emailVerificationExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Token expired" });
    }

    // Mark as verified
    ngo.emailVerified = true;
    ngo.emailVerificationToken = null;
    ngo.emailVerificationExpires = null;

    await ngo.save();

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Verification failed" });
  }
};




// --- Login NGO by email ---
export const loginNGO = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log("NGO login attempt for email:", email);

  try {
    const ngo = await NGO.findOne({ email });
    console.log("NGO found:", ngo);

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    // Send minimal info to frontend
    res.json({
      id: ngo._id,
      name: ngo.name,
      email: ngo.email,
    });
  } catch (err) {
    console.error("Error logging in NGO:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all NGOs (for cards page)
export const getAllNGOs = async (req: Request, res: Response) => {
  try {
    const ngos = await NGO.find({}, "name location logo city state");
    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch NGOs" });
  }
};

//single ngo details
export const getNGODetails = async (req: Request, res: Response) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    res.json({
      id: ngo._id,
      name: ngo.name,
      location: ngo.location,
      city: ngo.city,
      state: ngo.state,
      logo: ngo.logo,

      yearOfEstablishment: ngo.yearOfEstablishment,
      website: ngo.website,

      contact: ngo.contact,
      alternateContact: ngo.alternateContact,

      contactPersonName: ngo.contactPersonName,
      contactPersonDesignation: ngo.contactPersonDesignation,

      email: ngo.email,

      registrationNumber: ngo.registrationNumber,
      caraRegistrationNumber: ngo.caraRegistrationNumber,

      about: ngo.about,
      numberOfChildren: ngo.numberOfChildren,

      gallery: ngo.gallery?.map((item: any) =>
        typeof item === "string"
        ? { type: "gallery", url: item }
        : item
      ),

      testimonials: ngo.testimonials,
      emailVerified: ngo.emailVerified,
      status: ngo.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch NGO details" });
  }
};


// Validate NGO ID
export const validateNgoId = async (req: Request, res: Response) => {
  try {
    const { ngoId } = req.body;

    // Step 1: Check if ID format is valid (MongoDB ObjectId is 24 hex chars)
    if (!ngoId || !ngoId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid NGO ID format" });
    }

    // Step 2: Check if NGO exists in DB
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ error: "NGO ID does not exist" });
    }

    // Step 3: If both checks pass, ID is valid
    return res.status(200).json({ message: "NGO ID is valid" });
  } catch (error) {
    console.error("Error validating NGO ID:", error);
    res.status(500).json({ error: "Server error while validating NGO ID" });
  }
};

//update profile of ngo
export const updateNGODetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ngo = await NGO.findById(id);

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

      const {
        about,
        website,
        contact,
        alternateContact,
        testimonials,
        city,
        state,
        location,
        numberOfChildren,
        contactPersonName,
        contactPersonDesignation,
        existingGallery,
      } = req.body;

      // ---------- TEXT ----------
      ngo.about = about ?? ngo.about;
      ngo.website = website ?? ngo.website;
      ngo.contact = contact ?? ngo.contact;
      ngo.alternateContact = alternateContact ?? ngo.alternateContact;
      ngo.city = city ?? ngo.city;
      ngo.state = state ?? ngo.state;
      ngo.location = location ?? ngo.location;
      ngo.numberOfChildren = numberOfChildren ?? ngo.numberOfChildren;
      ngo.contactPersonName =contactPersonName ?? ngo.contactPersonName;
      ngo.contactPersonDesignation =contactPersonDesignation ?? ngo.contactPersonDesignation;

      if (testimonials) {
        ngo.testimonials = JSON.parse(testimonials);
      }

      // ---------- GALLERY ----------

      // 1️⃣ Preserve non-gallery images (registration + cara)
      const nonGalleryImages = ngo.gallery.filter(
        (img: any) => img.type !== "gallery"
      );

      // 2️⃣ Parse existing gallery URLs (these are strings from frontend)
      let parsedExistingGallery: string[] = [];

      if (existingGallery) {
        parsedExistingGallery = JSON.parse(existingGallery);
      }

      // Convert string URLs → object format
      const existingGalleryObjects = parsedExistingGallery.map((url: string) => ({
        type: "gallery" as const,
        url,
      }));

      // 3️⃣ Add new uploaded images
      const newGalleryObjects =
        req.files && Array.isArray(req.files)
          ? (req.files as Express.Multer.File[]).map((file) => ({
              type: "gallery" as const,
              url: file.path,
            }))
          : [];

      // 4️⃣ Combine + enforce max 3 gallery images
      const finalGalleryImages = [
        ...existingGalleryObjects,
        ...newGalleryObjects,
      ].slice(0, 3);

      // 5️⃣ Final gallery = preserved docs + updated gallery images
      ngo.set("gallery", [...nonGalleryImages, ...finalGalleryImages]);

      // ---------- EDIT REQUEST FLAG ----------
      if (ngo.status === "approved") {
        ngo.hasEditRequest = true;
        ngo.editRequestedAt = new Date();
      }
      await ngo.save();
      res.json(ngo);
    } catch (error) {
      console.error("Error updating NGO:", error);
      res.status(500).json({ message: "Failed to update NGO" });
    }
};

//adoption request for a child
export const submitAdoptionRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const { childId, adopterType, adopterId, externalAdopter } = req.body;

    if (!childId || !adopterType) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const child = await Child.findById(childId);

    if (!child) {
      return res.status(404).json({
        message: "Child not found",
      });
    }

    // Prevent duplicate request
    const existingRequest = await AdoptionRequest.findOne({
      childId,
      status: "Pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Adoption request already exists",
      });
    }

    if (adopterType === "Platform" && !adopterId) {
      return res.status(400).json({
        message: "Platform adopter required",
      });
    }

    let parsedExternalAdopter;

    if (adopterType === "External") {
      try {
        parsedExternalAdopter = JSON.parse(externalAdopter);
      } catch {
        return res.status(400).json({
          message: "Invalid external adopter data",
        });
      }
    }

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const adoptionCertificate =
      files?.adoptionCertificate?.[0]?.path;
    const updatedBirthCertificate =
      files?.updatedBirthCertificate?.[0]?.path;
    const followUpUndertaking =
      files?.followUpUndertaking?.[0]?.path;

    if (
      !adoptionCertificate ||
      !updatedBirthCertificate ||
      !followUpUndertaking
    ) {
      return res.status(400).json({
        message: "All legal documents required",
      });
    }

    const request = await AdoptionRequest.create({
      childId,
      ngoId: child.ngoId,
      adopterType,
      adopterId:
        adopterType === "Platform" ? adopterId : null,
      externalAdopter:
        adopterType === "External"
          ? parsedExternalAdopter
          : undefined,
      proofDocuments: {
        adoptionCertificate,
        updatedBirthCertificate,
        followUpUndertaking,
      },
      status: "Pending",
    });

    child.adoptionStatus = "Adoption Requested";
    await child.save();

    res.status(201).json({
      message: "Adoption request submitted",
      request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to submit adoption request",
    });
  }
};

// GET NGO adoption requests
export const getNGOAdoptionRequests = async (
  req: Request,
  res: Response
) => {
  try {
    const { ngoId } = req.params;

    const requests = await AdoptionRequest.find({ ngoId })

      // Child info needed for display card
      .populate("childId", "name age gender")

      // Platform adopter info
      .populate("adopterId", "fullName email contact")

      // newest first
      .sort({ createdAt: -1 });

    res.status(200).json(requests);

  } catch (error) {
    console.error("Fetch adoption requests error:", error);

    res.status(500).json({
      message: "Failed to fetch requests",
    });
  }
};

//each adoption details
export const getAdoptionRequestById = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const request = await AdoptionRequest.findById(requestId)
      .populate("childId", "name age gender")
      .populate("adopterId", "fullName email contactNumber");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({
      _id: request._id,
      status: request.status,
      adopterType: request.adopterType,
      createdAt: request.createdAt,

      childId: request.childId,
      adopterId: request.adopterId,
      externalAdopter: request.externalAdopter,

      proofDocuments: request.proofDocuments,

      adminRemarks: request.adminRemarks,
      verifiedAt: request.verifiedAt,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch request" });
  }
};