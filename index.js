const express = require('express')
const app = express()
const port = 5000
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;
 

app.get('/', (req, res) => {
  res.send('Hello World!')
})

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
    const database = client.db("hire_hub_db");
    const jobsCollection = database.collection("jobs");
    const companiesCollection = database.collection("companies");

    app.post('/api/addjob', async (req, res) => {
      const job = req.body;
      const result = await jobsCollection.insertOne(job);
      res.send(result);
    });
    app.get(`/api/jobs`, async (req, res) => {
        const query = {};
        req.query.companyId && (query.companyId = req.query.companyId);
        req.query.status && (query.status = req.query.status);
        req.query.isRemote && (query.isRemote = req.query.isRemote === 'true');
        const jobs = await jobsCollection.find(query).toArray();
        res.send(jobs); 
    }); 
    app.post('/api/addcompany', async (req, res) => {
      const company = req.body;
      const result = await companiesCollection.insertOne(company);
      res.send(result);
    });
    app.get(`/api/companies`, async (req, res) => {
      const companiesId = req.params.id;
      const query = {};
      companiesId && (query._id = new ObjectId(companiesId));
      const companies = await companiesCollection.find(query).toArray();
      res.send(companies);
    });
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}
run().catch(console.dir);