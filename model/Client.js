const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const ClientSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    surnames: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    create: {
        type: Date,
        default: Date.now()
    },
    // este valor se usar para conectar el modelo cliente con el modelo user que es el vendero
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }

})
module.exports = moongose.model('Client', ClientSchema)