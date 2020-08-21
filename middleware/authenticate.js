module.exports = (req, res, next) => {
  if (!req.session || !req.session.user)
    return res.status(401).send({
      msg: 'You are not authorized to make this request',
    });
  next();
};
