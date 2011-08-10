var request      = require("request")
  , nuvem        = require("nuvem")
  , async        = require("async")
  , cfg          = require("../cfg/marklogic")
  , markmail_api = require("../cfg/markmail")
  , topic        = markmail_api.topic
  , db           = nuvem(cfg);

function possibleMatches(member) {
  // Search for name but remove things with meetup to avoid dups
  db.json.find(member.name + " -excludefromsearch", function (err,response) {
      if(response.meta.total > 0) {
        var uri = ("/markmail" + escape(member.url))
          , collections;
        console.log(member.name + " seems to have " + response.meta.total + 
          " possible matches");
        member.tentative = response;
        member.exclude_from_search = "excludefromsearch";
        collections = _.map(response.results, function (r) { return r.uri; });
        collections.push("markmail");
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

request.get(
  ("http://" + topic +".markmail.org/facets.xqy?q=&type=senders&extended=true&mode=json"),
  function (e,h,b) {
    if(e) {
      console.log(e); 
      return;
    }
    try {
      var members = JSON.parse(b).facets.senders.item;
      async.forEach(members, possibleMatches,
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