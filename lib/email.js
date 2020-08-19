import { uuid, sparqlEscapeUri, sparqlEscapeString } from 'mu';
import fs from 'fs-extra';
import handlebars from 'handlebars';
import { querySudo as query } from '@lblod/mu-auth-sudo';
import { OUTBOX_FOLDER_URI, EMAIL_GRAPH, FROM_EMAIL_ADDRESS, APP_URI } from '../config';

const PREFIXES = [
  'PREFIX nmo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#>',
  'PREFIX mu: <http://mu.semte.ch/vocabularies/core/>',
  'PREFIX dct: <http://purl.org/dc/terms/>',
  'PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>'
];

// Statics
const TEMPLATE = '/usr/src/app/app/template.hbs';

export async function generateMailFor(unit) {
  const template = handlebars.compile(fs.readFileSync(TEMPLATE, 'utf8'));

  const html = template({
    name: unit.name,
    submissions: unit.submissions.map(submission =>
        `https://loket.lokaalbestuur.vlaanderen.be/supervision/submissions/${submission.uuid}`),
  });

  const id = uuid();
  const emailURI = `http://data.lblod.info/id/emails/${id}`;
  const q = `
${PREFIXES.join('\n')}
 
 INSERT DATA {
   GRAPH ${sparqlEscapeUri(EMAIL_GRAPH)} {
       ${sparqlEscapeUri(emailURI)} a nmo:Email;
       mu:uuid ${sparqlEscapeString(id)};
       nmo:isPartOf ${sparqlEscapeUri(OUTBOX_FOLDER_URI)};
       nmo:htmlMessageContent ${sparqlEscapeString(html)};
       nmo:messageSubject ${sparqlEscapeString('Automatische inzendingen vereisen uw aandacht')};
       nmo:emailTo ${sparqlEscapeString(unit.mail)};
       nmo:messageFrom ${sparqlEscapeString(FROM_EMAIL_ADDRESS)};
       dct:creator ${sparqlEscapeUri(APP_URI)}.
       ${unit.submissions.map((submission) => `${sparqlEscapeUri(emailURI)} ext:forSubmission ${sparqlEscapeUri(submission.uri)}.`).join('\n')}
   }
 }`.trim();

  await query(q);
}