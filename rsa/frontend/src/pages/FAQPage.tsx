import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../index.css';

const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-base dark:text-text-inverse">
      <Navbar />
      <main className="flex-grow container-app py-12 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
        <p className="text-lg">This is the FAQ page. Answers to common questions will be added here.</p>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage; 