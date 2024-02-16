const User = require('../model/User')
const Product = require('../model/Product')
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
    }
}
module.exports = resolvers;