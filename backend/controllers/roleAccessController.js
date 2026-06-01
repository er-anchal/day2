import RoleAccess from "../models/roleAccess.js";
export const createRoleAccess = async (req, res) => {
  try {
    const { userId, userName, roleName, moduleAccess } = req.body;

    const now = new Date();
    let roleAccess;

    if (roleName) {
      const existing = await RoleAccess.findOne({ roleName });
      if (existing) {
        existing.moduleAccess = moduleAccess;
        existing.modifiedAt = now;
        existing.modifiedOn = now.toLocaleString();
        roleAccess = await existing.save();
      } else {
        roleAccess = await RoleAccess.create({
          roleName,
          moduleAccess,
          createdBy: null,
          createdByName: "system",
          createdOn: now.toLocaleString(),
        });
      }
    } else {
      const existing = await RoleAccess.findOne({ userId });
      if (existing) {
        existing.userName = userName;
        existing.moduleAccess = moduleAccess;
        existing.modifiedAt = now;
        existing.modifiedOn = now.toLocaleString();
        roleAccess = await existing.save();
      } else {
        roleAccess = await RoleAccess.create({
          userId,
          userName,
          moduleAccess,
          createdBy: null,
          createdByName: "system",
          createdOn: now.toLocaleString(),
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Role access saved successfully",
      data: roleAccess,
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const getRoleAccessList = async (req, res) => {
  try {
    const data = await RoleAccess.find().populate("userId", "name email");
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getUserAccess = async (req, res) => {
  try {
    const data = await RoleAccess.findOne({ userId: req.params.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updateRoleAccess = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedBy = req.user._id;
    const updatedByName = req.user.name;

    const now = new Date();

    const updated = await RoleAccess.findByIdAndUpdate(
      id,
      {
        ...req.body,

        modifiedBy: updatedBy,
        modifiedByName: updatedByName,
        modifiedAt: now,
        modifiedOn: now.toLocaleString(),
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "Role access updated",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRoleAccessByRole = async (req, res) => {
  try {
    const data = await RoleAccess.findOne({ roleName: req.params.roleName });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
