const { Marketplace, Notification } = require('../model/Index');
const { suggestMarketplacePrice } = require('../services/aiService');

// POST /api/marketplace
exports.createListing = async (req, res, next) => {
  try {
    const { title, description, category, price, originalPrice, condition, tags } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/marketplace/${f.filename}`) : [];

    let aiPrice = null; // ✅ pehle declare karo
    try {
      aiPrice = await suggestMarketplacePrice(title, description, category, condition);
    } catch (aiErr) {
      console.log('AI failed:', aiErr.message);
    }

    const listing = await Marketplace.create({
      seller: req.user._id,
      title, description, category,
      price: +price, originalPrice: originalPrice ? +originalPrice : undefined,
      condition, images,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      aiSuggestedPrice: aiPrice?.suggestedPrice ?? null, // ✅ safe
    });

    res.status(201).json({ success: true, listing, aiPriceSuggestion: aiPrice ?? null });
  } catch (err) {
    console.log('Marketplace Error:', err.message);
    next(err);
  }
};

// GET /api/marketplace
exports.getListings = async (req, res, next) => {
  try {
    const { category, condition, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;
    const filter = { isAvailable: true, isSold: false };
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = +minPrice;
    if (maxPrice) filter.price.$lte = +maxPrice;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];

    const listings = await Marketplace.find(filter)
      .populate('seller', 'name roomNumber hostelBlock profilePhoto')
      .sort({ createdAt: -1 })
      .limit(+limit).skip((page - 1) * limit);

    const total = await Marketplace.countDocuments(filter);
    res.json({ success: true, listings, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/marketplace/:id
exports.getListingById = async (req, res, next) => {
  try {
    const listing = await Marketplace.findById(req.params.id)
      .populate('seller', 'name email roomNumber phone hostelBlock profilePhoto')
      .populate('interestedBuyers', 'name roomNumber');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });
    res.json({ success: true, listing });
  } catch (err) { next(err); }
};

// POST /api/marketplace/:id/interest — express interest
exports.expressInterest = async (req, res, next) => {
  try {
    const listing = await Marketplace.findById(req.params.id).populate('seller');
    if (!listing) return res.status(404).json({ success: false, message: 'Not found.' });
    if (listing.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Can't show interest in your own listing." });
    }
    if (!listing.interestedBuyers.includes(req.user._id)) {
      listing.interestedBuyers.push(req.user._id);
      await listing.save();

      await Notification.create({
        title: '🛒 Someone is interested!',
        message: `${req.user.name} is interested in your listing "${listing.title}".`,
        type: 'marketplace',
        recipients: [listing.seller._id],
        sender: req.user._id,
      });
    }
    res.json({ success: true, message: 'Interest expressed. Seller has been notified.' });
  } catch (err) { next(err); }
};

// PUT /api/marketplace/:id/sold
exports.markSold = async (req, res, next) => {
  try {
    const listing = await Marketplace.findOne({ _id: req.params.id, seller: req.user._id });
    if (!listing) return res.status(404).json({ success: false, message: 'Not found.' });
    listing.isSold = true;
    listing.isAvailable = false;
    await listing.save();
    res.json({ success: true, message: 'Marked as sold.' });
  } catch (err) { next(err); }
};

// DELETE /api/marketplace/:id
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Marketplace.findOne({
      _id: req.params.id,
      seller: req.user.role !== 'warden' ? req.user._id : undefined
    });
    if (!listing) return res.status(404).json({ success: false, message: 'Not found.' });
    await listing.deleteOne();
    res.json({ success: true, message: 'Listing deleted.' });
  } catch (err) { next(err); }
};

// GET /api/marketplace/my-listings
exports.getMyListings = async (req, res, next) => {
  try {
    const listings = await Marketplace.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (err) { next(err); }
};