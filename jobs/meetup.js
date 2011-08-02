var request    = require("request")
  , nuvem      = require("nuvem")
  , async      = require("async")
  , cfg        = require("../cfg/marklogic")
  , meetup_api = require("../cfg/meetup")
  , api_key    = meetup_api.api_key
  , topic      = meetup_api.topic
  , db         = nuvem(cfg);

function possibleMatches(member) {
  console.log(member.name);
}

function findMembers(group) {
  request.get(("http://api.meetup.com/2/profiles.json/?group_id=" + group.id +
    "&key=" + api_key),
    function (e,h,b) {
      try {
        if(e) { throw e; }
        var member = JSON.parse(b);
        console.log(member.results[0].name);
        async.forEach(member.results, possibleMatches,
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
      //console.log(meetups.results[0]);
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