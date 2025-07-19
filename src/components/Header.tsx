import React, { useState, useEffect } from "react";
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
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const openCart = () => dispatch({ type: "OPEN_CART" });

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-blue-600 transition-colors rounded">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                  <span className="hidden md:inline text-sm font-medium">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-md hidden group-hover:block z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <User className="h-6 w-6" />
              </button>
            )}

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

              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              ) : (
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
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
