import SubscriptionPlan from "../models/SubscriptionPlan.js";

export const getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({}).sort({ price: 1 });
    res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ message: "Server error fetching plans" });
  }
};


export const createPlan = async (req, res) => {
  try {
    const { title, price, subtitle, features, recommended } = req.body;

    const newPlan = new SubscriptionPlan({
      title,
      price,
      subtitle,
      features,
      recommended,
    });

    const createdPlan = await newPlan.save();
    res.status(201).json(createdPlan);
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ message: "Server error creating plan" });
  }
};


export const updatePlan = async (req, res) => {
  try {
    const { title, price, subtitle, features, recommended } = req.body;

    const plan = await SubscriptionPlan.findById(req.params.id);

    if (plan) {
      plan.title = title || plan.title;
      plan.price = price !== undefined ? price : plan.price;
      plan.subtitle = subtitle || plan.subtitle;
      plan.features = features || plan.features;
      plan.recommended = recommended !== undefined ? recommended : plan.recommended;

      const updatedPlan = await plan.save();
      res.status(200).json(updatedPlan);
    } else {
      res.status(404).json({ message: "Plan not found" });
    }
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ message: "Server error updating plan" });
  }
};


export const deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (plan) {
      await SubscriptionPlan.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "Plan removed" });
    } else {
      res.status(404).json({ message: "Plan not found" });
    }
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({ message: "Server error deleting plan" });
  }
};
