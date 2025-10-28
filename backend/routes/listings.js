const express = require('express');
const Listing = require('../models/listing');
const { auth, isFinder } = require('../middleware/auth');
const { validateListing } = require('../utils/validation');


const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type, location, status = 'Available' } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location, 'i');
    if (status) filter.status = status;

    const listings = await Listing.find(filter)
      .populate('finder', 'name role location')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('finder', 'name role location phone email');

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create listing (Finder only)
router.post('/', auth, isFinder, async (req, res) => {
  try {
    const { error } = validateListing(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const {
      name,
      type,
      breed,
      age,
      gender,
      description,
      photos,
      location,
      healthStatus,
      vaccinated
    } = req.body;

    const listing = new Listing({
      finder: req.user._id,
      name,
      type,
      breed,
      age,
      gender,
      description,
      photos,
      location,
      healthStatus,
      vaccinated
    });

    await listing.save();
    await listing.populate('finder', 'name role location');

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update listing
router.put('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.finder.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      listing[key] = updates[key];
    });

    await listing.save();
    await listing.populate('finder', 'name role location');

    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete listing
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership or admin
    if (listing.finder.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;