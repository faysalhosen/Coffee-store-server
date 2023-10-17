const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5005;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wzxk65v.mongodb.net/?retryWrites=true&w=majority`;
//console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const dbConnect = async () => {
  try {
    await client.connect();
    console.log("Database Connected successfully ✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

const coffeeCollection = client.db("coffeeDB").collection("coffee");
const userCollection = client.db("coffeeDB").collection("user");

app.get("/coffee", async (req, res) => {
  const cursor = coffeeCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

app.get("/coffee/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await coffeeCollection.findOne(query);
  res.send(result);
});

app.post("/coffee", async (req, res) => {
  const newCoffee = req.body;
  console.log(newCoffee);
  const result = await coffeeCollection.insertOne(newCoffee);
  res.send(result);
});

app.put("/coffee/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedCoffee = req.body;

  const coffee = {
    $set: {
      name: updatedCoffee.name,
      quantity: updatedCoffee.quantity,
      supplier: updatedCoffee.supplier,
      taste: updatedCoffee.taste,
      category: updatedCoffee.category,
      details: updatedCoffee.details,
      photo: updatedCoffee.photo,
    },
  };

  const result = await coffeeCollection.updateOne(filter, coffee, options);
  res.send(result);
});

app.delete("/coffee/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await coffeeCollection.deleteOne(query);
  res.send(result);
});

// user related apis
app.get("/user", async (req, res) => {
  const cursor = userCollection.find();
  const users = await cursor.toArray();
  res.send(users);
});

app.post("/user", async (req, res) => {
  const user = req.body;
  console.log(user);
  const result = await userCollection.insertOne(user);
  res.send(result);
});

app.patch("/user", async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const updateDoc = {
    $set: {
      lastLoggedAt: user.lastLoggedAt,
    },
  };
  const result = await userCollection.updateOne(filter, updateDoc);
  res.send(result);
});

app.delete("/user/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await userCollection.deleteOne(query);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("Coffee making server is running");
});

app.listen(port, () => {
  console.log(`Coffee Server is running on port: ${port}`);
});
