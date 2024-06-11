const express=require('express')
const routes=express.Router()
const bcrypt=require('bcrypt')
const db=require('../database/data')


routes.get('/signup',(req,res)=>{
        let Error=req.session.input
        if(!Error){
        Error={
        hasError:false,
        message:"",
        email:"",
        password:"",
        street:"",
        unicode:"",
        city:""
        }
        }
    
        req.session.input=null
        res.render('customer/signup',{Error:Error})
})

routes.post('/signup',async(req,res)=>{
    const email=req.body.email
    const password=req.body.password
    const street=req.body.street
    const unicode=req.body.unicode
    const city=req.body.city
    if(!email || !password ||!street||!unicode||!city){
        req.session.input={
        hasError:true,
        message:"Please Enter all details",
        email:email,
        password:password,
        street:street,
        unicode:unicode,
        city:city
        }
        req.session.save(()=>{
            res.redirect('customer/signup')
        })
        return
    }

    if(!email.includes('@')){
        req.session.input={
            hasError:true,
            message:"Please Enter Email properly",
            email:email,
            password:password,
            street:street,
            unicode:unicode,
            city:city
            }
            req.session.save(()=>{
                res.redirect('customer/signup')
            })
            return
    }
    if(!password.length>=8){
        req.session.input={
            hasError:true,
            message:"Please Enter password length not greather than 8",
            email:email,
            password:password,
            street:street,
            unicode:unicode,
            city:city
            }
            req.session.save(()=>{
                res.redirect('customer/signup')
            })
            return
    }
    if(unicode.length!=6){
        req.session.input={
            hasError:true,
            message:"Please vaild unicode",
            email:email,
            password:password,
            street:street,
            unicode:unicode,
            city:city
            }
            req.session.save(()=>{
                res.redirect('customer/signup')
            })
            return

        }
        const hashpassword=await bcrypt.hash(password,12)
        const data={
           
            email:email,
            password:hashpassword,
            street:street,
            unicode:unicode,
            city:city
        }
       await db.getDb().collection('client').insertMany([data])
        res.redirect('/login')
})
routes.get('/login',(req,res)=>{
    let input=req.session.input
    if(!input){
        input={
            hasError:false,
            message:"",
            email:"",
            password:""
        }
        req.session.input=null
    }
    
   res.render('customer/login',{input:input}) 
})
routes.post('/login',async(req,res)=>{
    const email=req.body.email
    const password=req.body.password
    const data= await db.getDb().collection('client').findOne({email:email})
    if(!email||!password){
        req.session.input={
            hasError:true,
            message:"Invalid input",
            email:email,
            password:password
        }
        req.session.save(()=>{
            res.redirect('customer/login')
        })
      return
        }
        const comparepassword= await bcrypt.compare(password,data.password)
        if(!comparepassword){
            req.session.input={
                hasError:true,
                message:"Invaild password",
                email:email,
                password:password
            }
            req.session.save(()=>{
                res.redirect('/login')
            })
            return
        }
    if(!data){
        req.session.input={
            hasError:true,
            message:"Email and Password doesn't exists",
            email:email,
            password:password
        }
        req.session.save(()=>{
            res.redirect('/login')
        })
    }
 
    req.session.isAuth=true;
    req.session.client={email:email,password:password}
    res.redirect('/shop')
})

routes.get('/logout',(req,res)=>{
    req.session.isAuth=false;
    req.session.client=null;
    res.redirect('/login')
})

module.exports=routes