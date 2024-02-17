const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const UsersSchema = moongose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    surnames: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    create: {
        // se usa date como tipo fecha
        type: Date,
        // y el default es por defecto cuando se cree el usuario recoge el metodo que le pusimos 
        //en este caso es poner la fecha exacta en la que se creo 
        default: Date.now()
    },
    age: {
        type: Date,
        required: true,
    },
    NID: {
        type: String,
        default: function () {
            return this.name + this.surnames + this.age;
        }
    }


})
module.exports = mongoose.model('User', UsersSchema)