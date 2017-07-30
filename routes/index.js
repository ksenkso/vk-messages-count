const {URLSearchParams} = require('url');
const {request} = require('https');
const process = require('process');
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  if (req.session.access_token) {
      res.render('auth', { id: req.session.id });
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

    process.stdout.write('OAuth started\n');

    const { code } = req.query;

    process.stdout.write('Code: ' + code + '\n');

    const atURL = 'https://oauth.vk.com/access_token/?';
    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        client_secret: process.env.CLIENT_SECRET,
        code: code
    });

    process.stdout.write(atURL + params.toString() + '\n');

    const rq = request({
        port: 443,
        hostname: 'oauth.vk.com',
        method: 'GET',
        path: '/access_token/?' + params.toString()
    }, response => {

        process.stdout.write('Request started' + '\n');

        let responseText = '';

        response.on('data', data => {
            responseText += data;
        });

        response.on('end', () => {
            process.stdout.write('Request ended' + '\n');

            const jsonData = JSON.parse(responseText);
            process.stdout.write(responseText + '\n');

            if (jsonData.access_token) {
                process.stdout.write('Access token: ' + jsonData.access_token + '\n');
                req.session.access_token = jsonData.access_token;
                req.session.expires = (+new Date()) + parseInt(jsonData.expires_in) * 1000;
                req.session.user_id = jsonData.user_id;

                res.redirect('/');
            } else {
                process.stderr.write('No access token\n');
                req.session.error = 'No access token';
                res.redirect('error');
            }
        });
    });

    rq.on('connect', () => {
        process.stdout.write('[Request] started\n');
    });

    rq.on('error', err => {

        process.stderr.write('[Error] ' + err.toString() + '\n');
    });

    rq.end();

});

router.get('/error', (req, res, next) => {
    res.render('error', {error: req.session.error})
});

module.exports = router;
