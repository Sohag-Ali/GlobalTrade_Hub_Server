const express = require("express");
const oors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// Midelwre
app.use(oors());
app.use(express.json());

const uri =
  "mongodb+srv://GlobalTradeHub:Nabv9wth2sqv7HK1@cluster0.tav8afj.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("GlobalTradeHub");
    const usersCollection = db.collection("users");
    const productsCollection = db.collection("products");
    const importsCollection = db.collection("imports");

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res
          .status(400)
          .send({ error: "User with this email already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //Product APIs
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.get("/latest-products", async (req, res) => {
      const result = await productsCollection
        .find()
        .sort({
          createdAt: -1,
        })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // Imports APIs
    app.post("/imports", async (req, res) => {
      const importData = req.body;
      const result = await importsCollection.insertOne(importData);
      res.send(result);
    });

    app.get("/imports", async (req, res) => {
      const result = await importsCollection.find().toArray();
      res.send(result);
    });

    app.get("/imports", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.importerEmail = email;
      }
      const result = await importsCollection.find(query).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("GlobalTrade Hub is running");
});

app.listen(port, () => {
  console.log(`GlobalTrade Hub listening on port ${port}`);
});
