# toezicht-submission-email-notification-service

Service that provides the creation of emails for the module Toezicht.

## Installation

To add the service to your stack, add the following snippet to docker-compose.yml:

```
services:
  submission-email-notification:
    image: lblod/toezicht-submission-email-notification-service:x.x.x
```

## Configuration

### Environment variables

- `MAIL_CONSTRUCTION_CRON`: Frequency at witch the e-mails should be "send-out". Defaults to 15 8 * * *, run every day at 8:15.
- `MESSAGE_FROM`: sender of the email. NO Defaults implemented.
- `EMAIL_GRAPH`: refers to the graph where the emails will be stored. Defaults to <http://mu.semte.ch/graphs/system/email>.
- `EMAIL_FOLDER`: refers to the folder that the emails will be linked to. Defaults to <http://data.lblod.info/id/mail-folders/2>, which is the OUTBOX.

   
## REST API

### POST `/initiate-mail-construction`

Initiates the mail construction.

## Development

For a more detailed look in how to develop a microservices based on the [mu-javascript-template](https://github.com/mu-semtech/mu-javascript-template), 
we would recommend reading "[Developing with the template](https://github.com/mu-semtech/mu-javascript-template#developing-with-the-template)"

### Developing in the `mu.semte.ch` stack

Paste the following snip-it in your `docker-compose.override.yml`:

````  
submission-email-notification:
  image: semtech/mu-javascript-template:1.4.0
  ports:
    - 8888:80
    - 9229:9229
  environment:
    NODE_ENV: "development"
  volumes:
    - /absolute/path/to/your/sources/:/app/
