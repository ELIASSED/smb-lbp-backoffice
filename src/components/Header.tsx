"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { 
  FaBars, 
  FaTimes, 
  FaChalkboardTeacher, 
  FaUsers, 
  FaClipboardList, 
  FaSignOutAlt,
  FaSignInAlt 
} from "react-icons/fa";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  
  // Close the mobile menu when clicking outside or on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && menuOpen) {
        setMenuOpen(false);
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      
      if (
        menuOpen && 
        mobileMenu && 
        mobileMenuButton && 
        !mobileMenu.contains(target) && 
        !mobileMenuButton.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    signOut({ 
      callbackUrl: '/auth/login',
      redirect: true 
    });
    setMenuOpen(false);
  };

  // Composant de navigation partagé pour desktop et mobile
  const NavigationLinks = ({ isMobile = false }) => {
    if (status !== "authenticated") {
      return (
        <Link 
          href="/auth/login" 
          className={`flex items-center space-x-3 text-lg font-semibold text-gray-dark px-4 py-3 rounded-lg hover:bg-yellow-dark hover:text-white transition duration-300 ${isMobile ? 'w-full' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          <FaSignInAlt />
          <span>Connexion</span>
        </Link>
      );
    }

    return (
      <>
              <NavItem 
          href="/inscriptions" 
          icon={<FaClipboardList />} 
          label="Inscriptions" 
          onClick={() => setMenuOpen(false)}
          isMobile={isMobile}
        />
        <NavItem 
          href="/sessions" 
          icon={<FaChalkboardTeacher />} 
          label="Stages" 
          onClick={() => setMenuOpen(false)} 
          isMobile={isMobile}
        />
        <NavItem 
          href="/staff" 
          icon={<FaUsers />} 
          label="Animateurs" 
          onClick={() => setMenuOpen(false)}
          isMobile={isMobile}
        />

        
        {/* Bouton de déconnexion */}
        <button
          onClick={handleLogout}
          className={`flex items-center space-x-3 text-lg font-semibold text-gray-dark px-4 py-3 rounded-lg hover:bg-red-600 hover:text-white transition duration-300 ${isMobile ? 'w-full text-left' : ''}`}
        >
          <FaSignOutAlt />
          <span>Déconnexion</span>
        </button>

        {/* Affichage du nom d'utilisateur */}
        {session?.user?.name && (
          <div className="px-4 py-2 text-sm text-gray-600 italic">
            Connecté : {session.user.name}
          </div>
        )}
      </>
    );
  };

  // Overlay pour le mobile menu
  const MobileMenuOverlay = () => (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
        menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setMenuOpen(false)}
    />
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex bg-yellow w-56 h-screen fixed top-0 left-0 flex-col items-center p-6 shadow-lg z-50">
        {/* Logo */}
        <Link href="/" className="mb-8">
          <Image
            src="/smblogo.png"
            width={120}
            height={60}
            alt="SMB Logo"
            className="h-20 w-auto"
            priority
          />
        </Link>

        {/* Navigation Desktop */}
        <nav className="flex flex-col space-y-6 w-full">
          <NavigationLinks />
        </nav>
      </aside>

      {/* Navbar Mobile */}
      <header className="md:hidden bg-yellow fixed top-0 w-full p-4 flex items-center justify-between shadow-lg z-50">
        <Link href="/" className="flex items-center">
          <Image 
            src="/smblogo.png" 
            width={80} 
            height={40} 
            alt="SMB Logo" 
            className="h-12 w-auto" 
            priority
          />
        </Link>
        <button
          id="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white text-2xl focus:outline-none p-2"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay />

      {/* Menu Mobile */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed top-0 left-0 w-56 h-full bg-yellow shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
      >
        {/* Bouton Fermer */}
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-4 right-4 text-white text-2xl p-2"
          aria-label="Fermer le menu"
        >
          <FaTimes />
        </button>

        {/* Logo */}
        <div className="flex justify-center mt-8 mb-6">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image 
              src="/smblogo.png" 
              width={100} 
              height={50} 
              alt="SMB Logo" 
              className="h-16 w-auto" 
              priority
            />
          </Link>
        </div>

        {/* Navigation Mobile */}
        <nav className="flex flex-col space-y-4 w-full px-4 pb-6">
          <NavigationLinks isMobile={true} />
        </nav>
      </div>
    </>
  );
}

// Composant pour les liens de navigation
const NavItem = ({ href, icon, label, onClick, isMobile = false }: { 
  href: string; 
  icon: JSX.Element; 
  label: string; 
  onClick?: () => void;
  isMobile?: boolean;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center space-x-3 text-lg font-semibold text-gray-dark px-4 py-3 rounded-lg hover:bg-yellow-dark hover:text-white transition duration-300 ${
      isMobile ? 'w-full' : ''
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </Link>
);