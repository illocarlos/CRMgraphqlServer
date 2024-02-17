const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const ProductSchema = moongose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    stock: {
        type: Number,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        trim: true,
    },
    create: {
        type: Date,
        default: Date.now()
    },


})
module.exports = mongoose.model('Product', ProductSchema)