# Matcha Frontend

Matcha is 42 school project written by [Marcio Flavio](https://www.linkedin.com/in/marcioflavio/) and [Teo Rimize](https://www.linkedin.com/in/t%C3%A9o-rimize-378b3222a/). 

It consists of a modern dating web application built with React and a RESTful API backend. This repository contains the frontend codebase, providing user experience for discovering, chatting, and connecting with potential matches.

[Click here to go to the backend repository.](https://github.com/marcioflaviob/42_matcha_back)

![Application Diagram](https://i.ibb.co/9HT0Jprb/Blank-diagram.png)

## Project Overview

Matcha enables users to create profiles, discover matches based on interests and location, chat in real-time, schedule dates, and receive notifications. The frontend is designed for responsiveness and accessibility, supporting both desktop and mobile devices.

## Key Features

- **Authentication**: Secure login, registration, and Google OAuth.
- **Profile Management**: Edit profile, upload pictures, set interests and preferences.
- **Matching**: Discover potential matches based on interests and location.
- **Chat**: Real-time messaging with online/offline status.
- **Video Calls**: Peer-to-peer video calls using WebRTC.
- **Date Scheduling**: Propose and manage dates with integrated calendar and map.
- **Notifications**: Real-time notifications for messages, matches, likes, and calls.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Architecture

The frontend is a single-page application (SPA) built with React and PrimeReact for UI components. It communicates with a RESTful backend API for user data, authentication, and matching logic, and uses WebSockets (via Pusher) for real-time features like chat and notifications.

```
.
├── public/                 
├── src/
│   ├── base/               # Core layout components (Header, Footer, HomePage)
│   ├── components/         
│   ├── context/            
│   ├── pages/              
│   ├── App.jsx             
│   ├── Layout.jsx          # App layout (Header, Outlet and Footer)
│   ├── Paths.jsx           # Route definitions
│   ├── main.jsx            
│   └── index.css           
├── package.json
├── vite.config.js
└──Dockerfile
```

**Key folders explained:**

- `base/`: Contains layout and navigation components shared across the app.
- `components/`: Contains all reusable and feature-specific components, organized by feature (e.g., ChatPage, Profile, Notification).
- `context/`: Houses React Contexts for global state management (user, authentication, sockets, map).
- `pages/`: Contains top-level page components mapped to routes.
- `public/`: Static files served directly by the web server.

---



## Setup & Installation

1. **Clone the repository:**
   ```
   git clone https://github.com/marcioflaviob/42_matcha_front.git
   cd 42_matcha_front
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure environment variables:**
   - Use the `.env.example` file as an example to configure the variables.

4. **Run the development server:**
   ```
   npm run dev
   ```

## License

This project is for educational purposes as part of the 42 school curriculum.