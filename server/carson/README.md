# Ideas for things to do for Carson
1. ClientQueryEscaper - an object that escapes browser queries. Could be combined with Query escaper, just different methods.(This will essentially wrap around the [querystring library](https://nodejs.org/api/querystring.html))
2. Mock data for the database
3. Method for entering mock data into database -- should probably be a part of the config.json and coreDatabaseSetup.js ... I may do this now that I'm thinking about it

# Complete
1. MySQL setup and desktop client step-by-step for Windows
2. QueryEscaper - an object that excapes mySQL queries to make sure nothing too weird is sent to the database. [Check out this](http://www.easysoft.com/developer/sql-injection.html), or for mysql module native escaping [look at this](https://github.com/mysqljs/mysql#escaping-query-values)