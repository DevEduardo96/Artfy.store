import React, { useState } from "react";
import { Search, ShoppingCart, Menu, X, User, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";

interface HeaderProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPage = "home",
  onPageChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state, dispatch } = useCart();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const openCart = () => dispatch({ type: "OPEN_CART" });

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gray-800">
              DigitalStore
            </span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              type="button"
              onClick={() => onPageChange?.("home")}
              className={`transition-colors ${
                currentPage === "home"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Cursos
            </button>
            <button
              type="button"
              onClick={() => onPageChange?.("ebooks")}
              className={`transition-colors ${
                currentPage === "ebooks"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              E-books
            </button>
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Templates
            </button>
            <button
              type="button"
              onClick={() => onPageChange?.("support")}
              className={`transition-colors ${
                currentPage === "support"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Suporte
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="p-2 text-gray-700 hover:text-red-600 transition-colors"
              aria-label="Favoritos"
            >
              <Heart className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Conta"
            >
              <User className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Abrir carrinho"
            >
              <ShoppingCart className="h-6 w-6" />
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-700"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
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
            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onPageChange?.("home");
                  setIsMenuOpen(false);
                }}
                className={`block py-2 w-full text-left transition-colors ${
                  currentPage === "home"
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Início
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                }}
                className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                Cursos
              </button>
              <button
                type="button"
                onClick={() => {
                  onPageChange?.("ebooks");
                  setIsMenuOpen(false);
                }}
                className={`block py-2 w-full text-left transition-colors ${
                  currentPage === "ebooks"
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                E-books
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                }}
                className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                Templates
              </button>
              <button
                type="button"
                onClick={() => {
                  onPageChange?.("support");
                  setIsMenuOpen(false);
                }}
                className={`block py-2 w-full text-left transition-colors ${
                  currentPage === "support"
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Suporte
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
