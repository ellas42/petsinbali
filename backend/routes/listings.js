const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Listing = require("../models/listing");
const { auth, isFinder } = require("../middleware/auth");
const { validateListing } = require("../utils/validation");

const router = express.Router();

// set up mutler
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

// get routes
router.get("/", async (req, res) => {
  try {
    const { type, location, status = "Available" } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location, "i");
    if (status) filter.status = status;

    const listings = await Listing.find(filter)
      .populate("finder", "name role location")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get single listing
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "finder",
      "name role location phone email"
    );

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create listing (Finder only)
router.post(
  "/",
  auth,
  isFinder,
  upload.array("photos", 5),
  async (req, res) => {
    let uploadedPublicIds = [];

    try {
      let imageUrls = [];

      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "bali-adoption",
                transformation: [{ width: 800, height: 600, crop: "limit" }],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(file.buffer);
          });
        });

        const uploadResults = await Promise.all(uploadPromises);

        uploadedPublicIds = uploadResults.map((r) => r.public_id);
        imageUrls = uploadResults.map((r) => r.secure_url);
      }

      const listingData = {
        ...req.body,
        photos: imageUrls, 
        finder: req.user._id, 
      };

      const { error } = validateListing(listingData);
      if (error) {
        throw new Error(error.details[0].message);
      }

      const listing = new Listing(listingData);

      await listing.save();
      await listing.populate("finder", "name role location");

      res.status(201).json(listing);
    } catch (error) {
      console.error("Error Create Listing:", error);

      // rollback
      if (uploadedPublicIds.length > 0) {
        const deletePromises = uploadedPublicIds.map((id) =>
          cloudinary.uploader.destroy(id)
        );
        await Promise.all(deletePromises);
        console.log("Rollback: Gambar sampah berhasil dihapus.");
      }

      const errorMessage = error.message || "Server error";
      const statusCode = errorMessage.includes("is required") ? 400 : 500;

      res.status(statusCode).json({ error: errorMessage });
    }
  }
);

// Delete listing
router.delete("/:id", auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check ownership or admin
    if (
      listing.finder.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
