var request    = require("request")
  , nuvem      = require("nuvem")
  , async      = require("async")
  , _          = require('underscore')
  , cfg        = require("../cfg/marklogic")
  , meetup_api = require("../cfg/meetup")
  , api_key    = meetup_api.api_key
  , topic      = meetup_api.topic
  , db         = nuvem(cfg);

function possibleMatches(member) {
  // Search for name but remove things with meetup to avoid dups
  db.json.find(member.name + " -excludefromsearch", function (err,response) {
      if(response.meta.total > 0) {
        var uri = ("/meetup/" + member.group.group_urlname + "/" + member.member_id)
          , collections;
        console.log(member.name + " seems to have " + response.meta.total + 
          " possible matches");
        member.tentative = response;
        member.exclude_from_search = "excludefromsearch"; 
        collections = _.map(response.results, function (r) { return r.uri; });
        collections.push("meetup");
        db.json.insert(uri, member, {collection: collections},
          function (err) {
            if(err) { 
              console.log("failed creating member " + uri);
              return;
            }
            console.log("User " + uri + " was created.");
          }
        );
      }
    }
  );
}

function findMembers(group) {
  request.get(("http://api.meetup.com/2/profiles.json/?group_id=" + group.id +
    "&key=" + api_key),
    function (e,h,b) {
      try {
        if(e) { throw e; }
        var member = JSON.parse(b)
          , members = _.map(member.results,
              function(member){
                member.group = group;
                return member;
              }
            );
        async.forEach(members, possibleMatches,
          function (err){
            if(err) { console.log(err); return; }
          });
       }
      catch (exc) {
        console.log("Failed retrieving " + group.name);
      }
    }
  );
}

request.get(
  ("http://api.meetup.com/groups.json/?topic=" + topic +
  "&key=" + api_key),
  function (e,h,b) {
    if(e) {
      console.log(e); 
      return;
    }
    try {
      var meetups = JSON.parse(b);
      async.forEach(meetups.results, findMembers,
        function(err){
          if(e) {
            console.log(e); 
            return;
          }
        }
      );
    }
    catch(err){
      console.log(e); 
      return;
    }
  }
);