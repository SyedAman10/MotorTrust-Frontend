'use client';

export default function Footer() {
  return (
    <footer className="relative z-10 glass-strong mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2ec8c6] to-[#1a9a99] rounded-lg flex items-center justify-center text-2xl">
                🚗
              </div>
              <span className="text-xl font-bold gradient-text">MotorTrust</span>
            </div>
            <p className="text-gray-400 text-sm">
              The universal repair passport for every car.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#2ec8c6]">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#2ec8c6]">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#2ec8c6]">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2025 MotorTrust. All rights reserved. Built with ❤️ for better vehicle care.</p>
        </div>
      </div>
    </footer>
  );
}

