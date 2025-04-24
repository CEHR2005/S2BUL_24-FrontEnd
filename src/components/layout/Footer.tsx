/**
 * Footer component with copyright information
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white p-4 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p>&copy; {currentYear} Movie Database. All rights reserved.</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-4">
              <li>
                <a href="/about" className="hover:text-gray-300">About</a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-gray-300">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms" className="hover:text-gray-300">Terms of Service</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-gray-300">Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};