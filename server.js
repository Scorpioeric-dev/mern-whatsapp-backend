//require import
import express from "express";
import Messages from "./dbMessages.js";
import mongoose from "mongoose";
import Pusher from "pusher";
// import cors from "cors ";

//app config
const app = express();
const PORT = process.env.PORT || 9000;
//middleware

// app.use(cors());
app.use(express.json());

//Not secured

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
  });

//Pusher & Mongoose integration into app to >> test << always use postman & pusher(must be open when testing endpoints) to real time checking on endpoints//

const pusher = new Pusher({
  appId: "1131711",
  key: "62eff83d674f3cc8aa7b",
  secret: "5e939e4f3137d4c56a66",
  cluster: "us3",
  useTLS: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB Connected");

  const msgCollection = db.collection("messagecontents");

  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    // console.log("A Change occured", change);

    if (change.operationType == "insert") {
      const messageDetails = change.fullDocument;

      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
});





//DB config
// cYebkn2MVNXwQSLU
const connection_url =
  "mongodb+srv://admin:cYebkn2MVNXwQSLU@cluster0.anvwt.mongodb.net/whatsapp?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ??
// api routes
//base URL
app.get("/", (req, res) => res.status(200).send("hello world"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    }
    res.status(200).send(data);
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

//listener
app.listen(PORT, () => {
  console.log(`We have ${PORT} honey's coming over!!`);
});
