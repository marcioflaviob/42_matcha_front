import Login from "./pages/Login/Login";
import Registration from "./pages/Registration/Registration";
import Profile from "./pages/ProfilePage/Profile"
import ChatPage from "./pages/ChatPage/ChatPage";
import HomePage from "./base/HomePage/HomePage";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

export const Paths = [
	{path: '', component: <HomePage/>},
	{path: '/register', component: <Registration />},
	{path: '/login', component: <Login />},
	{path: '/profile/:userId', component: <Profile />},
	{path: '/chat', component: <ChatPage />},
	{path: '/reset-password', component: <ResetPassword />},
];