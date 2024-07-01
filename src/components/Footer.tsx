import React from 'react'
import Link from 'next/link';


export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-16">
        <div className="container mx-auto text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">&copy; 2024 Lica. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
            <a href="#" className="text-sm hover:underline">Tentang Kami</a>
              <a href="/pages/contact" className="text-sm hover:underline">Kontak</a>
              <a href="#" className="text-sm hover:underline">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>
    );
}