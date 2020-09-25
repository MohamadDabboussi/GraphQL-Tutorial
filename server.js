const express=require('express')
const app=express()
const expressGraphQL= require('express-graphql')
const mongoose = require('mongoose')
const cors =require('cors')
app.use(cors())

mongoose.connect('mongodb://localhost/Rainmakers', { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

const rainmakerSchema = new mongoose.Schema({
  id:Number,
  firstName:String,
  lastName: String,
  username: {type :String, unique:true,required:true},
  email: String,
  age:Number
},
{collection:'RAINMAKERS'}
)

const{
GraphQLSchema,
GraphQLObjectType,
GraphQLString,
GraphQLList,
GraphQLNonNull,
GraphQLInt,
} = require('graphql')




const rainmakertype =new GraphQLObjectType({
    name: 'Rainmaker',
    description: 'This represents a rainmaker',
    fields: () => ({
        id: {type:GraphQLNonNull(GraphQLInt)} ,
        firstName: {type:GraphQLNonNull(GraphQLString)} ,
        lastName: {type:GraphQLNonNull(GraphQLString)} ,
        username: {type:GraphQLNonNull(GraphQLString)},
        email: {type:GraphQLNonNull(GraphQLString)} ,
        age: {type:GraphQLNonNull(GraphQLInt)}
    })
})


const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Return all rainmakers",
  fields: () => ({
    rainmakers: {
      type: new GraphQLList(rainmakertype),
      description: 'All Rainmakers',
      resolve: () => 
       ( mongoose.model("Rainmakers", rainmakerSchema).find() )
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
      addRainmaker: {
        type: rainmakertype,
        description: 'Add a Rainmaker',
        args: {
            id: {type:GraphQLNonNull(GraphQLInt)} ,
            firstName: {type:GraphQLNonNull(GraphQLString)} ,
            lastName: {type:GraphQLNonNull(GraphQLString)} ,
            username: {type:GraphQLNonNull(GraphQLString)},
            email: {type:GraphQLNonNull(GraphQLString)} ,
            age: {type:GraphQLNonNull(GraphQLInt)}
        },
        resolve: (parent, args) => {
          const rainmaker = new  mongoose.model("Rainmakers", rainmakerSchema)({ id: args.id, firstName: args.firstName, lastName: args.lastName , username: args.username , email: args.email , age: args.age })
          rainmaker.save()
          return rainmaker
        }
      }
    })
  })


const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})


app.use('/graphql', expressGraphQL.graphqlHTTP({
    schema: schema,
    graphiql: true,
}))

app.listen(5000, () => console.log('Server runnig'))