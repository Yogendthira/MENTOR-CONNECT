// Student data
const students = [
    { 
        id: '721223243001', 
        name: 'AFSHANA R', 
        department: 'Artificial Intelligence and Data Science', 
        year: '2nd Year', 
        email: 'afshana@example.com',
        phone: '9876543210',
        skills: ['Java', 'Python', 'Web Development', 'Data Structures'],
        projects: ['E-commerce Website', 'Student Management System'],
        interests: ['Machine Learning', 'Mobile App Development']
    },
    { id: '721223243002', name: 'AGILAN S', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'agilan@example.com' },
    { id: '721223243003', name: 'ANUSRI SADHASIVAM', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'anusri@example.com' },
    { id: '721223243004', name: 'ASHIK B', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'ashik@example.com' },
    { id: '721223243005', name: 'BARATH WAJ P', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'barath@example.com' },
    { id: '721223243006', name: 'DHARSHAN J', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'dharshan@example.com' },
    { id: '721223243007', name: 'DHARSHANA R', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'dharshana@example.com' },
    { id: '721223243008', name: 'DILLYRAJA R', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'dillyraja@example.com' },
    { id: '721223243009', name: 'DINESHES', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'dineshes@example.com' },
    { id: '721223243010', name: 'DINESHPRASATH S', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'dineshprasath@example.com' },
    { id: '721223243011', name: 'GIRIDHAR N', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'giridhar@example.com' },
    { id: '721223243012', name: 'GOKUL AR', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'gokul@example.com' },
    { id: '721223243013', name: 'HARIHARAN M', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'hariharan@example.com' },
    { id: '721223243014', name: 'HEMAPRIYA M', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'hemapriya@example.com' },
    { id: '721223243015', name: 'HEMAVARSHA R', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'hemavarsha@example.com' },
    { id: '721223243016', name: 'KAMALESHWARAN M', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'kamaleshwaran@example.com' },
    { id: '721223243017', name: 'KANIKAS', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'kanikas@example.com' },
    { id: '721223243018', name: 'KANISHKA R', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'kanishka@example.com' },
    { id: '721223243019', name: 'KARTHIKEYAN N', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'karthikeyan.n@example.com' },
    { id: '721223243020', name: 'KARTHIKEYAN S', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'karthikeyan.s@example.com' },
    { id: '721223243021', name: 'KAVIN KUMAR AR', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'kavinkumar@example.com' },
    { id: '721223243022', name: 'KRISHNADHEVAN N', department: 'Artificial Intelligence and Data Science', year: '2nd Year', email: 'krishnadhevan@example.com' }
];

// Mentor info
const mentor = {
    name: 'Dr. Jebakumar Immanuel D',
    title: 'Associate Professor',
    specialization: 'Department of Artificial Intelligence and Data Science',
    email: 'jebakumar.ai@karpagamtech.ac.in',
    institution: 'Karpagam Institute of Technology',
    location: 'Coimbatore - 641 105, Tamil Nadu, India'
};

// Function to get initials from a name
function getInitials(name) {
    // Special case for Dr. Jebakumar Immanuel D
    if (name === 'Dr. Jebakumar Immanuel D') {
        return 'J';
    }
    
    // For other names, get the first letter of each word
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
}

// Function to create student profile cards
function createStudentCards() {
    const studentsGrid = document.getElementById('studentProfiles');
    if (!studentsGrid) return;
    
    studentsGrid.innerHTML = ''; // Clear existing cards

    students.forEach(student => {
        // Create a shortened version of the department for display
        const shortDept = 'Artificial Intelligence and Data Science';
        const initials = getInitials(student.name);
        
        const card = document.createElement('div');
        card.className = 'student-card';
        card.dataset.id = student.id;
        
        card.innerHTML = `
            <div class="student-info">
                <h3>${student.name}</h3>
                <p class="student-id">${student.id}</p>
                <p class="student-dept">${shortDept}</p>
            </div>
            <div class="student-actions">
                <button class="btn-profile" onclick="openProfile('${student.id}')">View Profile</button>
                <button class="btn-schedule" onclick="scheduleMeeting('${student.id}')">Schedule Meeting</button>
                <button class="btn-video" onclick="startVideoCall('${student.id}')">Video Call</button>
            </div>
        `;
        
        // Keep the click event on the card for convenience
        card.addEventListener('click', (e) => {
            // Don't open profile if a button was clicked
            if (e.target.tagName === 'BUTTON') return;
            openProfile(student.id);
        });
        
        studentsGrid.appendChild(card);
    });
}

// Function to open student profile modal
function openProfile(studentId) {
    const modal = document.getElementById('profileModal');
    const profileContent = document.getElementById('profileContent');
    const student = students.find(s => s.id === studentId);
    
    if (!student) return;
    
    let skillsHtml = '';
    let projectsHtml = '';
    let interestsHtml = '';
    
    // Get student initials
    const studentInitials = getInitials(student.name);
    // Explicitly set mentor initial to 'J'
    const mentorInitials = 'J';
    
    // Generate HTML for skills, projects, and interests if they exist
    if (student.skills) {
        skillsHtml = `
            <div class="profile-section">
                <h3><i class="fas fa-code"></i> Skills</h3>
                <p>${student.skills.join(', ')}</p>
            </div>
        `;
    }
    
    if (student.projects) {
        projectsHtml = `
            <div class="profile-section">
                <h3><i class="fas fa-project-diagram"></i> Projects</h3>
                <p>${student.projects.join(', ')}</p>
            </div>
        `;
    }
    
    if (student.interests) {
        interestsHtml = `
            <div class="profile-section">
                <h3><i class="fas fa-star"></i> Interests</h3>
                <p>${student.interests.join(', ')}</p>
            </div>
        `;
    }
    
    // Add student dashboard link for Afshana (ID: 721223243001)
    const studentDashboardLink = student.id === '721223243001' 
        ? `<a href="student_dashboard.html" class="btn-dashboard" style="display: block; margin-top: 20px; padding: 10px; background-color: var(--secondary-color); color: white; text-align: center; border-radius: var(--border-radius); text-decoration: none;">
            <i class="fas fa-external-link-alt"></i> View Student Dashboard
          </a>` 
        : '';
    
    profileContent.innerHTML = `
        <div class="profile-header">
            <div class="profile-image">${studentInitials}</div>
            <div class="profile-main-info">
                <h2>${student.name}</h2>
                <p>${student.id}</p>
                <p>${student.department}, ${student.year}</p>
            </div>
        </div>
        
        <div class="profile-details">
            <div class="profile-section">
                <h3><i class="fas fa-user"></i> Personal Information</h3>
                <p><span>Email:</span> ${student.email}</p>
                <p><span>Department:</span> ${student.department}</p>
                <p><span>Year:</span> ${student.year}</p>
                ${student.phone ? `<p><span>Phone:</span> ${student.phone}</p>` : ''}
            </div>
            
            <div class="profile-section">
                <h3><i class="fas fa-user-tie"></i> Assigned Mentor</h3>
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <div class="mentor-img">${mentorInitials}</div>
                    <div style="margin-left: 15px;">
                        <p style="font-weight: 500;">${mentor.name}</p>
                        <p style="font-size: 0.9rem; color: var(--dark-gray);">${mentor.title}</p>
                    </div>
                </div>
                <p><span>Department:</span> ${mentor.specialization}</p>
                <p><span>Institution:</span> ${mentor.institution}</p>
                <p><span>Location:</span> ${mentor.location}</p>
                <p><span>Email:</span> ${mentor.email}</p>
            </div>
        </div>
        
        ${skillsHtml}
        ${projectsHtml}
        ${interestsHtml}
        
        <div class="profile-actions">
            <button class="btn-schedule" onclick="scheduleMeeting('${student.id}')">Schedule Meeting</button>
            <button class="btn-video" onclick="startVideoCall('${student.id}')">Video Call</button>
            <button class="btn-message" onclick="sendMessage('${student.id}')">Send Message</button>
            ${studentDashboardLink}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('studentSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const studentCards = document.querySelectorAll('.student-card');
        
        studentCards.forEach(card => {
            const studentId = card.dataset.id;
            const student = students.find(s => s.id === studentId);
            
            if (!student) return;
            
            const isVisible = 
                student.name.toLowerCase().includes(searchTerm) || 
                student.id.toLowerCase().includes(searchTerm) ||
                student.department.toLowerCase().includes(searchTerm);
            
            card.style.display = isVisible ? 'block' : 'none';
        });
    });
}

// Schedule meeting function
function scheduleMeeting(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    alert(`Scheduling meeting with ${student.name} (${studentId})`);
}

// Start video call function
function startVideoCall(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    alert(`Starting video call with ${student.name} (${studentId})`);
}

// Send message function
function sendMessage(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    alert(`Opening messaging interface for ${student.name} (${studentId})`);
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    createStudentCards();
    setupSearch();
    
    // Close modal when clicking on the close button
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('profileModal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside the modal content
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}); 