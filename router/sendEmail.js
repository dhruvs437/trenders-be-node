const express = require('express');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');
const router = express.Router();

// getting the userschema
const User = require('../schema/userSchema');
const Otp = require('../schema/otpSchema');

// raw SMTP from Render to Gmail was silently timing out on every port tried
// (ETIMEDOUT), consistent with the host or Gmail dropping cloud egress IPs -
// Resend sends over HTTPS, which isn't subject to that
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

function sendEmail(email,text,subject){
    resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: subject,
        text: text
    }).then(({data,error})=>{
        if (error) {
            console.log(error);
        } else {
            console.log('email sent:', data.id);
        }
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
