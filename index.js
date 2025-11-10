const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json())

const uri = "mongodb+srv://pawmartdb:G9uts0zHmy4ZjnRg@cluster0.mufxfps.mongodb.net/?appName=Cluster0";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/',(req,res)=>{
    res.send('Smart Server is running')
})

async function run(){
    try{
        await client.connect();

        const db = client.db('paw_db')
        const productsCollection =db.collection('products')

        app.get('/products', async (req, res) => {
     try {
         const products = await productsCollection.find({}).toArray();
             res.send(products);
       }
          catch (err) {
         console.error(err);
         res.status(500).send({ error: "Failed to fetch products" });
        }
        });

        app.post('/products',async(req,res)=>{
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct)
            res.send(result)
        })
       
        await client.db("admin").command({ping: 1});
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        
    }
    finally{

    }
}

run().catch(console.dir)

app.listen(port,()=>{
    console.log(`Smart server is running on port ${port}`, )
})