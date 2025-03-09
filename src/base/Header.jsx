import React from 'react';
import './Header.css';

const Header = () => {
	return (
		<div className="header">
			<div className="header-left">
				<h1 className="title">Matcha</h1>
			</div>
			<div className="header-right">
				<nav>
					<ul className="navList">
						<li className="navItem"><a href="#home">Home</a></li>
						<li className="navItem"><a href="#about">About</a></li>
						<li className="navItem"><a href="#contact">Contact</a></li>
					</ul>
				</nav>
			</div>
		</div>
	);
};

export default Header;
