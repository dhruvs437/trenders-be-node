const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
// getting the userschema
const Product = require('../schema/productSchema');
const Order = require('../schema/orderSchema');


// to get onlu product ids array out of ids and qty
const findProductId = (cart)=>{
    let idsArray = [];
    for(let item in cart){
        idsArray.push(cart[item].productId)
    }
    return idsArray;
}


router.post('/api/userDetails', auth, async (req,res)=>{
    try{
        const userInfo = req.user;
        const cartArray = findProductId(userInfo.cart);
        let whilistArray = userInfo.whilist;
        let myWhilist = await Product.find({productId:{$in:whilistArray}});
        let myCart = await Product.find({productId:{$in:cartArray}});
        let orders = await Order.find({email:userInfo.email});

        myWhilist.reverse();
        myCart.reverse();
        orders.reverse();

        res.status(200).json({data:{userInfo:userInfo,myCart:myCart,myWhilist:myWhilist,orders:orders}});
    }catch(err){
        res.status(500).json({data:"there is error and we are not getting try block"});
        console.log(err)
    }

})




module.exports = router;