import HomePage from "./base/HomePage/HomePage";
import Login from "./pages/Login/Login";
import Registration from "./pages/Registration/Registration";
import Profile from "./pages/ProfilePage/Profile"
import GuestHomePage from "./base/HomePage/GuestHomePage";

export const Paths = [
	{path: '', component: <GuestHomePage/>},
	{path: '/register', component: <Registration />},
	{path: '/login', component: <Login />},
	{path: '/profile/:userId', component: <Profile />},
];