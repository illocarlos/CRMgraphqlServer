const User = require('../model/User')
const Product = require('../model/Product')
const Client = require('../model/Client')
const Order = require('../model/Order')

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: '.env' })

const createToken = (user, tokenSecret, expiresIn) => {
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
        getUser: async (_, { }, ctx) => {
            console.log(ctx.user)

            return ctx.user
        },
        //QUERY PRODUCT
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

        //query CLIENT
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

            if (!client) {
                throw new Error('No exist this Client')
            }
            if (client.seller.toString() !== seller) {
                throw new Error('you have not credentials')
            }
            return client
        },
        //QUERY ORDER
        getOrders: async () => {

            try {
                const orders = await Order.find({})
                return orders
            } catch (error) {
                console.log(error)
            }
        },

        getOrdersPerSeller: async (_, { }, ctx) => {
            const seller = ctx.user.id

            try {
                const orders = await Order.find({ seller }).populate('client')
                return orders
            } catch (error) {
                console.log(error)
            }
        },
        getOrderId: async (_, { id }, ctx) => {
            const seller = ctx.user.id
            // revisar si el Pedido esta registrado

            const order = await Order.findById(id)

            if (!order) {
                throw new Error('No exist this order')
            }
            if (order.seller.toString() !== seller) {
                throw new Error('you have not credentials')
            }
            return order

        },
        getOrderState: async (_, { state }, ctx) => {
            const seller = ctx.user.id
            const order = await Order.find({ seller, state })
            return order

        },
        // filtros avanzados son busquedad de mejores clientes,buscar nombre de producto ...
        getTopClients: async () => {
            // metodo aggregate para empezar te rotorna un solo resultado
            //son funciones que podemos verificar obteniendo diferente valores 
            //podemos hacer muchas operaciones dentro para retornar lo que pase esas verificaciones
            const clients = await Order.aggregate([
                // primera verificacion
                // el match se usa para filtrar en mongo db solo se traera de la base de dato de orde los pedidod que tengan el state complete
                { $match: { state: "COMPLETE" } },
                // segunda verificacion
                //cuanto nos compro el cliente
                //group es una etapa de agregación en MongoDB que agrupa documentos según los criterios especificados.
                {
                    $group: {
                        _id: "$client",       // Esta línea especifica que los documentos se agruparán por el campo 'client'. 
                        total: { $sum: '$total' } // Esta línea calcula la suma de los valores del campo 'total' para cada grupo.
                    }
                },
                // tercera verificacion
                //lookup es una etapa de agregación en MongoDB que realiza una operación de unión entre dos colecciones.
                {
                    $lookup: {
                        from: 'clients',            // Esta línea especifica la colección 'clients' desde la cual se va a realizar la unión.
                        localField: '_id',         // Esta línea especifica el campo en la colección actual que se va a usar para la unión.
                        foreignField: '_id',       // Esta línea especifica el campo en la colección 'clients' que se va a usar para la unión.
                        as: 'client'               // Esta línea especifica el nombre del nuevo campo que se creará en los documentos de la colección actual para almacenar los resultados de la unión.
                    }
                },
                {
                    $limit: 10 //este  trae solo 10 cliente de la base de dato
                },
                //tercera verificacion sort se usa para ordenar en mongo
                //en este caso estamos diciendole que cambie el orden del cliente con mayor cantidad en el total
                {
                    $sort: { total: -1 }

                }
            ])


            return clients
        },
        getTopSellers: async () => {
            const sellers = await Order.aggregate([
                { $match: { state: "COMPLETE" } },
                {
                    $group: {
                        _id: "$seller",
                        total: { $sum: '$total' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',            // Esta línea especifica la colección 'users' desde la cual se va a realizar la unión.
                        localField: '_id',         // Esta línea especifica el campo en la colección actual que se va a usar para la unión.
                        foreignField: '_id',       // Esta línea especifica el campo en la colección 'users' que se va a usar para la unión.
                        as: 'seller'

                    }
                },
                {
                    $limit: 3 //este  trae solo 3 vendedores de la base de dato
                },
                {
                    $sort: { total: -1 } // este ordena los vendedores del que tiene mayor total

                }

            ])
            return sellers
        },
        //filtro para buscar productos por su nombre
        searchProduct: async (_, { text }) => {
            const products = await Product.find({ $text: { $search: text } }).limit(10)
            return products
        },
        //filtro cliente
        //filtro para buscar productos por su nombre
        searchClient: async (_, { text }) => {
            const clients = await Client.find({ $text: { $search: text } }).limit(5)
            return clients
        },


        //filtro seller
        searchSeller: async (_, { text }) => {
            const sellers = await User.find({ $text: { $search: text } }).limit(5)
            return sellers
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
                throw new Error("Password is not correct")
            }

            // crear token
            return {
                token: createToken(existUser, process.env.TOKEN_SECRET, '8h')
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
                throw new Error("client register!!!!")
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
                throw new Error("no existe this client")
            }

            // verificar si el vendedor edita

            if (client.seller.toString() !== ctx.user.id) {
                throw new Error("you have not credential")
            }
            // guardar cliente ( el new :true  se usa para que retorne el nuevo cliente)
            client = await Client.findOneAndUpdate({ _id: id }, input, { new: true })
            return client
        },
        deletedClient: async (_, { id }, ctx) => {

            let client = await Client.findById(id)
            // verificar si existe cliente
            if (!client) {
                throw new Error("no exist this client")
            }
            // verificar si el vendedor edita

            if (client.seller.toString() !== ctx.user.id) {
                throw new Error("you have not credential")
            }

            await Client.findOneAndDelete({ _id: id });
            return "Client deleted"
        },

        createOrder: async (_, { input }, ctx) => {
            console.log('dentro del backend', input, ctx)

            const { client } = input
            // verificar si hay cliente

            let existClient = await Client.findById(client)


            if (!existClient) {

                throw new Error("no exist client")
            }

            // verificar si el cliente esta en el vendedor
            if (existClient.seller.toString() !== ctx.user.id) {
                throw new Error("you have not credential")
            }
            //revisar que tenga stock


            for await (const article of input.order) {
                console.log('base de dato entroooo', article)
                const { id } = article
                const product = await Product.findById(id)


                if (article.cuantity > product.stock) {
                    throw new Error("exceds the amount")
                } else {
                    //restamos la cantidad para que lo axtualice la bbdd
                    product.stock = product.stock - article.cuantity
                    await product.save()
                }
            };
            // crear pedido
            const newOrder = new Order(input)

            // asignar vendedor
            newOrder.seller = ctx.user.id

            // guardar order
            const result = await newOrder.save()
            return result
        },




        updateOrder: async (_, { id, input }, ctx) => {
            const { client } = input
            const { order } = input
            const seller = ctx.user.id

            // verificar si existe pedido
            const existorder = await Order.findById(id)
            if (!existorder) {
                throw new Error("no exist this order")
            }
            // verificar si existe cliente 
            //le pàsamos el id del cliente que lo lleva el input dentro y le hacemos una busqueda con el id del cliente del objeto de order
            //que lleva dentro el id del cliente y buscamos en la bbdd de clientes si esta con findbyid
            const existClient = await Client.findById(client)

            if (!existClient) {
                throw new Error("no exist this client")
            }
            // verificar si el vendedor edita y si el cliente pertenece al vendedor
            if (existClient.seller.toString() !== seller) {
                throw new Error("you have not credential")
            }

            // revisar stock por si aumenta al editar  la cantidad
            if (order) {
                for await (const article of order) {

                    const { id } = article
                    const product = await Product.findById(id)

                    if (article.stock > product.stock) {
                        throw new Error("exceeds the amount")
                    } else {
                        //restamos la cantidad para que lo axtualice la bbdd
                        product.stock = product.stock - article.stock
                        await product.save()
                    }
                };
            }
            // guardar cliente ( el new :true  se usa para que retorne el nuevo cliente)
            const result = await Order.findOneAndUpdate({ _id: id }, input, { new: true })
            return result

        },
        deletedOrder: async (_, { id }, ctx) => {

            const seller = ctx.user.id
            let order = await Order.findById(id)
            // verificar si existe el pedido
            if (!order) {
                throw new Error("no exist this order")
            }
            // verificar si el vendedor es el que lo borra

            if (order.seller.toString() !== ctx.user.id) {
                throw new Error("you have not credential")
            }

            await Order.findOneAndDelete({ _id: id });
            return "Client deleted"
        },
    }
}
module.exports = resolvers;