// Internal Import
import app from "./app.js";

// External Import
import mongoose from "mongoose";
import { config } from "dotenv";

//Call config
config();

//Listing a server on port 5000
const port = process.env.PORT || 5000;

//COnnection to MongoDB

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connected to MongoDB`);
  });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
