import React from 'react';
import './GuestHomePage.css';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import drawing from '/homepage_drawing.png';

const GuestHomePage = () => {
	const navigate = useNavigate();

	return (
		<div className='guest-home-container'>
			<div className='guest-home-hero'>
				<div className='guest-home-content'>
					<h1>Find Your Perfect Match</h1>
					<p>Connect with like-minded individuals and discover meaningful relationships</p>
					<div className='guest-home-buttons'>
						<Button label="Get Started" className="p-button-raised p-button-rounded primary-button" onClick={() => navigate('/register')} />
						<Button label="Learn More" className="p-button-outlined p-button-rounded secondary-button" onClick={() => window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' })} />
					</div>
				</div>
				<div className='guest-home-image'>
					<img src={drawing} alt='Couple Illustration' className='hero-background-img' />
				</div>
			</div>
			<div className='guest-home-features'>
				<h2>Discover What Makes Matcha Special</h2>
				<div className='features-grid'>
					<div className='feature-card'>
						<div className='feature-icon'>
							<i className='pi pi-check-circle'></i>
						</div>
						<h3>Genuine Connections</h3>
						<p>Our matching algorithm helps you find people who share your interests.</p>
					</div>
					<div className='feature-card'>
						<div className='feature-icon'>
							<i className='pi pi-calendar'></i>
						</div>
							<h3>Date Planning Tools</h3>
							<p>Built-in features to schedule meetups, and plan the perfect first date.</p>
					</div>
					<div className='feature-card'>
						<div className='feature-icon'>
							<i className='pi pi-map-marker'></i>
						</div>
						<h3>Location-Based</h3>
						<p>Find compatible matches in your area and plan meetups with ease.</p>
					</div>
				</div>
			</div>
			<div className='guest-home-cta'>
				<h2>Ready to Find Your Match?</h2>
				<p>Join thousands of singles already on Matcha</p>
				<Button label="Sign Up Now" className="register-button p-button-raised p-button-rounded" onClick={() => navigate('/register')} />
			</div>
		</div>
	);
};

export default GuestHomePage;