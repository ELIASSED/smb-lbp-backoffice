"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-yellow-600 text-white p-4 shadow">
      {/* Titre principal */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SMB LBP Back-Office</h1>
        {/* Bouton pour le menu en mode mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden bg-white text-grey p-2 rounded focus:outline-none"
        >
          {menuOpen ? "Fermer" : "Menu"}
        </button>
      </div>

      {/* Navigation principale */}
      <div
        className={`${
          menuOpen ? "block" : "hidden"
        } md:block bg-grey-500 rounded-b-lg mt-4`}
      >
        <nav className="flex flex-col md:flex-row justify-center md:justify-end px-4 py-3 md:space-x-8">
          <Link href="/sessions" className="text-base uppercase hover:text-gray-200">
            Sessions
          </Link>
          <Link href="/staff
          " className="text-base uppercase hover:text-gray-200">
            Staff
          </Link>
          <Link href="/psychologues" className="text-base uppercase hover:text-gray-200">
            Psychologues
          </Link>
        </nav>
      </div>
    </header>
  );
}
