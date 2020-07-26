import * as nodemailer from "nodemailer";
import * as config from "../config";

import GenerateHtml from "./generateTemplate";
const logger = require("./logger").createLogger("mail.log");

var sendgrid = require("sendgrid")(
  "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"
);
/**
 * Send Mail to User
 * @param template Template to be used
 * @param subject Subject for email
 * @param data Data to be used
 * @param to User or recepient
 */
class Mailer {
  template: string;
  subject: string;
  data: any;
  to: string;
  html;
  constructor(template: string, subject: string, data: any, to: string) {
    this.template = template;
    this.subject = subject;
    this.data = data;
    this.to = to;
  }

  generateHTML() {
    return new Promise(async (res, reject) => {
      try {
        const html = await GenerateHtml(this.template, {
          ...this.data,
          SITE_URL: config.SITE_URL
        });
        this.html = html;
        res();
        return;
      } catch (e) {
        console.log("Could not generat HTML", e.message);
        reject();
      }
    });
  }

  send() {
    return new Promise(async (res, reject) => {
      try {
        var sg = require("sendgrid")(
          // "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", // For chaitrali@1
          "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"
        );

        var request = sg.emptyRequest({
          method: "POST",
          path: "/v3/mail/send",
          body: {
            personalizations: [
              {
                to: [
                  {
                    email: this.to
                  }
                ],
                subject: "Thank you for choosing car rental"
              }
            ],
            from: {
              email: "wsiyaruh@wsiyaruh.com",
              name: "Waseet Alsayara" //ramadan@homesrusgroup.com    "personality@homesrusgroup.com" for homesrus account and chaitrali@scriptlanes.com for test account
            },
            content: [
              {
                type: "text/html",
                value: this.html
              }
            ]
          }
        });

        //With callback
        sg.API(request, function(error, response) {
          if (error) {
            //console.log('Error response received', error);
            res(error);
          } else {
            console.log(response.statusCode);
            console.log(response.body);
            console.log("success, Mail sent successfully");
            // cb(
            //   null,
            //   "success",
            //   "Your form submitted successfully and sent to your email"
            // );

            res(response);
          }
        });

        // // Generate test SMTP service account from ethereal.email
        // // Only needed if you don't have a real mail account for testing
        // let account = await nodemailer.createTestAccount();

        // // create reusable transporter object using the default SMTP transport
        // let transporter = nodemailer.createTransport({
        //   host: "smtp.ethereal.email",
        //   port: 587,
        //   secure: false, // true for 465, false for other ports
        //   auth: {
        //     user: account.user, // generated ethereal user
        //     pass: account.pass // generated ethereal password
        //   }
        // });

        // // setup email data with unicode symbols
        // let mailOptions = {
        //   from: '"Fred Foo 👻" <bhumkarchaitrali@gmail.com>', // sender address
        //   to: this.to, // list of receivers
        //   subject: this.subject || "Email", // Subject line
        //   html: this.html // html body
        // };

        // // send mail with defined transport object
        // let info = await transporter.sendMail(mailOptions);

        // console.log("Message sent: %s", info.messageId);
        // res();
        // // Preview only available when sending through an Ethereal account
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      } catch (error) {
        console.log("ERROR", error);
        logger.error(
          `${error.name} - ${error.code} for ${this.subject} = ${error.message}`
        );
        reject(error.message);
      }
    });
  }
}

export default Mailer;
