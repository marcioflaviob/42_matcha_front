import Login from "./pages/Login/Login";
import Registration from "./pages/Registration/Registration";
import Profile from "./pages/ProfilePage/Profile";
import ChatPage from "./pages/ChatPage/ChatPage";
import HomePage from "./base/HomePage/HomePage";
import EditProfile from "./pages/EditProfilePage/EditProfile";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import GoogleCallback from "./pages/GoogleAuthentication/GoogleCallback";
import ErrorPage from "./pages/Error/ErrorPage";

export const Paths = [
	{path: '', component: <HomePage/>},
	{path: '/register', component: <Registration />},
	{path: '/login', component: <Login />},
	{path: '/profile/:userId', component: <Profile />},
	{path: '/chat', component: <ChatPage />},
	{path: '/edit-profile/', component: <EditProfile />},
	{path: '/reset-password', component: <ResetPassword />},
	{path: '/auth/google/callback', component: <GoogleCallback /> },
	{path: '*', component: <ErrorPage /> }
];