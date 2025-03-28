# Mentor Connect

A real-time mentoring platform for Karpagam Institute of Technology that connects mentors with their students. This application includes video calling, live chat, and resource sharing features.

## Features

- **Video Calls**: WebRTC-based peer-to-peer video calling with screen sharing capability
- **Live Chat**: Real-time messaging between mentors and students
- **Resource Sharing**: Mentors can share educational resources with students
- **Responsive Design**: Works on desktop and mobile devices
- **Notifications**: Real-time notifications for calls and messages

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with WebRTC support (Chrome, Firefox, Edge, etc.)

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/your-username/mentor-connect.git
   cd mentor-connect
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application:
   - Mentor dashboard: http://localhost:3000/
   - Student dashboard: http://localhost:3000/student

## Deployment Instructions

### Local Network Testing

To test on a local network with two different computers:

1. Run the server on one computer:
   ```
   npm start
   ```

2. Find your local IP address:
   - Windows: `ipconfig` in Command Prompt
   - macOS/Linux: `ifconfig` in Terminal

3. On the second computer, access:
   - Mentor dashboard: http://YOUR_LOCAL_IP:3000/
   - Student dashboard: http://YOUR_LOCAL_IP:3000/student

### Deploying to GitHub Pages

1. Create a GitHub repository
2. Push your code to GitHub:
   ```
   git remote add origin https://github.com/your-username/mentor-connect.git
   git push -u origin main
   ```

3. Deploy to GitHub Pages using GitHub Actions or manually

### Deploying to Heroku

1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku:
   ```
   heroku login
   ```

3. Create a new Heroku app:
   ```
   heroku create karpagam-mentoring
   ```

4. Push to Heroku:
   ```
   git push heroku main
   ```

5. Access your deployed app:
   - Mentor dashboard: https://karpagam-mentoring.herokuapp.com/
   - Student dashboard: https://karpagam-mentoring.herokuapp.com/student

## Usage Instructions

### For Mentors

1. Access the mentor dashboard
2. View your student list
3. Click on a student to view their profile
4. Use the "Video Call" button to initiate a call
5. Use the "Message" button to start a chat

### For Students

1. Access the student dashboard
2. View your assigned mentor's details
3. Use the "Schedule Meeting" button to request a meeting
4. Use the "Video Call" button to initiate a call
5. Use the "Message" button to start a chat with your mentor
6. Access shared resources in the Resources section

## Known Limitations

- WebRTC connections require proper network configuration (STUN/TURN servers) for NAT traversal
- Currently supports one mentor to one student relationship
- Large files cannot be shared directly through the application

## License

This project is licensed under the MIT License - see the LICENSE file for details. 