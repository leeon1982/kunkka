'use strict';

var express = require('express');
var router = express.Router();
var remote = require('config')('remote');
var getQueryString = require('helpers/getQueryString.js');

var request = require('superagent');
var noBodyMethodList = ['get', 'head', 'delete'];

router.all('/*', function (req, res, next) {
  if (req.body) {
    if (req.body.forceDelete !== undefined) {
      return res.status(403).json({Error: 'Request is not allowwed!'});
    }
  }
  var region = req.headers.region;
  var service = req.path.split('/')[1];
  var target = remote[service][region] + '/' + req.path.split('/').slice(2).join('/');
  var method = req.method.toLowerCase();
  if (noBodyMethodList.indexOf(method) !== -1) {
    request[method](target + getQueryString(req.query))
      .set(req.headers)
      .set('X-Auth-Token', req.session.user.token)
      .end(function (err, payload) {
        if (err) {
          next(err);
        } else {
          res.status(200).json(payload.body);
        }
      });
  } else {
    request[method](target + getQueryString(req.query))
      .set(req.headers)
      .set('X-Auth-Token', req.session.user.token)
      .send(req.body)
      .end(function (err, payload) {
        if (err) {
          next(err);
        } else {
          res.status(200).json(payload.body);
        }
      });
  }
});

// var httpProxy = require('http-proxy');
// var proxy = httpProxy.createProxyServer({});

// var restreamer = function (prev, next, req, res) {
//   req.removeAllListeners('data');
//   req.removeAllListeners('end');
//   prev(req, res);
//   process.nextTick(function () {
//     if(req.body) {
//       req.emit('data', JSON.stringify(req.body));
//     }
//     req.emit('end');
//   });
// };

// var filter = function (req, res) {
//   if (req.body) {
//     if (req.body.forceDelete !== undefined) {
//       return res.status(403).json('Request is not allowwed!');
//     }
//   }
//   proxyEmit(req, res);
// };

// var proxyEmit = function(req, res) {
//   var region = req.headers.region;
//   var service = req.path.split('/')[1]; console.log(req.body);
//   proxy.web(req, res, {
//     target: remote[service][region]
//   });
// };

// proxy.on('proxyReq', function (proxyReq, req, res, options) {
//   proxyReq.setHeader('X-Auth-Token', req.session.user.token);
//   proxyReq.path = '/' + proxyReq.path.split('/').slice(2).join('/');
// });

// proxy.on('error', function (e) {
//   console.log(e);
// });

// router.all('/*', restreamer.bind(null, filter, proxyEmit));

module.exports = router;
