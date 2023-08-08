const express = require("express");
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
app.use(cors());
const port = process.env.PORT | 5000;
app.use(express.json())

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
        await client.connect();
        const usersCollection = client.db("jobstack-database").collection('users');


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