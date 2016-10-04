var mongoose = require('mongoose');

var typeSchema = mongoose.Schema({
    nombre: String,
    user_id: String,
    opciones:[String]
});

module.exports = mongoose.model('Type', typeSchema);