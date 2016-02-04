
/**
 * FitController2
 *
 * @description :: Server-side logic for managing Fits
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var bodyParser   = require('body-parser');
var crypto = require('crypto');
var url = require("url");
var querystring = require('querystring');
var http = require('http');

module.exports = {
	index: function(req, res) {
		console.dir(req.url);
                query = req.url.indexOf('?') >= 0 ? '&' : '?';

		 parsed = url.parse(req.url, true);
		 var uid          = parsed.query['access_token'];
		 var retailer_id = parsed.query['rid'];

		 // Make the host name to tre.fitrrati.com (platform serving retailer integration calls)
		 req.headers.host = 'jbg.fitrrati.com';

		 var conf_secret_key = 'jabong'; // This is for testing only.  We will setup proper keys for retailers.

		 var host        = req.headers.host
		 var uri         = parsed.pathname;
		 var timestamp   = Number(new Date());

		 // All the requests, will have /trendinfit as prefix.  Strip the /trendinfit
		 req.url = req.url.replace("/jabongfit", "");
		 uri = uri.replace("/jabongfit", "");

		 // Create signature string
		 var sig_str = host + uri + retailer_id + uid + timestamp;
		 sig_str = sig_str.toString('base64')

		 // generate the signature.
		 sha1_sig = crypto.createHmac('sha1', conf_secret_key).update(sig_str).digest('hex')

		 // Additional params to the request.
		 params = {
				 sig: sha1_sig,
				 timestamp: timestamp
		 };

                 // Recreate request url
                 req.url = [req.url, query, querystring.stringify(params)].join('');

                 //The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
                 var options = {
                   host: 'jbg.fitrrati.com',
                   path: req.url,
                   headers: req.headers
                 };

                 var rq = http.request(options, function(rs) {
                             res.writeHead(rs.statusCode, rs.headers)
                             rs.on('data', function (chunk) {
                                 res.write(chunk);
                             });
                             rs.on('end', function () {
                                 res.end();
                             });
                          });

                 rq.on('socket', function (socket) {
                     socket.setTimeout(3000);  
                     socket.on('timeout', function() {
                         rq.abort();
                     });
                 });

                 rq.end();
	}
};


