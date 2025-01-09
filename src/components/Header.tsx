"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-yellow-600 text-white shadow fixed top-0 left-0 w-64 h-full flex flex-col items-start p-8">
      {/* Logo et Titre */}
      <div className="flex items-center mb-8">
        {/* Lien autour de l'image pour rediriger vers la page d'accueil */}
        <Link href="/" className="flex items-center">
          <Image
            src="/smblogo.png"
            width={100}
            height={50}
            alt="Exemple Banner"
            className="h-20 w-auto"
          />
        </Link>
      </div>

      {/* Navigation verticale */}
      <nav className="flex flex-col space-y-4 w-full">
        <Link
          href="/sessions"
          className="text-base uppercase hover:text-gray-200 py-2 px-4 rounded hover:bg-yellow-700"
        >
          Sessions
        </Link>
        <Link
          href="/staff"
          className="text-base uppercase hover:text-gray-200 py-2 px-4 rounded hover:bg-yellow-700"
        >
          Staff
        </Link>
        <Link
          href="/inscriptions"
          className="text-base uppercase hover:text-gray-200 py-2 px-4 rounded hover:bg-yellow-700"
        >
          Inscriptions
        </Link>
      </nav>

      {/* Bouton pour le menu mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden bg-white text-gray-800 p-2 rounded focus:outline-none mt-auto"
      >
        {menuOpen ? "Fermer" : "Menu"}
      </button>
    </header>
  );
}
