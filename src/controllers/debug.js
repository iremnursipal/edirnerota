const { getAllUsers, getAllResetTokens } = require('../models/userModel');

const listUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json({ status: 'success', users });
  } catch (err) {
    next(err);
  }
};

const listResetTokens = async (req, res, next) => {
  try {
    const tokens = await getAllResetTokens();
    res.json({ status: 'success', tokens });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  listResetTokens,
};
