import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../index.css';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-base dark:text-text-inverse">
      <Navbar />
      <main className="flex-grow container-app py-12 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>
        <p className="text-lg">This is the About Us page. Content coming soon!</p>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage; 