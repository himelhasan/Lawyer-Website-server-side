const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.verqpx7.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const servicesCollection = client.db("lawyerServices").collection("allServices");
    const allReviewsCollection = client.db("lawyerServices").collection("reviews");

    // three services for home
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });

    // all services

    app.get("/allservices", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = await servicesCollection.estimatedDocumentCount();
      res.send({ count, services });
    });
    // services api to create new service

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });
    // services api to get id basis services

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    // reviews collection
    // create new review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await allReviewsCollection.insertOne(review);
      res.send(result);
    });
    // get reviews
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.serviceId) {
        query = {
          serviceId: req.query.serviceId,
        };
      }
      const cursor = allReviewsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // reviuews querty according to email
    app.get("/myReviews", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          userEmail: req.query.email,
        };
      }
      const cursor = allReviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);

      // delete review

      app.delete("/reviews/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await allReviewsCollection.deleteOne(query);
        res.send(result);
      });
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Photographer car server is running");
});

app.listen(port, () => {
  console.log("server is running");
});
