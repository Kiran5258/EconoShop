const express=require('express')
const mongodb= require('mongodb')
const routes=express.Router()
const multer=require('multer')
const db=require('../database/data')

const storage=multer.diskStorage({
    destination:function(req,file,cd){
        cd(null,'images')
    },
    filename:function(req,file,cb){
     cb(null,Date.now()+"-"+file.originalname)
    }
})
const upload=multer({storage:storage})

routes.get('/admin/upload',async(req,res)=>{
    const data=await db.getDb().collection('itemsdetails').find().toArray()
    const userData =await req.session.client
    const useremail=  userData.email
    const client= await db.getDb().collection('client').findOne({email:useremail})
    console.log(client)
    if(req.session.isAuth){
        if(client.isAuthorized){
            res.render('admin/upload')
        }
    }
    res.status(404).render('customer/404')
})
routes.post('/admin/upload',upload.single('images'),async(req,res)=>{
    const uploadimage=req.file
    const data= await db.getDb().collection('itemsdetails').insertOne({...req.body,imagePath:uploadimage.path})
    res.redirect('/shop')
})



module.exports=routes