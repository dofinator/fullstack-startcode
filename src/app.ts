import express from "express";
import dotenv from "dotenv";
import path from "path";
import { ApiError } from "./errors/apierror";
import friendsRoutesAuth from "./routes/FriendRoutesAuth";
import { Request, Response, NextFunction } from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./graphql/shcema";
import authMiddleware from "./middleware/basic-auth";

dotenv.config();
const debug = require("debug")("app");
const app = express();

app.use(express.json());

const USE_AUTHENTICATION = !process.env.SKIP_AUTHENTICATION;

app.use((req, res, next) => {
  debug(new Date().toLocaleDateString(), req.method, req.originalUrl, req.ip);
  next();
});

//app.use("/graphql", authMiddleware)

app.use("/graphql", (req, res, next) => {
  const body = req.body;
  
  if (body && body.query && body.query.includes("createFriend")) {
    console.log("Create");
    return next();
  }
  if (body && body.operationName && body.query.includes("IntrospectionQuery")) {
    return next();
  }
  if (USE_AUTHENTICATION && body.query && (body.mutation || body.query)) {
    return authMiddleware(req, res, next);
  }
  next();
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api/friends", friendsRoutesAuth);

app.get("/demo", (req, res) => {
  res.send("Server is up");
});

//Our own default 404-handler for api-requests
app.use("/api", (req: any, res: any, next) => {
  res.status(404).json({ errorCode: 404, msg: "not found" });
});

//Makes JSON error-response for ApiErrors, otherwise pass on to default error handleer
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    res
      .status(err.errorCode)
      .json({ errorCode: err.errorCode, msg: err.message });
  } else {
    next(err);
  }
});

export default app;
