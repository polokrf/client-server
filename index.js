
const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors=require('cors')
const app = express();
const port = 5000;
const dns=require('dns')
app.use(cors());
app.use(express.json())

dns.setServers(['8.8.8.8', '8.8.4.4']);


const uri = process.env.DBURL;
  

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});




async function run() {
  // Connect the client to the server	(optional starting in v4.7)
  await client.connect();
  const myDB = client.db('client');
  const myColl = myDB.collection('client-tables');

  try {
    app.get('/get-client-data', async (req, res) => {
      const { search } = req.query;
      const query = {};
      if (search) {
        query.$or = [
          { client_name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
        ];
         
    }
      
      const result = await myColl.find(query).toArray();
      
      res.status(200).send(result);
    });

    app.patch('/update-status', async (req, res) => {
      const { id, status } = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          status: status,
        },
      };
      const result = await myColl.updateOne(query, update);
      res.status(200).send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!',
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});