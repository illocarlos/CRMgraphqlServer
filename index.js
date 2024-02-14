const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const conectDB = require('./config/db')

// conectar la base de dato a la aplicacion
conectDB();

// servido
const server = new ApolloServer({
    typeDefs,
    resolvers

})


// arranca el servidor
server.listen().then(({ url }) => {
    console.log(`server ok empezamos!! ${url} `)
})