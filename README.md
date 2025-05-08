# FindIt - Lost & Found Platform

FindIt is a community-based lost and found web application where users can post lost or found items within specific groups like colleges, societies, offices, etc. Admins can create groups, and users can interact in their relevant spaces.

---

## 🔧 Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Arkan-Khan/FindIt.git
cd findit
```

---

## 🖥️ Client Setup (Frontend)

```bash
cd client
npm install
```

1. Create a `.env` file using the example below.
2. Then run the development server:

```bash
npm run dev
```

---

## 🌐 Server Setup (Backend)

```bash
cd server
npm install
```

1. Create a `.env` file using the example below.
2. Then go to the **root directory** and run:

```bash
npx prisma generate
npx prisma migrate dev
```

3. Finally, run the server:

```bash
npm run dev
```

The server and client should now be running locally!

---

## 📄 Example `.env` Files

### 🟦 Client `.env`

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
VITE_BACKEND_URL=http://localhost:5000/
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key

```

---

### 🟥 Server `.env`

```env
DATABASE_URL=your-db-connection-url
PORT=5000
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Firebase Admin SDK config
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

```

> 🔐 **Important:** Never commit actual `.env` files with secrets to GitHub. Always use a `.env.example` file in your repository.

---

## ✅ Features

- Group-based lost and found board
- Admin-created groups with codes
- Image upload to Cloudinary
- Real-time updates and filtering

---

## 📦 Tech Stack

- Frontend: React + Vite with Tailwind CSS
- Backend: Node.js + Express + Prisma
- Notification: Firebase Cloud Messaging
- Database: PostgreSQL (hosted on Supabase)
- Image Storage: Cloudinary

---

## 📍 Status

Still under active development. Contributions, ideas, and feedback are welcome!

---

## 🔗 License

MIT License © 2025 Arkan Khan
