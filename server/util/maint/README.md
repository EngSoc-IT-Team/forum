# Maint
This directory contains files that will (one day) perform routine maintainance on the server
to eliminate irrelevant data and ensure that the server runs smoothly. It will be composed of both
the Janitor Object and the serverSweeper Object.

## Files
#### Janitor
The Janitor object is the top of the maint hierarchy and is in charge of creating, cancelling and 
 coordinating jobs. The Janitor is primarily event driven, and is capable of cancelling long jobs
 in both a "soft" (i.e. the job is allowed to complete it's current task) and "hard" (i.e. the task is
 quit immediately) manner. The Janitor should also be able to coordinate jobs to occur at times of low
 server load so that individual user performance is not impacted.
 
#### severSweeper
This file contains a single object called a Sweeper. Individual Sweepers correspond to single
jobs that are being coordinated by a Janitor. Sweepers do not know about other Sweepers also
doing work, nor anything about the server state itself. They only know to start and quit sweeping
when told by a Janitor. The jobs a sweeper is capable of could include ensuring vote tallies are correct,
making sure that all votes, comments and reviews refer to valid posts, links and comments or getting rid 
of old user sessions that are no longer in use.