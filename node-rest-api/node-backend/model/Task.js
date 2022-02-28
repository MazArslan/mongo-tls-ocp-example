const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Task = new Schema({
    id: {
        type: Number
    },
    text: {
        type: String
    },
    day: {
        type: String
    },
    reminder: {
        type: Boolean
    }
}, {
    collection: 'tasks'
})
 
module.exports = mongoose.model('Task', Task)