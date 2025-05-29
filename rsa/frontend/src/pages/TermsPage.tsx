import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../index.css';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-base dark:text-text-inverse">
      <Navbar />
      <main className="flex-grow container-app py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Terms of Service</h1>
        <div className="prose dark:prose-invert mx-auto">
          <p>These are the terms of service. Details will be added here shortly.</p>
          </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage; 