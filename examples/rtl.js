var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var canvas = new Canvas(500, 200)
var ctx = canvas.getContext('2d')

ctx.strokeStyle = "red"
ctx.font = 'normal 40px Impact, serif'
ctx.direction = "ltr"
ctx.strokeText('Hello world', 0, 100)

ctx.strokeStyle = "green"
ctx.direction = "rtl"
ctx.strokeText("Hello world", 250, 50)

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'rtl.png')))
