const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "f432c78dfa4dac",
        pass: "a88e090aa45b37"
    }
});