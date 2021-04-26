import { makeExecutableSchema } from "graphql-tools";
import { resolvers } from "./resolvers";

const typeDefs = `
    type Friend {
        id: ID
        firstName: String
        lastName: String
        gender: Gender
        email: String
        role: String

    }

    enum Gender {
        MALE
        FEMALE
        OTHER
    }
    
    """
    Queries available for Friends
    """
     type Query {
        getFriendByEmail(input: String): Friend
        allFriends: [Friend]!
        
    }
    input FriendInput {
        firstName: String!
        lastName: String!
        password: String!
        email: String!
        gender: Gender!
    }
    

    type Mutation {
        createFriend(input: FriendInput): Friend
        updateFriend(input: FriendInput): Friend
        deleteFriend(id: ID!): String
    }
        
    
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export { schema };
