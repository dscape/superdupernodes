// npm install request && npm install underscore
var request = require("request")
  , _       = require("underscore")
  , nuvem   = require("nuvem")
  , cfg     = require("./cfg/marklogic");

var db    = nuvem(cfg);

function fetchGitHubOrganization() {
  request.get(
    "http://github.com/api/v2/json/organizations/marklogic/public_members",
    function (err, response, body) {
      if(err) {
        console.log(err); 
        return;
      }
      var members = _(JSON.parse(body).users)
        .chain()
        .select(
          function hasMoreThanOneFollower(user) {
            return (user.followers_count > "1");
          }
        ).each(
          function updateUser(user) {
            console.log("Trying to update github user " + user.login);
            db.json.find.first(
              { github_login: user.login },
              function userAlreadyInDb(err,response) {
                if(err) {
                  console.log(err); 
                  return;
                }
                var userFromDb = response.results[0];
                console.log(userFromDb);
              }
            );
        });
  })
}

fetchGitHubOrganization();