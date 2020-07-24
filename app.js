import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';
// import handlebars from 'handlebars';

export const PACKAGE = require('./package.json');

app.use(bodyParser.json());

app.get('/', function(req, res) {
  const hello = `Hey, you have reached "${PACKAGE.name}" version ${PACKAGE.version}! Seems like I'm doing just fine! ^_^`;
  res.send(hello);
});

app.use(errorHandler);