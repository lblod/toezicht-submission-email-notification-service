export const MAIL_CONSTRUCTION_CRON = process.env.MAIL_CONSTRUCTION_CRON || '0 15 8 * * *'; // NOTE: set to run every day at 8:15
export const FROM_EMAIL_ADDRESS = process.env.FROM_EMAIL_ADDRESS || '';
export const EMAIL_GRAPH = process.env.EMAIL_GRAPH || 'http://mu.semte.ch/graphs/system/email';
export const OUTBOX_FOLDER_URI = process.env.OUTBOX_FOLDER_URI || 'http://data.lblod.info/id/mail-folders/2';
export const APP_NAME = process.env.APP_NAME || 'toezicht-submission-email-notification-service';
export const APP_URI = process.env.APP_URI ||  `http://lblod.data.gift/services/${APP_NAME}`;
