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
    const usersCollection = db.collection('users');

    // get users 
   app.post('/users', async (req, res) => {
  try {
    const newUser = req.body;
    const email = newUser.email;

    if (!email) {
      return res.status(400).send({ error: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.send({ message: 'User already exists. No need to insert again' });
    }

    // Insert new user
    const result = await usersCollection.insertOne(newUser);
    res.send(result);

  } catch (error) {
    console.error("Error in /users:", error);
    res.status(500).send({ error: "Failed to save user", message: error.message });
  }
});


    
    // ✅ GET products (with optional email filter)
app.get('/products', async (req, res) => {
  try {
    const email = req.query.email; // check if email is sent as query
    let query = {};
    if (email) {
      query = { email: email }; // only this user's listings
    }

    const products = await productsCollection.find(query).toArray();
    res.send(products);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch products" });
  }
});


    app.get('/users', async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch users" });
  }
});
    // get latest products

    app.get("/products/latest", async (req, res) => {
  try {
    
    const latestProducts = await productsCollection
      .find({})
      .sort({ _id: -1 }) 
      .limit(6)
      .toArray();

    res.send(latestProducts); 
  } catch (error) {
    console.error("Error fetching latest products:", error);
    res.status(500).send({ message: "Server error" });
  }
});


// get products by category
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

    // ✅ DELETE product by ID
app.delete('/products/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).send({ error: "Product not found" });
    }
    res.send({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to delete product" });
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
