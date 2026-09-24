// One-off, idempotent seed script for local/dev product data.
// Run with: node scripts/seedProducts.js
// Re-running is safe: each product is upserted by its computed productId.

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../schema/productSchema');

// mirrors router/addProduct.js's stringToArray + tag-building so search/category
// pages behave the same for seeded products as for ones added through the admin form
const stringToArray = (str) => {
    let array = [];
    let curr = "";
    let ascii;
    array.push(curr);
    for (let i = 0; i < str.length; i++) {
        ascii = str.charCodeAt(i);
        if (str[i] == ' ') {
            if (curr.length > 0) {
                array.push(curr);
                curr = "";
            }
        } else if (ascii >= 97 && ascii <= 122) {
            curr += str[i];
        }
    }
    if (curr.length > 0) {
        array.push(curr);
    }
    return array;
}

const COMMON_PINCODES = "110001,110002,400001,560001,700001,600001,500001,380001,411001,141001";

const RAW_PRODUCTS = [
    // Mens
    { name:"Slim Fit Checked Casual Shirt", brand:"Allen Solly", category:"Shirts", occasion:"Casual", gender:"Mens", color:"Blue", size:"L", img:"1658930367293-shirts.jpg", price:1099, actualPrice:1999, stock:25, inTrending:true },
    { name:"Regular Fit Solid Formal Shirt", brand:"Van Heusen", category:"Shirts", occasion:"Formal", gender:"Mens", color:"White", size:"XL", img:"1658930810678-shirts.jpg", price:1299, actualPrice:2199, stock:18 },
    { name:"Checked Slim Fit Shirt", brand:"Fubar", category:"Shirts", occasion:"Casual", gender:"Mens", color:"Navy", size:"M", img:"1655540487763-m-kcsh-07chk07-nbfi-fubar-original-image4yfhvbxfezc.jpg", price:899, actualPrice:1499, stock:30 },
    { name:"Polo Collar Cotton Shirt", brand:"Funday Fashion", category:"Shirts", occasion:"Casual", gender:"Mens", color:"Green", size:"XL", img:"1655540228078-xl-funfas-0001-funday-fashion-original-imafcwzzmfh8mvx8.jpg", price:799, actualPrice:1399, stock:22 },
    { name:"Round Neck Solid T-Shirt", brand:"Puma", category:"T-Shirts", occasion:"Casual", gender:"Mens", color:"Black", size:"L", img:"1658932770669-tshirts.jpg", price:649, actualPrice:999, stock:40, inTrending:true },
    { name:"Graphic Print Cotton T-Shirt", brand:"Funday Fashion", category:"T-Shirts", occasion:"Casual", gender:"Mens", color:"Grey", size:"M", img:"1655540333703-xl-sysckdshtrw01-funday-fashion-original-imafd2fczy4byjgt.jpg", price:549, actualPrice:899, stock:35 },
    { name:"Solid Polo T-Shirt", brand:"Damensch", category:"T-Shirts", occasion:"Casual", gender:"Mens", color:"Maroon", size:"L", img:"1655540685324-m-dambpolo1-damensch-original-imag9g9renyx4e85.jpg", price:999, actualPrice:1499, stock:28 },
    { name:"Slim Fit Stretchable Jeans", brand:"Levis", category:"Jeans", occasion:"Casual", gender:"Mens", color:"Blue", size:"L", img:"1658933698394-jeans.jpg", price:1799, actualPrice:2999, stock:20, specialOffer:true },
    { name:"Regular Fit Denim Jeans", brand:"Pepe Jeans", category:"Jeans", occasion:"Casual", gender:"Mens", color:"Black", size:"XL", img:"1658933773141-j2.jpg", price:1599, actualPrice:2699, stock:15 },
    { name:"Hooded Bomber Jacket", brand:"Roadster", category:"Jacket", occasion:"Casual", gender:"Mens", color:"Olive", size:"L", img:"1658941904964-mensjacket.jpg", price:1899, actualPrice:3299, stock:12, inTrending:true },
    { name:"Track Lower Joggers", brand:"Puma", category:"Lower", occasion:"Casual", gender:"Mens", color:"Grey", size:"L", img:"1658934097850-lm.jpg", price:799, actualPrice:1299, stock:25 },
    { name:"Cotton Straight Kurta", brand:"Fabindia", category:"Kurta", occasion:"Casual", gender:"Mens", color:"White", size:"L", img:"seed-kurta.jpg", price:1199, actualPrice:1999, stock:15 },
    { name:"Silk Blend Sherwani", brand:"Manyavar", category:"Sherwani", occasion:"Party Wear", gender:"Mens", color:"Gold", size:"L", img:"seed-sherwani.jpg", price:3999, actualPrice:6999, stock:6, inTrending:true },

    // Womens
    { name:"Floral Print Casual Shirt", brand:"W", category:"Shirts", occasion:"Casual", gender:"Womens", color:"Pink", size:"M", img:"1658932238317-wshirts.jpg", price:899, actualPrice:1499, stock:20, inTrending:true },
    { name:"Solid Formal Shirt", brand:"AND", category:"Shirts", occasion:"Formal", gender:"Womens", color:"White", size:"S", img:"1658932253364-wshirts.jpg", price:1099, actualPrice:1799, stock:18 },
    { name:"Round Neck Printed T-Shirt", brand:"H&M", category:"T-Shirts", occasion:"Casual", gender:"Womens", color:"Yellow", size:"M", img:"1658933351565-wt.jpg", price:599, actualPrice:999, stock:30 },
    { name:"Crop Top T-Shirt", brand:"Max", category:"T-Shirts", occasion:"Casual", gender:"Womens", color:"White", size:"S", img:"1658933480918-w2.jpg", price:499, actualPrice:799, stock:25 },
    { name:"Printed A-Line Top", brand:"Global Desi", category:"Tops", occasion:"Casual", gender:"Womens", color:"Red", size:"M", img:"seed-tops.jpg", price:799, actualPrice:1299, stock:20, specialOffer:true },
    { name:"Skinny Fit High Rise Jeans", brand:"Zara", category:"Jeans", occasion:"Casual", gender:"Womens", color:"Blue", size:"M", img:"1658933876325-wj.jpg", price:1699, actualPrice:2799, stock:16 },
    { name:"Embroidered Lehanga Choli", brand:"Biba", category:"Lehanga", occasion:"Party Wear", gender:"Womens", color:"Maroon", size:"M", img:"seed-lehanga.jpg", price:2999, actualPrice:4999, stock:8, inTrending:true },
    { name:"Quilted Puffer Jacket", brand:"H&M", category:"Jacket", occasion:"Casual", gender:"Womens", color:"Black", size:"M", img:"1658941826585-jacketw.jpg", price:1999, actualPrice:3499, stock:10 },

    // Kids
    { name:"Checked Cotton Shirt", brand:"Gini and Jony", category:"Shirts", occasion:"Casual", gender:"Boys", color:"Blue", size:"M", img:"1658932552693-bshirts.jpg", price:549, actualPrice:899, stock:20 },
    { name:"Printed Round Neck T-Shirt", brand:"mothercare", category:"T-Shirts", occasion:"Casual", gender:"Boys", color:"Red", size:"S", img:"1658932922528-btshirts.jpg", price:399, actualPrice:699, stock:25, specialOffer:true },
    { name:"Floral Print Frock Top", brand:"mothercare", category:"Tops", occasion:"Casual", gender:"Girls", color:"Pink", size:"S", img:"seed-girls-top.jpg", price:449, actualPrice:799, stock:18 },
];

async function seed() {
    await mongoose.connect(process.env.DATABASE);
    console.log('connected to database');

    for (const raw of RAW_PRODUCTS) {
        const color = raw.color.toLowerCase();
        const productId = `${raw.name.toLowerCase()} ${raw.brand.toLowerCase()} ${color} ${raw.size}`;
        const discount = parseInt(((raw.actualPrice - raw.price) / raw.actualPrice) * 100);
        let tagsSource = `${productId} ${raw.gender} ${raw.occasion} ${raw.category}`;
        tagsSource = tagsSource.toLowerCase();
        const tags = stringToArray(tagsSource);

        const doc = {
            productId,
            img: raw.img,
            name: raw.name,
            brand: raw.brand,
            gender: raw.gender,
            occasion: raw.occasion,
            category: raw.category,
            color,
            stock: raw.stock,
            discount,
            price: raw.price,
            actualPrice: raw.actualPrice,
            description: `${raw.name} by ${raw.brand}. Comfortable fit, quality fabric, perfect for ${raw.occasion.toLowerCase()} wear.`,
            pincodes: COMMON_PINCODES,
            size: raw.size,
            inTrending: !!raw.inTrending,
            specialOffer: !!raw.specialOffer,
            tags,
        };

        await Product.findOneAndUpdate({ productId }, doc, { upsert: true, setDefaultsOnInsert: true });
        console.log('upserted:', productId);
    }

    console.log(`done: ${RAW_PRODUCTS.length} products upserted`);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
