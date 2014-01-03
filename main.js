var server = require("webserver").create();
var url = "http://cis-mac-mini.local/";
var port = 3000;

console.log("Server started at http://127.0.0.1:" + port + "/");

server.listen(port, function(request, response) {
  var page = new WebPage();

  page.open(url, function(status) {
    function getJobs(callback) {
      var result = page.evaluate(function(s) {
        var data = [];
        var matches = document.querySelectorAll(".xc-paginating-bot-list-view-item.row");
        var match;
        var status;

        for (var i = 0; i < matches.length; i++) {
          match = matches[i];
          status = match.querySelector(".cell.status span");

          data.push({
            "name": match.querySelector(".cell.name a").innerHTML,
            "status": status.dataset.status,
            "subStatus": status.dataset.subStatus
          });
        }

        return data;
      });

      if (result.length) {
        callback(result);
      } else {
        setTimeout(function() {
          getJobs(callback);
        }, 200);
      }
    }

    getJobs(function(jobs) {
      var result = JSON.stringify(jobs);
      var callback = request.url.match(/jsonp=([^&]+)/);

      if (callback) {
        result = callback[1] + "(" + result + ")";
      }

      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json");
      response.write(result);
      response.close();

      page.close();
    });
  });
});
