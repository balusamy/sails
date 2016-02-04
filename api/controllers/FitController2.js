
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

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
  });
}

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

console.log(uri);
                 // Recreate request url
                 new_uri = [uri, query, querystring.stringify(params)].join('');
console.log(new_uri);

                 //The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
                 var options = {
                   host: 'jbg.fitrrati.com',
                   path: new_uri
                 };

                 http.request(options, callback).end();
	}
};


