'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Users2, Code2, Heart, Home, Upload, Shield, MessageSquarePlus } from 'lucide-react';

const menuItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Admin', href: '/admin', icon: Shield, target: '_blank' },
  { name: 'Request', href: 'https://forms.gle/jGswnf55KdcXUZpC8', icon: MessageSquarePlus, target: '_blank' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Simplified variants for minimal animations
  const menuVariants = {
    closed: {
      x: '-100%',
      transition: {
        duration: 0.2
      }
    },
    open: {
      x: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.1
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.1
      }
    }
  };

  useEffect(() => {
    // Check if there's a hash in the URL and scroll to that section
    if (pathname === '/' && window.location.hash === '#developers') {
      setTimeout(() => {
        const developersSection = document.getElementById('developers');
        if (developersSection) {
          developersSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure the section is rendered
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToDevelopers = (e: React.MouseEvent) => {
    e.preventDefault();
    const developersSection = document.getElementById('developers');
    if (developersSection && pathname === '/') {
      developersSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#developers');
    }
  };

  return (
    <>
      {/* Top Navbar with Logo and Developer Button */}
      <motion.nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border/50' : 'bg-transparent'
        }`}
        initial={false}
        animate={isScrolled ? { y: 0 } : { y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="lg:hidden relative z-50 w-8 h-8 flex flex-col justify-center items-center"
                  aria-label="Toggle Menu"
                >
                  <div className="flex flex-col justify-center items-center w-6 h-6">
                    <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-200 ${
                      isOpen ? 'rotate-45 translate-y-1.5' : ''
                    }`} />
                    <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-200 my-1 ${
                      isOpen ? 'opacity-0' : ''
                    }`} />
                    <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-200 ${
                      isOpen ? '-rotate-45 -translate-y-1.5' : ''
                    }`} />
                  </div>
                </button>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Link href="/" className="flex flex-col items-center">
                  <span className="text-2xl font-bold shiny-text">BtechNode</span>
                  <span className="text-xs mono-text mt-0.5 font-bold">By Script Squade</span>
                </Link>
              </motion.div>
            </div>

            <motion.button
              onClick={scrollToDevelopers}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent/50 transition-all duration-300 group relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="flex items-center space-x-1"
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Heart className="w-5 h-5 text-red-500 heart-glow" />
                <Users2 className="w-5 h-5 text-blue-500 users-glow" />
                <Code2 className="w-5 h-5 text-emerald-500 code-glow" />
              </motion.div>
              <span className="font-medium text-glow">Developers</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Side Menu for Desktop */}
      {!isMobile && (
        <div
          className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-200 ${
            isHovered ? 'w-48' : 'w-16'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="bg-background/30 backdrop-blur-xl border-r border-t border-b border-white/10 rounded-r-xl py-4 shadow-2xl shadow-purple-500/10">
            <div className="flex flex-col space-y-2 px-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    target={item.target}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg 
                      hover:bg-purple-500/20 
                      transition-all duration-200 ease-out group 
                      backdrop-blur-lg backdrop-saturate-150
                      ${isHovered ? 'justify-start' : 'justify-center'}`}
                  >
                    <Icon className="w-5 h-5 text-white group-hover:text-purple-400 transition-colors duration-200" />
                    <span className={`whitespace-nowrap text-white overflow-hidden transition-[width] duration-200 ${
                      isHovered ? 'w-24' : 'w-0'
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 ${isOpen && isMobile ? 'block' : 'hidden'}`}>
        <motion.div 
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={overlayVariants}
          className="fixed inset-0 bg-black/60"
          onClick={() => setIsOpen(false)}
        />
        <motion.div 
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={menuVariants}
          className="fixed left-0 top-0 h-full w-72 bg-background border-r border-white/10 z-50 overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col space-y-2 mt-20 px-3">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        target={item.target}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl 
                          bg-white/5 hover:bg-white/10
                          border border-white/5
                          transition-colors duration-150"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-medium">
                          {item.name}
                        </span>
                      </Link>
                    </div>
                  );
                })}
                
                <div>
                  <button
                    onClick={(e) => {
                      scrollToDevelopers(e);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl 
                      bg-white/5 hover:bg-white/10
                      border border-white/5
                      transition-colors duration-150"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Users2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium">
                      Developers
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 mt-auto">
              <div className="px-3 py-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold">BN</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">BtechNode</h4>
                    <p className="text-white/60 text-sm">By Script Squade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
