CRM Project

A simple CRM web app to create customer segments and generate AI-powered messages for marketing campaigns.




Demo Video: [[Link to YouTube/Google Drive] (Add after recording)](https://drive.google.com/file/d/1kVcSj9rBHlH4mGpFDMkcMOSlMLsYg14z/view?usp=sharing)

Functionalities





Sign In/Sign Up: Users can create an account or log in with an email and password. Admin users (role: 1) can access campaign creation.



Create Campaigns: Admins can:





Name a segment (e.g., "High Spenders").



Set rules (e.g., total_spend > 1000).



Enter a message objective (e.g., "Bring back inactive users").



Get message suggestions..



Preview audience size.



Save segments and log communications.



View Segments: Displays all saved segments with their names and rules.



Dark Theme UI: Clean interface with a dark background and semi-transparent sidebar (0.9 opacity).

Local Setup Instructions





Set Up Backend:





Navigate to the backend folder:

cd backend
npm install



Create a .env file in backend/:
VITE_PORT 
VITE_JWT_SECRET 
VITE_MONGO_URI





Start MongoDB:

mongod



Run the backend:

npm run start



Set Up Frontend:





Navigate to the frontend folder:

cd client
npm install
npm start



Access the App:





Open http://localhost:3001 in your browser.



Sign up with an email (e.g., test@example.com) and password, then log in.

Architecture Diagram







Frontend: React app for user interface and API calls.



Backend: Express server handling authentication, segments, and AI requests.



Database: MongoDB storing users, segments, and communication logs.



Tech Stack





Frontend: React, Axios, React Router, JWT-decode



Backend: Express, Mongoose, JSON Web Token, bcryptjs, CORS



Database: MongoDB



Tools: Git, npm

Known Limitations





Audience Size: Uses random numbers since no real customer data is available.



AI Messages: May sometimes fail if the Google API key is invalid or the network is down.



Security: Uses basic JWT authentication without advanced features like refresh tokens.



Deployment: Free-tier hosting (Vercel/Render) may have slow startup times.
