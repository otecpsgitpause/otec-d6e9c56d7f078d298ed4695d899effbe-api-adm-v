'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./contenidos.controller.router.json');
var schemaCurso = require('../../dbs/schemas/cursos/cursos.schema');
var schemaModulo = require('../../dbs/schemas/cursos/modulos.cursos.schema');
var schemaClase = require('../../dbs/schemas/cursos/clases.modulos.cursos.schema');
var schemaContenido = require('../../dbs/schemas/cursos/contenidos.clases.modulos.cursos.schema');
var schemaPrueba = require('../../dbs/schemas/cursos/pruebas.cursos.modulos.clases.schema');
var schemaPregunta = require('../../dbs/schemas/cursos/preguntas.pruebas.curso.schema');
var schemaAlternativa = require('../../dbs/schemas/cursos/alternativas.preguntas.pruebas.curso.schema');
var schemaArea = require('../../dbs/schemas/cursos/areas.schema');
var _ = require('lodash');
var moment = require('moment');
const Sequence = require('@lvchengbin/sequence');

secureRouter.post(rutas[0].ruta, (req, res, next) => {
    /**
             * Método envía un contenido
             * @param param
             */


    try {

        let data = req.body.data;
        let param = data.param


        schemaContenido.findOne({ "_id": param.contenidoId }).then((docContenido) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docContenido });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }

}).post(rutas[1].ruta, (req, res, next) => {
    /**
             * Método registra un contenido
             * @param param
             */

    try {

        let data = req.body.data;
        let param = data.param

        schemaClase.findOne({ "_id": param.claseId }).then((docClase) => {



            let saveContenido = new schemaContenido();
            param.contenido.fechaCreacion=moment().unix();
            saveContenido = param.contenido;
            schemaContenido.create(saveContenido).then((docContenido) => {
                docClase.contenidos.push(docContenido._id);
                schemaClase.findOneAndUpdate({ "_id": param.claseId }, docClase).then((docUpdateclase) => {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docContenido });
                })
            }).catch(err => {
                respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
            })




        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[2].ruta, (req, res, next) => {
    /**
             * Método actualiza un contenido
             * @param param
             */

    try {

        let data = req.body.data;
        let param = data.param;



        schemaContenido.findOneAndUpdate({ "_id": param.contenido._id }, param.contenido).then((docUpdateContenido) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: param.contenido });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }

}).post(rutas[3].ruta, (req, res, next) => {
    /**
             * Método envía todos los contenidos clase
             * @param param
             */

    try {

        let data = req.body.data;
        let param = data.param


        schemaClase.findOne({ "_id": param.claseId }).populate('contenidos').exec().then((docClase) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docClase });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }

}).post(rutas[4].ruta, (req, res, next) => {
    /**
             * Método elimina un contenido
             * @param param
             */

    try {

        let data = req.body.data;
        let param = data.param

        schemaContenido.deleteOne({"_id":param.contenidoId}).then((resDelete)=>{
            
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: true });

            
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
        })

     } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
}).post(rutas[5].ruta, (req, res, next) => {
    /**
    * Método actualiza las horas de los contenidos de una clase
    * @param param
    */

    try {

        let data = req.body.data;
        let param = data.param

        let secuencia={
            actualizaContenidos:()=>{
                return new Promise((resolve,reject)=>{
                    let contador=0;
                    param.docClase.contenidos.forEach((contenido) => {
                        console.log({contenidoUpddate:contenido});
                        schemaContenido.updateOne({"_id":contenido._id},contenido).then((update)=>{
                            
                        })
                        contador=contador+1;

                        if(contador==param.docClase.contenidos.length){
                            resolve(true);
                        }
                    });
                    if(param.docClase.contenidos.length==0){
                        resolve(true);
                    }
                })
            }
        }

        const steps = [
            secuencia.actualizaContenidos
        ];
        const sequence = new Sequence(steps, { interval: 1000 });
        sequence.on('success', (data, index) => {
            console.log({data:data,index:index});
            if (index == 0) {
             
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
            }
            // execute when each step in sequence succeed
        });

        sequence.on('failed', (data, index) => {
            console.log({ failed: data, index: index });
            // execute when each step in sequence failed
        });

        sequence.on('end', () => {
            // execute after finishing all steps in the sequence



        });

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }


})


module.exports = secureRouter;
