# Engineering Society Forum

The Engineering Society Forum is a pilot by the Engineering Society Software Development Team (ESSDev) to create a place where Queen's Engineering Students can build a central repository of knowledge not available elsewhere on the internet.

## Getting Started

This project is built with Node.js, MySQL and several key node modules. The following section contains summary notes on how to quickly set up the development environment. For exhaustive instructions please see the  

### Dependencies

First, this program requires that you have Node.js version 7.0 or greater and npm 3.10 or greater in order to function. If you are unsure or do not yet have Node.js and npm installed see the server README.

Once you have Node and npm installed, there are several Node.js modules that this project requires. These can be installed by navigating to the main forum directory in the terminal and running `npm install`

### Running the forum

Please follow the steps in the [server README]() to set up the sever.
Once the sever is running you can log in with the username "anon" and you can input anything you want in the password field (it doesn't matter at the moment).

## Running Tests

Currently the Engineering Society Forum has no automated tests, although they will ideally be created in an upcoming release.

## Built With Node Modules:

* mysql
* body-parser
* cookie-parser
* nodemailer
* nodemailer-smtp-transport
* express
* natural
* algorithmia

### Version History

* **0.0.1** - *Initial work* - We still do not have enough working for alpha testing, but are vary close

## Authors

* **Michael Albinson** - *Database implementation, Express.js architecture*
* **Carson Cook** - *Search implementation, database query escaping*
* **Ayrton Foster** - *Client pages, Text Editor functionality*
* **Robert Cooper** - *Client pages, landing page*


See the list of [contributors](https://github.com/EngSoc-IT-Team/forum/graphs/contributors) who participated in this project for a more detailed breakdown.

## Acknowledgments

Fedora tips to all the outside libraries we have used, as well as:

* [Bootstrap.js](http://getbootstrap.com/)
* [Express.js](https://expressjs.com/)
* [Select2](https://select2.github.io/)
* [CKEditor](http://ckeditor.com/)
* [MathJax](https://www.mathjax.org/)

## License

MIT License

Copyright (c) 2017 Engineering Society of Queen's University

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
