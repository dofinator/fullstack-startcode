import { IFriend } from "../interfaces/IFriend";
import { Db, Collection } from "mongodb";
import bcrypt from "bcryptjs";
import { ApiError } from "../errors/apierror";
import Joi, { ValidationError } from "joi";
import { IfStatement } from "typescript";

const BCRYPT_ROUNDS = 10;

const USER_INPUT_SCHEMA = Joi.object({
  firstName: Joi.string().min(2).max(40).required(),
  lastName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(4).max(30).required(),
  email: Joi.string().email().required(),
  // role: Joi.string().valid("user", "admin").required(),
});

class FriendsFacade {
  db: Db;
  friendCollection: Collection;

  constructor(db: Db) {
    this.db = db;
    this.friendCollection = db.collection("friends");
  }

  /**
   *
   * @param friend
   * @throws ApiError if validation fails
   */
  // **DONE*
  async addFriend(friend: IFriend): Promise<IFriend | null> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400);
    }
    try {
      const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
      const f = { ...friend, password: hashedpw, role: "user" };
      const result = await this.friendCollection.insertOne({ ...f });
      return await this.friendCollection.findOne({ email: f.email });
    } catch (error) {
      throw new ApiError(error);
    }
  }

  /**
   * TODO
   * @param email
   * @param friend
   * @throws ApiError if validation fails or friend was not found
   */
  async editFriend(
    email: string,
    friend: IFriend
  ): Promise<{ modifiedCount: number }> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400);
    }
    const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
    const f = { ...friend, password: hashedpw };
    //console.log({...f})
    const uFriend = await this.friendCollection.updateOne(
      { email: email },
      { $set: { ...f } }
    );
    //console.log({...f})
    return uFriend;
  }

  /**
   *
   * @param friendEmail
   * @returns true if deleted otherwise false
   */
  async deleteFriend(friendEmail: string): Promise<boolean> {
    const friend = await this.friendCollection.deleteOne({
      email: friendEmail,
    });
    if (friend.result.n === 1) {
      return true;
    }
    return false;
  }

  async getAllFriends(): Promise<Array<IFriend>> {
    const users: unknown = await this.friendCollection.find({}).toArray();
    return users as Array<IFriend>;
  }

  /**
   *
   * @param friendEmail
   * @returns
   * @throws ApiError if not found
   */
  async getFriend(friendEmail: string): Promise<IFriend> {
    const friend = await this.friendCollection.findOne({
      email: friendEmail,
    });
    return friend;
  }

  /**
   * Use this method for authentication
   * @param friendEmail
   * @param password
   * @returns the user if he could be authenticated, otherwise null
   */
  async getVerifiedUser(
    friendEmail: string,
    password: string
  ): Promise<IFriend | null> {
    const friend: IFriend = await this.friendCollection.findOne({
      email: friendEmail,
    });
    if (friend && (await bcrypt.compare(password, friend.password))) {
      return friend;
    }
    return Promise.resolve(null);
  }
}

export default FriendsFacade;
