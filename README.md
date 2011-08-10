# Installing

      # Install node
      npm install
      # Configure where mljson lives
      mv config/marklogic.js.example config/marklogic.js
      vi config/marklogic.js
      # Rename .example's to .js
      mv config/markmail.js.example config/markmail.js
      mv config/meetup.js.example config/meetup.js
      mv config/express.js.example config/express.js
      # Add API key to meetup
      vi config/meetup.js

# Running

      # Run the scripts
      ./run_jobs
