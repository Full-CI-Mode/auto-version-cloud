
var express = require('express');
const createserver = require('./server')

const app = createserver()
app.listen((process.env.PORT || 5000), ()=>{
  console.info("Server running on 3005 and awaiting files!!")
})
