import HomePage from "./base/HomePage";
import Login from "./pages/Login/Login";
import Registration from "./pages/Registration/Registration";

export const Paths = [
	{path: '', component: <HomePage />},
	{path: '/register', component: <Registration />},
	{path: '/login', component: <Login />},
];