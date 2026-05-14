import Faq from "../models/Faq.js";

export const getAllFaqs = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = { isActive: true };
    
    if (category && category !== "All") {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } }
      ];
    }

    const faqs = await Faq.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error fetching FAQs" });
  }
};
export const getAdminFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error fetching FAQs for admin" });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { title, category, shortDescription, answer, isFeatured, isActive, images, video, pdf } = req.body;
    
    if (!title || !category || !answer) {
      return res.status(400).json({ success: false, message: "Please provide title, category, and answer" });
    }

    const faq = await Faq.create({
      title,
      category,
      shortDescription,
      answer,
      isFeatured,
      isActive,
      images,
      video,
      pdf
    });

    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error creating FAQ" });
  }
};

export const updateFaq = async (req, res) => {
  try {
    let faq = await Faq.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error updating FAQ" });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    await faq.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error deleting FAQ" });
  }
};
