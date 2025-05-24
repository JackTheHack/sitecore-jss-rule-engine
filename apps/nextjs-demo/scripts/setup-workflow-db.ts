import { DatabaseService } from '@jss-rule-engine/workflow';

/*
  METADATA GENERATION
  Generates the /src/temp/metadata.json file which contains application 
  configuration metadata that is used for Sitecore XM Cloud integration.
*/
initDb();

function initDb(): void {

  try{

  console.log('Initializing database...');

  const dbServiceOptions = {
    authToken: process.env.SQLITE_AUTHTOKEN || '',
    url: process.env.SQLITE_URL || '',
    syncUrl: process.env.SQLITE_SYNCURL || ''
  };

  const databaseService = new DatabaseService(dbServiceOptions);
  databaseService.init();

  console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}