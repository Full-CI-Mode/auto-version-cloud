
var express = require('express');
const createserver = require('./server')

const app = createserver()
app.listen(3005, ()=>{
  console.info("Server running on 3005 and awaiting files!!")
})
