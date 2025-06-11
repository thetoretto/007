import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Globe, MessageCircle, Headphones } from 'lucide-react';
import '../index.css';

const ContactPage: React.FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.animate-on-scroll');
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.8) {
          section.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          message: ''
        });
      }, 3000);
    }, 1000);
  };

  return (
    <div className="w-full">
      <div className="py-12 sm:py-20">
        <div className="max-w-lg mx-auto lg:max-w-5xl">
          <div className="text-center mb-12 lg:mb-16 animate-on-scroll">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <MessageCircle className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Get In Touch</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-primary dark:text-dark-primary tracking-tight mb-4">
              We're Here to <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Help</span>
            </h1>
            <p className="mt-2 text-lg text-light-secondary dark:text-dark-secondary max-w-2xl mx-auto">
              Have questions or need assistance? Our dedicated support team is ready to help you with all your transportation needs.
            </p>
          </div>

          <div className="card overflow-hidden lg:grid lg:grid-cols-2 animate-on-scroll">
            {/* Contact Information */}
            <div className="relative p-8 lg:p-10 bg-gradient-to-br from-primary via-secondary to-purple text-white">
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-accent/20 rounded-full blur-2xl animate-float-delayed"></div>
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                <p className="mb-8 text-white/90">
                  Reach out directly or use the form. We're here to help with all your transportation needs 24/7!
                </p>

                <div className="space-y-6">
                  <div className="flex items-center group">
                    <div className="icon-badge icon-badge-lg bg-white/20 text-white mr-4 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">24/7 Support Hotline</p>
                      <p className="text-white font-semibold">+250 788 123 456</p>
                    </div>
                  </div>

                  <div className="flex items-center group">
                    <div className="icon-badge icon-badge-lg bg-white/20 text-white mr-4 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Email Support</p>
                      <p className="text-white font-semibold">support@rsa-travel.com</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="icon-badge icon-badge-lg bg-white/20 text-white mr-4 mt-1 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Headquarters</p>
                      <p className="text-white font-semibold">Kigali City Tower<br />Kigali, Rwanda</p>
                    </div>
                  </div>

                  <div className="flex items-center group">
                    <div className="icon-badge icon-badge-lg bg-white/20 text-white mr-4 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Business Hours</p>
                      <p className="text-white font-semibold">24/7 Customer Support</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12">
                  <h3 className="text-lg font-medium text-gray-200 mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-primary bg-opacity-30 p-3 rounded-full hover:bg-primary transition-colors duration-300">
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" className="bg-primary bg-opacity-30 p-3 rounded-full hover:bg-primary transition-colors duration-300">
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" className="bg-primary bg-opacity-30 p-3 rounded-full hover:bg-primary transition-colors duration-300">
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-8 lg:p-10 bg-surface-light dark:bg-surface-dark">
              {isSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="animate-scale-in">
                    <div className="icon-badge icon-badge-xl bg-success/10 text-success mx-auto mb-6">
                      <CheckCircle className="h-12 w-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-3">Message Sent!</h3>
                    <p className="text-light-secondary dark:text-dark-secondary">
                      Thank you for reaching out. Our team will get back to you within 24 hours.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-light-primary dark:text-dark-primary mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                      <label htmlFor="fullName" className="form-label">Full name</label>
                    <input
                      type="text"
                        name="fullName"
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                      autoComplete="name"
                      className="form-input" 
                        placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                      <label htmlFor="email" className="form-label">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                        value={formData.email}
                        onChange={handleChange}
                      autoComplete="email"
                      className="form-input"
                        placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                      <label htmlFor="phone" className="form-label">Phone <span className="text-light-tertiary dark:text-dark-tertiary text-xs">(Optional)</span></label>
                    <input
                        type="tel"
                      name="phone"
                      id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      autoComplete="tel"
                      className="form-input"
                        placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                      <label htmlFor="message" className="form-label">Message</label>
                    <textarea
                      id="message"
                      name="message"
                        value={formData.message}
                        onChange={handleChange}
                      rows={4}
                      className="form-input"
                        placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                        disabled={isSubmitting}
                        className="flex w-full justify-center items-center btn btn-primary"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                      Send Message
                          </>
                        )}
                    </button>
                </div>
              </form>
                </>
              )}
            </div>
          </div>

          {/* Office Location Section */}
          <div className="card mt-16 p-8 text-center animate-on-scroll">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Globe className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Visit Our Office</span>
            </div>

            <h2 className="text-2xl font-semibold text-light-primary dark:text-dark-primary mb-4">
              Come See Us in Person
            </h2>
            <p className="text-light-secondary dark:text-dark-secondary mb-8 max-w-2xl mx-auto">
              Our doors are always open for our valued customers. Visit our headquarters in the heart of Kigali
              for personalized assistance and to learn more about our services.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="icon-badge icon-badge-lg bg-primary/10 text-primary mx-auto mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-1">Office Hours</h3>
                <p className="text-sm text-light-secondary dark:text-dark-secondary">Mon-Fri: 8AM-6PM<br />Sat: 9AM-4PM</p>
              </div>

              <div className="text-center">
                <div className="icon-badge icon-badge-lg bg-secondary/10 text-secondary mx-auto mb-3">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-1">24/7 Support</h3>
                <p className="text-sm text-light-secondary dark:text-dark-secondary">Emergency assistance<br />always available</p>
              </div>

              <div className="text-center">
                <div className="icon-badge icon-badge-lg bg-accent/10 text-accent mx-auto mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-1">Easy Access</h3>
                <p className="text-sm text-light-secondary dark:text-dark-secondary">Central location<br />with parking</p>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden shadow-lg">
              <iframe
                className="w-full h-64 lg:h-80"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.4977618068896!2d30.05943731475395!3d-1.9440850984063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0xf32b36a5411d0bc8!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1676401066718!5m2!1sen!2sus"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="RSA Office Location - Kigali, Rwanda"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;