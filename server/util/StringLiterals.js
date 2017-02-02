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
const fieldUserID = "userID";
const fieldTitle = "title";
const fieldTags = "tags";
const fieldSummary = "summary";
const fieldItemID = "itemID";
const fieldType = "type";


const postTable = "post";
const fieldAnswered = "answered";

const commentTable = "comment";
const fieldIsSolution = "isSolution";
const fieldCommentLevel = "commentLevel";
const fieldParentPost = "parentPost";
const fieldParentComment = "parentComment";

const userTable = "user";
const fieldNetid = "netid";
const fieldUsername = "username";
const fieldTotalUpvotes = "totalUpvotes";
const fieldTotalDownvotes = "totalDownvotes";
const fieldTotalSolved = "totalSolved";
const fieldReportCount = "reportCount";
const fieldDateJoined = "dateJoined";
const fieldAcceptedTerms = "acceptedTerms";
const fieldPrivilege = "privilege";

const reportTable = "report";
const fieldReportReason = "reportReason";
const fieldReport = "report";
const fieldReportingUser = "reportingUser";
const fieldReportedUser = "reportedUser";
const fieldRelatedCommentOrPostID = "relatedCommentOrPostID";

const tagTable = "tag";
const fieldName = "name";
const fieldRelatedTags = "relatedTags";

const voteTable = "vote";
const fieldCommentOrPostID = "commentOrPostID";
const fieldVoteValue = "voteValue";

const sessionTable = "session";
const fieldSessionStart = "sessionStart";

const classTable = "class";
const fieldCourseCode = "courseCode";
const fieldLongSummary = "longSummary";

const linkTable = "link";
const fieldLink = "link";
const fieldTrusted = "trusted";
const fieldDateAdded = "dateAdded";
const fieldAddedBy = "addedBy";

const subscriptionsTable = "subscriptions";
const fieldLastNotified = "lastNotified";
const fieldNumNotificationsMissed = "numNotificationsMissed";
const fieldNumTimeNotified = "numTimesNotified";
const fieldDateSubscribed = "dateSubscribed";

const savedTable = "saved";
const fieldDateSaved = "dateSaved";

const contributionTable = "contribution";
const fieldDate = "date";

//allow all of these variables to be used outside of this file
module.exports={};