# Airdrop Tracker

A web application for efficiently tracking and managing crypto airdrop projects. Designed to help users organize and monitor their participation in various crypto airdrop programs.

## Key Features

- **Project Tracking**: Manage active and completed airdrop projects
- **Categorization**: Classify airdrops by type (Daily Tasks, Testnet, Retroactive, Node, DePIN, etc.)
- **Notes & Links**: Store important notes and links for each project
- **Marking System**: Mark projects to track progress
- **Search & Filter**: Quickly find projects by name and category
- **Responsive Interface**: Seamless user experience on desktop and mobile devices
- **User Authentication**: Data security with user login

## Technologies

This project is built using:

- **Next.js**: React framework with server-side rendering
- **Firebase**: For authentication and data storage (Firestore)
- **Tailwind CSS**: CSS framework for responsive design
- **Lucide Icons**: Lightweight and modern icon library

## Getting Started

### Prerequisites

- Node.js (version 14 or newer)
- Firebase account (for authentication and database)

### Firebase Configuration

1. Create a project in [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (with Email/Password and Google methods)
3. Create a Firestore database
4. Copy your Firebase credentials for use in environment variables

### Environment Variables

Create a `.env.local` file in the root directory and add your Firebase credentials:

```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (for API routes)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
```

### Installation and Running the Application

1. Clone this repository

```bash
git clone https://github.com/yourusername/airdrop-tracker.git
cd airdrop-tracker
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Usage

1. **Login/Register**: Sign in using Google account or email/password
2. **Add New Project**: Click the "+ Add Project" button to add a new airdrop
3. **Manage Projects**: Use the dropdown menu on each project card to edit, mark as completed, or delete
4. **Filter & Search**: Use the search bar and category filters to find specific projects
5. **Completed Projects**: View and manage completed projects in a separate tab

## Deployment

The easiest way to deploy a Next.js app is by using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

To learn more about Next.js deployment, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Learn More

To learn more about Next.js, take a look at:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

## Contributing

Contributions and suggestions are always welcome. Please open an issue or pull request if you have ideas for improvements!

## License

[MIT](https://choosealicense.com/licenses/mit/)
