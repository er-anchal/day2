import Pricing from "../models/Pricing.js";

export const getUserPricing = async (req, res) => {
  try {
    let pricingData = await Pricing.findOne({ userId: req.user._id }).sort({ createdAt: -1 });


    if (!pricingData) {
      console.log("Plan nahi found, creating free account");
      pricingData = await Pricing.create({
        userId: req.user._id,
        name: req.user.name,
        planName: "FREE",
        type: "free",
        imageCredits: { allocated: 100, used: 0 },
        videoCredits: { allocated: 5, used: 0 },
        isActive: 1
      });
    }


    res.status(200).json(pricingData);
  } catch (error) {
    console.error("Pricing Fetch Error:", error);
    res.status(500).json({ message: "Error fetching pricing data" });
  }
};