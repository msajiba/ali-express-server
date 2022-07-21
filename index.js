const { MongoClient, ServerApiVersion, ObjectId, ObjectID } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();


//middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5ni8yjd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){

    try{

        await client.connect();
        const productCollection = client.db('product').collection('items');
        const selectItemCollection = client.db('select_item').collection('product');
    
        //GET PRODUCT
        app.get('/products', async(req, res)=>{
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
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

        //GET SELECTITEM
        app.get('/selectitem', async(req, res)=> {
            const email = req.query.email;
            const query = {email:email};
            const cursor = selectItemCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        //DELETE SELECT ITEM
        app.delete('/selectitem/:id', async(req, res)=> {
            const _id = req.params.id;
            const query = {_id};
            const result = await selectItemCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally{}

};
run().catch(console.dir);


app.get('/', (req, res)=> {
    res.send('hello testing');
})

app.listen(port, ()=> {
    console.log('Listening port', port);
});
