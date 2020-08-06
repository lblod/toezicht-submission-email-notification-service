import { uuid, sparqlEscapeUri, sparqlEscapeString } from 'mu';
import fs from 'fs-extra';
import handlebars from 'handlebars';
import { querySudo as query } from '@lblod/mu-auth-sudo';
import { APP_URI } from '../app';
import { EMAIL_FOLDER, EMAIL_GRAPH, SENDER } from '../config';

const PREFIXES = [
  'PREFIX nmo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#>',
  'PREFIX mu: <http://mu.semte.ch/vocabularies/core/>',
  'PREFIX dct: <http://purl.org/dc/terms/>',
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
  const q = `
${PREFIXES.join('\n')}
 
 INSERT DATA {
   GRAPH ${sparqlEscapeUri(EMAIL_GRAPH)} {
       ${sparqlEscapeUri(`http://data.lblod.info/id/emails/${id}`)} a nmo:Email;
       mu:uuid ${sparqlEscapeString(id)};
       nmo:isPartOf ${sparqlEscapeUri(EMAIL_FOLDER)};
       nmo:htmlMessageContent ${sparqlEscapeString(html)};
       nmo:messageSubject ${sparqlEscapeString('Automatische inzendingen vereisen uw aandacht')};
       nmo:emailTo ${sparqlEscapeString(unit.mail)};
       nmo:messageFrom ${sparqlEscapeString(SENDER)};
       dct:creator ${sparqlEscapeUri(APP_URI)}.
   }
 }`.trim();

  await query(q);
}