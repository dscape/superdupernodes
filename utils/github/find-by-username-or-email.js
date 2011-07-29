var request = require("request")
  , user_or_email = process.argv[2];

function displayUser(err,headers,user){
  if (!err && headers.statusCode !== 404) {
    console.log(JSON.parse(user));
  }
  else {
    console.log({});
  }
}

// Email
if(user_or_email.match(/.*@.*\..*/)) {
  request.get("http://github.com/api/v2/json/user/email/" + user_or_email,
    function userFromEmail(err,headers,user) {
      displayUser(err,headers,user);
    }
  );
}
// Username
else { 
  request.get("http://github.com/api/v2/json/user/show/" + user_or_email,
    function userFromUsername(err,headers,user) {
      displayUser(err,headers,user);
    }
  );
}
