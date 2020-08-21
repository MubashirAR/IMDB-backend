var express = require('express');
var router = express.Router();
let auth = require('../lib/service/auth')

router.post('/login', async (req, res) => {
  try {
    const { email: username, password } = req.body;
    console.log(username, password)
    if (!username || !password) {
      return res.status(400).json({
        msg: `Please enter username and password!`,
      });
    }
    let user = await auth.login(username, password);
    req.session.user = user;
    req.session.save((err, data) => {
      res.send({
        msg: `Successfully logged in!`,
        user: req.session.user
      });
    });
  } catch (error) {
    console.log({ error });
    res.status(error.status || 400).json(error);
  }
});
module.exports = router;