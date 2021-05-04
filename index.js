require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const passport = require('passport');
const server = require('http').createServer(app);
const io = require('socket.io')(server);


const Account = require('./models/AccountModel')
const RoleRouter = require('./routes/RoleRouter')
const NotificationrRouter = require('./routes/NotificationRouter')
const AccountRouter = require('./routes/AccountRouter')
const AdminRouter = require('./routes/AdminRouter')
const NewFeedRouter = require('./routes/NewFeedRouter')
const AddRole = require('./routes/AddRole')
const apigoogle = require('./routes/apigoogle')

app.use(cors())
app.use(passport.initialize())
app.set('socketio', io)

const CheckLogin = require('./auth/CheckLogin')
const CheckAdmin = require('./middleware/CheckAdmin')

app.use(express.urlencoded({extended:false}))
app.use(express.json())
const port = process.env.PORT || 8080

app.get('/',(req,res)=>{
    res.json({
        code:0,
        message: 'Wellcom to my REST API'
    })
})



app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get('/auth/google/callback',
    passport.authenticate( 'google', {
    failureRedirect: '/' }),
    function(req, res) {
        let {displayName,email}= req.user
        console.log(req.user)
        let verifyEmail = email.split("@")[1]
        if(verifyEmail !=="student.tdtu.edu.vn"){
            return res.json({code:401,message:"Tài khoản không được phép đăng nhập"})
        }
        
        Account.findOne({
            email:email,
        })
        .then(acc=>{
            if(!acc){
                let user = new Account({
                    email:email,
                    fullname:displayName,
                    role:"student"
                })
                return user.save()
            }
        })
        .then(()=>{
            const {JWT_SECRET} = process.env
            jwt.sign({
                email:email,
                fullname:displayName,
                role:"student"
            },JWT_SECRET,{
                expiresIn:'1h'
            },(err,token)=>{
                if(err) throw err
                return res.json({
                    code:0,
                    message:"Đăng nhập thành công",
                    token: token
                })
            })
        })
        .catch(e=>{
            return res.status(401).json({code:2,message:"Đăng nhập thất bại:"+ e.message})
        })
})

app.use('/role',RoleRouter)
app.use('/notification',CheckLogin,NotificationrRouter)
app.use('/account',AccountRouter)
app.use('/roleadd',AddRole)
app.use('/admin',CheckAdmin,CheckLogin,AdminRouter)
app.use('/newfeed',CheckLogin,NewFeedRouter)
app.use('/api',apigoogle)

// mongodb+srv://adminPDA:<password>@cluster0.v9bnw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// adminPDA
// mn2jHpinkZEvtYi

mongoose.connect('mongodb://localhost/FPJ',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>{
    server.listen(port,()=>{
        console.log(`http://localhost:${port}`)
    })
})
.catch(e =>{
    console.log('Không thể kết nối với database'+e.message)
})
