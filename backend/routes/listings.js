const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Listing = require("../models/listing");
const { auth, isFinder } = require("../middleware/auth");
const { validateListing } = require("../utils/validation");

const router = express.Router();

// config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});


// GET All Listings
router.get("/", async (req, res) => {
  try {
    const { type, location, status = "Available" } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (status) filter.status = status;

    const listings = await Listing.find(filter)
      .populate("finder", "name role location")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(listings);
  } catch (error) {
    console.error("Error Get Listings:", error);
    res.status(500).json({ error: "Failed to fetch listings." });
  }
});

// GET Single Listing
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "finder",
      "name role location phone email"
    );

    if (!listing) return res.status(404).json({ error: "Listing not found." });

    res.json(listing);
  } catch (error) {
    console.error("Error Get Single Listing:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Create Listing (Finder)
router.post("/", auth, isFinder, upload.array("photos", 5), async (req, res) => {
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

      const results = await Promise.all(uploadPromises);
      
      imageUrls = results.map((r) => r.secure_url);
      uploadedPublicIds = results.map((r) => r.public_id); 
    }

    const listingData = {
      ...req.body,
      photos: imageUrls,
    };

    // validate user input
    const { error } = validateListing(listingData);
    if (error) {
      const err = new Error(error.details[0].message); 
      err.status = 400; 
      throw err;
    }
    listingData.finder = req.user._id;

    const newListing = new Listing(listingData);
    await newListing.save();

    res.status(201).json(newListing);

  } catch (error) {
    console.error("Failed to create listing:", error.message);

    // rollback
    if (uploadedPublicIds.length > 0) {
      console.log("Rolling back images...");
      uploadedPublicIds.forEach(publicId => {
        cloudinary.uploader.destroy(publicId);
      });
    }

    const status = error.status || 500;
    res.status(status).json({ error: error.message || "Internal Server Error." });
  }
});

// DELETE Listing
router.delete("/:id", auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ error: "Listing not found." });

    if (listing.finder.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: "You are not authorized to delete this listing." });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

module.exports = router;