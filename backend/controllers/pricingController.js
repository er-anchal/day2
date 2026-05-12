import Pricing from "../models/Pricing.js";

export const getUserPricing = async (req, res) => {
  try {
    const pricingData = await Pricing.findOne({ userId: req.user.id, isActive: 1 });
    res.status(200).json(pricingData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pricing data" });
  }
};