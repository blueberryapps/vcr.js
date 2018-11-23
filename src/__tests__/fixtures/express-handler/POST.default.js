module.exports = (req, res) => {
  const {
    parsed: { num }
  } = req.body;
  console.log(
    "---------------------- handler: body: ",
    req.body,
    ", type: ",
    typeof req.body
  );
  res.json({ num });
};
