const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;


// const admin = require("firebase-admin");

// const serviceAccount = require("./firebaseAdmin.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


// Midelwre
app.use(cors());
app.use(express.json());

// MongoDB connection

// const verifyFirebaseToken = async (req, res, next) => {
//   const authHeader = req.headers.authorization;   
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).send({ error: "Unauthorized" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
    
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     req.user = decodedToken;
//     next();
//   } catch (error) {
//     console.error("Error verifying token:", error);
//     return res.status(401).send({ error: "Unauthorized" });
//   }
// };



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tav8afj.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// API Endpoints
async function run() {
  try {
    await client.connect();

    const db = client.db("GlobalTradeHub");
    const usersCollection = db.collection("users");
    const productsCollection = db.collection("products");
    const importsCollection = db.collection("imports");

    // User APIs
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
    
    // Search products by name
    app.get("/products", async (req, res) => {
      const search = req.query.search || "";

      const query = {
        productName: { $regex: search, $options: "i" },
      };

      const result = await productsCollection.find(query).toArray();

      res.send(result);
    });

    // Get latest 6 products
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


    // Get product details by ID
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });


    // Update available quantity after import
    app.patch("/products/import/:id", async (req, res) => {
      const id = req.params.id;
      const importQuantity = req.body.quantity;

      const query = { _id: new ObjectId(id) };

      const updateDoc = {
        $inc: { availableQuantity: -importQuantity },
      };

      const result = await productsCollection.updateOne(query, updateDoc);

      res.send(result);
    });

    // app.get("/products", async (req, res) => {
    //   const result = await productsCollection.find().toArray();
    //   res.send(result);
    // });

    // app.delete("/products/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await productsCollection.deleteOne(query);
    //   res.send(result);
    // });

    // Imports APIs
    app.post("/imports", async (req, res) => {
      const importData = req.body;
      const result = await importsCollection.insertOne(importData);
      res.send(result);
    });

    // app.get("/imports", async (req, res) => {
    //   const result = await importsCollection.find().toArray();
    //   res.send(result);
    // });

    // Get imports by importer email
    app.get("/imports", async (req, res) => {
      const email = req.query.email;

      const query = { importerEmail: email };

      const result = await importsCollection.find(query).toArray();

      res.send(result);
    });


    // Get import details by ID
    app.delete("/imports/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await importsCollection.deleteOne(query);

      res.send(result);
    });

    // Get exports by exporter email
    app.get("/my-exports", async (req, res) => {
      const email = req.query.email;

      const query = { exporterEmail: email };

      const result = await productsCollection.find(query).toArray();

      res.send(result);
    });

    // Delete product by ID
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await productsCollection.deleteOne(query);

      res.send(result);
    });

    // Update product details by ID
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;

      const updatedData = req.body;

      const query = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: updatedData,
      };

      const result = await productsCollection.updateOne(query, updateDoc);

      res.send(result);
    });

    // app.get("/imports", async (req, res) => {
    //   const email = req.query.email;
    //   const query = {};
    //   if (email) {
    //     query.importerEmail = email;
    //   }
    //   const result = await importsCollection.find(query).toArray();
    //   res.send(result);
    // });

    // await client.db("admin").command({ ping: 1 });
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
