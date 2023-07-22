var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tipoSchema = new Schema({
    id: { type: Number, required: true }
});

module.exports = mongoose.model('Tipo', tipoSchema);