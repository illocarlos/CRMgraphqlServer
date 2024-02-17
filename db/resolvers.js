const User = require('../model/User')
const Product = require('../model/Product')
const Client = require('../model/Client')
const Order = require('../model/Order')

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: '.env' })

const createToken = (user, tokenSecret, expiresIn) => {
    console.log(user)
    const { name, surnames, email, id } = user
    return jwt.sign({ id, name, surnames, email }, tokenSecret, { expiresIn })
}


// resolver
const resolvers = {
    // se le pasa 4 argumentos(tanto query como mutation) el primero es para hacer cosultas anidadas en graphql se pone guin bajo para ignorarlo
    //el segundo es el argumento que queremos pasarle para que haga la llamada le pusimos input por que es como lo llamamos en shema
    //el tercer argumentos se conoce como un context es un objeto que se comparte con todos los resolver y se pasa informacion de atenticacion
    //el 4 argumentos se conoce como info es el ma avanzado lo quito para que no genere ningun tipo de error
    //se suelen usar el segundo y tercero normalmente pero es para que sepas que existen
    Query: {
        getUser: async (_, { token }) => {
            const userId = await jwt.verify(token, process.env.TOKEN_SECRET)
            return userId
        },
        getProduct: async () => {

            try {
                const products = await Product.find({})
                return products
            } catch (error) {
                console.log(error)
            }
        },
        getProductId: async (_, { id }) => {

            // revisar si el producto esta registrado

            const existProduct = await Product.findById(id)

            if (!existProduct) {
                throw new Error('No exist this product')
            }
            return existProduct
        },
        getClients: async () => {

            try {
                const clients = await Client.find({})
                return clients
            } catch (error) {
                console.log(error)
            }
        },

        // como queremos recoger solo los clientes de cada vendedor le pasamos el contexto(ctx) por props
        // y despues le damos un findbyid y le damos el contexto
        getClientsSeller: async (_, { }, ctx) => {
            const seller = ctx.user.id.toString()
            try {
                const clients = await Client.find({ seller })
                return clients
            } catch (error) {
                console.log(error)
            }
        },
        getOnlyClient: async (_, { id }, ctx) => {
            const seller = ctx.user.id
            // revisar si el Cliente esta registrado

            const client = await Client.findById(id)
            console.log('--->', client)

            if (!client) {
                throw new Error('No exist this Client')
            }
            if (client.seller.toString() !== seller) {
                throw new Error('you have not credentials')
            }
            return client
        }
    },
    Mutation: {
        createUser: async (_, { input }) => {
            // sacamos el email y password de lo que recibimos del input
            //que es el usuario
            const { email, password } = input
            // revisar si el usuario esta registrado

            const existUser = await User.findOne({ email })
            if (existUser) {
                throw new Error("Exist this user")
            }
            //HASHEAR SU PASSWORD
            // importante tuve un error ya que anteriormente se usaba el metodo getsalt
            //en estos momentos se usar gensalt en versiones mas modernas
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt)
            try {
                //guardar en bbdd
                const user = new User(input);
                user.save(); //AQUI SE GUARDA
                return user
            } catch (error) {
                console.log(error)
            }

        },

        autenticateUser: async (_, { input }) => {

            // si el usuario existe
            const { email, password } = input

            const existUser = await User.findOne({ email })
            if (!existUser) {
                throw new Error(" No exist this user")
            }
            //revisar si el password es correcto
            const passwordOK = await bcryptjs.compare(password, existUser.password)
            if (!passwordOK) {
                throw new error("Password is not correct")
            }

            // crear token
            return {
                token: createToken(existUser, process.env.TOKEN_SECRET, '24h')
            }
        },

        createProduct: async (_, { input }) => {
            try {
                const product = new Product(input);
                const result = await product.save(); //AQUI SE GUARDA
                return result
            } catch (error) {
                console.log(error)
            }

        },
        updateProduct: async (_, { id, input }) => {
            //revisdamos si existe ese producto
            let existProductAndEdit = await Product.findById(id)

            if (!existProductAndEdit) {
                throw new Error('No exist this product')
            }
            // si existe editamos y  guardamos en la bbdd

            existProductAndEdit = await Product.findOneAndUpdate({ _id: id }, input, { new: true })
            return existProductAndEdit

        },
        deletedProduct: async (_, { id }) => {
            //revisdamos si existe ese producto
            let existProductAndDeleted = await Product.findById(id)

            if (!existProductAndDeleted) {
                throw new Error('No exist this product')
            }
            // si existe editamos y  guardamos en la bbdd

            await Product.findOneAndDelete({ _id: id });
            return "product deleted"

        },

        //usarmes el tercer parametro  que es para pasarle el vendedor al cliente conectarlo como asi decir un modelo con otro
        //pero debemos de crearlo en el index
        createClient: async (_, { input }, ctx) => {
            const { email } = input
            //verificar cliente
            const client = await Client.findOne({ email })
            if (client) {
                throw new error("client register!!!!")
            }
            const newClient = new Client(input)

            // asignar vendedor
            //al conectarlo con el index desee alli le pasamos el conexto que estamos con verify recogiendo elñ id 
            //del vendedor conectado y es lo que le damos a seller una vez creamos el cliente
            newClient.seller = ctx.user.id


            //guardar en bbdd
            try {
                const result = await newClient.save()
                return result
            } catch (error) {
                console.log(error)
            }
        },
        updateClient: async (_, { id, input }, ctx) => {
            let client = await Client.findById(id)
            // verificar si existe cliente
            if (!client) {
                throw new error("no existe this client")
            }

            // verificar si el vendedor edita

            if (client.seller.toString() !== ctx.user.id) {
                throw new error("you have not credential")
            }
            // guardar cliente ( el new :true  se usa para que retorne el nuevo cliente)
            client = await Client.findOneAndUpdate({ _id: id }, input, { new: true })
            return client
        },
        deletedClient: async (_, { id }, ctx) => {

            let client = await Client.findById(id)
            // verificar si existe cliente
            if (!client) {
                throw new error("no exist this client")
            }
            // verificar si el vendedor edita

            if (client.seller.toString() !== ctx.user.id) {
                throw new error("you have not credential")
            }

            await Client.findOneAndDelete({ _id: id });
            return "Client deleted"
        },
        createOrder: async (_, { input }, ctx) => {

            const { client } = input
            // verificar si hay cliente

            let existClient = await Client.findById(client)


            if (!existClient) {

                throw new error("no exist client")
            }

            // verificar si el cliente esta en el vendedor
            if (existClient.seller.toString() !== ctx.user.id) {
                throw new error("you have not credential")
            }
            //revisar que tenga stock
            for await (const article of input.order) {

                const { id } = article
                const product = await Product.findById(id)

                console.log('.....', product.stock, article.stock)

                if (article.stock > product.stock) {
                    throw new error("exceeds the amount")
                } else {
                    //restamos la cantidad para que lo axtualice la bbdd
                    product.stock = product.stock - article.stock
                    await product.save()
                }
            };
            // crear pedido
            const newOrder = new Order(input)

            // asignar vendedor
            newOrder.seller = ctx.user.id

            console.log('-----', newOrder)
            // guardar order
            const result = await newOrder.save()
            return result
        }
    }
}
module.exports = resolvers;