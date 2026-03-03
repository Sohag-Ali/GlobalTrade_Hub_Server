const express = require('express');
const oors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Midelwre
app.use(oors());
app.use(express.json());

const uri = "mongodb+srv://GlobalTradeHub:Nabv9wth2sqv7HK1@cluster0.tav8afj.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();

    const db = client.db("GlobalTradeHub");
    const productsCollection = db.collection("products");

    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });







    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('GlobalTrade Hub is running');
})

app.listen(port, () => {
  console.log(`GlobalTrade Hub listening on port ${port}`)
})

