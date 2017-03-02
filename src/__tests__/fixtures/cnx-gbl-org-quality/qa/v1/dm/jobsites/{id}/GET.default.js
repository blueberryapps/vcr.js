module.exports = function (req, res, next) {
  if (req.params.id === 'returnError') {
    throw new Error('Something went wrong in fixture');
  }
  res.json({id: req.params.id});
}
