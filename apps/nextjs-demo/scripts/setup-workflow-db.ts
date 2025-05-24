import { DatabaseService } from '@jss-rule-engine/workflow';
import  dbServiceOptions from '../src/lib/db/dbOptions';
/*
  METADATA GENERATION
  Generates the /src/temp/metadata.json file which contains application 
  configuration metadata that is used for Sitecore XM Cloud integration.
*/
initDb();

function initDb(): void {

  try{

  console.log('Initializing database...');  

  const databaseService = new DatabaseService(dbServiceOptions);
  databaseService.init();

  console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}