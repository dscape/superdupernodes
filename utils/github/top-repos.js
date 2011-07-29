// USAGE: node get-repos user how_many_repos
var request       = require("request")
  , _             = require('underscore')
  , user          = process.argv[2]
  , how_many      = process.argv[3] || 3;

request.get('http://github.com/api/v2/json/repos/show/' + user, 
  function (e,h,b) {
    if (e || h.statusCode !== 200) {
      return console.log([]);
    }
    else { 
      var repos       = JSON.parse(b).repositories
        , xq_perc
        , top_n       ; // n=how_many
      _.each(repos,
        function (repo) {
          repo.rating = repo.watchers + repo.forks;
        }
      );
      top_n = _(repos)
        .chain()
        .sortBy(
          function (repo) {
            return repo.rating;
          }
        )
        .reverse()
        .filter(
          function (repo){
            return (!repo.fork && (repo.language === "XQuery" || repo.language === "JavaScript"))
          }
        )
        .value();
      if(repos.length === 0) {
        xq_perc = 0
      }
      else {
        xq_perc = Math.ceil((top_n.length/repos.length)*100)
      }      
      console.log( JSON.stringify(
        { "total_repos": repos.length
        , "total_xq_repos": top_n.length
        , "xq_percentage": xq_perc
        , "top_xq_repos":
          { "n": how_many
          , "repos": _.first(top_n,how_many)
          }
        } )
      );
      return;
    }
  }
);