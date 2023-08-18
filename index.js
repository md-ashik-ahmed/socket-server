const express = require("express");
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
app.use(cors());
const port = process.env.PORT || 5000;
app.use(express.json())


const corsConfig = {
    origin: '',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))

// verify jwt
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }
    // bearer token
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@teamhexacoders.ek82ng1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const usersCollection = client.db("jobstack-database").collection('users');
        const jobsCollection = client.db("jobstack-database").collection('jobs');
        const selfpostCollection = client.db("jobstack-database").collection('selfpost');
        const educationCollection = client.db("jobstack-database").collection('education');
        const skillsCollection = client.db("jobstack-database").collection('skills');
        const projectCollection = client.db("jobstack-database").collection('project');
        const worksCollection = client.db("jobstack-database").collection('experience');


        // verify jwt this api sequre to website user must verify
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            console.log(token);
            res.send({ token });
        });

        // allusers get this api just admin get   
        app.get('/users', verifyJWT, async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        // this api job find single email data and provide to user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.find({ email: email }).toArray();
            res.send(result);
        })

        // update information user specific id 


        // app.put("/users/:id", async (req, res) => {
        //   const id = req.params.id;
        //   const body = req.body;
        //   console.log(body);
        //   const filter = { _id: new ObjectId(id) };
        //   const updateDoc = {
        //     $set: {
        //       name : body.name,
        //       quantity: body.quantity,
        //       price: body.price,
        //       description : body.description,
        //       seller : body.seller,
        //       picture : body.picture
        //     },
        //   };
        //   const result = await toyCollection.updateOne(filter, updateDoc);
        //   res.send(result);
        // });



      app.put('/profile/:id', async (req, res) => {
        const id = req.params.id;
        const bgImage = req.body.bgImage;
        const image = req.body.image;
        const filter = { _id: new ObjectId(id) };
        if(bgImage){
          const updateDoc = {
            $set: {
              bgImage: bgImage,
            }
         }

        const options = { upsert: true };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.send(result);

       }else{
        const updateDoc = {
          $set: {
            image: image
          }
       }
       const options = { upsert: true };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.send(result);

       }
        
    });





      app.put('/contactinfo/:id', async (req, res) => {
        const id = req.params.id;
        const phoneNumber = req.body.phoneNumber;
        const currentLocation = req.body.currentLocation;
        const homeLocation = req.body.homeLocation;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
                phoneNumber: phoneNumber,
                currentLocation: currentLocation,
                homeLocation: homeLocation,
            },
        };
        const options = { upsert: true };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    });




      app.put('/basicinfo/:id', async (req, res) => {
        const id = req.params.id;
        const gender = req.body.gender;
        const language = req.body.language;
        const date = req.body.date;
        const month = req.body.month;
        const year = req.body.year;
        const hobbys = req.body.hobbys;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
                gender: gender,
                language: language,
                date: date,
                month: month,
                year: year,
                hobbys: hobbys
            },
        };
        const options = { upsert: true };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    });



        //alluser data post this api 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ error: "user Alredy exsits" })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });



    //==========================================================================

        
      //   get job related api

      app.get('/job', async (req, res) => {
        console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
            query = { email: req.query.email }
        }
        const result = await jobsCollection.find(query).toArray();
        res.send(result);
    })



    // get email by job post

    app.get("/job/:email", async(req, res) =>{
        console.log(req.params.email);
        const result = await jobsCollection
        .find({email : req.params.email})
        .toArray()
        res.send(result)
    });


    // job post related api

    app.post("/job", async (req, res) => {
        const body = req.body;
        console.log(body);
        const result = await jobsCollection.insertOne(body);
        if (result?.insertedId) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send({
            message: "can not insert try again leter",
            status: false,
          });
        }
      });



    // self post related api

    app.get('/selfpost', async (req, res) => {
        console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
            query = { email: req.query.email }
        }
        const result = await selfpostCollection.find(query).toArray();
        res.send(result);
    })



    // selfpost by email api

    app.get("/selfpost/:email", async(req, res) =>{
        console.log(req.params.email);
        const result = await selfpostCollection
        .find({email : req.params.email})
        .toArray()
        res.send(result)
    });



    // self post related api

    app.post("/selfpost", async (req, res) => {
        const body = req.body;
        console.log(body);
        const result = await selfpostCollection.insertOne(body);
        if (result?.insertedId) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send({
            message: "can not insert try again leter",
            status: false,
          });
        }
      });



      // self post delete related api

      app.delete("/selfpost/:id", async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await selfpostCollection.deleteOne(query)
        res.send(result)
    })



    //   Education get by email related API

    app.get("/education/:email", async(req, res) =>{
        console.log(req.params.email);
        const result = await educationCollection
        .find({email : req.params.email})
        .toArray()
        res.send(result)
    });


    // Education post related api

    app.post("/education", async (req, res) => {
        const body = req.body;
        console.log(body);
        const result = await educationCollection.insertOne(body);
        if (result?.insertedId) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send({
            message: "can not insert try again leter",
            status: false,
          });
        }
      });



    //   Skills get by email related API

    app.get("/skills/:email", async(req, res) =>{
        console.log(req.params.email);
        const result = await skillsCollection
        .find({email : req.params.email})
        .toArray()
        res.send(result)
    });


    // Skills post related api

    app.post("/skills", async (req, res) => {
        const body = req.body;
        console.log(body);
        const result = await skillsCollection.insertOne(body);
        if (result?.insertedId) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send({
            message: "can not insert try again leter",
            status: false,
          });
        }
      });



    //   Works get by email related API

    app.get("/works/:email", async(req, res) =>{
        console.log(req.params.email);
        const result = await worksCollection
        .find({email : req.params.email})
        .toArray()
        res.send(result)
    });


    // Works post related api

    app.post("/works", async (req, res) => {
        const body = req.body;
        console.log(body);
        const result = await worksCollection.insertOne(body);
        if (result?.insertedId) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send({
            message: "can not insert try again leter",
            status: false,
          });
        }
      });




    //   Projects get by email related API

    app.get("/project/:email", async(req, res) =>{
        console.log(req.params.email);
        const result = await projectCollection
        .find({email : req.params.email})
        .toArray()
        res.send(result)
    });


    //  Projects post related api

    app.post("/project", async (req, res) => {
        const body = req.body;
        console.log(body);
        const result = await projectCollection.insertOne(body);
        if (result?.insertedId) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send({
            message: "can not insert try again leter",
            status: false,
          });
        }
      });




    // ======================================================================




        await client.db("admin").command({ ping: 1 });
        console.log("Jobstack Network bullidng platfrom server successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Jobstack Network bullidng platfrom server is running");
})

app.listen(port, (req, res) => {
    console.log(`Jobstack Network bullidng platfrom server is running on port ${port}`)
})