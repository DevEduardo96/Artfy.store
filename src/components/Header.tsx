import React, { useState } from "react";
import {
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
                </span>
              )}
            </button>

            {/* Botão menu mobile */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

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
