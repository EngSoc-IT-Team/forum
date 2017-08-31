# HTML Folder
This directory contains the bare HTML pages upon which the forum is built. Some pages are built dynamically while others are static.

Summaries for the owners of each page, the page's state and the purpose of the page can be found below.

## Contents
* [Pages](#pages)
  * [Landing Page](#landing-page)
  * [Question Page](#question-page)
  * [Profile Page](#profile-page)
  * [List Page](#list-page)
  * [New Page](#new-page)
  * [First Year Area](#first-year-area)
  * [Login Page](#login-page)
  * [About Page](#about-page)
  * [Class Page](#class-page)
  * [Help Page](#help-page)
  * [Not Found Page](#not-found-page)
  * [Guidelines Page](#guidelines-page)
  * [Link Page](#list-page)
  * [Dev Page](#dev-page)
  * [Eval Page](#eval-page)

* [Modals](#modals)
  * [Reporting Modal](#reporting-modal)
  * [Commenting Modal](#commenting-modal)
  * [Rating Modal](#rating-modal)
  * [Feedback Modal](#feedback-modal)
  * [Help Modal](#help-modal)


## Pages
#### Landing Page
##### Owner: Robert Cooper
##### Status: Design-Complete
##### Filename: [`index.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/index.html)
##### Page Type: Static (at current)
##### Purpose:
The purpose of the landing page is to provide a place where information can be quickly searched and found.
It serves as the central hub of our website and all portions of the site should be easily reached from here.

----

#### Question Page
##### Owner: Ayrton Foster
##### Status: Design-Complete
##### Filename: [`question.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/question.html)
##### Website Route: [`/question?id=somevalidquestionid`](http://localhost:8080/question?id=somevalidquestionid)
##### Page Type: Dynamic
##### Purpose:
The page used for displaying and commenting on questions posted by forum users

----

#### Profile Page
##### Owner: Michael Albinson
##### Status: Design-Complete
##### Filename: [`profile.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/profile.html)
##### Website Route: [`/profile`](http://localhost:8080/profile)
##### Page Type: Dynamic
##### Purpose:
 This page is used by a user to view their own metrics (votes, contributions, badges, etc.) and to view items that they have saved or subscribed to across the site.
 They should be able to filter through their recent contributions, subscriptions and saves to easily undo or delete those actions, if necessary.
 Additionally, other users should be able to be found on the profile page by using `/profile?username=ValidUsername` or
 `/profile?id=validuserid`. When viewing another user's profile, the viewing user should not see the other person's saved or subscribed items.

----

#### List Page
##### Owner: Robert Cooper
##### Status: Design-Complete
##### Filename: [`list.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/list.html)
##### Website Route: [`/list`](http://localhost:8080/list)
##### Page Type: Dynamic
##### Purpose:
The list page is used to display lists of items. The list can be filtered in a variety of ways, including by tag, date,
item popularity, and custom queries. It should be easy and intuitive to quickly filter or query for information.

----

#### New Page
##### Owner: Ayrton Foster
##### Status: Design-Complete
##### Filename: [`new.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/new.html)
##### Website Route: [`/new`](http://localhost:8080/new)
##### Page Type: Static
##### Purpose:
 The new page is used to add new content to the website. Questions, links and classes can be added here.
 Classes should be depreciated from this, as letting users add class may lead to bad or incomplete information regarding certain classes.

----

#### First Year Area
##### Owner: Unclaimed
##### Status: Incomplete
##### Filename: N/A
##### Website Route: N/A
##### Page Type: N/A
##### Purpose:
 A place where information pertient to first-year users can be gathered. This could include first year classes,
 popular first year questions and links, etc. Should be formatted so that the most pertient information that first
 years would like to see can be quickly found and filtered through.

----

#### Login Page
##### Owner: Michael Albinson
##### Status: Incomplete
##### Filename: [`login.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/login.html)
##### Website Route: [`/login`](http://localhost:8080/login) (only available if not logged in)
##### Page Type: Static
##### Purpose:
The login page is where all users login to the site. This page will need to eventually integrate with the
Queen's Single-Sign-On in order for users to be properly verified before being allowed onto the site.
The forum should be able to redirect the user to the initially requested url after they log in.

----

#### About Page
##### Owner: Michael Albinson
##### Status: Draft
##### Filename: [`about.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/about.html)
##### Website Route: [`/about`](http://localhost:8080/about)
##### Page Type: Static
##### Purpose:
The about page contains a short description of the forum and its purpose.

----

#### Class Page
##### Owner: Robert Cooper
##### Status: Design-Complete
##### Filename: [`class.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/class.html)
##### Website Route: [`/class?id=validclassid`](http://localhost:8080/class?id=validclassid)
##### Page Type: Dynamic
##### Purpose:
The class page shows information regarding a particular class, along with an average rating of the class
and user comments about the class.

----

#### Help page
##### Owner: Ayrton Foster
##### Status: Design-Complete
##### Filename: [`help.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/help.html)
##### Website Route: [`/help`](http://localhost:8080/help)
##### Page Type: Static
##### Purpose:
The help page contains frequently asked questions as well as a fast way to filter through them.

----

#### Not found page
##### Owner: Michael Albinson
##### Status: Functionally-Complete
##### Filename: [`notFound.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/notFound.html)
##### Website Route: Any invalid link
##### Page Type: Dynamic
##### Purpose:
The not found page is displayed any time the server encounters an error or the user requests a page that does not exist.

----

#### Guidelines Page
##### Owner: Michael Albinson
##### Status: Draft
##### Filename: [`guidelines.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/guidelines.html)
##### Website Route: [`/guidelines`](http://localhost:8080/guidelines)
##### Page Type: Static
##### Purpose:
The guidelines page contains the forum guidelines. These guidelines constitute the forum's Code of Conduct and terms of service.
The first time the user logs on they must agree to these guidelines before they can use any part of the forum.

----

#### Link page
##### Owner: Michael Albinson
##### Status: Design-Complete
##### Filename: [`link.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/link.html)
##### Website Route: [`/link?id=somevalidlinkid`](http://localhost:8080/link?id=somevalidlinkid)
##### Page Type: Dynamic
##### Purpose:
The link page contains details of a user-provided link, as well as user comments on the comment. The link page should
indicate if the link has been verified and is trusted for other users to use.

---

#### Dev page
##### Owner: Michael Albinson
##### Status: Design-Complete
##### Filename: [`dev.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/dev.html)
##### Website Route: [`/dev`](http://localhost:8080/dev)
##### Page Type: Static
##### Purpose:
The dev page is a developers-only portion of the website where weekly goals and long term project objectives are placed.
This can be updated as desired.

---

#### Eval page
##### Owner: Michael Albinson
##### Status: Design-Complete
##### Filename: [`eval.html`](https://github.com/EngSoc-IT-Team/forum/blob/master/client/html/eval.html)
##### Website Route: [`/eval`](http://localhost:8080/eval)
##### Page Type: Static
##### Purpose:
The eval page is used to run server-side code from the client. This page is a very powerful tool in the right hands
and a very dangerous one in the wrong ones. It is limited to developers only, and allows for server cleanup routines to
be run, as well as database queries to be made.

## Modals
#### Reporting Modal
##### Owner: Unclaimed
##### Status: Not-Started
##### Implemented on: All pages
##### Purpose:
 The report modal should be used to report content on the forum that is inappropriate or violates the
 forum code of conduct.

----

#### Commenting Modal
##### Owner: Ayrton Foster
##### Status: Incomplete
##### Implemented on: Link, Question pages
##### Purpose:
 The commenting modal should be used for users to make comments on the link and question pages

---

#### Rating Modal
##### Owner: Robert Cooper
##### Status: Incomplete
##### Implemented on: class page
##### Purpose:
 The rating modal should be used to make ratings and comments on a class on the class page

---

#### Feedback Modal
##### Owner: Unclaimed
##### Status: Not-Started
##### Purpose:
 The purpose of the feedback modal is to allow users to report bugs and issues to the developers.
 They should also be allowed to leave positive feedback, if desired.

----

#### Help Modal
##### Owner: Robert Cooper
##### Status: Incomplete
##### Implemented on: All pages
##### Purpose:
