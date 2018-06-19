var nodemailer = require('nodemailer');
var configuracion= require('./configuracion-mail.json');
var mailConfig= process.env.mailConfig;
var mail = {

    

    send:(mailOption)=>{

        /**
         *  
         * param require mailOption = from, to, subject, text
         *  
         */

        var transporter = nodemailer.createTransport(mailConfig);
        
        return transporter.sendMail(mailOption)

    }


}

module.exports=mail;