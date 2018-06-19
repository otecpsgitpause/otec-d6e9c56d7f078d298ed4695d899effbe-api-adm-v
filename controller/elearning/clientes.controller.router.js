'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./clientes.controller.router.json');
var schemaCurso = require('../../dbs/schemas/cursos/cursos.schema');
var schemaModulo = require('../../dbs/schemas/cursos/modulos.cursos.schema');
var schemaClase = require('../../dbs/schemas/cursos/clases.modulos.cursos.schema');
var schemaContenido = require('../../dbs/schemas/cursos/contenidos.clases.modulos.cursos.schema');
var schemaPrueba = require('../../dbs/schemas/cursos/pruebas.cursos.modulos.clases.schema');
var schemaPregunta = require('../../dbs/schemas/cursos/preguntas.pruebas.curso.schema');
var schemaAlternativa = require('../../dbs/schemas/cursos/alternativas.preguntas.pruebas.curso.schema');
var schemaArea = require('../../dbs/schemas/cursos/areas.schema');
var schemaCliente = require('../../dbs/schemas/elearning/clientes.schema');
var schemaCursosFavoritos = require('../../dbs/schemas/elearning/cursosFavoritos.schema');
var schemaInscCursoCliente = require('../../dbs/schemas/elearning/inscripcionCursosCliente.schema');
var schemaAvancesCurso = require('../../dbs/schemas/elearning/avancesCurso.schema');
var _ = require('lodash');
var moment= require('moment');
const Sequence = require('@lvchengbin/sequence');

secureRouter.post(rutas[0].ruta, (req, res, next) => {
    /**
     * Método envía un cliente
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;


        schemaCliente.find({}).then((docs) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: docs, error: null } });
        }).catch(err => {

            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'No se pudo recuperar la lista de clientes' } });
        })




    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Error inesperado' } });
    }
}).post(rutas[1].ruta, (req, res, next) => {
    /**
     * Método registra un cliente
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;
        schemaCliente.findOne({ "correoPago": param.datosPersonales.correoPago }).then((docFindCliente) => {
            if (docFindCliente == null) {

                
                let cursoEsquemaSave = new schemaAvancesCurso();
                
                schemaAvancesCurso.create(cursoEsquemaSave).then((docAvanceCurso) => {

                    let inscripcionCurso = new schemaInscCursoCliente();
                    inscripcionCurso = param.inscripcionCurso;
                    param.inscripcionCurso.fechaCreacion=moment().unix();
                    inscripcionCurso.avancescurso=docAvanceCurso._id;
                    schemaInscCursoCliente.create(inscripcionCurso).then((docInscripcion) => {
                        let cliente = new schemaCliente();
                        param.datosPersonales.fechaCreacion=moment().unix();
                        cliente = param.datosPersonales;
                        let inscripcionCurso = [];
                        inscripcionCurso.push(docInscripcion._id);
                        cliente.inscripcionCursos = inscripcionCurso;
                        schemaCliente.create(cliente).then((docCliente) => {
                            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: docCliente, error: null } });
                        }).catch(err => {
                            console.log({ errInscCliente: err });
                            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'No se pudo registrar el cliente' } });
                        })
                    }).catch(err => {
                        console.log({ errInscCursoCliente: err });
                        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'No se pudo inscribir en un curso al usuario' } });
                    })
                }).catch(err => {
                    console.log({ errInscCursoCliente: err });
                    respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'No se pudo registrar el esquema del curso' } });
                })


            } else {
                respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Usuario existente' } });
            }
        })

        console.log({ estudianteParam: param });




    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Error inesperado' } });
    }
})

module.exports = secureRouter;