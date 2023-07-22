var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user: { type: String, required: true }
    //estado: {type: Number, required: true, default: 1  }
});

module.exports = mongoose.model('User', userSchema);