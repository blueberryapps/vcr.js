
module.exports = (req, res, next) => {
  const { arr } = req.body;
  res.status(200).json({ arrLength: arr.length });
}
