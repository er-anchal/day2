import UserQuery from "../models/UserQuery.js";

export const submitQuery = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Please provide name, email, and message" });
    }

    const query = await UserQuery.create({
      name,
      email,
      phone,
      message
    });

    res.status(201).json({ success: true, data: query });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error submitting query" });
  }
};

export const getAllQueries = async (req, res) => {
  try {
    const queries = await UserQuery.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: queries.length, data: queries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error fetching queries" });
  }
};

export const updateQueryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Resolved"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    let query = await UserQuery.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found" });
    }

    query = await UserQuery.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: query });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error updating query" });
  }
};

export const deleteQuery = async (req, res) => {
  try {
    const query = await UserQuery.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found" });
    }

    await query.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error deleting query" });
  }
};
