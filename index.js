const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.lo1m20r.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("toysDB").collection("toys");

    const indexKeys = { name: 1, category: 1 }; 
    const indexOptions = { name: "nameCategory" }; 
    const result = await toysCollection.createIndex(indexKeys, indexOptions);
    
    
    app.get('/toys/:text', async(req, res) => {
      if(req.params.text == 'Sports' || req.params.text == 'Truck' || req.params.text == 'Regular'){
        const result = await toysCollection.find({category: req.params.text}).sort({createdAt: -1}).toArray();
        return res.send(result);
      }
      const result = await toysCollection.find().toArray();
      res.send(result);
     
      
    });

    app.get('/allToys', async(req, res) =>{
      const result = await toysCollection.find().limit(20).sort({createdAt: -1}).toArray();
      res.send(result);
    });

    app.get("/searchToyByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toysCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },
            { category: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });


    app.get('/myToys', async(req, res) => {
      
      let query = {};
      if(req.query?.email){
        query = { email: req.query.email }
      }
      const result = await toysCollection.find(query).sort({createdAt: -1}).toArray();
      res.send(result);
    });

    app.get('/myToys/:id', async(req, res,)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.findOne(query);
      res.send(result);

    });
    

    app.post('/toys', async(req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      console.log(body);
      const result = await toysCollection.insertOne(body);
      res.send(result);
    });

    app.delete('/toys/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('crazy car server is running');
});

app.listen(port, () => {
    console.log(`crazy car server is running on port: ${port}`);
});