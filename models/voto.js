var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const votoSchema = new Schema({
    user: { type: String, required: true },
});

module.exports = mongoose.model('Voto', votoSchema);