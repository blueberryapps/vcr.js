
module.exports = (req, res) => {
  const { parsed: { num } } = req.body;

  res.json({ num });
};
