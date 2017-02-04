"use strict";

var DBRow = require('./DBRow').DBRow;

exports.aggregateProfileInfo = function(user, info) {
	return new Promise(function(resolve, reject) {
		info.PROFILE.other = 0; // TODO: other should mean something eventually

		var posts = new DBRow('post');
		posts.addQuery('author', user.getValue('username'));
		posts.query().then(function() {
			info.PROFILE.posts = posts.count();
			var comments = new DBRow('comment');
			comments.addQuery('author', user.getValue('username'));

			comments.query().then(function() {
				info.PROFILE.comments = comments.count();
				var links = new DBRow('link');
				links.addQuery('addedBy', user.getValue('id'));

				links.query().then(function() {
					info.PROFILE.links = links.count();
					resolve(info);

				}, function(err) {
					resolve(err);
				});
			}, function(err) {
				resolve(err)
			});
		}, function(err) {
			resolve(err);
		});
	});
}

exports.Aggregator = function() {

}