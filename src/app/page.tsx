"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState, useRef } from 'react';
import emailjs from 'emailjs-com';
import Swal from 'sweetalert2';
import { HiMenu, HiX } from 'react-icons/hi';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Home() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side rendering to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "features", label: "Packages" },
    { id: "why-choose", label: "Why Choose Us" },
    { id: "partners", label: "Our Partners" },
    { id: "contact", label: "Contact" },
  ];

  // Handle smooth scrolling and active section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Update active section on scroll
  useEffect(() => {
    if (!isClient) return;

    AOS.init({
      duration: 1000,
      once: false,
    });

    const handleScroll = () => {
      const sections = ['home', 'features', 'why-choose', 'partners', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) setActiveSection(currentSection);
    };

    // Initialize scroll position
    if (window.scrollY > 100) {
      const home = document.getElementById('home');
      if (home) {
        home.scrollIntoView({ behavior: 'auto' });
        setActiveSection('home');
      }
    } else {
      handleScroll();
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  const ContactForm: React.FC = () => {
    const form = useRef<HTMLFormElement>(null);

    const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!form.current) return;

      emailjs.sendForm(
        'service_yk9fi68', 
        'template_lpywbd9', 
        form.current,
        'vOFoX6K3EuP2M2bjH'
      ).then(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Message Sent!',
            text: 'Thank you for contacting us.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          form.current?.reset();
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to send, try again.',
            confirmButtonText: 'Retry'
          });
        }
      );
    };

    return (
      <form ref={form} onSubmit={sendEmail} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Your Name"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Your Email"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          rows={4}
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        ></textarea>
        <Button 
          variant="default"
          type="submit"
          className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3"
        >
          Send Message
        </Button>
      </form>
    );
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Image src="/assets/img/LogoHRIS.png" alt="HRIS Logo" width={80} height={80} />

          {/* Hamburger icon - hanya tampil di mobile */}
          <button 
            className="md:hidden text-3xl text-gray-700"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {menuOpen ? <HiX /> : <HiMenu />}
          </button>

          {/* Navigation - tampil di desktop */}
          <nav className="hidden md:flex space-x-8 text-md font-medium">
            {navItems.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`${
                  activeSection === id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                } hover:text-blue-600 transition`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Buttons Sign In/Up - tampil di desktop */}
          <div className="hidden md:flex space-x-4">
            <Button variant="outline" onClick={() => router.push('/signin')} className="bg-blue-600 text-white hover:bg-blue-700">
              Sign In
            </Button>
            <Button variant="default" onClick={() => router.push('/signup')} className="bg-blue-600 text-white hover:bg-blue-700">
              Sign Up
            </Button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4">
            <nav className="flex flex-col space-y-4 text-gray-700">
              {navItems.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => {
                    scrollToSection(id);
                    setMenuOpen(false);
                  }}
                  className="text-left w-full hover:text-blue-600"
                >
                  {label}
                </button>
              ))}

              {/* Optional: Tambah tombol Sign In/Up di menu mobile */}
              <Button variant="outline" onClick={() => router.push('/signin')} className="bg-blue-600 text-white hover:bg-blue-700">
                Sign In
              </Button>
              <Button variant="default" onClick={() => router.push('/signup')} className="bg-blue-600 text-white hover:bg-blue-700">
                Sign Up
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Section */}
      <section id="home" className="pt-4 bg-gradient-to-b from-blue-50 to-white" data-aos="fade-in">
        <main className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 md:px-12 py-24 gap-12">
          <div className="w-full md:w-1/2 space-y-6 flex-shrink-0">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight max-w-xl">
              Simplify HR Management with <span className="text-blue-600">HRIS</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-lg">
              Empower your HR team with a seamless tool to manage workforce data, track attendance, and streamline paperwork. Flexible paid subscription plans to fit your company's needs.
            </p>
            <div className="flex space-x-6">
              <Button 
                variant="default"
                onClick={() => router.push('/signup')}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3"
              >
                Try HRIS for free
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center flex-shrink-0">
            <Image
              src="/assets/img/landing.png"
              alt="HRIS Logo"
              width={700}
              height={700}
              className="object-contain"
              priority
            />
          </div>
        </main>
      </section>

      {/* Features / Packages Section */}
      <section id="features" className="py-24 px-4" data-aos="fade-in">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-900">Choose the HRIS Packages right for you</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-center mb-16">
            Choose the package that best suits your business! This HRIS offers
            both subscription and pay-as-you-go payment options.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Free Trial',
                subtitle: 'Try before you buy — full features for 2 weeks',
                features: [
                  '14 days access', 
                  'Up to 25 employees', 
                  'Head Office only',
                ],
                price: 0,
                popular: false,
              },
              {
                title: 'Starter',
                subtitle: 'Ideal for small businesses starting their journey',
                features: [
                  '1 month access', 
                  'Up to 50 employees', 
                  'Head Office only',
                ],
                price: 500000,
                popular: true,
              },
              {
                title: 'Growth',
                subtitle: 'Perfect for expanding companies with multiple locations',
                features: [
                  '3 month access',
                  'Up to 250 employees',
                  'Head Office with 2 branch offices',
                ],
                price: 1800000,
                popular: false,
              }
            ].map((plan) => (
              <div
                key={plan.title}
                className={`relative bg-white border-2 ${
                  plan.popular ? 'border-blue-500' : 'border-gray-200'
                } rounded-xl shadow-md p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-xl text-sm`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex flex-col h-full">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.title}</h3>
                  <p className="text-gray-500 mt-2 mb-6">{plan.subtitle}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Free' : `Rp ${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && <span className="text-gray-500 ml-2">/package</span>}
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() =>
                      plan.price === 0
                        ? router.push("/signup")
                        : router.push(`/pricing?plan=${plan.title}&price=${plan.price}`)
                    }
                    className={`w-full mt-auto ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-white border-blue-600 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {plan.price === 0 ? "Start Free Trial" : "Choose Plan"}
                    <span className="ml-2">→</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Second tier - Advanced packages */}
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Pro',
                subtitle: 'Advanced features for mid-sized enterprises',
                features: [
                  '6 month access',
                  'Up to 500 employees',
                  'Head Office with 3 branch offices',
                ],
                price: 3600000,
                popular: false,
              },
              {
                title: 'Enterprise',
                subtitle: 'For large organizations',
                features: [
                  '12 month access',
                  'Up to 1000 employees',
                  'Head Office with 4 branch offices',
                ],
                price: 7200000,
                popular: false,
              },
              {
                title: 'Ultra',
                subtitle: 'Custom solution for enterprise needs',
                features: [
                  'All Premium features',
                  'Face Recognition',
                  'Automated check-out attendance',
                  'Employee turnover dashboard',
                  'Custom dashboard for statistics & analysis',
                ],
                price: null,
                popular: false,
              }
            ].map((plan) => (
              <div
                key={plan.title}
                className={`relative bg-white border-2 ${
                  plan.popular ? 'border-blue-500' : 'border-gray-200'
                } rounded-xl shadow-md p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-xl text-sm`}
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.title}</h3>
                  <p className="text-gray-500 mt-2 mb-6">{plan.subtitle}</p>
                  
                  {plan.price ? (
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        Rp {plan.price.toLocaleString()}
                      </span>
                      <span className="text-gray-500 ml-2">/package</span>
                    </div>
                  ) : (
                    <p className="text-xl font-medium text-blue-600 mb-6">Contact for Custom Pricing</p>
                  )}
                  
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="outline"
                    onClick={() =>
                      plan.price 
                        ? router.push(`/pricing?plan=${plan.title}&price=${plan.price}`)
                        : router.push('/contact-sales')
                    }
                    className="w-full mt-auto bg-white border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {plan.price ? "Choose Plan" : "Contact Sales"}
                    <span className="ml-2">→</span>
                  </Button>
                </div>
              </div>
            ))}
            </div>
          </div>      
        </div>
      </section>

      {/* Why Choose HRIS Section */}
      <section id="why-choose" className="py-24 px-4 bg-blue-50" data-aos="fade-in">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose HRIS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Advanced Analytics',
                description: 'Get deep insights into your workforce with powerful analytics and custom dashboards',
                icon: '📊'
              },
              {
                title: 'Automated Workflows',
                description: 'Streamline HR processes with intelligent automation and customizable workflows',
                icon: '⚡'
              },
              {
                title: 'Anywhere, Anytime Access',
                description: 'Use our web-based HRIS system seamlessly on any device—laptop, tablet, or smartphone',
                icon: '🌐'
              },
              {
                title: 'Security First',
                description: 'Enterprise-grade security with end-to-end encryption and compliance',
                icon: '🔒'
              },
              {
                title: 'Easy Integration',
                description: 'Seamlessly integrate with your existing tools and software',
                icon: '🔄'
              },
              {
                title: '24/7 Support',
                description: 'Round-the-clock support from our dedicated team of experts',
                icon: '💬'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-24 px-4" data-aos="fade-in">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Our Technology Partners</h2>
          <p className="text-gray-600 max-w-4xl mx-auto mb-16">
            Collaborating with leading institutions and technology providers to deliver the best HR solutions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center justify-items-center mb-16">
            <div className="w-full max-w-[400px] hover:scale-105 transition flex flex-col items-center">
              <div className="flex justify-center items-center h-[150px]">
                <Image
                  src="/assets/img/logo_polinema.png"
                  alt="Politeknik Negeri Malang"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-600 mt-4 font-medium text-center">Politeknik Negeri Malang</p>
            </div>
            <div className="w-full max-w-[400px] hover:scale-105 transition flex flex-col items-center">
              <div className="flex justify-center items-center h-[150px]">
                <Image
                  src="/assets/img/logo_jti.png"
                  alt="Jurusan Teknologi Informasi"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-600 mt-4 font-medium text-center">Jurusan Teknologi Informasi</p>
            </div>
            <div className="w-full max-w-[400px] hover:scale-105 transition flex flex-col items-center">
              <div className="flex justify-center items-center h-[150px]">
                <Image
                  src="/assets/img/cmlabs.png"
                  alt="CMLabs"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-600 mt-4 font-medium text-center">PT CM Labs Indonesia Digital</p>
            </div>
          </div>        
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 bg-gray-50" data-aos="fade-in">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Get in Touch</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-center mb-16">Questions? Feedback? We're here to listen.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <p className="flex items-center">
                  <span className="mr-3">📍</span>
                  Jl. Soekarno Hatta 09 Malang, 65144
                </p>
                <p className="flex items-center">
                  <span className="mr-3">📧</span>
                  hris.cmlabs@gmail.com
                </p>
                <p className="flex items-center">
                  <span className="mr-3">📞</span>
                  +62 85708727797
                </p>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-center py-8 text-gray-500 text-sm">
        © {new Date().getFullYear()} HRIS. All rights reserved.
      </footer>
    </div>
  );
}