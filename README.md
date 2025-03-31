# BlogApp - Firebase Blog Platform

A modern blog platform built with React and Firebase with comprehensive user management, content management, and security features.

## 🌟 Features

- **User Authentication**: Email/password authentication with email verification
- **User Management**: Admin panel to manage users and permissions
- **Content Management**: Create, edit, delete, and restore blog posts
- **Security**: Role-based permissions, account suspension, and content moderation
- **Responsive UI**: Modern UI built with Tailwind CSS that works on all devices
- **Soft Delete**: Trash system for both users and posts with restore functionality
- **Anonymous Posting**: Option to post content anonymously
- **Profile Management**: User profile management with mobile verification

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Anonymous6412/Blog-app.git
   cd Blog-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Set up Authentication (enable Email/Password)
   - Create a Firestore database

4. Configure environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_DATABASE_URL=your-database-url
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

5. Start the development server:
   ```
   npm start
   ```

## 🔒 Security Considerations

- **Environment Variables**: Keep your Firebase credentials secure in `.env.local` (never commit to git)
- **Authentication**: Email verification is enabled to prevent unauthorized access
- **Data Validation**: Input validation is performed on all forms
- **Permission System**: Granular role-based permissions for users
- **Admin Protections**: Super admin status is protected with additional verification
- **Content Moderation**: Content can be moderated by admins with soft delete functionality
- **Inactivity Timeout**: Users are automatically logged out after 20 minutes of inactivity
- **Data Storage**: User data is stored securely in Firebase Firestore

## 📋 User Roles

- **Regular User**: Can read posts and create their own content
- **Admin**: Can manage users, edit permissions, and moderate content
- **Super Admin**: Has full access including admin management

## 🛠️ Built With

- [React](https://reactjs.org/) - Frontend framework
- [Firebase](https://firebase.google.com/) - Backend and authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Router](https://reactrouter.com/) - Navigation
- [Firebase Authentication](https://firebase.google.com/products/auth) - User authentication
- [Firestore](https://firebase.google.com/products/firestore) - Database

## 🧪 Testing

Run the test suite with:
```
npm test
```

## 🚢 Deployment

1. Build the application:
   ```
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```
   firebase deploy
   ```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

For questions or support, please reach out to support@blogapp.com.
