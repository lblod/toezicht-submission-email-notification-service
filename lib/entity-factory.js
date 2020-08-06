import { sparqlEscapeUri } from 'mu';
import { querySudo as query } from '@lblod/mu-auth-sudo';

const PREFIXES = [
  'PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>',
  'PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>',
  'PREFIX voc: <http://mu.semte.ch/vocabularies/typed-literals/>',
  'PREFIX melding: <http://lblod.data.gift/vocabularies/automatische-melding/>',
  'PREFIX pav: <http://purl.org/pav/>',
  'PREFIX prov: <http://www.w3.org/ns/prov#>',
  'PREFIX adms: <http://www.w3.org/ns/adms#>',
  'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>',
  'PREFIX mu: <http://mu.semte.ch/vocabularies/core/>',
  'PREFIX meb: <http://rdf.myexperiment.org/ontologies/base/>',
];

const AUTO_SUBMISSION_CONCEPT_STATUS = 'http://lblod.data.gift/automatische-melding-statuses/successful-concept';
const SUBMISSION_CONCEPT_STATUS = 'http://lblod.data.gift/concepts/79a52da4-f491-4e2f-9374-89a13cde8ecd';

export default class EntityFactory {

  /**
   * Returns an array of all administrative-unites that are subscribed
   * to receive notification e-mails for toezicht-submissions.
   *
   * @returns {Promise<Array>}
   */
  static async getAllSubscribedAdministrativeUnites() {
    const q = `
${PREFIXES.join('\n')}

SELECT DISTINCT ?uri ?name ?mail
WHERE {
 ?uri a besluit:Bestuurseenheid ;
    skos:prefLabel ?bestuurseenheid ;
    ext:submissionNotificationEmail ?mail ;
    ext:allowedSubmissionNotificationsMails "true"^^voc:boolean;
    besluit:classificatie ?class .
 ?class skos:prefLabel ?classificatie .
 
 BIND(CONCAT(STR( ?classificatie ), " ", STR(?bestuurseenheid)) AS ?name ) .
}`.trim();

    const bindings = (await query(q)).results.bindings;
    return mapBindingsToPlainObjects(bindings);
  }

  /**
   * Returns an array of all submissions that were automatically processed and failed validation.
   *
   * @param unit - the administrative-unit to retrieve the submissions for.
   * @returns {Promise<Array>}
   */
  static async getAllInConceptAutomaticSubmissionsFor(unit) {
    const q = `
${PREFIXES.join('\n')}

SELECT DISTINCT ?uri ?uuid
WHERE {
      ?task a melding:AutomaticSubmissionTask ;
            prov:generated ?uri ;
            adms:status ${sparqlEscapeUri(AUTO_SUBMISSION_CONCEPT_STATUS)} .
      ?uri  a meb:Submission ;
            pav:createdBy ${sparqlEscapeUri(unit.uri)} ;
            adms:status ${sparqlEscapeUri(SUBMISSION_CONCEPT_STATUS)} ;
            mu:uuid ?uuid .
}`.trim();

    const bindings = (await query(q)).results.bindings;
    return mapBindingsToPlainObjects(bindings);
  }

}

/**
 * Helper function that maps bindings result array to an array of plain javascript objects.
 *
 * @param bindings
 * @returns
 */
function mapBindingsToPlainObjects(bindings) {
  return bindings.map(binding => {
    const object = {};
    mapBindingToObject(binding, object);
    return object;
  });
}

/**
 * Helper function that maps a binding result object from a sparql query to a javascript object.
 *
 * @param binding - result object from sparql query
 * @param object - object to map to
 */
function mapBindingToObject(binding, object) {
  const keys = Object.keys(binding);
  for (const key of keys) {
    object[key] = binding[key].value;
  }
}