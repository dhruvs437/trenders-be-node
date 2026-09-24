const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// getting the userschema
const User = require('../schema/userSchema');
const Otp = require('../schema/otpSchema');


router.post('/api/signup', async (req,res)=>{
    try{
        const {email,password,otp} = req.body;
        if(!password || !otp){
            return res.status(202).json({"message":"fill it completely"});
        }

        const otpRecord = await Otp.findOne({email,purpose:'signup'});
        const otpValid = otpRecord && await bcrypt.compare(otp.toString(),otpRecord.otpHash);
        if(!otpValid){
            return res.status(203).json({message:"wrong otp"});
        }
        await Otp.deleteOne({_id:otpRecord._id});

        const newUser = new User({email,password});
        let token = await newUser.generateToken();
        await newUser.save();
        res.status(201).json({token:token})
    }catch(err){
        res.status(500).json({error:"there is error and we are not getting req.body"});
        console.log(err)
    }

})




module.exports = router;