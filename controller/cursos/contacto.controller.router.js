var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./contacto.controller.router.json');
var schemaContacto = require('../../dbs/schemas/sistema/contacto.schema');
var _ = require('lodash');
const Sequence = require('@lvchengbin/sequence');
var mail = require('../../mail/mail-info-server');
secureRouter.post(rutas[0].ruta, (req, res, next) => {
    /**
     * Método registra contacto para la empresa
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        let saveContacto = new schemaContacto();
        saveContacto = param.contacto;
        schemaContacto.create(saveContacto).then((docContacto) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
        }).catch(err => {

            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
}).post(rutas[1].ruta, (req, res, next) => {
    /**
     * Método envía todos los registro de contacto no leidos
     * @param param
     */

    try {
        let data = req.body.data;
        let param = data.param;

        schemaContacto.find({}).where('leido').equals(false).then((docs) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docs });
        }).catch(err => {

            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })
    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[2].ruta, (req, res, next) => {
    /**
     * Método envía un correo al contacto 
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;
        console.log({paramSendMail:param});
        mail.send({
            from: 'sendmailotecpausa@gmail.com',
            to: param.correo, subject: param.subject,
            text: param.contenido
        }).then((sendInfo) => {
            schemaContacto.findOne({"correo":param.correo}).then((docContacto)=>{
                docContacto.leido=true;
                docContacto.respondido=true;
                schemaContacto.updateOne({"correo":param.correo},docContacto).then((docUpdate)=>{
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
                })
            })
            
        }).catch(err => {

            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
}).post(rutas[3].ruta, (req, res, next) => {
    /**
     * Método elimina una contatación
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaContacto.deleteOne({"correo":param}).then((docDelete)=>{
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
        }).catch(err => {

            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
        })

    }catch(e){
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
}).post(rutas[4].ruta, (req, res, next) => {
    /**
     * Método marca como leido una contatación
     * @param param
     */

    try {
        let data = req.body.data;
        let param = data.param;

        schemaContacto.findOne({"correo":param}).then((docContacto)=>{
            docContacto.leido=true;
            schemaContacto.updateOne({"correo":param},docContacto).then((docUpdate)=>{
                console.log({docContactoUpdate:docUpdate});
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
            }).catch(err => {

                respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
            })
        }).catch(err => {

            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
        })

    }catch(e){
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
}).post(rutas[5].ruta, (req, res, next) => {
    /**
     * Método marca como leido una contatación
     * @param param
     */

    try {
        let data = req.body.data;
        let param = data.param;

        schemaContacto.find({}).where('respondido').equals(false).exec().then((docs)=>{
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docs });
        }).catch(err => {

            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    }catch(e){
respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
})
module.exports = secureRouter;