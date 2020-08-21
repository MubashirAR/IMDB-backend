module.exports = (req, res, next) => {
  console.log(req.session, req.body)
  if (!req.session || !req.session.user)
    return res.status(401).send({
      msg: 'You are not authorized to make this request',
    });
  next();
};
