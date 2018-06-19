var bd= require('./dbs/mongodb/conexion');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cors = require('cors');
var methodOverride = require('method-override');
var jwt = require('jsonwebtoken'); //no use
var ip = require('ip');
var cluster = require('cluster');
var numCPUs= require('os').cpus().length;
var app = express();
var secureRoutes = express.Router();
var whitelist = ['http://www.google.com'];
var corsOption ={
    origin:function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(JSON.stringify('error'))
        }
    }
}
app.set('port', (process.env.PORT || 9000));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true,limit: '5mb' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(cors());  //una vez terminando el modo desarrollador activar corsOption


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT,POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


//bd-init
bd.conectar();



//router
var administradores = require('./controller/administradores.controller.router');
app.use('/administradores',administradores);
var cursos = require('./controller/cursos/cursos.controller.router');
app.use('/cursos',cursos);
var sistema = require('./controller/sistema/sistema.controller.router');
app.use('/sistema',sistema);
var areas = require('./controller/cursos/areas.controller.router');
app.use('/areas',areas);
var modulos = require('./controller/cursos/modulos.controller.router');
app.use('/modulos',modulos);
var clases = require('./controller/cursos/clases.controller.router');
app.use('/clases',clases);
var contenidos = require('./controller/cursos/contenidos.controller.router');
app.use('/contenidos',contenidos);
var pruebas = require('./controller/cursos/pruebas.controller.router');
app.use('/pruebas',pruebas);
var preguntas = require('./controller/cursos/preguntas.controller.router');
app.use('/preguntas',preguntas);
var alternativas = require('./controller/cursos/alternativas.controller.router');
app.use('/alternativas',alternativas);
var contacto = require('./controller/cursos/contacto.controller.router');
app.use('/contacto',contacto);
var estudiantes = require('./controller/elearning/clientes.controller.router');
app.use('/estudiantes',estudiantes);
//cluster
if(cluster.isMaster){
    for(var i=0; i < numCPUs;i++){
        cluster.fork();
        cluster.on('exit', function(worker, code, signal)
        {
          console.log('worker ' + worker.process.pid + ' died');
        });
    }
}else{
    app.listen(app.get('port'), () => {
        console.log('app running port ', app.get('port'), 'IP:', ip.address());
    })
}