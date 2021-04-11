import path from "path";
import { expect } from "chai";
import app from "../src/app";

import supertest from "supertest";
const request = supertest(app);

import bcryptjs from "bcryptjs";
import * as mongo from "mongodb";
import { InMemoryDbConnector } from "../src/config/dbConnector";
import FriendsFacade from "../src/facades/friendFacade";
import { ApiError } from "../src/errors/apierror";

let friendCollection: mongo.Collection;

describe("### Describe the Friend Endpoints (/api/friends) ###", function () {
  let URL: string;

  before(async function () {
    const client = await InMemoryDbConnector.connect();
    const db = client.db();
    friendCollection = db.collection("friends");
    app.set("db", db);
  });

  beforeEach(async function () {
    const hashedPW = await bcryptjs.hash("secret", 8);
    await friendCollection.deleteMany({});
    await friendCollection.insertMany([
      {
        firstName: "Peter",
        lastName: "Pan",
        email: "pp@b.dk",
        password: hashedPW,
        role: "user",
      },
      {
        firstName: "Donald",
        lastName: "Duck",
        email: "dd@b.dk",
        password: hashedPW,
        role: "user",
      },
      {
        firstName: "Ad",
        lastName: "Admin",
        email: "aa@a.dk",
        password: hashedPW,
        role: "admin",
      },
    ]);
  });

  //In this, and all the following REMOVE tests that requires authentication if you are using the simple version of friendRoutes
  describe("While attempting to get all users", function () {
    it("it should get two users when authenticated", async () => {
      const response = await request
        .get("/api/friends/all")
        .auth("pp@b.dk", "secret");
      expect(response.status).to.equal(200);
      //console.log(response.body)
      expect(response.body.length).to.equal(3);
    });

    it("it should get a 401 when NOT authenticated", async () => {
      const response = await request.get("/api/friends/all");
      expect(response.status).to.equal(401);
    });
  });

  describe("While attempting to add a user", function () {
    it("it should Add the user Jan Olsen", async () => {
      const newFriend = {
        firstName: "Jan",
        lastName: "Olsen",
        email: "jan@b.dk",
        password: "secret",
      };
      const response = await request.post("/api/friends").send(newFriend);
      expect(response.status).to.equal(200);
      expect(response.body.id).to.be.not.null;
    });

    it("It should fail to Add user due to wrong password length", async () => {
      const newFriend = {
        firstName: "Jan",
        lastName: "Olsen",
        email: "jan@b.dk",
        password: "se",
      };
      const response = await request.post("/api/friends").send(newFriend);
      //console.log(response.text);
      expect(response.status).to.equal(400);
    });
  });

  describe("While logged in as a user", function () {
    it("It should return the logged in user", async () => {
      const response = await request
        .get("/api/friends/me")
        .auth("pp@b.dk", "secret");
      //console.log("***********" + response.body.firstName)
      expect(response.body.firstName).equal("Peter");
    });
    it("It should return not authenticated when trying to acces /me endpoint", async () => {
      const response = await request
        .get("/api/friends/me")
        .auth("asd@asd.dk", "ost");
      console.log("tstØØØØØØØØØØØØ " + response.status);
      expect(response.status).equals(401);
    });
    it("It should edit the logged in user", async () => {
      const editFriend = {
        firstName: "Jan ",
        lastName: "Pedersen",
        email: "jan@b.dk",
        password: "secret",
      };
      const response = await request
        .put("/api/friends/editme")
        .auth("pp@b.dk", "secret")
        .send(editFriend);

      //console.log("***************" + response);
      expect(response.body).equal(1);
    });
  });

  describe("While verifying the get any user, given a userId (email)", function () {
    xit("It should allow an admin user to find Donald Duck", async () => {
      const response = await request
        .get("/api/friends/find-user/dd@b.dk")
        .auth("aa@a.dk", "secret");
      //console.log("*************" + response)
      expect(response.body.firstName).equal("Donald");
    });
    xit("It should not, allow admin-users to find a non-existing user", async () => {
      const response = await request
        .get("/api/friends/find-user/dd3@b.dk")
        .auth("aa@a.dk", "secret");
      //console.log("*************" + response)
      expect(response.status).equal(500);
    });

    it("It should not let a non-admin user find Donald Duck", async () => {
      const response = await request
        .get("/api/friends/find-user/pp@b.dk")
        .auth("dd@b.dk", "secret");
      //console.log("*************" + response.status)
      expect(response.status).equal(401);
    });
  });

  describe("While verifying the 'edit any user', given a userId (email)", function () {
    xit("It should allow an admin-user to edit Peter Pan", async () => {
      const editFriend = {
        firstName: "Jan ",
        lastName: "Pedersen",
        email: "jan@b.dk",
        password: "secret",
      };
      const response = await request
        .put("/api/friends/editme")
        .auth("aa@a.dk", "secret")
        .send(editFriend);
      //console.log("***************" + response);
      expect(response.body).equal(1);
    });
    xit("It should NOT allow a non-admin user to edit Peter Pan", async () => {
      const editFriend = {
        firstName: "Peter",
        lastName: "Pan2",
        email: "pp@b.dk",
        password: "secret",
      };
      const response = await request
        .put("/api/friends/pp@b.dk")
        .auth("@b.dk", "secret")
        .send(editFriend);
      //console.log("***************" + response);
      expect(response.status).equal(401);
    });
  });
});
