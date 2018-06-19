var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
   prueba:{type:schema.Types.ObjectId,ref:'pruebas'},
   preguntas:[{pId:String,opcion:String,correcta:Boolean}],
   aprovado:{type:Boolean,default:false}
})

module.exports = mongoose.model('pruebaHojaRespuesta', modelSchema);