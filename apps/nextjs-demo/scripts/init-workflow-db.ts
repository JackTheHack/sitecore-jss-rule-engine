import { DatabaseService } from '@jss-rule-engine/workflow';
import  {getDatabaseServiceOptions} from '../src/lib/db/dbOptions';
import * as dotenv from 'dotenv';
/*
  METADATA GENERATION
  Generates the /src/temp/metadata.json file which contains application 
  configuration metadata that is used for Sitecore XM Cloud integration.
*/
initDb();

function initDb(): void {

  try{

  dotenv.config({ override: true});  // Load environment variables from .env file 

  console.log('Initializing database...');  
  var dbServiceOptions = getDatabaseServiceOptions(process.env);
  console.log(dbServiceOptions);
  const databaseService = new DatabaseService(dbServiceOptions);
  
  databaseService.init().then(() => {
    console.log('Database initialized successfully');
  }).catch((error) => {
    console.error('Error initializing database:', error);
  });
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}