var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var multer= require('multer');
var GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');
var crypto=require('crypto');
var Task=require('./modal/Task');
var formModel=require('./formModel');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cors= require('cors');
const mongoURI='mongodb://127.0.0.1:27017/files';
// Create  mongo connection
const conn=mongoose.createConnection(mongoURI);


let gfs;

conn.once('open',(err)=>{
  if(err) throw err;
  gfs = Grid(conn.db,mongoose.mongo);
  gfs.collection('apFiles');
  console.log("Connection is established");
  console.log(gfs.files.find());
})


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(logger('dev')); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Create storage Engine

const storage= new GridFsStorage({
 url:mongoURI,
 file: (req,file) => {
   return new Promise((resolve,reject)=>{
    crypto.randomBytes(16,(err,buff)=>{
      if(err) {

        return reject(err);
      }

      const filename=buff.toString('hex') + path.extname(file.originalname);
      const fileInfo ={
        filename:filename,
        bucketName:'apFiles'
      };
       
      resolve(fileInfo);
    })
   })
 }

});



//Multer configuration for single file uploads
let upload=multer ({
  storage
}).single('file');


// Route for file upload
app.post('/upload',(req,res)=>{
  upload(req,res,(err)=>{
    if(err) {
      res.json({error_code:1,err_desc:err});
      return;
    }

    var formData={
      firstname:req.body.firstname,
      lastname:req.body.lastname,
      occupation:req.body.occupation
    };
     
    var form= new formModel(formData);

    form.save();
     
    res.json({file:req.file});
    //res.redirect('/');
   
  })
})

// Downloading the single file 
app.get('/file/:filename',(req,res)=>{
   
    gfs.collection('apFiles');// set collection name to lookup into
  
    /**First check if the file exists  */
   
    gfs.files.find({filename:req.params.filename}).toArray(function(err,files){
      if(!files || files.length === 0) {
        return res.status(404).json({
          responseCode:1,
          responseMessage:"error"
        })
      }

      // create read stream
      var readstream= gfs.createReadStream({
        filename:files[0].filename,
        root:"apFiles"
      });

      // set the proper content type 
      res.set('Content-Type',files[0].contentType);

      return readstream.pipe(res);
    })
   
})

// get the occupationData 

app.get('/occupationData',function(req,res){
  
  Task.getOccupationData(function(err,rows){
    if(err) {
      res.json(err);
    }else {
      res.json(rows);
    }
  })
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
