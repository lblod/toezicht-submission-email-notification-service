export const MAIL_CONSTRUCTION_CRON = process.env.MAIL_CONSTRUCTION_CRON || '0 15 8 * * *'; // NOTE: set to run every day at 8:15
export const SENDER = process.env.MESSAGE_FROM || '';
export const EMAIL_GRAPH = process.env.EMAIL_GRAPH || 'http://mu.semte.ch/graphs/system/email';
export const EMAIL_FOLDER = process.env.EMAIL_FOLDER || 'http://data.lblod.info/id/mail-folders/2';