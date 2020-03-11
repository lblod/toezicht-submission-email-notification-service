import { app, query, errorHandler } from 'mu';
import { querySudo, updateSudo} from '@lblod/mu-auth-sudo';
import { v1 as uuid } from 'uuid';
import bodyParser from 'body-parser';
import fs from 'fs';
import handlebars from 'handlebars';

app.use(bodyParser.json());
app.use(errorHandler);

const prefixes =`
  PREFIX rdfs: <https://www.w3.org/2000/01/rdf-schema#>
  PREFIX elod: <http://linkedeconomy.org/ontology#>
  PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
  PREFIX lblodBesluit: <http://lblod.data.gift/vocabularies/besluit/>
  PREFIX melding: <http://lblod.data.gift/vocabularies/automatische-melding/>
  PREFIX meb: <http://rdf.myexperiment.org/ontologies/base/>
  PREFIX dbpedia: <http://dbpedia.org/ontology/>
  PREFIX schema: <http://schema.org/>
  PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
  PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX pav: <http://purl.org/pav/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  PREFIX adms: <http://www.w3.org/ns/adms#>
  PREFIX eli: <http://data.europa.eu/eli/ontology#>
  PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX rm: <http://mu.semte.ch/vocabularies/logical-delete/>
  PREFIX typedLiterals: <http://mu.semte.ch/vocabularies/typed-literals/>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX app: <http://mu.semte.ch/app/>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX nmo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#>
`;

//TODO (sergey): remove this, its only for testing purposes
app.get('/readQuery', function(req, res){
  const myQuery = `
    SELECT * 
    WHERE{
      ?a ?b <asdasdasdasd> .
    }LIMIT 10
  `;
  querySudo( myQuery )
    .then( function(response) {
      res.send( JSON.stringify( response ) );
    })
    .catch( function(err) {
      res.send( "Oops something went wrong: " + JSON.stringify( err ) );
    });
});

//TODO (sergey): remove this, its only for testing purposes
app.get('/generateTask', function(req, res){
  const newUuid=uuid();
  const myQuery=prefixes+`
    INSERT {
      GRAPH ?g {
        <task`+newUuid+`>  a <http://lblod.data.gift/vocabularies/automatische-melding/AutomaticSubmissionTask>.
        <task`+newUuid+`>  prov:generated ?submission.
        <task`+newUuid+`> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/automatische-melding-statuses/successful-concept>.
        ?submission a ?type.
      }
    }
    WHERE {
      GRAPH ?g {
        BIND(<http://data.lblod.info/submissions/5E68A57EB5D3120008000006> AS ?submission)
        ?submission a ?type.
      }
    }
  `;

  querySudo( myQuery )
  .then( function(response) {
    res.send( JSON.stringify( response ) );
  })
  .catch( function(err) {
    res.send( "Oops something went wrong: " + JSON.stringify( err ) );
  });
});

app.post('/delta', function(req, res){
  //get changeset from delta and extract taskId
  const merged=req.body.map(e=>e.inserts).flat();
  const taskId=merged.find((e)=>{ 

    return e.predicate.value=="http://www.w3.org/ns/adms#status" &&
      e.object.value=="http://lblod.data.gift/automatische-melding-statuses/successful-concept";
  
  }).subject.value;

  //get submission id and pass it to email function
  const subIdQuery=prefixes+`
    SELECT ?submission
    WHERE {
      GRAPH ?g {
        <`+taskId+`> a melding:AutomaticSubmissionTask .
        <`+taskId+`> prov:generated ?submission .
        <`+taskId+`> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/automatische-melding-statuses/successful-concept>.
        FILTER NOT EXISTS { <http://foo> ext:notificatieEmail ?email . }
      }
    }
  `;

  querySudo(subIdQuery).then( function(response) {
    email(response.results.bindings[0].submission.value);
  })
  .catch( function(err) {
    console.log("Oops something went wrong when retrieving submissionId: \n\n" + err);
    return false;
  });
  console.log('email qued');
  res.send('email qued');
});

async function email(submissionId){
  //get email adress of who submitted the form
  //TODO (sergey):this will probably changed once discussed with the client
  const emailAddrQuery=prefixes+`
  SELECT ?emailTo  WHERE {
    GRAPH ?g {
      <`+submissionId+`> a meb:Submission.
      <`+submissionId+`> <http://purl.org/pav/createdBy> ?bestuurseenheid.
      ?bestuurseenheid <http://mu.semte.ch/vocabularies/ext/toezicht/mailAdresVoorNotificaties> ?emailTo.
    }
  }
  `;
  try{
    var response=await querySudo(emailAddrQuery);
    //TODO (sergey): once decided it should not be empty
    var mailTo=''//response.results.bindings[0].emailTo.value;
  }catch(err){
    console.log("Oops something went wrong when retrieving the emailTo address: \n\n" + err);
    return false;
  }
  
  //compose an email
  const newUuid=uuid();

  const template = handlebars.compile(fs.readFileSync("/usr/src/app/app/template.hbs", 'utf8'));

  const mailFolderUri=process.env.EMAIL_FOLDER_URI;
  
  //TODO (sergey): once decided it the template should change
  //pass variables to teample that you want to be rendered in the html email message body
  const message=template({ name: "Nils" });
  
  const subject=``;
  
  const messageFrom=process.env.MESSAGE_FROM;
  
  const creator=`http://lblod.data.gift/services/meldingsplichtige-api`;
  
  const emailGraph=process.env.EMAIL_GRAPH;

  const writeEmailQuery=prefixes+`
    INSERT DATA {
    GRAPH <`+emailGraph+`> {
      <http://data.lblod.info/id/emails/`+newUuid+`> a <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#Email>;
        mu:uuid	"""`+newUuid+`""";
        nmo:isPartOf	<`+mailFolderUri+`>;
        nmo:htmlMessageContent	"""`+message+`""";
        nmo:messageSubject	"""`+subject+`""";	
        nmo:emailTo	"""`+mailTo+`""";
        nmo:messageFrom	"""`+messageFrom+`""";
        dct:creator	<`+creator+`>.
  }}
  `;

  try{
    response= await querySudo(writeEmailQuery);
  }catch(err){
    console.log("Oops something went wrong when saving the email: \n\n" + err);
    return false;
  }
  
  console.log('email saved');
}
