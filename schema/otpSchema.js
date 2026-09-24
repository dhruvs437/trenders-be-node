const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email:{type:String, required:true},
    purpose:{type:String, enum:['signup','forgotPassword'], required:true},
    otpHash:{type:String, required:true},
    // TTL index: the document (and the OTP) is auto-deleted 10 minutes after it's (re)issued
    createdAt:{type:Date, default:Date.now, expires:600},
})

const Otp = mongoose.model('OTP', OtpSchema);

module.exports = Otp;
