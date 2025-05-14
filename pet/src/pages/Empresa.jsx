import React from 'react';
import '../styles/Empresa.css';
import heroDog from '../img/ban.jpg';
import pawIcon from '../img/paws.png';

export default function Empresa() {
  return (
    <div className="empresa-container">
      <section className="empresa-hero">
        <div className="empresa-hero-text">
          <h1><span>Professional</span><br />Pet Training Services</h1>
          <p>
            Your expert pet and obedience trainer. We are dedicated to helping
            your furry friends become their best selves.
          </p>
          <div className="empresa-buttons">
            <button className="empresa-btn-orange">Explore Now</button>
            <button className="empresa-btn-white">Contact Now</button>
          </div>
        </div>
        <div className="empresa-hero-image">
          <img src={heroDog} alt="Dogs" />
          <img className="empresa-paw paw1" src={pawIcon} alt="Paw" />
          <img className="empresa-paw paw2" src={pawIcon} alt="Paw" />
          <img className="empresa-paw paw3" src={pawIcon} alt="Paw" />
        </div>
      </section>

      <section className="empresa-servicos">
        <h2>Than you ar yours just pet dogs</h2>
        <p>Your understanding changes lives forever. Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>

        <div className="empresa-servicos-grid">
          <div className="empresa-servico-img">
            <img src="/images/puppy2.png" alt="Happy Puppy" />
          </div>

          <div className="empresa-servico-card">
            <h3>Grows the Pet Training?</h3>
            <p>This description goes well and also says how we care about the animals.</p>
            <button>Read Project</button>
          </div>

          <div className="empresa-servico-card">
            <h3>Happy Trainn training</h3>
            <p>No greater time to make our animals happy and sociable.</p>
            <button>Read Lesson</button>
          </div>
        </div>
      </section>

      <section className="empresa-info">
        <div className="empresa-info-texto">
          <h2>Lets you ca Roal Pet Training:</h2>
          <p>We’re pet lovers who are passionate about helping dogs reach their best potential through training.</p>
          <ul>
            <li>About us</li>
            <li>Our Pet Adopts collection</li>
            <li>List of abilities</li>
          </ul>
          <img src="/images/family-dog.png" alt="Family with dog" />
        </div>

        <div className="empresa-info-cta">
          <h3>How do you res of Pet Chepley</h3>
          <p>Even if you’ve been your usual pet partner, learning behaviors like cause and reward strengthens obedience.  
          Our experts are happy to assist your dog with positive reinforcement.  
          Find a coach near you today or sign up for instant virtual sessions online now.</p>
          <button>Contact Now</button>
        </div>
      </section>
    </div>
  );
}
