# Logging folder

This file will contain logs for the current runtime if the config.json file property `logging` is set to `true`. Whenever something needs to be logged use the `log.log()`, `log.warn()`, or the `log.error()` functions. These calls will log to both the node console, and to the log file.

Log files will be titled by the log date for when the log was created