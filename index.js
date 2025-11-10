const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://pawmartdb:G9uts0zHmy4ZjnRg@cluster0.mufxfps.mongodb.net/?appName=Cluster0";
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

    // 1️⃣ GET all products
    app.get('/products', async (req, res) => {
      try {
        const products = await productsCollection.find({}).toArray();
        res.send(products);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch products" });
      }
    });

    // 2️⃣ GET products by category
    app.get('/products/category/:categoryName', async (req, res) => {
      const categoryName = req.params.categoryName;
      try {
        const products = await productsCollection.find({ category: categoryName }).toArray();
        res.send(products);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch products by category" });
      }
    });

    // 3️⃣ GET product by ID
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const product = await productsCollection.findOne({ _id: new ObjectId(id) });
        if (!product) return res.status(404).send({ error: "Product not found" });
        res.send(product);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch product by ID" });
      }
    });

    // 4️⃣ POST new product
    app.post('/products', async (req, res) => {
      const { name, image, category, location, description, email, date } = req.body;
      if (!name || !image || !category) {
        return res.status(400).send({ error: "Missing required fields: name, image, category" });
      }
      try {
        const result = await productsCollection.insertOne({ name, image, category, location, description, email, date });
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to add new product" });
      }
    });

    console.log("Connected to MongoDB successfully!");
  } finally {
    // You can close the client when needed
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Smart server is running on port ${port}`);
});
