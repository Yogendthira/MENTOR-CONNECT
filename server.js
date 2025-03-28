// server.js - Simple signaling server for WebRTC connections

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors());

// Set up Socket.IO with CORS
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'mentor.html'));
});

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'student_dashboard.html'));
});

// Store connected users
const users = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // When a user registers
    socket.on('register', (data) => {
        console.log('User registered:', data);
        
        // Store user information
        users[data.peerId] = {
            socketId: socket.id,
            peerId: data.peerId,
            role: data.role,
            name: data.name
        };
        
        // Notify other users that a new user has connected
        socket.broadcast.emit('user-connected', {
            peerId: data.peerId,
            role: data.role,
            name: data.name
        });
    });
    
    // When a call is initiated
    socket.on('call-initiated', (data) => {
        console.log('Call initiated:', data);
        
        // Find the recipient's socket ID
        const recipient = users[data.to];
        if (recipient) {
            // Forward the call request to the recipient
            io.to(recipient.socketId).emit('incoming-call', {
                from: data.from,
                name: data.name
            });
        }
    });
    
    // When a call is declined
    socket.on('call-declined', (data) => {
        console.log('Call declined:', data);
        
        // Find the caller's socket ID
        const caller = users[data.to];
        if (caller) {
            // Notify the caller that the call was declined
            io.to(caller.socketId).emit('call-declined', {
                from: data.from
            });
        }
    });
    
    // When a call is ended
    socket.on('call-ended', (data) => {
        console.log('Call ended:', data);
        
        // Find the recipient's socket ID
        const recipient = users[data.to];
        if (recipient) {
            // Notify the recipient that the call has ended
            io.to(recipient.socketId).emit('call-ended', {
                from: data.from
            });
        }
    });
    
    // When a user disconnects
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Find and remove the disconnected user
        let disconnectedPeerId = null;
        for (const peerId in users) {
            if (users[peerId].socketId === socket.id) {
                disconnectedPeerId = peerId;
                break;
            }
        }
        
        if (disconnectedPeerId) {
            // Remove the user from the users object
            const userData = users[disconnectedPeerId];
            delete users[disconnectedPeerId];
            
            // Notify other users that this user has disconnected
            socket.broadcast.emit('user-disconnected', {
                peerId: disconnectedPeerId,
                role: userData.role,
                name: userData.name
            });
        }
    });
});

// Set port and start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 