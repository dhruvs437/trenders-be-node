const express = require('express');
const router = express.Router();

const getProductIds = (array) =>{
    let ids = [];
    for(let i in array){
        ids.push(array[i].productId);
    }
    return ids;
}

const paymentCheck = ()=>{
    return true;
}

const auth = require('../middleware/auth');
// getting the userschema
const Order = require('../schema/orderSchema');
const Product = require('../schema/productSchema');
const User = require('../schema/userSchema');


router.post('/api/order', auth, async (req,res)=>{
    try{
        const {details} = req.body;
        if(paymentCheck()){
            for(let i in details.cart){
                await Product.findOneAndUpdate({productId:details.cart[i].productId},{$inc:{stock:-details.cart[i].qty}});
            }
            // email comes from the verified user, not the client-supplied details
            const newOrder = new Order({...details, email:req.user.email});
            await newOrder.save();
            await User.findOneAndUpdate({_id:req.user._id},{$set:{cart:[]}});
            res.status(201).json({message:"order placed successfully"})
        }
    }catch(err){
        res.status(500).json({error:"there is error and we are not getting req.body"});
        console.log(err)
    }

})




module.exports = router;