const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mufxfps.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Smart Server is running');
});

async function run() {
  try {
    await client.connect();
    const db = client.db('paw_db');
    const productsCollection = db.collection('products');
    const usersCollection = db.collection('users');
    const ordersCollection = db.collection('orders');

    
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const email = newUser.email;
      if (!email) return res.status(400).send({ error: "Email is required" });

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) return res.send({ message: 'User already exists' });

      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    app.get('/users', async (req, res) => {
      const users = await usersCollection.find({}).toArray();
      res.send(users);
    });

    
    app.get('/products', async (req, res) => {
      const email = req.query.email;
      const query = email ? { email } : {};
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    });

    app.get('/products/latest', async (req, res) => {
      const latest = await productsCollection.find({}).sort({ _id: -1 }).limit(6).toArray();
      res.send(latest);
    });

    app.get('/products/category/:categoryName', async (req, res) => {
      const categoryName = req.params.categoryName;
      const products = await productsCollection.find({ category: categoryName }).toArray();
      res.send(products);
    });

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const product = await productsCollection.findOne({ _id: new ObjectId(id) });
      if (!product) return res.status(404).send({ error: "Product not found" });
      res.send(product);
    });

    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // ✅ ORDERS (moved inside)
    app.post('/orders', async (req, res) => {
      try {
        const order = req.body;
        const result = await ordersCollection.insertOne(order);
        res.send(result);
      } catch (err) {
        console.error("Error saving order:", err);
        res.status(500).send({ error: "Failed to save order" });
      }
    });

    app.get('/orders', async (req, res) => {
      try {
        const email = req.query.email;
        const query = email ? { buyerEmail: email } : {};
        const orders = await ordersCollection.find(query).toArray();
        res.send(orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send({ error: "Failed to fetch orders" });
      }
    });

    console.log("✅ Connected to MongoDB successfully!");
  } finally {
    // You can close the client if needed
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Smart server is running on port ${port}`);
});
