var request = require("request")
  , _       = require("underscore")
  , exec    = require('child_process').exec
  , nuvem   = require("nuvem")
  , cfg     = require("../cfg/marklogic")
  , gh_cfg  = require("../cfg/github")
  , db      = nuvem(cfg);

function jsonInsert(uri, updatedUser) {
  db.json.insert(uri, updatedUser,
    {collection: [("/" + uri), "github", ("organization:" + gh_cfg.organization)]},
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
    "http://github.com/api/v2/json/organizations/" + gh_cfg.organization + "/public_members",
    function (err, response, body) {
      if(err) {
        console.log(err); 
        return;
      }
      var members = _(JSON.parse(body).users)
        .chain()
        .select(
          function hasMoreThanXFollowers(user) {
            return (user.followers_count >= gh_cfg.min_followers);
          }
        ).each(
          function updateUser(ghUser) {
            console.log("Processing github user " + ghUser.login);
            db.json.first(
              ghUser.login  + " -excludefromsearch",
              function userAlreadyInDb(err,updatedUser) {
                if(err) {
                  console.log(err); 
                  return;
                }
                var uri;
                if(updatedUser) {
                  console.log("Found " + ghUser.login);
                  uri = updatedUser.uri;
                  updatedUser = updatedUser.content;
                }
                else {
                  console.log(ghUser.login + " is a new user");
                  updatedUser = {};
                  updatedUser.github_login = ghUser.login;
                  updatedUser.gravatar_id = 
                    updatedUser.gravatar_id || ghUser.gravatar_id;
                  if(ghUser.company && ghUser.company.match(/MarkLogic/)) {
                    updatedUser.company = "MarkLogic";
                  }
                  uri = "github/" + ghUser.login;
                }
                updatedUser.github =  ghUser;
                exec(("node " + __dirname + "/../utils/github/top-repos.js " + 
                  ghUser.login + " " + gh_cfg.max_repos), 
                  function topReposCb(e, stdout, stderr) {
                    try {
                      if(e) { throw e; }
                      var github_repos = JSON.parse(stdout);
                      updatedUser.github_repos = github_repos;
                    }
                    catch (exc) {
                      console.log("Fetching top repos for " + ghUser.login + " yielded invalid json");
                    }
                    jsonInsert(uri, updatedUser);
                  }
                );
              });
        });
  });
}

fetchGitHubOrganization();