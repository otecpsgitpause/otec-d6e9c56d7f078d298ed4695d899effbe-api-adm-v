'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./cursos.controller.router.json');
var schemaCurso = require('../../dbs/schemas/cursos/cursos.schema');
var schemaModulo = require('../../dbs/schemas/cursos/modulos.cursos.schema');
var schemaClase = require('../../dbs/schemas/cursos/clases.modulos.cursos.schema');
var schemaContenido = require('../../dbs/schemas/cursos/contenidos.clases.modulos.cursos.schema');
var schemaPrueba = require('../../dbs/schemas/cursos/pruebas.cursos.modulos.clases.schema');
var schemaPregunta = require('../../dbs/schemas/cursos/preguntas.pruebas.curso.schema');
var schemaAlternativa = require('../../dbs/schemas/cursos/alternativas.preguntas.pruebas.curso.schema');
var schemaArea = require('../../dbs/schemas/cursos/areas.schema');
var schemaVentaCursoInscripcion = require('../../dbs/schemas/cursos/ventasCursoInscripcion.schema');
var schemaCliente = require('../../dbs/schemas/elearning/clientes.schema');
var schemaCursosFavoritos = require('../../dbs/schemas/elearning/cursosFavoritos.schema');
var schemaInscCursoCliente = require('../../dbs/schemas/elearning/inscripcionCursosCliente.schema');
var schemaAvancesCurso = require('../../dbs/schemas/elearning/avancesCurso.schema');
var _ = require('lodash');
const Sequence = require('@lvchengbin/sequence');
var moment = require('moment');
secureRouter.post(rutas[0].ruta, (req, res, next) => {
    /**
     * Método registra un curso
     * @param curso
     */

    try {

        let data = req.body.data;
        let curso = data.curso;

        let cursoSave = new schemaCurso();
        curso.fechaCreacion = moment().unix();
        cursoSave = curso;
        schemaCurso.create(cursoSave).then((doc) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: doc });
        }).catch(err => {
            console.log({ errorProCatch: err });
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })




    } catch (e) {
        console.log({ errorCatch: e });
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[1].ruta, (req, res, next) => {
    /**
     * Método elimina un curso
    * @param curso
    */

    try {

        let data = req.body.data;
        let curso = data.curso;

        console.log({ eliminaCurso: curso });
        schemaCurso.findOne({ "_id": curso }).populate('modulos').populate('pruebas').exec().then((docCurso) => {
            console.log({ docCursoObtenido: docCurso });
            let secuencia = {
                populatePruebas: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.pruebas.forEach((prueba, idx) => {
                            contador = contador + 1;
                            schemaPrueba.findOne({ "_id": prueba._id }).populate('preguntas').exec().then((doc) => {
                                docCurso.pruebas.splice(idx, 1, doc);
                            })

                            if (contador == docCurso.pruebas.length) {
                                resolve(true);
                            }
                        })

                        if (docCurso.pruebas.length == 0) {
                            resolve(true);
                        }
                    })
                },
                deletePrueba: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.pruebas.forEach((prueba, idx) => {
                            contador = contador + 1;
                            schemaPrueba.deleteOne({ "_id": prueba._id });
                            if (contador == docCurso.pruebas.length) {
                                resolve(true);
                            }
                        })
                        if (docCurso.pruebas.length == 0) {
                            resolve(true);
                        }
                    })
                },
                deletePreguntas: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.pruebas.forEach((prueba, idx) => {
                            contador = contador + 1;
                            prueba.preguntas.forEach((pregunta) => {
                                schemaPregunta.deleteOne({ "_id": pregunta._id });
                            })

                            if (contador == docCurso.pruebas.length) {
                                resolve(true);
                            }
                        })
                        if (docCurso.pruebas.length == 0) {
                            resolve(true);
                        }
                    })
                },
                deleteAlternativas: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.pruebas.forEach((prueba, idx) => {
                            contador = contador + 1;
                            prueba.preguntas.forEach((pregunta) => {
                                pregunta.alternativas.forEach((alternativa) => {
                                    schemaAlternativa.deleteOne({ "_id": alternativa._id });
                                })

                            })

                            if (contador == docCurso.pruebas.length) {
                                resolve(true);
                            }
                        })
                        if (docCurso.pruebas.length == 0) {
                            resolve(true);
                        }
                    })
                },
                deleteCurso: () => {
                    return new Promise((resolve, reject) => {
                        schemaCurso.deleteOne({ "_id": docCurso._id }).then((docDelete) => {
                            resolve(true);
                        })
                    })
                }
            }

            const steps = [secuencia.populatePruebas, secuencia.deleteAlternativas, secuencia.deletePreguntas,
            secuencia.deletePrueba, secuencia.deleteCurso
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                console.log({ success: data, index: index });
                // execute when each step in sequence succeed
            });

            sequence.on('failed', (data, index) => {
                console.log({ failed: data, index: index });
                // execute when each step in sequence failed
            });

            sequence.on('end', () => {
                // execute after finishing all steps in the sequence

                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });


            });

        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }



}).post(rutas[2].ruta, (req, res, next) => {
    /**
     * Método envia un curso
    * @param cursoId
    */


    try {

        let data = req.body.data;
        let curso = data.curso;

        schemaCurso.findOne({ "_id": curso }).populate('modulos').populate('pruebas').populate('area').then((doc) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: doc });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }


}).post(rutas[3].ruta, (req, res, next) => {
    /**
     * Método envia varios cursos
    * 
    */


    try {



        schemaCurso.find({}).where('definido').equals(true).exec().then((doc) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: doc });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }


}).post(rutas[4].ruta, (req, res, next) => {
    /**
    * Método envia cursos no definidos
    * 
    */

    try {

        schemaCurso.find({}).where('definido').equals(false).exec().then((doc) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: doc });
        }).catch(err => {
            console.log({ noDefinidosError: err });
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        console.log({ noDefinidosErrore: e });
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[5].ruta, (req, res, next) => {
    /**
    * Método actualiza datos un curso
    * @param curso
    */

    try {

        let data = req.body.data;
        let curso = data.curso;

        schemaCurso.findOneAndUpdate({ "_id": curso._id }, curso).then((update) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: curso });
        }).catch(err => {
            console.log({ noDefinidosError: err });
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[6].ruta, (req, res, next) => {
    /**
    * Método elimina módulos de un curso
    * @param curso
    */

    try {

        let data = req.body.data;
        let curso = data.curso;

        schemaCurso.findOne({ "_id": curso }).populate('modulos').exec().then((docCurso) => {
            console.log({ cursoConsultado: docCurso });
            let secuencia = {
                populateModulos: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idx) => {
                            contador = contador + 1;
                            schemaModulo.findOne({ "_id": modulo._id }).populate('pruebas')
                                .populate('clases').exec().then((doc) => {
                                    console.log({ populateModulo: doc });
                                    docCurso.modulos.splice(idx, 1, doc);
                                })

                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })
                    })

                },
                populatePruebasModulo: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idx) => {
                            contador = contador + 1;
                            modulo.pruebas.forEach((prueba, idxPrueba) => {
                                schemaPrueba.findOne({ "_id": prueba._id }).populate('preguntas').exec()
                                    .then((doc) => {
                                        console.log({ populatePruebasModulo: doc });
                                        docCurso.modulos[idx].pruebas.splice(idxPrueba, 1, doc);
                                    })
                            })
                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })
                    })
                },
                deletePruebas: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idx) => {
                            contador = contador + 1;
                            modulo.pruebas.forEach((prueba, idxPrueba) => {
                                schemaPrueba.deleteOne({ "_id": prueba._id }).then((respuestaDell) => {
                                    console.log({ deleteDocPrueba: respuestaDell });
                                });
                            })
                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })
                    })
                },
                deletePreguntas: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idx) => {
                            contador = contador + 1;
                            modulo.pruebas.forEach((prueba, idxPrueba) => {
                                prueba.preguntas.forEach((pregunta, idxPregunta) => {
                                    schemaPregunta.deleteOne({ "_id": pregunta._id }).then((respuestaDell) => {
                                        console.log({ deleteDocPregunta: respuestaDell });
                                    });
                                })
                            })
                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })
                    })
                },
                deleteAlternativas: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idx) => {
                            contador = contador + 1
                            modulo.pruebas.forEach((prueba, idxPrueba) => {
                                prueba.preguntas.forEach((pregunta, idxPregunta) => {
                                    pregunta.alternativas.forEach((alternativa) => {
                                        schemaAlternativa.deleteOne({ "_id": alternativa }).then((respuestaDell) => {
                                            console.log({ deleteDocAlternativa: respuestaDell });
                                        });
                                    })
                                })
                            })
                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })
                    })
                },
                deleteModulo: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idxModulo) => {
                            contador = contador + 1;
                            schemaModulo.deleteOne({ "_id": modulo._id }).then((respuestaDell) => {
                                console.log({ deleteDocModulo: respuestaDell });
                                docCurso.modulos.splice(idxModulo, 1);
                            });
                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })
                    })
                },
                updateCurso: () => {
                    return new Promise((resolve, reject) => {
                        docCurso.modulos = new Array();
                        schemaCurso.updateOne({ "_id": docCurso._id }, docCurso).then((doc) => {
                            resolve({ updateCurso: doc });
                        })
                    })

                },
                deleteClases: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo) => {
                            contador = contador + 1;
                            modulo.clases.forEach((clase) => {
                                schemaClase.deleteOne({ "_id": clase._id }).then((docDelete) => {

                                })
                            })

                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })

                        if (docCurso.modulos.length == 0) {
                            resolve(true);
                        }

                    })
                },
                deleteContenidos: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo) => {
                            contador = contador + 1;
                            modulo.clases.forEach((clase) => {
                                clase.contenidos.forEach((contenido) => {
                                    schemaContenido.deleteOne({ "_id": contenido }).then((docDelete) => {

                                    })
                                })
                            })
                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })

                        if (docCurso.modulos.length == 0) {
                            resolve(true);
                        }
                    })
                }

            }

            const steps = [secuencia.populateModulos, secuencia.populatePruebasModulo,
            secuencia.deleteAlternativas, secuencia.deletePreguntas, secuencia.deletePruebas,
            secuencia.deleteContenidos, secuencia.deleteClases,
            secuencia.deleteModulo, secuencia.updateCurso
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                console.log({ success: data, index: index });
                // execute when each step in sequence succeed
            });

            sequence.on('failed', (data, index) => {
                console.log({ failed: data, index: index });
                // execute when each step in sequence failed
            });

            sequence.on('end', () => {
                // execute after finishing all steps in the sequence

                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docCurso });


            });
        })

    } catch (e) {
        console.log({ catcherror: e });
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }


}).post(rutas[8].ruta, (req, res, next) => {
    /**
        * Método valida activación curso
        * @param param
        */



    try {

        let data = req.body.data;
        let param = data.param;

        console.log({ validaActivacionCursoParam: param });
        schemaCurso.findOne({ "_id": param.cursoId }).populate('modulos').populate('pruebas').exec().then((docCurso) => {

            let validaciones = [];

            let secuencia = {

                validacionRegister: (param) => {
                    let valida = {
                        type: param.type,
                        estado: param.estado,
                        motivo: param.motivo
                    }
                    validaciones.push(valida);
                },
                populateClasesPruebas: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idx) => {
                            contador = contador + 1;
                            schemaModulo.findOne({ "_id": modulo._id }).populate('clases').populate('pruebas').exec().then((docModulo) => {
                                docCurso.modulos.splice(idx, 1, docModulo);
                            })

                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })

                        if (docCurso.modulos.length == 0) {
                            resolve(true);
                        }

                    })
                },
                populateContenidos: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idxModulo) => {
                            contador = contador + 1;
                            modulo.clases.forEach((clase, idxClase) => {
                                schemaClase.findOne({ "_id": clase._id }).populate('contenidos').exec().then((docClase) => {
                                    docCurso.modulos[idxModulo].clases.splice(idxClase, 1, docClase);
                                })
                            })

                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })

                        if (docCurso.modulos.length == 0) {
                            resolve(true);
                        }
                    })
                },
                verificaExistenciaModulo: () => {
                    return new Promise((resolve, reject) => {
                        if (docCurso.modulos.length == 0) {
                            secuencia.validacionRegister({ type: 'Curso', estado: 'Fallo', motivo: 'Sin módulos' });
                            resolve(true);
                        } else {
                            secuencia.validacionRegister({ type: 'Curso', estado: 'Ok', motivo: 'Existencia módulos' });
                            resolve(true);
                        }
                    })
                },
                verificarExistenciaClases: () => {
                    return new Promise((resolve, reject) => {
                        let existencia = [];
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idxModulo) => {
                            contador = contador + 1;
                            existencia.push(modulo.clases.length);



                            if (contador == docCurso.modulos.length) {

                                if (existencia.length > 0) {
                                    if (existencia.indexOf(0) > -1) {
                                        secuencia.validacionRegister({ type: 'Clases', estado: 'Fallo', motivo: 'Hay módulos que no tienen clases definidas' });
                                    } else if (existencia.indexOf(0) == -1) {
                                        secuencia.validacionRegister({ type: 'Clases', estado: 'Ok', motivo: 'Módulos con todas sus clases' });
                                    }
                                } else if (existencia.length == 0) {
                                    secuencia.validacionRegister({ type: 'Clases', estado: 'Fallo', motivo: 'Sin clases' });
                                }


                                resolve(true);
                            }

                        })

                        if (docCurso.modulos.length == 0) {
                            secuencia.validacionRegister({ type: 'Clases', estado: 'Fallo', motivo: 'Sin clases' });
                            resolve(true);
                        }





                    })
                },
                verificarExistenciaContenidos: () => {
                    return new Promise((resolve, reject) => {
                        let existencia = [];
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idxModulo) => {
                            contador = contador + 1;
                            modulo.clases.forEach((clase, idxClase) => {
                                existencia.push(clase.contenidos.length);
                            })
                            if (contador == docCurso.modulos.length) {

                                if (existencia.length > 0) {
                                    if (existencia.indexOf(0) > -1) {
                                        secuencia.validacionRegister({ type: 'Contenidos', estado: 'Fallo', motivo: 'Hay clases que no tienen contenidos' });
                                    } else if (existencia.indexOf(0) == -1) {
                                        secuencia.validacionRegister({ type: 'Contenidos', estado: 'Ok', motivo: 'Todas las clases tienen al menos 1 contenido' });
                                    }
                                } else if (existencia.length == 0) {
                                    secuencia.validacionRegister({ type: 'Contenidos', estado: 'Fallo', motivo: 'Sin contenidos' });
                                }


                                resolve(true);
                            }

                        })

                        if (docCurso.modulos.length == 0) {
                            secuencia.validacionRegister({ type: 'Contenidos', estado: 'Fallo', motivo: 'Sin contenidos' });
                            resolve(true);
                        }
                    })
                },
                verificarExitenciaPruebas: () => {
                    return new Promise((resolve, reject) => {
                        let validacionPruebas = new Array();
                        validacionPruebas.push(docCurso.pruebas.length);
                        let contador = 0;
                        if (docCurso.modulos.length > 0) {
                            docCurso.modulos.forEach((modulo, idxModulo) => {
                                contador = contador + 1;
                                validacionPruebas.push(modulo.pruebas.length);
                                if (contador == docCurso.modulos.length) {
                                    let suma = _.sum(validacionPruebas);
                                    if (suma == 0) {
                                        secuencia.validacionRegister({ type: 'Pruebas', estado: 'Fallo', motivo: 'No hay pruebas ni en el curso ni en los módulos' });
                                        resolve(true);
                                    } else if (suma > 0) {
                                        secuencia.validacionRegister({ type: 'Pruebas', estado: 'Ok', motivo: 'Existencia pruebas' });
                                        resolve(true);
                                    }
                                }
                            })
                        } else if (docCurso.modulos.length == 0) {
                            let suma = _.sum(validacionPruebas);
                            if (suma == 0) {
                                secuencia.validacionRegister({ type: 'Pruebas', estado: 'Fallo', motivo: 'No hay pruebas ni en el curso ni en los módulos' });
                                resolve(true);
                            } else if (suma > 0) {
                                secuencia.validacionRegister({ type: 'Pruebas', estado: 'Ok', motivo: 'Existencia pruebas' });
                                resolve(true);
                            }
                        }


                    })
                },
                entregarData: () => {
                    return new Promise((resolve, reject) => {
                        resolve({ docCurso: docCurso, validaciones: validaciones });
                    })
                }

            }

            const steps = [secuencia.populateClasesPruebas, secuencia.populateContenidos,
            secuencia.verificaExistenciaModulo, secuencia.verificarExistenciaClases,
            secuencia.verificarExistenciaContenidos, secuencia.verificarExitenciaPruebas, secuencia.entregarData
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                if (index == 6) {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: data.value });
                }
            });

            sequence.on('failed', (data, index) => {
                console.log({ failed: data, index: index });
                // execute when each step in sequence failed
            });

            sequence.on('end', () => {
                // execute after finishing all steps in the sequence




            });


        })



    } catch (e) {

        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });

    }
}).post(rutas[9].ruta, (req, res, next) => {
    /**
        * Método inscribe un curso para la venta
        * @param param
        */

    try {

        let data = req.body.data;
        let param = data.param;
        console.log({ params: param });
        let saveCursoVenta = new schemaVentaCursoInscripcion();
        saveCursoVenta.curso = param.curso._id;
        saveCursoVenta.precio = param.precio;
        saveCursoVenta.fechaIncripcion = param.fechaIncripcion;
        saveCursoVenta.paypalCodeButton = param.paypalCodeButton;
        schemaVentaCursoInscripcion.create(saveCursoVenta).then((docCursoVenta) => {

            schemaCurso.updateOne({ "_id": param.curso._id }, param.curso).then((getCursoUpdate) => {
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
            })
        }).catch(err => {
            console.log({ errorConsulta: err });
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
        })



    } catch (e) {
        console.log({ errorParam: e });
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
}).post(rutas[10].ruta, (req, res, next) => {
    /**
        * Método envía los cursos registrados a la venta
        * @param param
        */

    try {

        schemaVentaCursoInscripcion.find({}).populate('curso').then((docs) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docs });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })



    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[11].ruta, (req, res, next) => {
    /**
        * Método envía los cursos registrados a la venta
        * @param param
        */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaVentaCursoInscripcion.deleteOne({ "_id": param._id }).then((docDelete) => {
            schemaCurso.updateOne({ "_id": param.curso._id }, param.curso).then((docUpdate) => {
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
            }).catch(err => {
                respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
            })
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
}).post(rutas[12].ruta, (req, res, next) => {
    /**
        * Método envía un curso venta
        * @param param
        */

    try {


        let data = req.body.data;
        let param = data.param;

        schemaVentaCursoInscripcion.findOne({ "_id": param }).populate('curso').then((doc) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: doc });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }


}).post(rutas[13].ruta, (req, res, next) => {
    /**
        * Método actualiza los horarios del curso, modulos, clases
        * @param param
        */

    try {

        let data = req.body.data;
        let param = data.param;



        let secuencia = {
            updateCurso: () => {
                return new Promise((resolve, reject) => {
                    schemaCurso.updateOne({ "_id": param.curso._id }, param.curso).then((docUpdate) => {
                        resolve(true);
                    })
                })
            },
            updateModulo: () => {
                return new Promise((resolve, reject) => {
                    let contador = 0;
                    param.curso.modulos.forEach((modulo, idx) => {
                        contador = contador + 1;
                        schemaModulo.updateOne({ "_id": modulo._id }, modulo).then((docUpdate) => {

                        })
                        if (contador == param.curso.modulos.length) {
                            resolve(true);
                        }
                    })
                })
            },
            updateClase: () => {
                return new Promise((resolve, reject) => {
                    let contador = 0;
                    param.curso.modulos.forEach((modulo, idx) => {
                        contador = contador + 1;
                        modulo.clases.forEach((clase) => {
                            schemaClase.updateOne({ "_id": clase._id }, clase).then((docUpdate) => {

                            })

                        })

                        if (contador == param.curso.modulos.length) {
                            resolve(true);
                        }
                    })
                })
            }
        }

        const steps = [
            secuencia.updateCurso, secuencia.updateModulo, secuencia.updateClase
        ];
        const sequence = new Sequence(steps, { interval: 1000 });
        sequence.on('success', (data, index) => {
            console.log({ data: data.value, index: index });
            if (index == 2) {
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
            }
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
}).post(rutas[14].ruta, (req, res, next) => {
    /**
        * Método envía curso completo
        * @param param
        */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaCurso.findOne({ "_id": param.cursoId }).populate('modulos').exec().then((docCurso) => {
            let secuencia = {
                populateClases: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docCurso.modulos.forEach((modulo, idx) => {
                            contador = contador + 1;
                            schemaModulo.findOne({ "_id": modulo._id }).populate('clases').exec().then((docModulo) => {
                                docCurso.modulos.splice(idx, 1, docModulo);
                            })

                            if (contador == docCurso.modulos.length) {
                                resolve(true);
                            }
                        })

                        if (docCurso.modulos.length == 0) {
                            resolve(true);
                        }

                    })
                },
                docData: () => {
                    return new Promise((resolve, reject) => {
                        resolve(docCurso);
                    })
                }
            }


            const steps = [
                secuencia.populateClases, secuencia.docData
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                console.log({ data: data.value });
                if (index == 1) {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: data.value });
                }
            });

            sequence.on('failed', (data, index) => {
                console.log({ failed: data, index: index });
                // execute when each step in sequence failed
            });

            sequence.on('end', () => {
                // execute after finishing all steps in the sequence

            });

        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }


}).post(rutas[15].ruta, (req, res, next) => {
    /**
        * Método envía la lista de estudiantes inscritos en un curso
        * @param param
        */

    try {

        let data = req.body.data;
        let param = data.param;
        console.log({ param: param });
        schemaCurso.findOne({ "_id": param.cursoId }).then((docCurso) => {
            let docClientes = null;
            let secuencia = {

                getEstudiantes: () => {
                    return new Promise((resolve, reject) => {

                        schemaCliente.find({}).then((docClientesArray) => {
                            console.log({ clientesArray: docClientesArray });
                            docClientes = docClientesArray;
                            resolve(true);
                        }).catch(err => {
                            console.log({ err: err });
                            resolve(true);
                        })
                    })
                },
                inscripciones: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docClientes.forEach((cliente, idx) => {
                            contador = contador + 1;
                            schemaCliente.findOne({ '_id': cliente._id }).populate('inscripcionCursos').exec().then((doccliente) => {
                                docClientes.splice(idx, 1, doccliente);
                            })

                            if (contador == docClientes.length) {
                                resolve(true);
                            }

                        })
                        if(docClientes.length==0){
                            resolve(true);
                        }
                    })
                },
                getData: () => {
                    return new Promise((resolve, reject) => {
                        resolve({ docClientes: docClientes, docCurso: docCurso });
                    })
                }
            }

            const steps = [
                secuencia.getEstudiantes,secuencia.inscripciones,secuencia.getData
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                console.log({ data: data.value,idx:index });
                if (index == 2) {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: data.value, error: null } });
                }
            });

            sequence.on('failed', (data, index) => {
                console.log({ failed: data, index: index });
                // execute when each step in sequence failed
            });

            sequence.on('end', () => {
                // execute after finishing all steps in the sequence

            });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Error inesperado' } });
    }
})
module.exports = secureRouter;