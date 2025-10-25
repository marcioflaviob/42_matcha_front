import React from 'react';
import './Footer.css';

const Footer = () => {
    
    return (
        <footer className="footer">
            <div className="footer-content">
                <a href="https://42.fr/" target="_blank" rel="noopener noreferrer" className="school-link">
                    <img src="https://42.fr/wp-content/uploads/2021/05/42-Final-sigle-seul.svg" alt="42 Logo" className="school-logo" />
                </a>
                
                <div className="footer-links">
                    <a href="https://github.com/marcioflaviob/42_matcha_front/" target="_blank" rel="noopener noreferrer">
                        frontend
                    </a>
                    <span className="separator">|</span>
                    <a href="https://github.com/marcioflaviob/42_matcha_back/" target="_blank" rel="noopener noreferrer">
                        backend
                    </a>
                    <span className="separator">|</span>
                    <a href="https://42.fr/" target="_blank" rel="noopener noreferrer">
                        42 school
                    </a>
                </div>
                
				<p className="copyright">
                    matcha is a school project written in 2025 by{" "}
                    <a href="https://www.linkedin.com/in/marcioflavio/" target="_blank" rel="noopener noreferrer">
                        marcio flavio
                    </a>{" "}
                    and{" "}
                    <a href="https://www.linkedin.com/in/t%C3%A9o-rimize-378b3222a/" target="_blank" rel="noopener noreferrer">
                        teo rimize
                    </a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
