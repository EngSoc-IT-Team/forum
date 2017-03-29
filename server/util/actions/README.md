# Actions folder

## Searcher.js

This file deals with searching the database for content that is relevant to the search terms entered. The file uses the AutoTag API from Algorithmia to find 
the key parts of a piece of text. All searchable content is sent through a function that finds these key terms, and then the items table in the SQL database
holds these key terms for each piece of searchable content. If no key terms were made for whatever reason, key tags are generated for that content and the search is continued.

Searchable content includes links, posts, users (only by username), tags, classes and comments.
The searchable fields of these tables are for the most part content and title.

User added tags are also searched. If a word/number/word number combo is entered in the search term that matches a tag added by a user, then
that post is added onto the end of the array of "found" items. It is added on the end because the contribution that has relevant fields to the
search is more likely to be useful than just having the same user tags. E.g. physics could mean quantum physics or dynamics.

searchForContent() is the main function to use, where a search term and table to be searched is inputted. An array of contributions in that table that have similar key terms is found
and then sorted by relevancy to the search, and then contributions in that table with matching user tags to the search are added on the end of the array. Finally,
and array of contributions' ID's, sorted by relevancy is returned. Currently, development is being done to allow for multiple tables to be searched at once.

## Subscriptions.js

This file allows the user to subscribe to a piece of content so that when people comment on it, or there are edits made, they get an email notification.
It ensures that a user can only subscribe to each piece of content once. Also, in order to avoid constantly notifying the user, a timestamp of the 
last notification is kept and the number of missed notifications since that timestamp is kept, using this file's logic. So, if a change is made, but not
long enough since the last notification, or there aren't enough missed notifications since that timestamp, the user won't be notified.

onContentAddedOrChanged() should be called on every edit/addition to keep these missed notifications up to date. Then an email is sent to all users that are subscribed and have the time/number of notifications conditions fulfilled.

To notify users, an email is sent from do-not-reply-forum@engsoc.queensu.ca, using nodemailer and SMTP-Transport. Currently it is just an email saying something has changed,
with no specific information, links or styling.

## Commenter.js

This file manages comments being added, deleted or edited. There are exported functions to do each of those operations. There are also functions to
retrieve comments and sub comments from the database, as well as functions that retrieve a comment (in an object) from the database.

## Contributor.js

This file adds to the Contributions table in the database. Every time a post, comment, tag etc. is added, a row in Contributions is added using this file.
The content's ID, the ID of user who entered it, the type of content added (e.g. post, comment etc.) and the tags, if there are any.

## Rater.js

This file deals with rating the classes in the database. It can add, edit and delete ratings of classes, as well as makes sure a user can rate a specific class only once.
Rater.js also retrieves individual ratings or all of the ratings for one class, and can set the average rating of a class.
 
 ## Reporter.js
 
 This file allows the user to report a piece of content for being offensive/inaccurate etc. It also ensures that a user cannot report a piece of content more than once.
 In the future report resolves will be implemented, so that reports can be flagged as still needing to be dealt with.
 
 ## Saver.js
 
 This file allows a user to save a piece of content so that they can come back to it later on their profile page. It can save and un-save content, as well
 as ensures a user can't save the same content multiple times at once.
 
 ## Tagger.js
 
 This file allows the user to give content tags in order to give a sense of what the content is about. Tags can be added, but not removed with this file.
 All of the tags in the database or just one tag (by ID) can be retrieved from the database using this file.
 
 ## Voter.js
 
 This file allows a user to upvote or downvote content. The user can also change their vote. This file will retrieve and individual vote, as well
 as update the vote number and the user's vote indications (up, down or none) on the page as well. 