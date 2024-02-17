const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const OrderSchema = mongoose.Schema({
    order: {
        type: Array,
        required: true,

    },
    total: {
        type: Number,
        required: true,
        trim: true
    },
    // este valor se usar para conectar el modelo pedido con el modelo client que es el cliente
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Client'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    state: {
        type: String,
        required: true,
        default: "EARRING"
    },
    create: {
        type: Date,
        default: Date.now()
    },

})
module.exports = moongose.model('Order', OrderSchema)