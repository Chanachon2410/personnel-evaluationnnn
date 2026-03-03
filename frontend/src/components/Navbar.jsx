import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'หน้าแรก', path: '/home', roles: ['ADMIN', 'EVALUATOR', 'EVALUATEE'] },
    { name: 'จัดการการประเมิน', path: '/admin/evaluations', roles: ['ADMIN'] },
    { name: 'งานที่ได้รับมอบหมาย', path: '/evaluator/evaluations', roles: ['EVALUATOR'] },
    { name: 'ผลการประเมินของฉัน', path: '/me/evaluations', roles: ['EVALUATEE'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(user?.role));

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/home" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold">P</div>
              <span className="font-bold text-xl hidden md:block">Performance System</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold leading-none">{user.name}</span>
                  <span className="text-xs text-blue-200">{user.role}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white border-2 border-blue-500 overflow-hidden">
                  <UserIcon size={20} />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-100 hover:text-white"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn bg-white text-primary hover:bg-blue-50">
                เข้าสู่ระบบ
              </Link>
            )}
            
            <div className="flex md:hidden ml-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-800 px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-in slide-in-from-top duration-200">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <div className="pt-4 pb-3 border-t border-blue-700 mt-2">
              <div className="flex items-center px-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                    <UserIcon size={20} />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium">{user.name}</div>
                  <div className="text-sm font-medium text-blue-200">{user.role}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
