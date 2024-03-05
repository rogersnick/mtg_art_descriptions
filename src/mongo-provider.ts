
import { MongoClient, ServerApiVersion } from 'mongodb';

/*
  Make sure to set MONGO_CONNECTION_STRING environment variable 
*/
class MongoProvider {
    public client: MongoClient;
    constructor() {
        // Create a MongoClient with a MongoClientOptions object to set the Stable API version
        this.client =  new MongoClient(
            process.env.MONGO_CONNECTION_STRING!,
            {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                }
            }
        );
    }

     async init(): Promise<void> {
        await this.client.connect();
    }
}


export { MongoProvider }
