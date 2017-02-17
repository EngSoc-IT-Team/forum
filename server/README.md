# Server-Side Setup (MAC ONLY)
1. Download and install MySQL
2. **Save the password that is provided to you when you finish the setup** <- Very important!!!
2. Turn on MySQL in system preferences (see [this link](http://dev.mysql.com/doc/mysql-getting-started/en/#mysql-getting-started-installing) -- only use the getting started portion)
3. Download a client for SQL, I suggest [Sequel Pro](https://www.sequelpro.com/), it's pretty easy to use but it's mac-only, sorry non-mac users :(
4. Now open up terminal, if you type `mysql` you will notice that it causes an error
5. To fix this type `echo 'export PATH=$PATH:/usr/local/mysql/bin' >> ~/.bash_profile` this will add the mysql prompt to your bash profile (if you're not sure what it is... don't worry too much, but we can have a chat)
6. Now enter `mysql -u root -p` and when prompted enter the password from step 2
7. Congratulations! You're logged into your local mysql server! Now, if you try to use this password to log into Sequel (don't do it) mysql will complain about you using an expired password, let's fix that
8. Now in the mysql prompt (it looks different than the normal terminal interface) type `SET PASSWORD FOR 'root'@'localhost' = 'password_you_want';` where you fill in `password_you_want` with the password you would like to use for the root user (since it's only local, it's ok to make it easy to remember)
9. If all goes well, we should now be able to leave this horrible interface and open up Sequel Pro for the first time select the Socket option on the home screen
10. The name is *localhost*, the user name is *root* and the password is whatever you used for *password_you_want* in step 8
11. **You did it!** MySQL is all set up now! Nice work, as a reward, here's a picture of Leo DiCaprio from *The Revenant*, and just remember if you ever think you have a truly challenging problem, at least you aren't running around a winter tundra by yourself in fear of a bear attack in like the 1800s.

![](https://si.wsj.net/public/resources/images/BN-MT095_COSTUM_JV_20160223171342.jpg)

# Server-Side Setup (Windows ONLY)
1. Download and install with [MySQL installer](https://dev.mysql.com/downloads/installer/). Use the default options except click start server on startup. **Make sure the port used is NOT 8080**
2. The installer may have requirements that are not filled, such as your computer does not have python installed. However, these requirements are only used when working with that specific language, so as long as you have the language you want to use installed, you are good to go
3. Set the root password when prompted in the installer
4. Go to start > all programs > MySQL > MySQL 5.7 Command Line Client and enter the root password
5. In the same directory is the much nicer looking client, MySQL Workbench
6. That's it! So much easier than on Mac! Wow, Windows > Macs!!

# Moving Forward - The javascript
1. Make sure your nodejs is up to date (Version 7.0.0 or up please)
2. Make sure you have npm installed ([try this ](http://blog.npmjs.org/post/85484771375/how-to-install-npm) if you need to install both node and npm)
3. Now that you have npm, you'll need to run `npm install mysql`, `npm install cookie-parser`, `npm install body-parser`, `npm install nodemailer`, `npm install nodemailer-smtp-transport` and `npm install express` so that you have all the dependencies we need to get our server up and running (this list will be added to over time)
4. In your mysql client add a database called `testing`
5. Navigate to the forum/server directory using your terminal or shell
6. Navigate to the config directory and run `git update-index --assume-unchanged config.json` and `git update-index --assume-unchanged database.json`. This prevents your local changes to this file from being pushed back to master.
7. Make sure that in the database.json file, your database name is set to `testing`, that the user is set to `root` and the password is the same as the one set in the previous section
8. Return to the server directory
9. Run `node setup.js` -- this will make sure you have all the necessary dependencies for the backend and load an empty database into the database `testing`
10. Note that a sample user with netid `anon` will be loaded into the database along with the username you requested
11. In terminal, halt the execution of the server using `control` + `c` and run the command `node expressServer.js`
12. If there are no errors in the terminal/shell, the server should now be up and running! Go to `localhost:8080` in your browser of choice
13. You should be routed to the login page. Enter `anon` as the netid and whatever you want for the password (we aren't checking for passwords yet)
14. You're all set up! Happy developing :)

# Resetting the database
### Every so often the way the database is setup (or it's "schema") will change. When it does, you'll need to follow these steps. There are two ways of resetting the database. The first is the mac-only way, the second is from the MySQL terminal and can be done cross-platform. Note this should NEVER be done while the `expressServer.js` file is running.
### Mac-Only way
1. Open up Sequel Pro and log in as you normally would
2. Select the database from the top-left dropdown (should be named "testing")
3. Select Database > Delete Database from the header
4. Click "Add Database" from the top left dropdown
5. Make the database name "testing"
6. Then run the `setup.js` file, and you should be good to go!

### Cross-platform way
1. Open up the MySQL monitor
2. Run `DROP DATABASE testing;`
3. Run `CREATE DATABASE testing;`
4. Then run the `setup.js` file, and you should be good to go!
