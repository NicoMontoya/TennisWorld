import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
console.log(`Using connection string: ${uri.replace(/:[^:]*@/, ':****@')}`);

const client = new MongoClient(uri);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    const database = client.db('tennisworld');
    const playersCollection = database.collection('players');
    
    // Create a sample document
    const samplePlayer = {
      player_id: 1,
      player_name: 'Novak Djokovic',
      country: 'SRB',
      type: 'ATP',
      rank: 1,
      points: 11245,
      movement: 0
    };
    
    // Insert the sample document
    console.log('Inserting sample player...');
    const result = await playersCollection.insertOne(samplePlayer);
    console.log(`Inserted sample player with ID: ${result.insertedId}`);
    
    // Find the document to verify it was inserted
    console.log('Finding the inserted player...');
    const foundPlayer = await playersCollection.findOne({ player_id: 1 });
    console.log('Found player:', foundPlayer);
    
    // Delete the sample document
    console.log('Deleting the sample player...');
    await playersCollection.deleteOne({ player_id: 1 });
    console.log('Sample player deleted');
    
  } catch (error) {
    console.error('Error connecting to MongoDB:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

run().catch(console.dir);
