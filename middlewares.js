var express = require('express');

const authPage = (permissions)=>{
    return (req,res,next)=>{
        if(req.cookies.user!=null){
        const user = JSON.parse(req.cookies.user);
        console.log(user.role);
        const userRole = user.role;
        if(permissions.includes(userRole)){
            next()
        }else{
            return res.status(401).json("not authorized");
        }
    }else return res.status(401).json("not authenticated");
    }
}

const authCourse = (req,res,next)=>{

}

module.exports = {authCourse,authPage};