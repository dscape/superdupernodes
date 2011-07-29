var request = require("request")
  , _       = require("underscore")
  , nuvem   = require("nuvem")
  , cfg     = require("../cfg/marklogic")
  , meetup_api = require("../cfg/meetup")
  , api_key = meetup_api.api_key
  , topic   = meetup_api.topic
  , db      = nuvem(cfg);

request.get(
  ("http://api.meetup.com/groups.json/?topic=" + topic +
  "&key=" + api_key)
  ,
  function (e,h,b) {
    if(e) {
      console.log(e); 
      return;
    }
    try {
      var meetups = JSON.parse(b);
      console.log(meetups.results[0]);
    }
    catch(err){
      console.log(e); 
      return;
    }
  }
)