const express = require('express');
const bcrypt = require('bcryptjs');
const { google } = require('googleapis');
const router = express.Router();

// getting the userschema
const User = require('../schema/userSchema');
const Otp = require('../schema/otpSchema');

// raw SMTP from Render to Gmail was silently timing out on every port tried
// (ETIMEDOUT), consistent with the host or Gmail dropping cloud egress IPs.
// Resend's sandbox sender could only deliver to our own account without a
// verified domain. Sending via the Gmail API (HTTPS) as our own account
// sidesteps both: no SMTP port, and it's a real mailbox that can send to anyone.
const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

function encodeMessage(to, from, subject, text) {
    const message = [`From: ${from}`, `To: ${to}`, `Subject: ${subject}`, '', text].join('\r\n');
    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function sendEmail(email,text,subject){
    gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodeMessage(email, process.env.MY_EMAIL, subject, text) }
    }).then(()=>{
        console.log('email sent to', email);
    }).catch((error)=>{
        console.log(error);
    });
}


const makeOtp = ()=>{
    let otp = Math.random();
    otp = 1000+ (otp*9000);
    otp = Math.floor(otp);
    return otp;
}

router.post('/api/sendEmail', async (req,res)=>{
    try{
        const {email,type} = req.body;
        const purpose = type=='signup' ? 'signup' : 'forgotPassword';
        const userExist = await User.findOne({email:email});

        if(purpose=='signup' && userExist){
            return res.status(422).json({message:'this user alredy exist'});
        }
        if(purpose=='forgotPassword' && !userExist){
            return res.status(422).json({message:'this id is never logged before'});
        }

        const otp = makeOtp();
        const otpHash = await bcrypt.hash(otp.toString(),10);
        // upsert resets both the hash and the TTL clock if an OTP was already pending
        await Otp.findOneAndUpdate({email,purpose},{otpHash,createdAt:new Date()},{upsert:true});

        const text = purpose=='signup'
            ? "your otp for regestring with trenders is " + otp
            : "your otp to change yor password is " + otp;
        const subject = purpose=='signup'
            ? 'OTP for regestring with trenders'
            : 'OTP for settingn new password on trenders';
        sendEmail(email,text,subject);

        res.status(200).json({message:'otp sent'});
    }catch(err){
        res.status(500).json({error:"there is error and we are not getting req.body"});
        console.log(err)
    }

})




module.exports = router;
