const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const ProductSchema = moongose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
    },
    stock: {
        type: Number,
        require: true,
        trim: true,
    },
    price: {
        type: Number,
        require: true,
        trim: true,
    },
    create: {
        type: Date,
        default: Date.now()
    },


})
module.exports = mongoose.model('Product', ProductSchema)