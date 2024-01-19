const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const qs = require('qs');
var cors = require('cors')
const PORT = process.env.PORT || 3000;
const eurekaHelper = require('./eureka-helper');
const axios = require('axios')
const {authPage,authCourse} = require('./middlewares');
app.use(express.json());
app.listen(PORT, () => {
  console.log("user-service on 3000");
})

app.use(cors({
  origin:'*'
}))

app.get('/', authPage(["admin","emetteur","agent"]),(req, res) => {
 res.json("I am user-service")
})

app.get('/logout',(req,res)=>{
  cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }    
        res.cookie(prop, '', {expires: new Date(0)});
    }
    res.redirect('/');
  })


app.post('/login',async (req,res)=>{
  var user = {
    id:'',
    email: req.body.email,
    password: req.body.password,
    role:''
  };
  const config = {
    method: 'post',
    url: 'http://localhost:1945/login/',
    data:user,
    headers: {
      'Content-Type': 'application/json'
   },
}
  let ress = await axios(config).then(response=>{
    user=response.data;
    if(user.email == null){
      res.status(402).json('Email and password are incorrect !');
    }else{
      res.cookie('user', JSON.stringify(user), { expires: new Date(Date.now() + 900000) });
      console.log(user.role)
      res.send(JSON.stringify(response.data));

    }
  })

})


app.post('/fromAgentAccount', authPage(["agent"]), async(req,res)=>{

  const config = {
    method: 'put',
    url: 'http://localhost:9000/fromAgentAccount/',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
   },
   data:req.body
}
  let ress = await axios(config).then((response)=>{
    console.log(response);
    res.send(response.data);
  })
})

app.get('/api/B', async (req, res) => {
  const config = {
    method: 'get',
    url: 'http://localhost:1945/get_Agents/',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
   }
}
  let ress = await axios(config).then((response)=>{
    res.send(response.data);
  })
});

eurekaHelper.registerWithEureka('user-service', PORT);

module.exports = app;
