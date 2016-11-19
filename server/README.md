# Server-Side Setup (MAC ONLY)
1. Download and install MySQL
2. **Save the password that is provided to you when you finish the setup** <- Very important!!!
2. Turn on MySQL in system preferences (see [this link](http://dev.mysql.com/doc/mysql-getting-started/en/#mysql-getting-started-installing) -- only use the getting started portion)
3. Download a client for SQL, I suggest [Sequel Pro](https://www.sequelpro.com/), it's pretty easy to use but it's mac-only, sorry non-mac users :(
4. Now open up terminal, if you type `mysql` you will notice that it causes an error
5. To fix this type `echo 'export PATH=$PATH:/usr/local/mysql/bin' >> ~/.bash_profile` this will add the mysql prompt to your bash profile (if you're not sure what it is... don't worry too much, but we can have a chat)
6. Now enter `mysql -u root -p` and when prompted enter the password from step 2
7. Congratulations! You're logged into your local mysql server! Now, if you try to use this password to log into Sequel (don't do it) mysql will complain about you using an expired password, let's fix that
8. Now in the mysql prompt (it looks different than the normal terminal interface) type `SET PASSWORD FOR ‘root’@‘localhost' = ‘password_you_want’;` where you fill in `password_you_want` with the password you would like to use for the root user (since it's only local, it's ok to make it easy to remember)
9. If all goes well, we should now be able to leave this horrible interface and open up Sequel Pro for the first time select the Socket option on the home screen
10. The name is *localhost*, the user name is *root* and the password is whatever you used for *password_you_want* in step 8
11. **You did it!** MySQL is all set up now! Nice work, as a reward, here's a picture of Leo DiCaprio from *The Revenant*, and just remember if you ever think you have a truly challenging problem, at least you aren't running around a winter tundra by yourself in fear of a bear attack in like the 1800s.

![](https://si.wsj.net/public/resources/images/BN-MT095_COSTUM_JV_20160223171342.jpg)

# Moving Forward - The javascript
1. Make sure your nodejs is up to date (Version 7.0.0 or up please)
2. Make sure you have npm installed ([try this ](http://blog.npmjs.org/post/85484771375/how-to-install-npm) if you need to install both node and npm)
3. Now that you have npm, you'll need to run `npm install mysql` and `npm install express` so that you have all the dependencies we need to get our server up and running (this list will be added to over time)
4. Note: All files must be run from the top of the directory, otherwise certain utility objects/functions may not work as expected 