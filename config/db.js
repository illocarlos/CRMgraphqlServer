const mongoose = require('mongoose')
require('dotenv').config({ path: '.env' });


// conectar la aplicacion con la base
const conectDB = async () => {
    try {

        await mongoose.connect(process.env.DB_MONGO, {
            // esto se usa para limpiar el chache de la terminal de advertencias innecesarias que se vean en la terminal
            // useNewURLParser: true,
            // useUnifiedTopology: true,
            // useFindAndModify: false,
            // useCreateIndex: true,

        })// con el await se espera una conezcion a la base de dato
        console.log('conect DB')
    } catch (error) {
        console.log('errrrrrorrrrrrrrr')
        console.log(error)

        process.exit(1)//esto detiene la aplicacion si hay un error
    }
}
module.exports = conectDB