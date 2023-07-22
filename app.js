var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose');

var serialNumber = require('serial-number');
var randomstring = require("randomstring");
var request = require('request');
var serial = "";

serialNumber(function (err, value) {
    if (err) {
        serialNumber.preferUUID = true;
        serialNumber.useSudo(function (err, value) {
            if (err) {
                serial = randomstring.generate();
                console.log(serial);
            }
            else {
                serial = value;
                console.log(serial);
            }
        });
    }
    else {
        serial = value;
        console.log(serial);
    }
});


app.use(express.static('public'));
//var mongoDB = "mongodb://localhost:27017/conteo" //local
var mongoDB = "mongodb+srv://stadistics:Enero2023@cluster0.q3f0oyv.mongodb.net/conteo?retryWrites=true";// mongo atlas

mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Usuario = require('./models/user');
var Tipo = require('./models/tipo')
var Voto = require('./models/voto');

var conectados = 0;
var grafica = { error: "", sa: 0, al: 0, nu: 0, li: 0, co: "" }
var salida = { error: "", id: 0 }

io.sockets.on('connection', function (socket) {
    conectados++;
    grafica.li = conectados;
    console.log('conectados...' + conectados);

    Usuario.findOne({ user: serial }, function (err, user) {
        if (err) {
            salida.error = err;
            socket.emit('grafica', salida);
            return;
        }
        if (!user) {
            var nuevo = { user: serial };
            Usuario.create(nuevo, function (err) {
                if (err) {
                    salida.error = err;
                    //socket.emit('grafica', salida);
                    return;
                }
            });
        }
    });

    Tipo.find({}, function (err, data) {
        if (err) {
            salida.error = err;
            socket.emit('grafica', salida);
            return;
        }
        else if (data) {
            grafica.sa = data.filter(item => item.id == 1).length;
            grafica.al = data.filter(item => item.id == 2).length;
            grafica.nu = data.filter(item => item.id == 3).length;
        }
    });

    
    Voto.find({ user: serial }, function (err, data) {
        if (err) {
            salida.error = err;
            socket.emit('grafica', salida);
            return;
        }
        if (data.length == 0) grafica.co = serial;
        else grafica.co = "";
        console.log("serial..." + grafica.co);
    });
    

    io.sockets.emit('connected', grafica);

    socket.on('inicio', function (data) {
      
        io.sockets.emit('usuarios', conectados);
        // socket.emit('otherClick', clicks);
    });

    socket.on('disconnect', function (data) {
        conectados--;
        console.log('desconectado, conectados...' + conectados);
        io.sockets.emit('usuarios', conectados);
        // socket.emit('otherClick', clicks);
    });

    socket.on('votar', function (data) {
        var idVoto = data.id;
        //console.log(data.to);
        if (data.id == "" || data.id == undefined) {
            salida.error = "ingrese id";
            socket.emit('grafica', salida);
            return;
        }

        if (data.co == undefined) {
            salida.error = "ingrese código";
            socket.emit('grafica', salida);
            return;
        }

        if (data.to == "" || data.to == undefined) {
            salida.error = "ingrese token";
            socket.emit('grafica', salida);
            return;
        }

        var key = "6LfJxEMnAAAAAEG346ctnaDAyWh17uaRULk74Stx"; //prod

        /*
        request("https://www.google.com/recaptcha/api/siteverify?secret=" + key + "&response=" + data.to, function (error, response, body) {
            if (error) {
                console.log("error..." + err);
                salida.error = err;
                socket.emit('grafica', salida);
                return;
            } else if (body) {
                var p = JSON.parse(body);
                if (!p.success) {
                    salida.error = "ingrese token válido";
                    socket.emit('grafica', salida);
                    return;
                }

            }
        });
        */

        Usuario.find({ user: data.co }, function (err, user) {
            if (err) {
                salida.error = err;
                socket.emit('grafica', salida);
                return;
            }
            else if (!user) {
                salida.error = "código no encontrado";
                socket.emit('grafica', salida);
                return;
            }
        });

        Voto.find({ user: data.co }, function (err, user) {
            if (err) {
                salida.error = err;
                socket.emit('grafica', salida);
                return;
            }
            console.log(user);
        })

        var nuevo = { id: data.id };
        Tipo.create(nuevo, function (err) {
            if (err) {
                salida.error = err;
                socket.emit('grafica', salida);
                return;
            }
            else salida.id = parseInt(data.id);
            console.log(salida);
            io.sockets.emit('grafica', salida);
        });
    });

});

var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log("Servidor corriendo en http://localhost:" + port);
});