const { MongoClient, ServerApiVersion, ObjectId, ObjectID } = require('mongodb');
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const app = express();


//middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;


//VERIFIED JWT
function verifyJWT (req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: "unauthorized access"})
    }
    const token = authHeader.split(' ')[1]; 
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded)=> {
        if(err){
            return res.status(403).send({message :'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
};



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5ni8yjd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){

    try{

        await client.connect();
        const productCollection = client.db('product').collection('items');
        const selectItemCollection = client.db('select_item').collection('product');
    
        //GET PRODUCT
        app.get('/products', async(req, res)=>{

            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            const cursor = productCollection.find(query);

            let products;
            
            if(page || size){
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }
            res.send(products);
        });

        //GET COUNT
        app.get('/productCount', async(req, res)=> {
            const count = await productCollection.estimatedDocumentCount();
            res.send({count});
        });


        //POST PRODUCT
        app.post('/product', async(req, res)=> {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });

        //POST SELECT ITEM
        app.post('/selectitem', async(req, res)=> {
            const selectItem = req.body;
            const result = await selectItemCollection.insertOne(selectItem);
            res.send(result);
        });

        //GET SELECTED COUNT
        app.get('/selectedCount', async(req, res)=> {
            const count = await selectItemCollection.estimatedDocumentCount();
            res.send({count});
        })

        //GET SELECTITEM
        app.get('/selectitem', verifyJWT, async(req, res)=> {

            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            if(email === decodedEmail){

                const query = {email:email};
                const cursor = selectItemCollection.find(query);

                let selectedItem;

                if(page || size){
                        selectedItem = await cursor.skip(page*size).limit(size).toArray();
                }
                else{
                        selectedItem = await cursor.toArray();
                }
                res.send(selectedItem);
            }
            else{
                res.status(403).send({message: 'Forbidden access'});
            }
        });

        //DELETE SELECT ITEM
        app.delete('/selectitem/:id', async(req, res)=> {
            const _id = req.params.id;
            const query = {_id};
            const result = await selectItemCollection.deleteOne(query);
            res.send(result);
        })



        //AUTH
        app.post('/login', async(req, res)=> {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({accessToken});
        });

    }
    finally{}

};
run().catch(console.dir);


app.get('/test', (req, res)=> {
    res.send('Testing backend server');
})

app.listen(port, ()=> {
    console.log('Listening port', port);
});
