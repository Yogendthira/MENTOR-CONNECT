// Student Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if(sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('expanded');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isSidebar = event.target.closest('.sidebar');
        const isSidebarToggle = event.target.closest('.sidebar-toggle');
        
        if(!isSidebar && !isSidebarToggle && window.innerWidth < 992 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mainContent.classList.remove('expanded');
        }
    });
    
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't scroll if it's an external link
            if(this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if(targetElement) {
                    // Close mobile sidebar if open
                    if(window.innerWidth < 992 && sidebar.classList.contains('active')) {
                        sidebar.classList.remove('active');
                        mainContent.classList.remove('expanded');
                    }
                    
                    // Scroll to section
                    window.scrollTo({
                        top: targetElement.offsetTop - 20,
                        behavior: 'smooth'
                    });
                    
                    // Update active link
                    navLinks.forEach(link => link.parentElement.classList.remove('active'));
                    this.parentElement.classList.add('active');
                }
            }
        });
    });
    
    // Initialize mentor info tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabId).classList.add('active');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Resource filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter resources
            const resourceCards = document.querySelectorAll('.resource-card');
            
            resourceCards.forEach(card => {
                if(filter === 'all' || card.getAttribute('data-type') === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Mark message as read
    const markReadButtons = document.querySelectorAll('.btn-mark-read');
    
    markReadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const messageCard = this.closest('.message-card');
            messageCard.classList.remove('unread');
            const unreadIndicator = messageCard.querySelector('.unread-indicator');
            if(unreadIndicator) unreadIndicator.remove();
            this.remove();
            
            // Update unread message count
            updateUnreadMessageCount();
        });
    });
    
    // Function to update unread message count
    function updateUnreadMessageCount() {
        const unreadMessages = document.querySelectorAll('.message-card.unread').length;
        const unreadMessageElement = document.querySelector('.overview-card:nth-child(2) .overview-info h3');
        
        if(unreadMessageElement) {
            unreadMessageElement.textContent = unreadMessages;
        }
    }
    
    // Handle file attachments
    const fileInput = document.getElementById('message-attachments');
    const attachmentList = document.getElementById('attachment-list');
    
    if(fileInput && attachmentList) {
        fileInput.addEventListener('change', function() {
            attachmentList.innerHTML = '';
            
            if(this.files.length > 0) {
                for(let i = 0; i < this.files.length; i++) {
                    const file = this.files[i];
                    const fileSize = formatFileSize(file.size);
                    
                    const fileElement = document.createElement('div');
                    fileElement.className = 'attachment';
                    fileElement.innerHTML = `
                        <i class="${getFileIcon(file.name)}"></i>
                        <span>${file.name} (${fileSize})</span>
                    `;
                    
                    attachmentList.appendChild(fileElement);
                }
            }
        });
    }
    
    // Helper function to format file size
    function formatFileSize(bytes) {
        if(bytes < 1024) return bytes + ' bytes';
        else if(bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    // Helper function to get file icon based on extension
    function getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        
        switch(extension) {
            case 'pdf':
                return 'fas fa-file-pdf';
            case 'doc':
            case 'docx':
                return 'fas fa-file-word';
            case 'xls':
            case 'xlsx':
                return 'fas fa-file-excel';
            case 'ppt':
            case 'pptx':
                return 'fas fa-file-powerpoint';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'fas fa-file-image';
            case 'zip':
            case 'rar':
                return 'fas fa-file-archive';
            case 'mp3':
            case 'wav':
                return 'fas fa-file-audio';
            case 'mp4':
            case 'avi':
                return 'fas fa-file-video';
            case 'js':
            case 'php':
            case 'html':
            case 'css':
            case 'py':
                return 'fas fa-file-code';
            default:
                return 'fas fa-file';
        }
    }
    
    // Quick action buttons
    const btnQuickMessage = document.getElementById('btnQuickMessage');
    const btnInstantMeeting = document.getElementById('btnInstantMeeting');
    
    if(btnQuickMessage) {
        btnQuickMessage.addEventListener('click', function() {
            showModal('message-modal');
        });
    }
    
    if(btnInstantMeeting) {
        btnInstantMeeting.addEventListener('click', function() {
            alert('Starting instant meeting with your mentor...');
            // In a real application, this would initiate a video call
        });
    }
    
    // Cancel meeting
    const cancelButtons = document.querySelectorAll('.btn-cancel');
    
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const meetingCard = this.closest('.meeting-card');
            const meetingTitle = meetingCard.querySelector('.meeting-details h3').textContent;
            
            if(confirm(`Are you sure you want to cancel the meeting: "${meetingTitle}"?`)) {
                meetingCard.remove();
                
                // Update upcoming meetings count
                updateUpcomingMeetingsCount();
                
                // Show confirmation message
                alert(`Meeting "${meetingTitle}" has been cancelled.`);
            }
        });
    });
    
    // Function to update upcoming meetings count
    function updateUpcomingMeetingsCount() {
        const upcomingMeetings = document.querySelectorAll('.meeting-card').length;
        const upcomingMeetingsElement = document.querySelector('.overview-card:first-child .overview-info h3');
        
        if(upcomingMeetingsElement) {
            upcomingMeetingsElement.textContent = upcomingMeetings;
        }
    }
    
    // Compose new message button
    const btnCompose = document.querySelector('.btn-compose');
    
    if(btnCompose) {
        btnCompose.addEventListener('click', function() {
            showModal('message-modal');
        });
    }
    
    // Initialize schedule meeting functionality
    const scheduleMeetingBtns = document.querySelectorAll('.btn-schedule');
    
    scheduleMeetingBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showModal('schedule-meeting-modal');
        });
    });
    
    // Initialize video call buttons
    const videoCallBtns = document.querySelectorAll('.btn-video');
    
    videoCallBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // In a real application, this would initiate a video call
            alert('Video call feature would be initiated here.');
        });
    });
    
    // Initialize message buttons
    const messageBtns = document.querySelectorAll('.btn-message');
    
    messageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showModal('message-modal');
        });
    });
    
    // Initialize reply buttons
    const replyBtns = document.querySelectorAll('.btn-reply');
    
    replyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const messageCard = this.closest('.message-card');
            const mentorName = messageCard.querySelector('.sender-info h3').textContent;
            
            // Set the recipient in the message modal
            const messageModal = document.getElementById('message-modal');
            if(messageModal) {
                const recipientField = messageModal.querySelector('.recipient-field');
                if(recipientField) {
                    recipientField.textContent = mentorName;
                }
                
                showModal('message-modal');
            }
        });
    });
    
    // Initialize reschedule buttons
    const rescheduleBtns = document.querySelectorAll('.btn-reschedule');
    
    rescheduleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const meetingCard = this.closest('.meeting-card');
            const meetingTitle = meetingCard.querySelector('.meeting-details h3').textContent;
            
            // Set the meeting to reschedule in the modal
            const rescheduleModal = document.getElementById('reschedule-modal');
            if(rescheduleModal) {
                const meetingField = rescheduleModal.querySelector('.meeting-field');
                if(meetingField) {
                    meetingField.textContent = meetingTitle;
                }
                
                showModal('reschedule-modal');
            }
        });
    });
    
    // Modal functionality
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }
    
    // Close modals
    const closeButtons = document.querySelectorAll('.close-modal');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(event) {
            if(event.target === this) {
                closeModal(this);
            }
        });
    });
    
    function closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // Form submissions
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, form data would be sent to a server
            const formData = new FormData(this);
            const modal = this.closest('.modal');
            
            // For demonstration purposes
            alert('Form submitted successfully!');
            
            // Close the modal after submission
            if(modal) {
                closeModal(modal);
            }
            
            // Clear the form
            this.reset();
            
            // Clear attachment list if exists
            const attachmentList = document.getElementById('attachment-list');
            if(attachmentList) {
                attachmentList.innerHTML = '';
            }
        });
    });
    
    // Notification toggle
    const notificationBtn = document.querySelector('.notification-btn');
    
    if(notificationBtn) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.querySelector('.notification-dropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close notification dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if(!e.target.closest('.notifications')) {
                const dropdown = document.querySelector('.notification-dropdown');
                if(dropdown) dropdown.style.display = 'none';
            }
        });
    }
}); 