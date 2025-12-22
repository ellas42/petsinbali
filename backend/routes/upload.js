const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { auth } = require('../middleware/auth');
const Animal = require('../models/listing');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

// Upload endpoint
router.post('/', auth, upload.array('photos', 5), async (req, res) => {
  // Kita tampung public_id gambar buat jaga-jaga kalau perlu dihapus
  let uploadedPublicIds = []; 

  try {
    // 1. Upload ke Cloudinary
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: 'bali-adoption',
            // Cloudinary butuh public_id buat hapus, jadi kita return full result
          }, 
          (error, result) => {
            if (error) reject(error);
            else resolve(result); // Resolve FULL RESULT, bukan cuma URL
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);
    
    uploadedPublicIds = uploadResults.map(r => r.public_id);
    const imageUrls = uploadResults.map(r => r.secure_url);

    const newAnimal = new Animal({
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      location: req.body.location,
      photos: imageUrls,
      user: req.user.id
    });

    await newAnimal.save();
    
    res.status(201).json(newAnimal);

  } catch (error) {
    console.error("Error terjadi, melakukan rollback...", error);

    if (uploadedPublicIds.length > 0) {
      const deletePromises = uploadedPublicIds.map(id => 
        cloudinary.uploader.destroy(id)
      );
      await Promise.all(deletePromises);
      console.log("Rollback: Gambar berhasil dihapus dari Cloudinary");
    }

    res.status(500).json({ error: 'Gagal membuat listing, gambar dibatalkan.' });
  }
});

module.exports = router;