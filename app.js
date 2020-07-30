import bodyParser from 'body-parser';

import { app, errorHandler } from 'mu';
import { CronJob } from 'cron';

import EntityFactory from './lib/entity-factory';
import { generateMailFor } from './lib/email';
import { MAIL_CONSTRUCTION_CRON } from './config';

// Statics
export const APP_NAME = 'toezicht-submission-email-notification-service';
export const APP_URI = `http://lblod.data.gift/services/${APP_NAME}`;

app.use(bodyParser.json());

// REST API

app.get('/', function(req, res) {
  const hello = `Hey, you have reached "${APP_NAME}"! Seems like I'm doing just fine! ^_^`;
  res.send(hello);
});

app.post('/initiate-mail-construction', async function(req, res) {
  try {
    const units = await EntityFactory.getAllSubscribedAdministrativeUnites();
    for (let unit of units) {
      unit.submissions = await EntityFactory.getAllInConceptAutomaticSubmissionsFor(unit);
      if (unit.submissions.length) {
        await generateMailFor(unit);
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
  console.log(`construction off notification e-mails initiated by cron job at ${new Date().toISOString()}`);
  rp.post('http://localhost/initiate-mail-construction');
}, null, true);

