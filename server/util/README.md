# Util
This directory contains essentially all the code required to run the server for the Forum.
There are several general [files](Files), as well as some more specific [directories](Directories) that have files
that are specialized to specific tasks.

## Directories
#### Actions
This directory contains files that perform actions on the database when requested by a client.
These actions include: voting, commenting, rating and seraching. As a general rule of thumb, if it happens
after the page is loaded, the request is probably processed here.

#### DatabaseUtil
This directory handles database management and security. It includes files responsible for 
escaping client queries, building client queries and the interface with the database itself.

#### Handlers
Contains the code required to handle client requests before the page loads. For example, this
directory has the code to return data to the list, link, question, class and profile pages
(and more) so that there is information that can be rendered on those pages.

#### Maint
The maint directory contains code required to perform routine server maintainance. This code
remains _incomplete_ as of 5/7/17.

#### Setup
Contains the code required to setup the database, load mock data into the database and ensure that
all required dependencies for the server are installed.

## Files
#### actionResponder.js
Handles all client requests that invoke actions, i.e. voting, commenting and rating and typically calls
down to one of the files in the action directory.

#### aggregator.js
**Incomplete** Should be used to easily aggregate information (i.e. count). Currently only used to get simple
user metrics for the profile page.

#### compare.js
**Incomplete** File to contain methods that make it easy to compare common items. Currently only used to
determine that objects are not empty.

#### DBRow.js
The cornerstone of the server and its interaction with the database. Abstracts away all of the
ugly SQL syntax behind making queries. **If there is one thing to understand about the server it is
this file.**

#### evalEnvironment.js
An Object that acts as a safe evaluation environment for client code. FOR DEVELOPERS ONLY. Normal
clients should never have access to this as it gives users far too much power. Should be used for manual
server maintainance once the server is running and cannot be restarted. *Still relatively unstable.*

#### evalUtil.js
Utility functions for the evaluation environment.

#### IDGenerator.js
Allows for the generation of random IDs for database rows as well as random usernames.
 
#### Literals.js
A place where are constant literal strings used in the server are stored. Should be required
and used whenever possible to allow for ease of changing strings in the future as well as to
avoid misspellings.

#### log.js
The logging utility for the server. Writes out to a log file if the server is in production,
writes to the console if in development mode.

#### recursion.js
A file full of recursive methods of applying DBRow to ensure "synchronous" code behavior 
when attempting to retrieve particular things from the database such as comments for a question
that can prove difficult given the extensive use of Promises in the server.

#### requestResponder.js
Handles incoming requests from the server that (as a rule of thumb) occur before the page
has loaded on the client. This file then calls down to files in the Handler directory (typically).

#### Validator.js
A file that performs common database validation to ensure items exist, that users exist or
have a particular role in the database.