require("dotenv").config();
const express = require("express");

const cors = require("cors");
const app = express();
// UcDjSfPKO9CQVO65
// assignment-10
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.NAME}:${process.env.PASS}@cluster0.dfrdec8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// middlewere

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db = client.db("courses");
    const courseCollection = db.collection("course");

    const enrollCollection = db.collection("myEnroll");
    //   get all course data

    app.get("/all-course", async (req, res) => {
      const result = await courseCollection
        .find()
        .sort({ price: "asc" })
        .toArray();
      // console.log(result);
      res.send(result);
    });

    app.get("/all-course/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);
      const result = await courseCollection.findOne({ _id: objectId });
      res.send({
        success: true,
        result,
      });
    });

    // get only my course

    app.get("/my-course", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const result = await courseCollection
        .find({ created_by: email })
        .toArray();
      res.send(result);
    });

    // ------------------ Enroll a course ------------------
    app.post("/enroll", async (req, res) => {
      const enrollData = req.body;

      // prevent duplicate enroll
      const alreadyEnrolled = await enrollCollection.findOne({
        courseId: enrollData.courseId,
        studentEmail: enrollData.studentEmail,
      });

      if (alreadyEnrolled) {
        return res.send({ message: "Already Enrolled" });
      }

      const result = await enrollCollection.insertOne(enrollData);
      res.send(result);
    });

    // ------------------ Get my enrolled courses (POST) ------------------
    app.post("/my-enrolled-courses", async (req, res) => {
      const { email } = req.body;
      const result = await enrollCollection
        .find({ studentEmail: email })
        .toArray();
      res.send(result);
    });

    // ------------------ Get my enrolled courses (GET alternative) ------------------
    app.get("/my-enrolls", async (req, res) => {
      const email = req.query.email;
      const result = await enrollCollection
        .find({ studentEmail: email })
        .toArray();
      res.send(result);
    });

    app.put("/my-course/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;

      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const update = {
        $set: data,
      };
      const result = await courseCollection.updateOne(filter, update);

      res.send({
        success: true,
        result,
      });
    });

    // get popular courses here

    app.get("/popular-courses", async (req, res) => {
      const result = await courseCollection
        .find({ isFeatured: true })
        .sort({ price: "desc" })
        .toArray();
      // console.log(result);
      res.send(result);
    });
    // search function

    app.get("/search", async (req, res) => {
      try {
        const search_text = req.query.search || "";
        const result = await courseCollection
          .find({ title: { $regex: search_text, $options: "i" } })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });
    // get single course

    // post add course

    app.post("/all-course", async (req, res) => {
      const data = req.body;

      const result = await courseCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    // delete method

    app.delete("/my-course/:id", async (req, res) => {
      const { id } = req.params;
      const result = await courseCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send({
        success: true,
        result,
      });
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
