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
            <p>&copy; {currentYear} Advanced Programming_S2BUL_24. st2218026. Arsentii Bieliaiev</p>
          </div>
          
          <div className="mt-4 md:mt-0">

          </div>
        </div>
      </div>
    </footer>
  );
};