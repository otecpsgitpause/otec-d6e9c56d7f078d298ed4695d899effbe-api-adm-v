'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./sistema.controller.router.json');
var schemaSistema = require('../../dbs/schemas/sistema/sistema.schema');
var _ = require('lodash');
const Sequence = require('@lvchengbin/sequence');

secureRouter.post(rutas[0].ruta, (req, res, next) => {
    /**
     * Método verifica la identidad del sistema y envía token
     * @param identity
     */

     try{

        let data = req.body.data;
        let identity = data.identity;





     }catch(e){

        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });

     }
})

module.exports = secureRouter;