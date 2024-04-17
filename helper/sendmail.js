const nodemailer = require("nodemailer");
const config = require("../configs/config");

const transporter = nodemailer.createTransport({
    host: config.Host,
    port: config.Port,
    secure: false,
    auth: {
        user: config.Username,
        pass: config.Password,
    },
});

module.exports = async function (desMail, URL) {
    try {
        const info = await transporter.sendMail({
            from: 'info@demomailtrap.com',
            to: desMail,
            subject: "Tic-Tac-Toe Password Reset",
            html: `<p><a href="${URL}">Click vào đây để đổi password</a></p>`,
        });

        console.log("Gửi mail thành công", info.messageId);
        return true;
    } catch (error) {
        console.error("Gửi mail thất bại:", error);
        return false;
    }
};
