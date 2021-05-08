require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const server = require('http').createServer(app);
const io = require('socket.io')(server)

const AccountModel = require('./models/AccountModel')
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
        message: 'Wellcom to my REST API',
        time:DateTime.now()
    })
})

app.get('/resetpassword', async(req,res)=>{
    try{
        resetpassword = await bcrypt.hash('123456789',10)
        await AccountModel.updateOne({user_name:"Admin"},{password:resetpassword })
        return res.json({code:0,message:"password đổi thành công: 123456789"})
    }catch(err){
        return res.json({code:1,message:err.message})
    }
})

io.on('connection', function(socket){
    socket.on('notiadd', (data) => {
        console.log(data);
    })
    
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    })
  
});

app.use('/role',RoleRouter)
app.use('/notification',CheckLogin,NotificationrRouter)
app.use('/account',AccountRouter)
app.use('/roleadd',AddRole)
app.use('/admin',CheckLogin,CheckAdmin,AdminRouter)
app.use('/newfeed',CheckLogin,NewFeedRouter)
app.use('/api',apigoogle)

// mongodb+srv://adminPDA:<password>@cluster0.v9bnw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// adminPDA
// mn2jHpinkZEvtYi

mongoose.connect('mongodb+srv://adminPDA:mn2jHpinkZEvtYi@cluster0.v9bnw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
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
