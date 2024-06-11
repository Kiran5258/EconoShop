const express=require('express')
const path=require('path')
const db=require('./database/data')
const admin=require('./routes/admin')
const cust=require('./routes/cust')
const routes=require('./routes/routes')
const session=require('express-session')
const exp = require('constants')
const mongodbstore=require('connect-mongodb-session')(session)

const app=express()

app.use(express.json())


const sessionstore=new mongodbstore({
    url:'mongodb://localhost:27017',
    collection:'sessions'
})
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    store:sessionstore
}))


app.use(express.urlencoded({extended:false}))
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.static('public'))
app.use('/images',express.static('images'))

app.use(routes)
app.use(cust)
app.use(admin)

db.connectToDatabase().then(()=>{
    app.listen(3000)
})