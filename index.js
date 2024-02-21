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
        console.log('--->aaaaaaaaa', token)

        if (token) {
            try {
                //importante Bearer parece que es absurdo por que se lo colocamos en el frontend y se lo quitamos en el backen
                //pero es una forma de pasarle de manera limpia el token
                const user = jwt.verify(token.replace('Bearer ', ''), process.env.TOKEN_SECRET)
                console.log('------>', user)

                return {
                    user
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

})


// arranca el servidor
server.listen().then(({ url }) => {
    console.log(`server ok empezamos!! ${url} `)
})