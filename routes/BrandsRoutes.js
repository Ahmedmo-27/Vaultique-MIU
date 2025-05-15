const express = require("express");
const Brand = require("../models/Brands");
const router = express.Router();

const normalizeBrandName = (name) => {
  const brandMappings = {
    "rolex": "Rolex",
    "omega": "Omega",
    "cartier": "Cartier",
    "patek-philippe": "Patek Philippe",
    "patek": "Patek Philippe",
    "audemars-piguet": "Audemars Piguet",
    "ap": "Audemars Piguet",
    "a-lange-sohne": "A.Lange & Söhne",
    "lange": "A.Lange & Söhne",
    "A.lange ": "A.Lange & Söhne",
    "vacheron-constantin": "Vacheron Constantin",
    "vc": "Vacheron Constantin",
    "jacob-co": "Jacob & Co",
    "Jacob ": "Jacob & Co",
    "richard-mille": "Richard Mille",
    "rm": "Richard Mille",
    "breitling": "Breitling"
  };

  const lowerName = name.toLowerCase();
  return brandMappings[lowerName] || name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    res.json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/name/:name", async (req, res) => {
  try {
    const rawName = decodeURIComponent(req.params.name);
    const normalizedBrandName = normalizeBrandName(rawName);
    console.log(`Searching for brand: ${rawName} (normalized: ${normalizedBrandName})`);

    let brand = await Brand.findOne({ name: normalizedBrandName });

    if (!brand) {
      brand = await Brand.findOne({
        name: { $regex: new RegExp(`^${normalizedBrandName}$`, "i") }
      });
    }

    if (!brand) {
      const variations = [
        normalizedBrandName.replace(/&/g, "and"),
        normalizedBrandName.replace(/&/g, " and "),
        normalizedBrandName.replace(/ and /g, "&"),
        normalizedBrandName.replace(/\band\b/g, "&"),
        normalizedBrandName.replace(/\s+/g, "-"),
        normalizedBrandName.replace(/-/g, " "),
        normalizedBrandName.replace(/ö/g, "o"),
        normalizedBrandName.replace(/\./g, ""),
        normalizedBrandName.replace(/'/g, ""),
        normalizedBrandName.replace(/ sohne/g, " & Söhne"),
        normalizedBrandName.replace(/Jacob /g, "Jacob & Co")
      ];

      for (const variation of variations) {
        brand = await Brand.findOne({
          name: { $regex: new RegExp(`^${variation}$`, "i") }
        });
        if (brand) break;
      }
    }

    if (!brand) {
      console.log(`Brand not found: ${normalizedBrandName}`);
      return res.status(404).json({ success: false, message: "Brand not found", attemptedName: normalizedBrandName });
    }

    console.log(`Found brand: ${brand.name}`);
    res.json({ success: true, data: brand });
  } catch (err) {
    console.error("Error finding brand:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
