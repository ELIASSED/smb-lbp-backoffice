"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaTimes, FaChalkboardTeacher, FaUsers, FaClipboardList } from "react-icons/fa";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex bg-yellow w-64 h-screen fixed top-0 left-0 flex-col items-center p-6 shadow-lg">
        {/* Logo */}
        <Link href="/" className="mb-8">
          <Image
            src="/smblogo.png"
            width={120}
            height={60}
            alt="SMB Logo"
            className="h-20 w-auto"
          />
        </Link>

        {/* Navigation Desktop */}
        <nav className="flex flex-col space-y-6 w-full">
          <NavItem href="/sessions" icon={<FaChalkboardTeacher />} label="Sessions" />
          <NavItem href="/staff" icon={<FaUsers />} label="Staff" />
          <NavItem href="/inscriptions" icon={<FaClipboardList />} label="Inscriptions" />
        </nav>
      </aside>

      {/* Navbar Mobile */}
      <header className="md:hidden bg-yellow fixed top-0 w-full p-4 flex items-center justify-between shadow-lg z-50">
        <Link href="/" className="flex items-center">
          <Image src="/smblogo.png" width={80} height={40} alt="SMB Logo" className="h-12 w-auto" />
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white text-2xl focus:outline-none"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      {/* Menu Mobile */}
      <div
        className={`md:hidden fixed top-0 left-0 w-64 h-full bg-yellow shadow-lg transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Bouton Fermer */}
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-4 right-4 text-white text-2xl"
        >
          <FaTimes />
        </button>

        {/* Logo */}
        <div className="flex justify-center mt-8 mb-6">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image src="/smblogo.png" width={100} height={50} alt="SMB Logo" className="h-16 w-auto" />
          </Link>
        </div>

        {/* Navigation Mobile */}
        <nav className="flex flex-col space-y-6 w-full px-6">
          <NavItem href="/sessions" icon={<FaChalkboardTeacher />} label="Sessions" onClick={() => setMenuOpen(false)} />
          <NavItem href="/staff" icon={<FaUsers />} label="Staff" onClick={() => setMenuOpen(false)} />
          <NavItem href="/inscriptions" icon={<FaClipboardList />} label="Inscriptions" onClick={() => setMenuOpen(false)} />
        </nav>
      </div>
    </>
  );
}

// Composant pour les liens de navigation
const NavItem = ({ href, icon, label, onClick }: { href: string; icon: JSX.Element; label: string; onClick?: () => void }) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center space-x-3 text-lg font-semibold text-gray-dark px-4 py-3 rounded-lg hover:bg-yellow-dark hover:text-white transition duration-300"
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </Link>
);
