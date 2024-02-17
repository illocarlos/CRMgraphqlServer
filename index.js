const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const conectDB = require('./config/db');

const jwt = require('jsonwebtoken')
require('dotenv').config({ path: '.env' })


// conectar la base de dato a la aplicacion
conectDB();

// servido
const server = new ApolloServer({
    typeDefs,
    resolvers,
    // context que es lo que usaremos para asignarle al modelo de cliente un vendedor que sera eñ que cree sus clientes
    //le pasamos el req que es el token 
    context: ({ req }) => {
        const token = req.headers['authorization'] || ""
        if (token) {
            try {
                const user = jwt.verify(token, process.env.TOKEN_SECRET)
                return {
                    user
                }
            } catch (error) {
                console.log('eeeeerrrorrr')
                console.log(error)
            }
        }
    }

})


// arranca el servidor
server.listen().then(({ url }) => {
    console.log(`server ok empezamos!! ${url} `)
})