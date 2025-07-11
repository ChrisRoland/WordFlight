# WordFlight

A modern, real-time chat application built with Next.js and Firebase. Grant your words flight and connect with others in beautifully designed chat rooms.

![WordFlight Logo](public/WFLogo.png)

## Features

### **Core Functionality**
- **Real-time messaging** - Messages appear instantly across all connected users
- **Multiple chat rooms** - Create and join different conversation spaces
- **User-friendly interface** - Clean, intuitive design with responsive layout
- **Mobile-first design** - Optimized for both mobile and desktop experiences

###  **User Experience**
- **Simple authentication** - Quick name-based login to get started (For now)
- **User avatars** - Colorful, initials-based avatars for easy user identification
- **Notifications** - Sounds, unread message badges and toasts with new messages.
- **Smart timestamps** - Context-aware time display (Today, Yesterday, Day names, Full dates)
- **Message management** - Delete your own messages or manage room content as a creator

### **Room Management**
- **Create rooms** - Set up new conversation spaces with names and descriptions
- **Room permissions** - Room creators have enhanced moderation capabilities
- **Easy navigation** - Sidebar with all available rooms and quick switching
- **Room deletion** - Remove rooms and all associated messages when needed

### **Modern Interface**
- **Responsive design** - Seamless experience across all device sizes
- **Touch-friendly** - Long-press support for mobile interactions
- **Smooth animations** - Polished transitions and hover effects
- **Accessibility focused** - High contrast colors and readable typography

## Tech Stack

### **Frontend**
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with modern features
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and better development experience
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework

### **Backend & Database**
- **[Firebase](https://firebase.google.com/)** - Backend-as-a-Service platform
- **[Firestore](https://firebase.google.com/docs/firestore)** - Real-time NoSQL database
- **[Firebase SDK v11](https://firebase.google.com/docs/web)** - Latest Firebase web SDK

### **Icons & Assets**
- **[Lucide React](https://lucide.dev/)** - Beautiful, customizable icons
- **[Google Fonts (Ubuntu)](https://fonts.google.com/specimen/Ubuntu)** - Clean, modern typography
- **[Next.js Image](https://nextjs.org/docs/api-reference/next/image)** - Optimized image loading

## Getting Started

### **Prerequisites**
- Node.js 18+ installed on your machine
- A Firebase project set up
- Git for cloning the repository

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wordflight.git
   cd wordflight
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Get your Firebase configuration
   - Update `src/lib/firebase.js` with your Firebase config:

   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id",
     measurementId: "your-measurement-id"
   };
   ```

4. **Firestore Security Rules**
   Set up your Firestore rules for proper security:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /rooms/{document} {
         allow read, write: if true;
       }
       match /messages/{document} {
         allow read, write: if true;
       }
     }
   }
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the app

## Project Structure

```
wordflight/
├── public/
│   └── WFLogo.png          # App logo
├── src/
│   ├── app/
│   │   ├── globals.css     # Global styles and Tailwind imports
│   │   ├── layout.tsx      # Root layout with fonts and metadata
│   │   └── page.tsx        # Main page with login and app logic
│   ├── components/
│   │   ├── ChatApp.tsx     # Main chat application logic
│   │   ├── ChatRoom.tsx    # Individual chat room component
│   │   └── Sidebar.tsx     # Navigation sidebar with rooms
│   └── lib/
│       └── firebase.js     # Firebase configuration and setup
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## Features in Detail

### **User Avatars**
- **Consistent colors** - Each user gets a unique color based on their username
- **Initials display** - Shows first letters of the username
- **Multiple sizes** - Responsive sizing for different contexts

### **Message Management**
- **User permissions** - Delete your own messages
- **Room creator privileges** - Delete any message in rooms you created
- **Confirmation dialogs** - Prevent accidental deletions
- **Mobile support** - Long-press menus for touch devices

### **Room Features**
- **Room creation** - Name and optional description
- **Creator attribution** - Shows who created each room
- **Cascading deletion** - Removing a room deletes all its messages

## Development

### **Available Scripts**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### **Code Style**
- **TypeScript** for type safety
- **ESLint** for code quality
- **Functional components** with React hooks
- **Modular architecture** with reusable components

## Deployment

### **Vercel (Used for this project)**
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Vercel will automatically deploy on every push to main

### **Other Platforms**
- **Netlify** - Works great with Next.js
- **Firebase Hosting** - Integrates well with Firebase backend
- **Heroku** - Classic deployment option

### **Environment Variables**
For production deployments, consider using environment variables for Firebase configuration instead of hardcoding them.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Enhancements

- [ ] **Message editing** functionality
- [ ] **File and image sharing** capabilities
- [ ] **Emoji reactions** to messages
- [ ] **Typing indicators** to show when users are typing
- [ ] **Dark mode** toggle for better accessibility
- [ ] **Message search** functionality
- [ ] **User profiles** with custom avatars
- [ ] **Push notifications** for new messages
- [ ] **Voice messages** support
- [ ] **Message threading** for better organization

---
## ⚠️ Disclaimer/Security notice

This app is currently public! Private message/channel features have not been implemented. App has not received external security review and may contain vulnerabilities. Do not use for sensitive use cases or share private info. ⛑️ work in progress. 

---

**WordFlight** - Grant your words flight! 🚀

Built with ❤️ by Chris