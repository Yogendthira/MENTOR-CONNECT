// test_data.js - Sample data for testing the communication features

// Function to add sample messages to the chat
function populateSampleMessages() {
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatMessages) return;
    
    // Clear existing messages
    chatMessages.innerHTML = '';
    
    // Sample messages
    const messages = [
        { text: "Hello! How are you doing with your project?", time: "09:15", isFromMe: false },
        { text: "Hi Dr. Jebakumar! I'm making good progress. Just struggling with the neural network architecture.", time: "09:17", isFromMe: true },
        { text: "What specific issues are you facing with the architecture?", time: "09:18", isFromMe: false },
        { text: "I'm not sure how many hidden layers to use for my image classification task.", time: "09:20", isFromMe: true },
        { text: "For a standard image classification task, you could start with 2-3 hidden layers. Let's discuss it in detail during our call.", time: "09:22", isFromMe: false },
        { text: "That sounds good. When would you be available for a quick call?", time: "09:23", isFromMe: true },
        { text: "I'm free today between 2-4 PM. Would that work for you?", time: "09:25", isFromMe: false }
    ];
    
    // Add messages to the chat
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.isFromMe ? 'outgoing' : 'incoming'}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = message.text;
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = message.time;
        
        messageElement.appendChild(bubble);
        messageElement.appendChild(time);
        
        chatMessages.appendChild(messageElement);
    });
    
    // Show the chat container
    const liveChatContainer = document.getElementById('live-chat');
    if (liveChatContainer) {
        liveChatContainer.style.display = 'flex';
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to simulate an incoming call
function simulateIncomingCall() {
    const isMentor = window.location.pathname.includes('mentor.html');
    
    // Create a notification
    const message = isMentor ? 'Incoming call from Afshana R' : 'Incoming call from Dr. Jebakumar';
    
    // Show browser notification if available
    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            const notification = new Notification(
                isMentor ? 'KIT Mentor Connect' : 'KIT Student Portal', 
                {
                    body: message,
                    icon: 'https://img.icons8.com/color/48/000000/video-call.png'
                }
            );
            
            notification.onclick = function() {
                window.focus();
                simulateVideoCall();
                this.close();
            };
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    simulateIncomingCall();
                }
            });
        }
    }
    
    // Add to in-app notifications
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
        icon.innerHTML = '<i class="fas fa-video"></i>';
        
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
        
        // Make notification clickable
        notificationItem.addEventListener('click', simulateVideoCall);
    }
    
    // Ask user if they want to answer
    if (confirm(message + '. Answer?')) {
        simulateVideoCall();
    }
}

// Function to simulate a video call
function simulateVideoCall() {
    const videoModal = document.getElementById('video-call-modal');
    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');
    
    if (!videoModal || !localVideo || !remoteVideo) return;
    
    // Request user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            // Display local video
            localVideo.srcObject = stream;
            
            // Simulate remote video (just use the same stream for testing)
            setTimeout(() => {
                remoteVideo.srcObject = stream;
            }, 1000);
            
            // Show the video call modal
            videoModal.style.display = 'flex';
            setTimeout(() => {
                videoModal.classList.add('show');
            }, 10);
            
            // Set up end call button
            const endCallBtn = document.getElementById('end-call');
            if (endCallBtn) {
                endCallBtn.addEventListener('click', function() {
                    // Stop all tracks
                    stream.getTracks().forEach(track => track.stop());
                    
                    // Hide modal
                    videoModal.classList.remove('show');
                    setTimeout(() => {
                        videoModal.style.display = 'none';
                        localVideo.srcObject = null;
                        remoteVideo.srcObject = null;
                    }, 300);
                });
            }
        })
        .catch(error => {
            console.error('Error accessing media devices.', error);
            alert('Could not access camera and microphone. Please check permissions.');
        });
}

// Attach test functions to window for easy access in the console
window.testFunctions = {
    populateSampleMessages,
    simulateIncomingCall,
    simulateVideoCall
};

// If the test parameter is present in the URL, auto-run tests
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('test')) {
        // Wait a bit for UI to initialize
        setTimeout(() => {
            // Simulate messages if test=messages or test=all
            if (urlParams.get('test') === 'messages' || urlParams.get('test') === 'all') {
                populateSampleMessages();
            }
            
            // Simulate call if test=call or test=all
            if (urlParams.get('test') === 'call' || urlParams.get('test') === 'all') {
                setTimeout(simulateIncomingCall, 3000);
            }
        }, 1000);
    }
}); 