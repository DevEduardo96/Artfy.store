import React, { useState } from "react";
import {
<<<<<<< HEAD
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  LogOut,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const openCart = () => dispatch({ type: "OPEN_CART" });

  // Até você ter login com seu backend, sempre será null:
  const user = null;

  const handleLogout = async () => {
    // Adapte aqui para sua API futuramente
    console.log("Logout");
    navigate("/");
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10">
              <img src="/logo02.webp" alt="Logo" />
            </div>
            <span className="text-xl font-bold text-gray-800">Nectix</span>
          </div>

          {/* Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate("/")}
              className="text-gray-700 hover:text-blue-600"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/ebooks")}
              className="text-gray-700 hover:text-blue-600"
            >
              Ebooks
            </button>
            <button
              onClick={() => navigate("/sites")}
              className="text-gray-700 hover:text-blue-600"
            >
              Sites
            </button>
            <button
              onClick={() => navigate("/suporte")}
              className="text-gray-700 hover:text-blue-600"
            >
              Suporte
            </button>
          </nav>

          {/* Ações */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/favorites")}
              className="p-2 text-gray-700 hover:text-red-600 transition-colors"
              aria-label="Ver favoritos"
            >
              <Heart className="h-6 w-6" />
            </button>

            <button
              onClick={() => navigate("/login")}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <User className="h-6 w-6" />
            </button>

            <button
              onClick={openCart}
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )}
=======
  ShoppingCart,
  Search,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  onCartClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-10 h-10">
                  <img src="/logo02.webp" alt="Logo" />
                </div>
                <span className="text-xl font-bold text-gray-800">Nectix</span>
              </div>
            </Link>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">
              Início
            </Link>
            <Link
              to="/meu-site"
              className="hover:text-indigo-600 transition-colors"
            >
              Meu site
            </Link>
            <Link
              to="/suporte"
              className="hover:text-indigo-600 transition-colors"
            >
              Suporte
            </Link>
            <Link
              to="/sobre"
              className="hover:text-indigo-600 transition-colors"
            >
              Sobre
            </Link>
          </nav>

          {/* Campo de Busca */}
          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produtos, cursos, templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              />
            </div>
          </div>

          {/* Carrinho + Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {cartItemCount}
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)
                </span>
              )}
            </button>

<<<<<<< HEAD
            {/* Botão menu mobile */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
=======
            {/* Botão de Menu Mobile */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)
              )}
            </button>
          </div>
        </div>
<<<<<<< HEAD

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            <div className="flex mb-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  navigate("/");
                  setIsMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Home
              </button>
              <button
                onClick={() => {
                  navigate("/ebooks");
                  setIsMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Ebooks
              </button>
              <button
                onClick={() => {
                  navigate("/sites");
                  setIsMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Sites
              </button>
              <button
                onClick={() => {
                  navigate("/suporte");
                  setIsMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Suporte
              </button>
              <button
                onClick={() => {
                  navigate("/favorites");
                  setIsMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Favoritos
              </button>
              <button
                onClick={() => {
                  navigate("/login");
                  setIsMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Entrar
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
=======
      </div>

      {/* Menu Mobile com transição de baixo pra cima */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-0 bg-white border-t shadow-lg z-40 animate-slide-up">
          <nav className="flex flex-col divide-y text-center text-sm font-medium text-gray-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 hover:bg-gray-100"
            >
              Início
            </Link>
            <Link
              to="/meu-site"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 hover:bg-gray-100"
            >
              Meu site
            </Link>
            <Link
              to="/suporte"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 hover:bg-gray-100"
            >
              Suporte
            </Link>
            <Link
              to="/sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 hover:bg-gray-100"
            >
              Sobre
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)
