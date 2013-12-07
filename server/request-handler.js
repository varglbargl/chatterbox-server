/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var url = require("url");
var classes = {room1: []};

// var routeRequest = function(method) {
//   return Function.prototype.apply(null);
// };
var getPath = function(requestUrl) {
  var parsedURL = url.parse(requestUrl);
  // console.log('Pathname is', parsedURL.path);
  return parsedURL.path.split("/").slice(1);
};

exports.handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */
  var statusCode;
  var responseData;

  console.log("Serving request type " + request.method + " for url " + request.url);

  var path = getPath(request.url);

  if(path[0] !== 'classes') {
    statusCode = 404;
  } else {

    switch(request.method) {
      case 'GET':

        if(path[1] in classes) {
          responseData = classes[path[1]];
          statusCode = 200;
        } else {
          statusCode = 404;
        }
        break;

      case 'POST':
        if(path[0] !== 'classes'){
          statusCode = 404;
          break;
        }

        if(path[1] in classes) {
          // push to classes value
          classes[path[1]].push(request._postData);
        } else {
          // create key and create array and push
          classes[path[1]] = [request._postData];
        }
        statusCode = 201;
        break;

      default:
        statusCode = 404;
        break;
    }

  }


  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/plain";

  /* .writeHead() tells our server what HTTP status code to send back */
  response.writeHead(statusCode, headers);

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
  response.end(JSON.stringify(responseData));
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
