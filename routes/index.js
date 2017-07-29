const {URLSearchParams} = require('url');
const {request} = require('https');
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
    const { code } = req.params;

    const atURL = 'https://oauth.vk.com/access_token/?';
    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        client_secret: process.env.CLIENT_SEECRET,
        code,

    });

    request({
        hostname: 'oauth.vk.com',
        protocol: 'https',
        method: 'GET',
        path: '/access_token/?' + params.toString()
    }, response => {

        let responseText = '';

        response.on('data', data => {
            responseText += data;
        });

        response.on('end', () => {
            try {
                const jsonData = JSON.parse(responseText);

                if (jsonData.access_token) {
                    req.session.access_token = jsonData.access_token;
                    req.session.expires_in = jsonData.expires_in;
                    req.session.user_id = jsonData.user_id;

                    res.redirect('auth', {id: req.session.user_id});
                }
            } catch (e) {
                res.render('error', e);
            }
        })
    });



    res.render('auth', {code});
});

module.exports = router;
