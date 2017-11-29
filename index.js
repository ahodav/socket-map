const Koa = require('koa');
const port = 3000;
const Router = require('koa-router');
const serve = require('koa-static');
const http = require('http');
const socket = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = new Koa();
const router = new Router();

app.use(serve('dist'))

router.get('*', function(ctx) {
    ctx.body = fs.readFileSync(path.resolve(path.join('dist', 'index.html'), 'utf-8')); 
})

app.use(router.routes());
app.use(router.allowedMethods());

const connectedUsers = {};

const server = http.createServer(app.callback());
const io = socket(server);
io.on('connection', (socket) => {
    const user = {
        id: socket.id,
        name: socket.handshake.headers.username,
        lat: socket.handshake.headers.lat,
        lng: socket.handshake.headers.lng
    }

    connectedUsers[socket.id] = user;
    console.log('connected', connectedUsers);

    socket.emit('all users', connectedUsers);
    io.sockets.emit('new user', user);

    socket.on('disconnect', function() {
        io.sockets.emit('delete user', socket.id);
        delete connectedUsers[socket.id];

        
        console.log('delate', connectedUsers);
    });
})


server.listen(port);