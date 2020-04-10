const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const searchTermSchema = new Schema({
    term: String,
    dateTime: String
}, { timestamps: {} })

module.exports = mongoose.model('SearchTerm', searchTermSchema)