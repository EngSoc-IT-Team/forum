# Logging folder

This directory will contain server logs if the config.json property `logging` is set to `true`. Whenever something needs to be logged use the `log.log()`, `log.warn()`, `log.info()` or `log.error()` functions. These calls will log to both the node console, and to the log file.

Note that calls to console.log are **NOT** logged. Please require the log.js file and use the provided logging functions.

Log files will be titled by the date when the log was created.