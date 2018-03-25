# Database Util

This folder holds files that deal with the database, in terms of querying, sanitizing queries and managing access.

## DatabaseManager.js

This file creates a connection to the SQL database used to hold the site's data. It also performs the query itself to a database, while managing the connection to it.

## QueryBuilder.js

This file creates the SQL query strings used to access/change the database. It gives the option to insert, get, delete, update and in general query a table/row.
The file also escapes queries by using the default escaping in the mysql module, as well as using QueryEscaper.js to ensure the queries are safe.
Objects used in queries are broken down by this file and are added into the SQL strings in order to query using values and other information.

## QueryEscaper.js

This file extends the SQL query escaping that the mysql module provides, and ensures that all table and fields that are queried are existing tables/fields.
Each table has its own set of valid fields, so the table name alone can be escaped with this file, but if fields are escaped, the table name is as well by default.

## SQLQuery.js

This file acts as an abstract representation of each query that a particular row wants to send to the database. Simplifies the implementation
of further database behaviors by providing an extensible framework for adding additional Query characteristics to each generic
Query object.