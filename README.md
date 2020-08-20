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

- `MAIL_CONSTRUCTION_CRON`: Frequency at witch the e-mails should be "send-out". Defaults to `0 15 8 * * *`, run every day at 8:15.
- `FROM_EMAIL_ADDRESS`: sender of the email. No defaults implemented.
- `EMAIL_GRAPH`: refers to the graph where the emails will be stored. Defaults to <http://mu.semte.ch/graphs/system/email>.
- `OUTBOX_FOLDER_URI`: refers to the outbox folder that the emails will be linked to. Defaults to <http://data.lblod.info/id/mail-folders/2>.
- `APP_NAME`: name given to the application. Defaults to 'toezicht-submission-email-notification-service'.
- `APP_URI`: uri given to the application. Defaults to <http://lblod.data.gift/services/${APP_NAME}>.

   
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
berichtencentrum-deliver-email-service:
  environment:
    WELL_KNOWN_SERVICE_OR_SERVER: "Gmail"
    SMTP_OR_REST : "smtp"
    EMAIL_ADDRESS: "address@gmail.com"
    EMAIL_PASSWORD: "password"
```

### Subscribe a besturseenheid to the service

In order to subscribe to the service you will have to manually insert the following data in the triplestore

```
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
INSERT {
     GRAPH <http://mu.semte.ch/graphs/public> {
         ?org ext:submissionNotificationEmail ?mail ;
              ext:allowedSubmissionNotificationsMails "true"^^voc:boolean .
     }
 }
```

Being ?org the uri of the besturseenheid and ?mail your email

### Insert submission

In order to add a new submission and trigger the service you can run the following query

```
PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX voc: <http://mu.semte.ch/vocabularies/typed-literals/>
PREFIX melding: <http://lblod.data.gift/vocabularies/automatische-melding/>
PREFIX pav: <http://purl.org/pav/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX adms: <http://www.w3.org/ns/adms#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX meb: <http://rdf.myexperiment.org/ontologies/base/>
PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
INSERT DATA {
  GRAPH <http://mu.semte.ch/graphs/public> {
    <http://task-uri> a melding:AutomaticSubmissionTask ;
      prov:generated <http://submission-uri-3> ;
      adms:status <http://lblod.data.gift/automatische-melding-statuses/successful-concept> .
    <http://submission-uri>  a meb:Submission ;
      pav:createdBy ?org;
      adms:status <http://lblod.data.gift/concepts/79a52da4-f491-4e2f-9374-89a13cde8ecd> ;
      mu:uuid '1'.
  }
}
```

Remember to change the uris if you run the query multiple times. The ?org should be the same one you subscribed.
