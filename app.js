import bodyParser from 'body-parser';

import { app, errorHandler } from 'mu';
import { CronJob } from 'cron';

import { generateMail } from './lib/email';
import EntityFactory from './lib/entity-factory';

// Require
export const PACKAGE = require('./package-lock.json');

// Environment variables
const MAIL_CONSTRUCTION_CRON = process.env.MAIL_CONSTRUCTION_CRON || '15 8 * * *'; // NOTE: set to run every day at 8:15

// Statics
export const CREATOR = `http://lblod.data.gift/services/${PACKAGE.name}`;

app.use(bodyParser.json());

// REST API

app.get('/', function(req, res) {
  const hello = `Hey, you have reached "${PACKAGE.name}" version ${PACKAGE.version}! Seems like I'm doing just fine! ^_^`;
  res.send(hello);
});

app.post('/initiate-mail-construction', async function(req, res) {
  try {
    const units = await EntityFactory.getAllSubscribedAdministrativeUnites();
    for (let unit of units) {
      console.log(`Creating mail for ${unit.name}`);
      unit.submissions = await EntityFactory.getAllInConceptAutomaticSubmissionsFor(unit);
      if (unit.submissions.length) {
        await generateMail(unit);
      }
    }
  } catch (e) {
    console.log('Something went wrong while trying to construct the necessary entities');
    console.error(e);
    res.send().status(500);
  }
  res.send().status(200);
});

app.use(errorHandler);

// CRON-JOBS

new CronJob(MAIL_CONSTRUCTION_CRON, function() {
  console.log(`construction off e-mails initiated by cron job at ${new Date().toISOString()}`);
  rp.post('http://localhost/initiate-mail-construction');
}, null, true);

