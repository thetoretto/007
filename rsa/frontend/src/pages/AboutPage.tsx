import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Users, Zap, Globe, Award, TrendingUp, Star,
  Target, Route, CheckCircle, ArrowRight, Sparkles, Play, Eye,
  Lightbulb, Rocket, Calendar, Phone, Mail
} from 'lucide-react';

import '../index.css';

const AboutPage: React.FC = () => {

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

  const stats = [
    { icon: Users, number: "2M+", label: "Active Users", description: "Travelers trust us daily" },
    { icon: Globe, number: "25+", label: "African Cities", description: "Connected across the continent" },
    { icon: Star, number: "4.9", label: "Average Rating", description: "Customer satisfaction score" },
    { icon: Shield, number: "99.9%", label: "Safety Record", description: "Incident-free journeys" }
  ];

  const timeline = [
    { year: "2020", title: "The Vision", description: "Founded with a mission to revolutionize African transportation", icon: Lightbulb },
    { year: "2021", title: "First Routes", description: "Launched in 3 major cities with 100+ drivers", icon: Route },
    { year: "2022", title: "Rapid Growth", description: "Expanded to 15 cities, serving 500K+ passengers", icon: TrendingUp },
    { year: "2023", title: "Continental Reach", description: "Now serving 25+ cities across 8 African countries", icon: Globe },
    { year: "2024", title: "Innovation Hub", description: "Leading Africa's transportation technology revolution", icon: Rocket }
  ];

  const team = [
    {
      name: "Kwame Asante",
      role: "CEO & Co-Founder",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Former McKinsey consultant with 15+ years in African tech ecosystem"
    },
    {
      name: "Amina Hassan",
      role: "CTO & Co-Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      bio: "Ex-Google engineer specializing in scalable transportation systems"
    },
    {
      name: "David Ochieng",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "20+ years experience in African logistics and supply chain management"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section - Cinematic Introduction */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-light via-purple/5 to-primary/10 dark:from-dark dark:via-purple/10 dark:to-primary/5">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-secondary/20 rounded-full blur-xl animate-float-slow"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-on-scroll">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">Our Story</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-light-primary dark:text-dark-primary">Connecting</span>
                <br />
                <span className="text-gradient bg-gradient-to-r from-primary via-purple to-accent bg-clip-text text-transparent">
                  Africa
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-light-secondary dark:text-dark-secondary leading-relaxed max-w-2xl">
                We're not just a transportation company. We're a movement that's transforming how Africa travels,
                one journey at a time. Our mission is to make safe, reliable, and affordable transportation
                accessible to every African.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/booking"
                  className="btn btn-primary btn-lg group"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button className="btn btn-secondary group">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Our Story
                </button>
              </div>
            </div>

            {/* Right Content - Interactive Stats */}
            <div className="grid grid-cols-2 gap-6 animate-on-scroll">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="card card-interactive p-6 text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="icon-badge icon-badge-lg bg-primary/10 text-primary mx-auto mb-4 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                    {stat.label}
                  </div>
                  <div className="text-xs text-light-tertiary dark:text-dark-tertiary">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-surface-light to-light dark:from-surface-dark dark:to-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Mission */}
            <div className="animate-on-scroll">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Target className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">Our Mission</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-light-primary dark:text-dark-primary mb-6">
                Revolutionizing African Transportation
              </h2>

              <p className="text-lg text-light-secondary dark:text-dark-secondary leading-relaxed mb-8">
                We believe every African deserves access to safe, reliable, and affordable transportation.
                Our platform connects communities, enables economic opportunities, and transforms how people move across the continent.
              </p>

              <div className="space-y-4">
                {[
                  "Connecting 25+ major African cities",
                  "Empowering local drivers and entrepreneurs",
                  "Building sustainable transportation networks",
                  "Creating economic opportunities for communities"
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-secondary mr-3 flex-shrink-0" />
                    <span className="text-light-secondary dark:text-dark-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision */}
            <div className="animate-on-scroll">
              <div className="card p-8 bg-gradient-to-br from-primary/5 to-purple/5 border-primary/20">
                <div className="icon-badge icon-badge-lg bg-primary text-black mx-auto mb-6">
                  <Eye className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-4 text-center">
                  Our Vision
                </h3>

                <p className="text-lg text-light-secondary dark:text-dark-secondary text-center leading-relaxed">
                  To become Africa's leading transportation platform, fostering unity, economic growth,
                  and sustainable mobility solutions that connect every corner of our beautiful continent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-purple/5 to-light dark:from-primary/10 dark:via-purple/10 dark:to-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Calendar className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Our Journey</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-primary dark:text-dark-primary mb-6">
              Building the Future of
              <br />
              <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                African Mobility
              </span>
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary to-accent hidden lg:block"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center animate-on-scroll ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="card card-interactive p-8 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                      <div className="flex items-center mb-4">
                        <div className="icon-badge icon-badge-lg bg-primary/10 text-primary mr-4 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div className="text-2xl font-bold text-primary">{item.year}</div>
                      </div>

                      <h3 className="text-xl font-bold text-light-primary dark:text-dark-primary mb-3">
                        {item.title}
                      </h3>

                      <p className="text-light-secondary dark:text-dark-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="hidden lg:block relative z-10">
                    <div className="w-6 h-6 bg-primary rounded-full border-4 border-light dark:border-dark"></div>
                  </div>

                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-light to-surface-light dark:from-dark dark:to-surface-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Users className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Leadership Team</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-primary dark:text-dark-primary mb-6">
              Meet the Visionaries
            </h2>

            <p className="text-lg text-light-secondary dark:text-dark-secondary max-w-3xl mx-auto">
              Our diverse team of African leaders, technologists, and innovators are united by a shared vision
              of transforming transportation across the continent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="card card-interactive p-8 text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-on-scroll"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary/20 group-hover:border-primary transition-all duration-300"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-black" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-light-primary dark:text-dark-primary mb-2">
                  {member.name}
                </h3>

                <div className="text-primary font-medium mb-4">
                  {member.role}
                </div>

                <p className="text-sm text-light-secondary dark:text-dark-secondary leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary via-primary-dark to-purple relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6">
              Ready to Join Our Mission?
            </h2>

            <p className="text-lg lg:text-xl text-black/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Be part of Africa's transportation revolution. Whether you're a traveler seeking reliable rides
              or a driver looking for opportunities, we welcome you to our growing community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/booking"
                className="btn bg-white text-primary hover:bg-white/90 btn-lg group"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/become-member"
                className="btn border-2 border-white/30 text-white hover:bg-white/10 btn-lg group"
              >
                <Users className="w-5 h-5 mr-2" />
                Become a Driver
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 