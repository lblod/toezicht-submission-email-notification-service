import { uuid, sparqlEscapeUri, sparqlEscapeString } from 'mu';
import fs from 'fs-extra';
import handlebars from 'handlebars';
import { querySudo as query } from '@lblod/mu-auth-sudo';
import { APP_URI } from '../app';

const PREFIXES = [
  'PREFIX nmo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#>',
  'PREFIX mu: <http://mu.semte.ch/vocabularies/core/>',
  'PREFIX dct: <http://purl.org/dc/terms/>',
];

// Environment variables
const SENDER = process.env.MESSAGE_FROM || '';
const EMAIL_GRAPH = process.env.EMAIL_GRAPH || 'http://mu.semte.ch/graphs/system/email';
const EMAIL_FOLDER = process.env.EMAIL_FOLDER || 'http://data.lblod.info/id/mail-folders/2';

// Statics
const TEMPLATE = '/usr/src/app/app/template.hbs';

export async function generateMailFor(unit) {
  const template = handlebars.compile(fs.readFileSync(TEMPLATE, 'utf8'));

  const html = template({
    name: unit.name,
    amountOfConcepts: unit.submissions.length,
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
       nmo:messageSubject ${sparqlEscapeString('Automatische inzendingen vereisen je aandacht')};
       nmo:emailTo ${sparqlEscapeString(unit.mail)};
       nmo:messageFrom ${sparqlEscapeString(SENDER)};
       dct:creator ${sparqlEscapeUri(APP_URI)}.
   }
 }`.trim();

  await query(q)
}