var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    nombre:String,
    correo:String,
    motivo:String,
    leido:Boolean,
    respondido:Boolean,
    fecha:String
})

module.exports = mongoose.model('contacto', modelSchema);