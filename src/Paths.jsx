import HomePage from "./base/HomePage";
import Login from "./pages/Login/Login";
import Registration from "./pages/Registration/Registration";
import Profile from "./pages/ProfilePage/Profile"
import EditProfile from "./pages/EditProfilePage/EditProfile"

export const Paths = [
	{path: '', component: <HomePage />},
	{path: '/register', component: <Registration />},
	{path: '/login', component: <Login />},
	{path: '/profile/:userId', component: <Profile />},
	{path: '/editprofile/:userId', component: <EditProfile />},
];