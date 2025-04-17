export default function Footer() {
  return (
    <footer className="mt-auto py-4 sm:py-6 px-4 text-gray-600 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 text-center sm:text-left">
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-2">Address</h3>
            <p className="text-xs sm:text-sm">H R Mahajani Rd, Matunga East,</p>
            <p className="text-xs sm:text-sm">Mumbai, Maharashtra 400019</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li><a href="https://vjti.ac.in/" className="text-xs sm:text-sm hover:text-[#800000]">VJTI Website</a></li>
              <li><a href="https://vjti.ac.in/academic-calendar/" className="text-xs sm:text-sm hover:text-[#800000]">Academics</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-2">Follow Us</h3>
            <ul className="space-y-1">
              <li><a href="https://www.linkedin.com/school/veermata-jijabai-technological-institute/" className="text-xs sm:text-sm hover:text-[#800000]">LinkedIn</a></li>
              <li><a href="https://x.com/i/flow/login?redirect_after_login=%2Fvjti_official" className="text-xs sm:text-sm hover:text-[#800000]">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} Veermata Jijabai Technological Institute. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}