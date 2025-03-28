// communication.js - Handles WebRTC peer connections for video calls and messaging

// Configuration for connecting to the signaling server
const SIGNALING_SERVER_URL = 'https://mentor-connect-we1o.onrender.com';
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
    try {
        // Connect to the signaling server
        console.log('Connecting to signaling server:', SIGNALING_SERVER_URL);
        socket = io(SIGNALING_SERVER_URL);
        
        socket.on('connect', () => {
            console.log('Connected to signaling server');
        });
        
        socket.on('connect_error', (error) => {
            console.error('Failed to connect to signaling server:', error);
            alert('Failed to connect to communication server. Please try refreshing the page.');
        });
        
        // Set up the PeerJS connection
        console.log('Setting up PeerJS connection');
        peer = new Peer(myPeerId, {
            host: 'peerjs.jenovarain.com',
            secure: true,
            port: 443,
            config: ICE_SERVERS,
            debug: 3
        });
        
        // Handle peer errors
        peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            if (err.type === 'peer-unavailable') {
                alert('The person you are trying to connect with is not available.');
            } else {
                alert('Connection error: ' + err);
            }
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
                        if (localVideo) localVideo.srcObject = stream;
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
    } catch (error) {
        console.error('Error in initCommunication:', error);
        alert('Failed to initialize communication. Please check your internet connection and try again.');
    }
}

// Function to initiate a call
function startCall() {
    try {
        console.log('Starting call to:', remotePeerId);
        
        if (!peer || peer.disconnected) {
            alert('Connection to peer server lost. Please refresh the page and try again.');
            return;
        }
        
        // Check if the other person is available
        if (!remotePeerId) {
            alert('No one to call. Please wait for the other person to connect.');
            return;
        }
        
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStream = stream;
                if (localVideo) localVideo.srcObject = stream;
                
                console.log('Local media stream obtained');
                
                // Create data connection first for messaging
                if (!connection) {
                    console.log('Creating data connection');
                    connection = peer.connect(remotePeerId);
                    setupDataConnection();
                }
                
                // Call the remote peer
                console.log('Calling remote peer');
                const call = peer.call(remotePeerId, stream);
                
                if (!call) {
                    console.error('Failed to create call object');
                    alert('Failed to create call. Please try again.');
                    return;
                }
                
                // Notify the other user
                socket.emit('call-initiated', { 
                    from: myPeerId, 
                    to: remotePeerId,
                    name: isMentor ? 'Dr. Jebakumar Immanuel D' : 'Afshana R'
                });
                
                // When the remote stream is received
                call.on('stream', (remoteStream) => {
                    console.log('Received remote stream');
                    handleRemoteStream(remoteStream);
                });
                
                // When the call is closed
                call.on('close', () => {
                    console.log('Call closed');
                    endCall();
                });
                
                // Handle errors
                call.on('error', (err) => {
                    console.error('Call error:', err);
                    alert('Call error: ' + err);
                    endCall();
                });
                
                // Show the video call modal
                showVideoCallModal();
            })
            .catch((error) => {
                console.error('Failed to get local stream', error);
                alert('Could not access camera and microphone. Please check permissions and ensure no other application is using them.');
            });
    } catch (error) {
        console.error('Error in startCall:', error);
        alert('Failed to start call. Please try again.');
    }
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
        if (liveChatContainer) {
            liveChatContainer.style.display = 'flex';
        } else {
            console.error('Chat container not found in the DOM');
        }
    });
    
    connection.on('data', (data) => {
        if (data.type === 'message') {
            // Add message to chat
            addMessageToChat(data.text, false);
            
            // Show notification if chat is minimized or not visible
            if (!liveChatContainer || liveChatContainer.style.display === 'none' || 
                liveChatContainer.classList.contains('minimized')) {
                showNotification(
                    `New message from ${isMentor ? 'Afshana R' : 'Dr. Jebakumar'}`,
                    'message'
                );
            }
        }
    });
    
    connection.on('error', (err) => {
        console.error('Data connection error:', err);
    });
    
    connection.on('close', () => {
        console.log('Data connection closed');
        // Hide chat when connection closes
        if (liveChatContainer) {
            liveChatContainer.style.display = 'none';
        }
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
    if (!('Notification' in window)) {
        alert(message);
        return;
    }
    
    if (Notification.permission === 'granted') {
        createNotification(message, type);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                createNotification(message, type);
            } else {
                alert(message);
            }
        });
    } else {
        alert(message);
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
    console.log('Setting up UI listeners');
    
    // Video call controls
    if (toggleVideoBtn) {
        toggleVideoBtn.addEventListener('click', toggleVideo);
        console.log('Added listener for toggleVideoBtn');
    } else {
        console.warn('toggleVideoBtn not found in the DOM');
    }
    
    if (toggleAudioBtn) {
        toggleAudioBtn.addEventListener('click', toggleAudio);
        console.log('Added listener for toggleAudioBtn');
    } else {
        console.warn('toggleAudioBtn not found in the DOM');
    }
    
    if (shareScreenBtn) {
        shareScreenBtn.addEventListener('click', shareScreen);
        console.log('Added listener for shareScreenBtn');
    } else {
        console.warn('shareScreenBtn not found in the DOM');
    }
    
    if (endCallBtn) {
        endCallBtn.addEventListener('click', endCall);
        console.log('Added listener for endCallBtn');
    } else {
        console.warn('endCallBtn not found in the DOM');
    }
    
    // Messaging controls
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', () => {
            if (messageInput) sendMessage(messageInput.value);
        });
        console.log('Added listener for sendMessageBtn');
    } else {
        console.warn('sendMessageBtn not found in the DOM');
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage(messageInput.value);
            }
        });
        console.log('Added listener for messageInput');
    } else {
        console.warn('messageInput not found in the DOM');
    }
    
    if (minimizeChatBtn) {
        minimizeChatBtn.addEventListener('click', () => {
            if (liveChatContainer) liveChatContainer.classList.toggle('minimized');
        });
        console.log('Added listener for minimizeChatBtn');
    } else {
        console.warn('minimizeChatBtn not found in the DOM');
    }
    
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            if (liveChatContainer) liveChatContainer.style.display = 'none';
        });
        console.log('Added listener for closeChatBtn');
    } else {
        console.warn('closeChatBtn not found in the DOM');
    }
    
    // Video call buttons in the UI
    const videoCallBtns = document.querySelectorAll('.btn-video');
    if (videoCallBtns.length > 0) {
        videoCallBtns.forEach(btn => {
            btn.addEventListener('click', startCall);
        });
        console.log(`Added listeners for ${videoCallBtns.length} video call buttons`);
    } else {
        console.warn('No video call buttons found');
    }
    
    // Quick action instant meeting button
    const instantMeetingBtn = document.getElementById('btnInstantMeeting');
    if (instantMeetingBtn) {
        instantMeetingBtn.addEventListener('click', startCall);
        console.log('Added listener for instant meeting button');
    }
    
    // Message buttons in the UI
    const messageBtns = document.querySelectorAll('.btn-message');
    if (messageBtns.length > 0) {
        messageBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Create data connection if it doesn't exist
                if (!connection && peer) {
                    connection = peer.connect(remotePeerId);
                    setupDataConnection();
                }
                
                // Show chat
                if (liveChatContainer) {
                    liveChatContainer.style.display = 'flex';
                    liveChatContainer.classList.remove('minimized');
                } else {
                    console.error('Chat container not found in the DOM');
                }
            });
        });
        console.log(`Added listeners for ${messageBtns.length} message buttons`);
    } else {
        console.warn('No message buttons found');
    }
    
    // Quick action message button
    const quickMessageBtn = document.getElementById('btnQuickMessage');
    if (quickMessageBtn) {
        quickMessageBtn.addEventListener('click', () => {
            if (!connection && peer) {
                connection = peer.connect(remotePeerId);
                setupDataConnection();
            }
            
            if (liveChatContainer) {
                liveChatContainer.style.display = 'flex';
                liveChatContainer.classList.remove('minimized');
            }
        });
        console.log('Added listener for quick message button');
    }
} 