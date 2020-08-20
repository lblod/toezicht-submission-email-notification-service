import bodyParser from 'body-parser';

import { app, errorHandler } from 'mu';
import { CronJob } from 'cron';

import EntityFactory from './lib/entity-factory';
import { generateMailFor } from './lib/email';
import { MAIL_CONSTRUCTION_CRON, APP_NAME } from './config';

const fetch = require('node-fetch');

app.use(bodyParser.json());

// REST API

app.get('/', function(req, res) {
  const hello = `Hey, you have reached "${APP_NAME}"! Seems like I'm doing just fine! ^_^`;
  res.send(hello);
});

app.post('/initiate-mail-construction', async function(req, res) {
  try {
    const units = await EntityFactory.getAllSubscribedAdministrativeUnites();
    if (!units.length) {
      console.log('no-one subscribed to the auto-submission mail service, no mails send!');
      return res.send().status(204);
    }
    const submissions = await EntityFactory.getAllInConceptAutomaticSubmissions();
    for (let unit of units) {
      unit.submissions = submissions.filter((submission) => submission.createdBy === unit.uri);
      if (unit.submissions.length) {
        await generateMailFor(unit);
        console.log(`Automatic submission notification mail prepared for ${unit.name} (URI: <${unit.uri}>) containing ${unit.submissions.length} submissions.`);
      }
    }
  } catch (e) {
    console.log('Something went wrong while trying to construct the necessary notification e-mails');
    console.error(e);
    res.send().status(500);
  }
  res.send().status(201);
});

app.use(errorHandler);

// CRON-JOBS

new CronJob(MAIL_CONSTRUCTION_CRON, function() {
  console.log(`construction of notification e-mails initiated by cron job at ${new Date().toISOString()}`);
  fetch('http://localhost/initiate-mail-construction', { method: 'POST' });
}, null, true);

