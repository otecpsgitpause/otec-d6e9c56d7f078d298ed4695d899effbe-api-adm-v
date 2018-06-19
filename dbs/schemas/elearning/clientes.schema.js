var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    nombres:String,
    apellidos:String,
    correo:String,
    correoPago:String,
    rut:String,
    direccion:String,
    fechaInscripcion:String,
    fechaCreacion:Number,
    inscripcionCursos:[{type:schema.Types.ObjectId,ref:'inscripcionCursosCliente'}]
})

module.exports = mongoose.model('clientes', modelSchema);