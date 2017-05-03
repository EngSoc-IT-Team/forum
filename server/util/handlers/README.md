# Handlers

The handler directory contains JavaScript dedicated to handling client requests and returning any relevant information. 
These are generally called down to from the requestResponder.js file, and are the first response to client requests.
  
## Files
#### classHandler.js
Gets information about a class and it's ratings and sends them to the class page client

#### itemInfoHandler.js
A file that contains common functions to get information about what data to get from the database for ratings, comments, etc.

#### linkHandler.js
Handles requests from the link page and returns the link information and its relevant comments.

#### listHandler.js
Handles requests from the class page and returns a list of items that correspond to a user's query.

#### newHandler.js
Handles requests from the new page to _enter_ data into the database. This file differs as it puts data into the database
instead of reading it and sending it back to the page. This file returns the id of the new item so that the new page can
redirect to it when a new itme is successfully added.

#### profileHandler.js
Handles requests from the profile page by getting lists of a user's contributions, saves, and subscriptions, as well as
relevant user information and returns it to the user page.

#### questionHandler.js
Handles requests from the question page and returns information about the question as well as a list of relevant comments.