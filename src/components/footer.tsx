import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer
      className="relative bg-cover bg-center text-white"
      style={{
        backgroundImage: "url('https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/47440edcda1755338e49b4c001259df8.jpg')",
      }}
    >
      {/* Overlay for glassmorphism */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md rounded-t-3xl"></div>

      {/* Footer Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand Description */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-3">Trainease</h3>
            <p className="text-gray-200 text-sm leading-relaxed">
              Train like a beast, book like a breeze. <br />
              India's dopest sports zones are just a tap away — grab your slot and let the grind begin. 🏸🔥
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
            <h3 className="text-xl font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>
                <Link to="/" className="hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/centers" className="hover:text-white">Find Centers</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
            <h3 className="text-xl font-semibold text-white mb-3">Contact Us</h3>
            <address className="not-italic text-gray-300 text-sm">
              <p>Email: info@trainease.com</p>
              <p>Phone: +91 98765 43210</p>
              <p className="mt-2">
                Head Office: Trainease, <br />
                24, Hill Road, Bandra West, <br />
                Mumbai - 400050
              </p>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-white/20 text-center text-sm text-gray-300">
          &copy; {new Date().getFullYear()} Trainease. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

