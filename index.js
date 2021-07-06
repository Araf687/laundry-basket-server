const express = require('express')
require('dotenv').config()
const bodyParser=require('body-parser');
const cors=require('cors');
const fileUpload=require('express-fileupload');
const fs=require('fs-extra');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmdkt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})



client.connect(err => {
  const orderCollection = client.db("LaundryBasket").collection("orders");
  const servicesCollection = client.db("LaundryBasket").collection("services");
  const reviewCollection = client.db("LaundryBasket").collection("userReviews");
  const AdminCollection = client.db("LaundryBasket").collection("admin");
  // perform actions on the collection object
  console.log('db connected')

  app.post('/addService',(req,res)=>{
      const title=req.body.title;
      const description=req.body.description;
        servicesCollection.insertOne({title,description})
        .then(result=>{
            res.send(result.insertedCount>0)
        })
    
  })

  app.post('/makeAdmin',(req,res)=>{
      const email=req.body;
      console.log(email);
      AdminCollection.insertOne(email)
      .then(result=>{
          res.send(result.insertedCount>0)
      })

  })
  app.post("/isAdmin",(req,res)=>{
    const email=req.body;
    console.log(email);
    AdminCollection.find({email:email.email})
    .toArray((error,admin)=>{
        console.log(admin);
      res.send(admin.length>0);

    })
  })
  app.post('/addReview',(req,res)=>{
    const review=req.body;
    console.log(review.data);
    reviewCollection.insertOne(review.data)
    .then(result=>{
        res.send(result.insertedCount>0)
    })
    .catch(error=>res.send(false))

})
app.get("/getReviews",(req,res)=>{
  console.log('finding reviews')
  reviewCollection.find({})
  .toArray((error,reviews)=>{
    res.send(reviews);

  })
})
app.get("/getServices",(req,res)=>{
  console.log('finding services')
  servicesCollection.find({})
  .toArray((error,services)=>{
    res.send(services);

  })
})

app.post('/addCourierDetails',(req,res)=>{
  const details=req.body;
  console.log(details);
  orderCollection.insertOne(details)
  .then(result=>{
      res.send(result.insertedCount>0)
  })

})
app.get("/getAllCourierDetails",(req,res)=>{
  console.log('finding all courier details')
  orderCollection.find({})
  .toArray((error,courierData)=>{
    console.log(courierData);
    res.send(courierData);

  })
})

app.post("/getCourierById",(req,res)=>{
  const email=req.body;
  console.log(email.historyData);
  orderCollection.find({email:email.email})
  .toArray((error,courierData)=>{
    res.send(courierData);

  })
})


app.patch('/manageService',(req,res)=>{
      const title=req.body.title;
      const description=req.body.description;
      console.log(title,description);
        servicesCollection.updateOne({title:title}, {
          $set: {
            title:title,
            image:image,
            description:description,
          }
        })
        .then(result => {
          res.send(result.modifiedCount>0);
        })
        .catch(error=>res.send(false))
      

})



}); 

app.listen(process.env.PORT||5000);