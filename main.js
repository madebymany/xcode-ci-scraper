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

        for(var i = 0; i < matches.length; i++) {
          match = matches[i];

          data.push({
            "name": match.querySelector(".cell.name a").innerHTML,
            "status": match.querySelector(".cell.status span").dataset.status,
          });
        }

        return data;
      });

      if (result.length) {
        callback(result);
      } else {
        setTimeout(function() {
          getJobs(callback);
        }, 250);
      }
    }

    getJobs(function(jobs) {
      response.headers = {
        "Content-Type": "application/json"
      };

      response.statusCode = 200;
      response.write(JSON.stringify(jobs));
      response.close();

      page.close();
    });
  });
});
