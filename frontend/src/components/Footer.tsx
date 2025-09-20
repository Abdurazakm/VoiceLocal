import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();
  const go = (page: string) => {
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'post-issue':
        navigate('/post-issue');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'about':
        navigate('/about');
        break;
      default:
        navigate('/');
    }
  };
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-lg mr-2">
                <span className="font-bold">VL</span>
              </div>
              <span className="text-xl font-bold">VoiceLocal</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Empowering communities by giving local issues a digital voice. 
              Connect, engage, and create positive change in your neighborhood.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => go('home')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => go('post-issue')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Post Issue
                </button>
              </li>
              <li>
                <button 
                  onClick={() => go('dashboard')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => go('about')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-gray-400 text-center">
            © 2024 VoiceLocal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}