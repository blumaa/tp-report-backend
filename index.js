//index.js
import express from "express";
import bodyParser from "body-parser";
import graphqlHTTP from "express-graphql";
import cors from "cors";
import mongoose from "mongoose";
import graphQLSchema from "./graphql/schema";
import graphQLResolvers from "./graphql/resolvers";
import schema from './graphql/schema/schema'
require("dotenv").config();

const app = express();

app.use(cors());

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

// app.use(
//   "/graphql",
//   graphqlHTTP({
//     schema: graphQLSchema,
//     rootValue: graphQLResolvers,
//     graphiql: true
//   }),
//   bodyParser.json()
// );

function main() {
  const port = process.env.PORT || 8080;
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-om3us.mongodb.net/test?retryWrites=true&w=majority`;
  // console.log(uri)
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      app.listen(port, () =>
        console.log(`Server is listening on port: ${port}`)
      );
    })
    .catch(err => {
      console.log("there is an error:", err);
    });
}
main();
