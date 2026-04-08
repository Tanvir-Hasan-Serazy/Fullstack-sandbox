const getUserDetails = async (req, res) => {
  res.json({
    success: true,
    message: "Protected route",
    user: req.user,
  });
};

export default { getUserDetails };
