const express=require('express')
const routes=express.Router()
const mongodb=require('mongodb')
const db=require('../database/data')
const objectid=mongodb.ObjectId

routes.get('/',async(req,res)=>{
    const data= await db.getDb().collection('itemsdetails').find().toArray()    
    res.render('customer/shop',{data:data})
})
routes.get('/shop',async(req,res)=>{
    const data= await db.getDb().collection('itemsdetails').find().toArray()
    console.log(data)
    if(req.session.isAuth){
        const clientemail=req.session.client.email
        const client= await db.getDb().collection('client').findOne({email:clientemail})
        if(client.isAuthorized){
            return res.render('admin/shop',{data:data})
        }
    }
    res.render('customer/shop',{data:data})
})
let data
routes.get('/:id/viewdetail',async(req,res)=>{
    data=await db.getDb().collection('itemsdetails').findOne({_id:new objectid(req.params.id)})
    let input=req.session.input
    if(!input){
        input={
            hasError:"",
            message:"",
        }
    }
    req.session.input=null
    return res.render('customer/viewdetail',{
        data:data,
        input:input
    })
    
    
})

routes.get('/data',(req,res)=>{
    res.json(data)
})
routes.post('/cart/item',async(req,res)=>{
    if(req.session.isAuth){
        if(await db.getDb().collection('orders').findOne({client:req.session.client.email})){
            const productdata=await db.getDb().collection('orders').findOne({client:req.session.client.email})
            for(const order of productdata.orders){
                if(order.title==req.body.title){
                    await db.getDb().collection('orders').updateMany({"orders.title":order.title},{
                        $set:{
                            "orders.$.quanity":req.body.quanity
                        }
                    })
                }
            }
            if(!await db.getDb().collection('orders').findOne({client:req.session.client.email,"orders.title":req.body.title})){
                await db.getDb().collection('orders').updateMany({client:req.session.client.email},{
                    $push:{
                        orders:{
                        title:req.body.title,
                        price:req.body.price,
                        quanity:req.body.quanity
                        }
                    }
                })
            }
        }
        else{
            await db.getDb().collection('orders').insertMany([{
                client:req.session.client.email,
                orders:[{
                    title:req.body.title,
                    price:req.body.price,
                    quanity:req.body.quanity
                }]
            }])
        }
    }
    else{
        return res.status(404).render('404')
        }
        res.json("ok")
})
routes.get('/cart/item', async (req, res) => {
    if (req.session.isAuth) {
        const existing = await db.getDb().collection('orders').findOne({ client: req.session.client.email })
        res.json(existing)
    } else {
        res.json(null)
    }
})
routes.get('/cart/quanity',async(req,res)=> {
    if(req.session.isAuth) {
        const data = await db.getDb().collection('orders').findOne({client:req.session.client.email})
        res.json(data)
    }
    res.status(404)
})
routes.get('/cart',async(req,res)=>{
    if(req.session.isAuth){
        const cartdata=await db.getDb().collection('orders').findOne({client:req.session.client.email})
        return res.render('customer/cart',{cartdata:cartdata})
    }
    res.status(404).render('customer/404')
})
routes.post('/order',async(req,res)=>{
    if(req.session.isAuth){
        const cartdata=await db.getDb().collection('orders').findOne({client:req.session.client.email})
        const userdata=await db.getDb().collection('client').findOne({email:req.session.client.email})
        const date = new Date().toLocaleString("en-us",{
            weekday:'long',
            year:'numeric',
            month:'long',
            day:'numeric'
        })
        await db.getDb().collection('orders').deleteOne({client:req.session.client.email})
        await db.getDb().collection('ordersdata').insertMany([{
            client:req.session.client.email,
            cartdata,
            status:'pending',
            userdata,
            date:date
        }])
        res.redirect('/shop')
    }else{
        res.status(404).render('customer/404')
    }
})
routes.get('/order',async(req,res)=>{
    const client=await db.getDb().collection('client').findOne({email:req.session.client.email})
    const userauth=client.isAuthorized ? true : false
    if(req.session.isAuth){
        if(userauth){
            const data=await db.getDb().collection('ordersdata').find().toArray()
            res.render('admin/order',{data:data,isAuth:req.session.isAuth})
        }
        else if(req.session.isAuth){
            const data=await db.getDb().collection('ordersdata').find({client:req.session.client.email}).toArray()
            res.render('customer/order',{data:data,isAuth:req.session.isAuth})
        }   
        else{
            res.render('customer/404')
        }
    } 
    else{
        res.status(404).render('customer/404')
    }
})
routes.post('/admin/:id/updatestatus',async(req,res)=>{
    await db.getDb().collection('ordersdata').updateOne({_id:new objectid(req.params.id) },{$set:{
        status:req.body.status
    }})
    res.render('admin/order')

})

module.exports=routes