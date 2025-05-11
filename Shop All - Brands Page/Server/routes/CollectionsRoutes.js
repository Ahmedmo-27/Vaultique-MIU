const express = require("express");
const Collection = require("../models/Collections");
const router = express.Router();

// Collection name normalization mappings
const COLLECTION_MAPPINGS = {
  "classic & dress": "Classic & Dress",
  "casual & everyday": "Casual & Everyday",
  "sports & adventure": "Sports & Adventure",
  "aviation & travel": "Aviation & Travel",
  "luxury & heritage": "Luxury & Heritage",
  "classic": "Classic & Dress",
  "casual": "Casual & Everyday",
  "sports": "Sports & Adventure",
  "aviation": "Aviation & Travel",
  "luxury": "Luxury & Heritage"
};

const collectionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Collection name normalization function
function normalizeCollectionName(name) {
  if (!name) return null;
  
  // Convert to lowercase and trim
  let normalized = name.toLowerCase().trim();
  
  // Replace common variations
  normalized = normalized
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .replace(/[ö]/g, "o")
    .replace(/[.'']/g, "")
    .replace(/collection$/i, "")
    .trim();

  // Check mappings
  return COLLECTION_MAPPINGS[normalized] || normalized;
}

// Generate search variations for a collection name
function generateSearchVariations(name) {
  const variations = new Set([
    name,
    name.replace(/and/g, "&"),
    name.replace(/&/g, " and "),
    name.replace(/\s+/g, "-"),
    name.replace(/-/g, " "),
    name.replace(/collection$/i, "").trim(),
    name + " Collection"
  ]);

  // Add mapped variations
  Object.entries(COLLECTION_MAPPINGS).forEach(([key, value]) => {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      variations.add(value);
    }
  });

  return Array.from(variations);
}

// Get all collections
router.get("/", async (req, res) => {
  try {
    const collections = await Collection.find().sort({ name: 1 });
    res.json({ success: true, data: collections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single collection by ID
router.get("/:id", async (req, res) => {
  try {

    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }
    res.json({ success: true, data: collection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Enhanced collection by name endpoint
router.get("/name/:name", async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    // Input validation
    const rawName = decodeURIComponent(req.params.name);
    if (!rawName || typeof rawName !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid collection name provided",
        requestId
      });
    }

    // Check cache first
    const cacheKey = rawName.toLowerCase();
    const cachedResult = collectionCache.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_TTL) {
      console.log(`[${requestId}] Cache hit for collection: ${rawName}`);
      return res.json({
        success: true,
        data: cachedResult.data,
        source: 'cache',
        requestId
      });
    }

    // Normalize the collection name
    const normalizedCollectionName = normalizeCollectionName(rawName);
    console.log(`[${requestId}] Searching for collection: ${rawName} (normalized: ${normalizedCollectionName})`);

    // Generate search variations
    const searchVariations = generateSearchVariations(normalizedCollectionName);
    
    // Try exact match first
    let collection = await Collection.findOne({ name: normalizedCollectionName });

    // If not found, try case-insensitive regex match with variations
    if (!collection) {
      const searchQueries = searchVariations.map(variation => ({
        name: { $regex: new RegExp(`^${variation}$`, "i") }
      }));

      collection = await Collection.findOne({
        $or: searchQueries
      });
    }

    if (!collection) {
      console.log(`[${requestId}] Collection not found: ${normalizedCollectionName}`);
      return res.status(404).json({
        success: false,
        message: "Collection not found",
        attemptedName: normalizedCollectionName,
        variations: searchVariations,
        requestId
      });
    }

    // Cache the result
    collectionCache.set(cacheKey, {
      data: collection,
      timestamp: Date.now()
    });

    // Log success with timing
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Found collection: ${collection.name} (${duration}ms)`);

    // Return success response
    res.json({
      success: true,
      data: collection,
      source: 'database',
      requestId,
      timing: {
        duration,
        cached: false
      }
    });

  } catch (err) {
    // Enhanced error handling
    console.error(`[${requestId}] Error finding collection:`, err);
    
    const errorResponse = {
      success: false,
      message: "Server error",
      requestId,
      timing: {
        duration: Date.now() - startTime
      }
    };

    // Add error details in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        message: err.message,
        stack: err.stack
      };
    }

    res.status(500).json(errorResponse);
  }
});


module.exports = router;