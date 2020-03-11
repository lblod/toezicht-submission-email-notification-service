# toezicht-submission-email-notification-service
email service for toezicht harvester

## This is still evolving some notes for dev setup
notifier config
```
//email notify
  {
    match: {
      predicate: { type: "uri", value: "http://www.w3.org/ns/adms#status" },
      object: { type: "uri", value: "http://lblod.data.gift/automatische-melding-statuses/successful-concept" } //This is called 'submittable status'
    },
    callback: {
      method: "POST",
      url: "http://email-notify/delta"
    },
    options: {
      resourceFormat: "v0.0.1",
      gracePeriod: 1000,
      ignoreFromSelf: false
    }
  }
```
docker-compose config
```
email-notify:
    image: semtech/mu-javascript-template:1.4.0-beta
    ports:
      - 9229:9229
    environment:
      NODE_ENV: "development"
      EMAIL_FOLDER_URI: "http://data.lblod.info/id/mail-folders/2"
      MESSAGE_FROM: "Agentschap Binnenlands Bestuur Vlaanderen noreply-binnenland@vlaanderen.be"
      EMAIL_GRAPH: "http://mu.semte.ch/graphs/system/email"
    volumes: 
      - ./../meldingsplichtige-api-email-notification-service:/app
```
