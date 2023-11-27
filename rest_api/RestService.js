var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(__dirname + '/images'));

var pool = mysql.createPool({
    connectionLimit : 1000, 
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'union_agricola',
    debug    :  false
});

pool.getConnection(function (err, connection) {
  if (err) {
    console.error('Error al conectar a la base de datos: ' + err.message);
    throw err; // Termina la aplicación si no se puede conectar a la base de datos
  }
  console.log('Conexión a la base de datos exitosa.');
  connection.release(); // Libera la conexión
});

pool.on('error', function (err) {
  console.error('Error en la piscina de conexiones: ' + err.message);
  // Puedes agregar un manejo específico aquí, como intentar reconectar o enviar una notificación.
});

app.use(router);

app.listen(3000, function() {  
  console.log("Node server running on http://localhost:3000");
});



router.get('/api/images', function (req, res)
 { 
    pool.getConnection(function(err,connection){
        if (err) {
            res.status(500).send(err);
            console.log('Error Conectando a Base de Datos');
            return;
        }
        console.log('connected as id ' + connection.threadId);
        var query = "SELECT * from productos order by name" ;
        connection.query(query,function(err,rows){
            if(!err) {
                res.header("Access-Control-Allow-Origin", "*");
                res.status(200).send(rows);
                console.log("Envie:",rows);
            }
            else{
                res.header("Access-Control-Allow-Origin", "*");
                res.status(500).send({"updated":false, "error":err});
            }
        });
        connection.release();
    });
});
