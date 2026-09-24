const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
// getting the userschema
const User = require('../schema/userSchema');


router.post('/api/addToWhilist', auth, async (req,res)=>{
    try{
        const {productId,add} = req.body;
        if(add){
            const data = await User.findOneAndUpdate({_id:req.user._id},{$push:{whilist:productId}});
            return res.status(200).json({data:data});
        }else{
            const data = await User.findOneAndUpdate({_id:req.user._id},{$pull:{whilist:productId}});
            return res.status(200).json({data:data});
        }
    }catch(err){
        res.status(500).json({error:"there is error and we are not getting req.body"});
        console.log(err)
    }

})



module.exports = router;