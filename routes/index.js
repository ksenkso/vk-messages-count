const {URLSearchParams} = require('url');
const process = require('process');
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  if (req.session.user) {
      res.render('index', { title: 'my test vk-oauth app!!!' });
  } else {
    const redirectURL = 'https://oauth.vk.com/authorize/?';
    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        display: 'page',
        response_type: 'code',
        v: '5.67',
    });

    const url = redirectURL + params.toString();

    res.redirect(url)
  }


});

router.get('/oauth', (req, res, next) => {
  res.render('auth');
});

module.exports = router;
