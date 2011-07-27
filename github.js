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
          function updateUser(ghUser) {
            console.log("Trying to update github user " + ghUser.login);
            db.json.first(
              { github_login: ghUser.login },
              function userAlreadyInDb(err,response) {
                if(err) {
                  console.log(err); 
                  return;
                }
                var updatedUser = response.results && response.results[0],
                    uri;
                if(updatedUser) {
                  console.log("Found " + ghUser.login);
                  uri = updatedUser.uri;
                  updatedUser = updatedUser.content;
                }
                else {
                  console.log(ghUser.login + " is a new user");
                  updatedUser = {};
                  updatedUser.github_login = ghUser.login;
                  uri = "github/" + ghUser.login;
                }
                updatedUser.github =  ghUser;
                db.json.insert(uri, updatedUser, 
                  {collection: "github"},
                  function updateCb(e) {
                    if(e) {
                      console.log("Couldn't update " + ghUser.login);
                      return;
                    }
                    else {
                       console.log(ghUser.login + " updated");
                       return;
                    }
                  }
                )
              }
            );
        });
  })
}

fetchGitHubOrganization();