'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('./respuesta');
var rutas = require('./administradores.controller.router.json');
var schema = require('../dbs/schemas/administradores.schema');
var mail = require('../mail/mail-info-server');
secureRouter.post(rutas[0].ruta, (req, res, next) => {
        /**
         * Método registra un administrador.
         * @param datosPersonales @param rol @param correo
         */



        try {

            let data = req.body.data;
            let admin = data.admin;



            let administrador = new schema();
            administrador.datosPersonales = Object.assign(admin.datosPersonales); //-->Object
            administrador.rol = admin.rol; //-->String
            administrador.correo = admin.correo; //-->String

            //Método create --> crea un documento con los subDocumentos.
            schema.create(administrador).then((reacion) => {
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: reacion });
            }, err => { respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null }); })
                .catch(err => { respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null }); });
        } catch (e) {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        }



    }).post(rutas[1].ruta, (req, res, next) => {
        /**
        * Método envía todos los administradores.
        */

        schema.find({}).then((administradores) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: administradores });
        }, err => { respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null }); })
            .catch(err => { respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null }); });

    }).post(rutas[2].ruta, (req, res, next) => {
        /**
        * Método envía un administrador según el correo.
        * @param correo
        */

        try {

            let data = req.body.data;
            let correo = data.correo;
            console.log({ administradorCorre: correo });
            schema.$where('this.correo.indexOf("' + correo + '") !== -1').exec().then((administrador) => {
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: administrador });
            }, err => { respuesta.sendDev({ req: req, res: res, code: 500, respuesta: err }); })
                .catch(err => { respuesta.sendDev({ req: req, res: res, code: 500, respuesta: err }); })

        } catch (e) {


            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });

        }




    })
    //schema datosPersonales
    .post(rutas[3].ruta, (req, res, next) => {
        /**
         * Método actualiza los datos personales del administrador según el correo.
         * Envía como respuesta  el doc del administrador actualizado. 
         * @param correo, @param datosPersonales
         */

        try {

            let data = req.body.data;
            let correo = data.correo;
            let datosPersonales = data.datosPersonales;
            console.log({ dataupdateAdminsitrador: data });
            schema.$where('this.correo.indexOf("' + correo + '") !== -1').then((oldAdmin) => {
                let oldAdministrador = oldAdmin[0];
                let seal = Object.seal(oldAdministrador.datosPersonales);
                seal = Object.assign(datosPersonales);
                oldAdministrador.datosPersonales = seal;
                schema.findOneAndUpdate({ "_id": oldAdministrador._id }, oldAdministrador)
                    .then((administrador) => {
                        //administrador actualizado
                        respuesta.sendDev({ req: req, res: res, code: 200, respuesta: oldAdministrador });
                        //error findOneAndUpdate
                    }, err => { respuesta.sendDev({ req: req, res: res, code: 500, respuesta: err }); })
                    //error findOneAndUpdate catch
                    .catch(err => { respuesta.sendDev({ req: req, res: res, code: 500, respuesta: err }); })
                //error .$where
            }, err => { respuesta.sendDev({ req: req, res: res, code: 500, respuesta: err }); })
                //error .$where catch
                .catch(err => { respuesta.sendDev({ req: req, res: res, code: 500, respuesta: err }); })

        } catch (e) {

            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });

        }


    }).post(rutas[5].ruta, (req, res, next) => {
        /**
         * Método envía un correo al administrador
         * @param param
         */
    
        try {
    
            let data = req.body.data;
            let param = data.param;
            console.log({paramSendMail:param});
            mail.send({
                from: 'sendmailotecpausa@gmail.com',
                to: param.email, subject:'Registro como administrador OTECPAUSA LTDA',
                text: 'Te han registrado como administrador en otecpausa con el correo:'+param.email+' y tu clave es:'+param.password+' la url de ingreso es app-administracion.otecpausa.cl. Que tengas buen día.'
            }).then((sendInfo) => {
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
                
            }).catch(err => {
    
                respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
            })
    
    
        } catch (e) {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
        }
    })






module.exports = secureRouter;
