// communication.js - Handles WebRTC peer connections for video calls and messaging

// Configuration for connecting to the signaling server
const SIGNALING_SERVER_URL = 'https://karpagam-mentoring.herokuapp.com';
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        {
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        }
    ]
};

// Determine if this is mentor or student by checking the URL
const isMentor = window.location.pathname.includes('mentor.html');
const role = isMentor ? 'mentor' : 'student';

// User IDs - these would ideally come from a database
const MENTOR_ID = 'mentor-jebakumar';
const STUDENT_ID = 'student-afshana';

// The peer ID based on role
const myPeerId = isMentor ? MENTOR_ID : STUDENT_ID;
const remotePeerId = isMentor ? STUDENT_ID : MENTOR_ID;

// Global variables
let peer = null;
let connection = null;
let localStream = null;
let remoteStream = null;
let socket = null;
let videoEnabled = true;
let audioEnabled = true;
let screenShare = null;

// DOM elements
const videoModal = document.getElementById('video-call-modal');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const toggleVideoBtn = document.getElementById('toggle-video');
const toggleAudioBtn = document.getElementById('toggle-audio');
const shareScreenBtn = document.getElementById('share-screen');
const endCallBtn = document.getElementById('end-call');
const liveChatContainer = document.getElementById('live-chat');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const minimizeChatBtn = document.getElementById('minimize-chat');
const closeChatBtn = document.getElementById('close-chat');

// If we're on the mentor page, update some elements
if (isMentor) {
    const callStudentName = document.getElementById('call-student-name');
    const chatStudentName = document.getElementById('chat-student-name');
    const remoteVideoLabel = document.getElementById('remote-video-label');
    
    if (callStudentName) callStudentName.textContent = 'Afshana R';
    if (chatStudentName) chatStudentName.textContent = 'Afshana R';
    if (remoteVideoLabel) remoteVideoLabel.textContent = 'Afshana R';
}

// Initialize the connection when the page loads
document.addEventListener('DOMContentLoaded', initCommunication);

function initCommunication() {
    // Connect to the signaling server
    socket = io(SIGNALING_SERVER_URL);
    
    // Set up the PeerJS connection
    peer = new Peer(myPeerId, {
        host: 'peerjs-server.herokuapp.com',
        secure: true,
        port: 443,
        config: ICE_SERVERS
    });
    
    // When the peer connection is established
    peer.on('open', (id) => {
        console.log(`My peer ID is: ${id}`);
        
        // Register with the signaling server
        socket.emit('register', { 
            peerId: id, 
            role: role,
            name: isMentor ? 'Dr. Jebakumar Immanuel D' : 'Afshana R'
        });
    });
    
    // When we receive a call
    peer.on('call', (call) => {
        // Show notification for incoming call
        showNotification(
            isMentor ? 'Incoming call from Afshana R' : 'Incoming call from Dr. Jebakumar',
            'video-call'
        );
        
        // Ask user to accept the call
        if (confirm(`${isMentor ? 'Afshana R' : 'Dr. Jebakumar'} is calling. Answer?`)) {
            // Get user media and answer the call
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    localStream = stream;
                    localVideo.srcObject = stream;
                    call.answer(stream);
                    call.on('stream', handleRemoteStream);
                    
                    // Show the video call modal
                    showVideoCallModal();
                })
                .catch((error) => {
                    console.error('Failed to get local stream', error);
                    alert('Could not access camera and microphone. Please check permissions.');
                });
        } else {
            // Decline the call
            call.close();
            socket.emit('call-declined', { 
                from: myPeerId, 
                to: remotePeerId 
            });
        }
    });
    
    // Handle incoming data connection
    peer.on('connection', (conn) => {
        connection = conn;
        setupDataConnection();
    });
    
    // Set up event listeners for UI elements
    setupUIListeners();
}

// Function to initiate a call
function startCall() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            localStream = stream;
            localVideo.srcObject = stream;
            
            // Create data connection first for messaging
            if (!connection) {
                connection = peer.connect(remotePeerId);
                setupDataConnection();
            }
            
            // Call the remote peer
            const call = peer.call(remotePeerId, stream);
            
            // Notify the other user
            socket.emit('call-initiated', { 
                from: myPeerId, 
                to: remotePeerId,
                name: isMentor ? 'Dr. Jebakumar Immanuel D' : 'Afshana R'
            });
            
            // When the remote stream is received
            call.on('stream', handleRemoteStream);
            
            // When the call is closed
            call.on('close', () => {
                endCall();
            });
            
            // Show the video call modal
            showVideoCallModal();
        })
        .catch((error) => {
            console.error('Failed to get local stream', error);
            alert('Could not access camera and microphone. Please check permissions.');
        });
}

// Handle the remote stream
function handleRemoteStream(stream) {
    remoteStream = stream;
    remoteVideo.srcObject = stream;
}

// Set up data connection for messaging
function setupDataConnection() {
    if (!connection) return;
    
    connection.on('open', () => {
        console.log('Data connection established');
        // Show the chat interface
        liveChatContainer.style.display = 'flex';
    });
    
    connection.on('data', (data) => {
        if (data.type === 'message') {
            // Add message to chat
            addMessageToChat(data.text, false);
            
            // Show notification if chat is minimized
            if (liveChatContainer.classList.contains('minimized')) {
                showNotification(
                    `New message from ${isMentor ? 'Afshana R' : 'Dr. Jebakumar'}`,
                    'message'
                );
            }
        }
    });
    
    connection.on('close', () => {
        console.log('Data connection closed');
        // Hide chat when connection closes
        liveChatContainer.style.display = 'none';
    });
}

// Send a message through the data connection
function sendMessage(text) {
    if (!connection || !text.trim()) return;
    
    // Create message data
    const messageData = {
        type: 'message',
        text: text.trim(),
        timestamp: new Date().toISOString()
    };
    
    // Send through the data connection
    connection.send(messageData);
    
    // Add to own chat
    addMessageToChat(text.trim(), true);
    
    // Clear input
    messageInput.value = '';
}

// Add a message to the chat window
function addMessageToChat(text, isFromMe) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${isFromMe ? 'outgoing' : 'incoming'}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    
    // Format current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    time.textContent = `${hours}:${minutes}`;
    
    messageElement.appendChild(bubble);
    messageElement.appendChild(time);
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// End the current call
function endCall() {
    // Close video streams
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    if (remoteStream) {
        remoteStream = null;
    }
    
    // Reset video elements
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    
    // Hide video modal
    videoModal.style.display = 'none';
    
    // Notify peer
    socket.emit('call-ended', { 
        from: myPeerId, 
        to: remotePeerId 
    });
}

// Toggle video on/off
function toggleVideo() {
    if (!localStream) return;
    
    videoEnabled = !videoEnabled;
    localStream.getVideoTracks().forEach(track => {
        track.enabled = videoEnabled;
    });
    
    // Update button icon
    toggleVideoBtn.innerHTML = videoEnabled 
        ? '<i class="fas fa-video"></i>' 
        : '<i class="fas fa-video-slash"></i>';
}

// Toggle audio on/off
function toggleAudio() {
    if (!localStream) return;
    
    audioEnabled = !audioEnabled;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = audioEnabled;
    });
    
    // Update button icon
    toggleAudioBtn.innerHTML = audioEnabled 
        ? '<i class="fas fa-microphone"></i>' 
        : '<i class="fas fa-microphone-slash"></i>';
}

// Share screen
function shareScreen() {
    if (screenShare) {
        // Stop screen sharing
        screenShare.getTracks().forEach(track => track.stop());
        screenShare = null;
        
        // Restore camera video
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStream = stream;
                localVideo.srcObject = stream;
                
                // Replace the track in the call
                const videoTrack = localStream.getVideoTracks()[0];
                const sender = peer.getSenders().find(s => s.track.kind === videoTrack.kind);
                sender.replaceTrack(videoTrack);
                
                // Update button
                shareScreenBtn.innerHTML = '<i class="fas fa-desktop"></i>';
            })
            .catch(error => {
                console.error('Error getting user media', error);
            });
    } else {
        // Start screen sharing
        navigator.mediaDevices.getDisplayMedia({ video: true })
            .then((stream) => {
                screenShare = stream;
                localVideo.srcObject = stream;
                
                // Replace the track in the call
                const videoTrack = screenShare.getVideoTracks()[0];
                const sender = peer.getSenders().find(s => s.track.kind === videoTrack.kind);
                sender.replaceTrack(videoTrack);
                
                // Listen for the user ending screen share
                videoTrack.onended = () => {
                    shareScreen(); // Toggle back to camera
                };
                
                // Update button
                shareScreenBtn.innerHTML = '<i class="fas fa-stop"></i>';
            })
            .catch(error => {
                console.error('Error sharing screen', error);
            });
    }
}

// Show the video call modal
function showVideoCallModal() {
    videoModal.style.display = 'flex';
    setTimeout(() => {
        videoModal.classList.add('show');
    }, 10);
}

// Show notification
function showNotification(message, type) {
    // Check if the Notification API is available
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return;
    }
    
    // Check if permission is already granted
    if (Notification.permission === "granted") {
        createNotification(message, type);
    } 
    // Otherwise, ask for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                createNotification(message, type);
            }
        });
    }
    
    // Also add to in-app notifications
    const notificationCount = document.getElementById('notification-count');
    const notificationList = document.getElementById('notification-list');
    
    if (notificationCount && notificationList) {
        // Increment notification count
        const count = parseInt(notificationCount.textContent) + 1;
        notificationCount.textContent = count;
        
        // Add to notification list
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item unread';
        
        const icon = document.createElement('div');
        icon.className = 'notification-icon';
        icon.innerHTML = type === 'video-call' 
            ? '<i class="fas fa-video"></i>'
            : '<i class="fas fa-comment"></i>';
        
        const content = document.createElement('div');
        content.className = 'notification-content';
        
        const text = document.createElement('p');
        text.textContent = message;
        
        const time = document.createElement('span');
        time.className = 'notification-time';
        time.textContent = 'Just now';
        
        content.appendChild(text);
        content.appendChild(time);
        
        notificationItem.appendChild(icon);
        notificationItem.appendChild(content);
        
        notificationList.insertBefore(notificationItem, notificationList.firstChild);
    }
}

// Create a browser notification
function createNotification(message, type) {
    const options = {
        body: message,
        icon: type === 'video-call' 
            ? 'https://img.icons8.com/color/48/000000/video-call.png'
            : 'https://img.icons8.com/color/48/000000/chat.png'
    };
    
    const notification = new Notification(
        isMentor ? 'KIT Mentor Connect' : 'KIT Student Portal', 
        options
    );
    
    notification.onclick = function() {
        window.focus();
        if (type === 'video-call') {
            showVideoCallModal();
        } else {
            liveChatContainer.style.display = 'flex';
            liveChatContainer.classList.remove('minimized');
        }
        this.close();
    };
}

// Set up UI event listeners
function setupUIListeners() {
    // Video call controls
    if (toggleVideoBtn) {
        toggleVideoBtn.addEventListener('click', toggleVideo);
    }
    
    if (toggleAudioBtn) {
        toggleAudioBtn.addEventListener('click', toggleAudio);
    }
    
    if (shareScreenBtn) {
        shareScreenBtn.addEventListener('click', shareScreen);
    }
    
    if (endCallBtn) {
        endCallBtn.addEventListener('click', endCall);
    }
    
    // Messaging controls
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', () => {
            sendMessage(messageInput.value);
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage(messageInput.value);
            }
        });
    }
    
    if (minimizeChatBtn) {
        minimizeChatBtn.addEventListener('click', () => {
            liveChatContainer.classList.toggle('minimized');
        });
    }
    
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            liveChatContainer.style.display = 'none';
        });
    }
    
    // Video call buttons in the UI
    const videoCallBtns = document.querySelectorAll('.btn-video');
    videoCallBtns.forEach(btn => {
        btn.addEventListener('click', startCall);
    });
    
    // Message buttons in the UI
    const messageBtns = document.querySelectorAll('.btn-message');
    messageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Create data connection if it doesn't exist
            if (!connection) {
                connection = peer.connect(remotePeerId);
                setupDataConnection();
            }
            
            // Show chat
            liveChatContainer.style.display = 'flex';
            liveChatContainer.classList.remove('minimized');
        });
    });
} 