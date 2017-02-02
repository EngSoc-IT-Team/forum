/**
 * Created by Carson on 02/02/2017.
 */

"use strict";

//fields names for multiple tables
const fieldUpvotes = "upvotes";
const fieldDownvotes = "downvotes";
const fieldNetvotes = "netVotes";
const fieldAuthor = "author";
const fieldID = "id";
const fieldContent = "content";
const fieldTimestamp = "timestamp";

const postTable = "post";
const postTableTitle = "title";
const postTableAnswered = "answered";
const postTableTags = "tags";

const commentTable = "comment";
const commentTableIsSolution = "isSolution";
const commentTableCommentLevel = "commentLevel";
const commentTableParentPost = "parentPost";
const commentTableParentComment = "parentComment";

const userTable = "user";
const userTableNetid = "netid";
const userTableUsername = "username";
const userTableTotalUpvotes = "totalUpvotes";
const userTableTotalDownvotes = "totalDownvotes";
const userTableTotalSolved = "totalSolved";
const userTableReportCount = "reportCount";
const userTableDateJoined = "dateJoined";
const userTableAcceptedTerms = "acceptedTerms";
const userTablePrivilege = "privilege";

//allow all of these variables to be used outside of this file
module.exports={};