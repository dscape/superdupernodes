var request = require("request")
  , _       = require("underscore")
  , exec    = require('child_process').exec
  , nuvem   = require("nuvem")
  , cfg     = require("../cfg/marklogic")
  , db      = nuvem(cfg);

function jsonInsert(uri, updatedUser) {
  db.json.insert(uri, updatedUser,
    {collection: "github"},
    function updateCb(e) {
      if(e) {
        console.log("Couldn't update " + uri);
        return;
      }
      else {
         console.log(uri + " updated");
         return;
      }
  });
}

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
                exec(("node " + __dirname + "/../utils/github/top-repos.js " + ghUser.login), 
                  function topReposCb(e, stdout, stderr) {
                    if(e) {
                      console.log("Fetching top repos failed for " + ghUser.login);
                      jsonInsert(uri, updatedUser);
                    }
                    try {
                      var github_repos = JSON.parse(stdout);
                      updatedUser.github_repos = github_repos;
                      jsonInsert(uri, updatedUser);
                    }
                    catch (exc) {
                      console.log("Fetching top repos for " + ghUser.login + " yielded invalid json");
                      jsonInsert(uri, updatedUser);
                    }
                  }
                )
              });
        });
  });
}

fetchGitHubOrganization();