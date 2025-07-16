import React, { useState, useMemo } from "react";
import {
  Heart,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Download,
  ShoppingCart,
  Trash2,
  Share2,
  Eye,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Product } from "../types";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";

const FavoritesPage: React.FC = () => {
  const {
    state: favoritesState,
    dispatch: favoritesDispatch,
    toggleFavorite,
  } = useFavorites();
  const { dispatch: cartDispatch } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Categorias únicas, mais "Todos"
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(favoritesState.items.map((item) => item.category))
    );
    return ["Todos", ...uniqueCategories];
  }, [favoritesState.items]);

  // Filtra e ordena favoritos sem mutação
  const filteredFavorites = useMemo(() => {
    let filtered = favoritesState.items.filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term);
      const matchesCategory =
        selectedCategory === "Todos" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Copia array para não alterar original
    filtered = [...filtered];

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // recent
        filtered.reverse();
    }

    return filtered;
  }, [favoritesState.items, searchTerm, selectedCategory, sortBy]);

  const addToCart = (product: Product) => {
    cartDispatch({ type: "ADD_ITEM", payload: product });
    cartDispatch({ type: "OPEN_CART" });
  };

  const clearAllFavorites = () => {
    if (window.confirm("Tem certeza que deseja remover todos os favoritos?")) {
      favoritesDispatch({ type: "CLEAR_FAVORITES" });
    }
  };

  const shareProduct = async (product: Product) => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Usuário pode cancelar o share
        console.log("Compartilhamento cancelado ou falhou:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copiado para a área de transferência!");
      } catch {
        alert("Não foi possível copiar o link. Por favor, copie manualmente.");
      }
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  const FavoriteCard: React.FC<{
    product: Product;
    viewMode: "grid" | "list";
  }> = ({ product, viewMode }) => {
    if (viewMode === "list") {
      return (
        <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6">
          <div className="flex gap-6">
            <img
              src={product.image}
              alt={product.name}
              className="w-24 h-32 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 flex flex-col justify-between">
              <header className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm text-blue-600 font-medium">
                    {product.category}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {product.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    {formatPrice(product.price)}
                  </p>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </p>
                  )}
                </div>
              </header>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>

              <footer className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{product.rating}</span>
                    <span>({product.reviews})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{product.fileSize}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => shareProduct(product)}
                    aria-label={`Compartilhar ${product.name}`}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    type="button"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    aria-label={`Visualizar ${product.name}`}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    type="button"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => toggleFavorite(product)}
                    aria-label={`Remover ${product.name} dos favoritos`}
                    className="p-2 text-red-500 hover:text-red-600 transition-colors"
                    type="button"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    type="button"
                  >
                    Comprar
                  </button>
                </div>
              </footer>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={() => toggleFavorite(product)}
              aria-label={`Remover ${product.name} dos favoritos`}
              className="p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors"
              type="button"
            >
              <Heart className="h-4 w-4 fill-current" />
            </button>
            <button
              onClick={() => shareProduct(product)}
              aria-label={`Compartilhar ${product.name}`}
              className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              type="button"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          {product.originalPrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
              {Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                  100
              )}
              % OFF
            </div>
          )}
        </div>

        <div className="p-5">
          <header className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-600 font-medium">
              {product.category}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{product.rating}</span>
            </div>
          </header>

          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>{product.fileSize}</span>
              <span>•</span>
              <span>{product.format}</span>
            </div>
          </div>

          <footer className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-800">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={() => addToCart(product)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              type="button"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Comprar</span>
            </button>
          </footer>
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-500 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 mr-3 fill-current" />
              <h1 className="text-4xl lg:text-5xl font-bold">Meus Favoritos</h1>
            </div>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Seus produtos digitais favoritos salvos para compra posterior
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">
                {favoritesState.items.length}
              </p>
              <p className="text-sm opacity-80">Favoritos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{categories.length - 1}</p>
              <p className="text-sm opacity-80">Categorias</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">
                {favoritesState.items.reduce(
                  (total, item) =>
                    total +
                    (item.originalPrice
                      ? Math.round(
                          ((item.originalPrice - item.price) /
                            item.originalPrice) *
                            100
                        )
                      : 0),
                  0
                )}
                %
              </p>
              <p className="text-sm opacity-80">Economia Média</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">
                {formatPrice(
                  favoritesState.items.reduce(
                    (total, item) => total + item.price,
                    0
                  )
                )}
              </p>
              <p className="text-sm opacity-80">Valor Total</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <input
                type="search"
                placeholder="Buscar nos favoritos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Buscar nos favoritos"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="filters-section"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                type="button"
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-red-100 text-red-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  type="button"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-red-100 text-red-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  type="button"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {favoritesState.items.length > 0 && (
                <button
                  onClick={clearAllFavorites}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Limpar Tudo</span>
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div
              id="filters-section"
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label
                    htmlFor="category-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Categoria
                  </label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label
                    htmlFor="sort-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ordenar por
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="recent">Adicionado Recentemente</option>
                    <option value="name">Nome A-Z</option>
                    <option value="rating">Melhor Avaliado</option>
                    <option value="price-low">Menor Preço</option>
                    <option value="price-high">Maior Preço</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {filteredFavorites.length}{" "}
              {filteredFavorites.length === 1 ? "Favorito" : "Favoritos"}
            </h2>
            {searchTerm && (
              <p className="text-gray-600" aria-live="polite">
                Resultados para "{searchTerm}"
              </p>
            )}
          </div>
        </header>

        {/* Favorites Grid/List */}
        {filteredFavorites.length > 0 ? (
          <section
            aria-live="polite"
            className={
              viewMode === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-6"
            }
          >
            {filteredFavorites.map((product) => (
              <FavoriteCard
                key={product.id}
                product={product}
                viewMode={viewMode}
              />
            ))}
          </section>
        ) : favoritesState.items.length === 0 ? (
          <section className="text-center py-16" aria-live="polite">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum favorito ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Comece a adicionar produtos aos seus favoritos para vê-los aqui.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300"
              type="button"
            >
              Explorar Produtos
            </button>
          </section>
        ) : (
          <section className="text-center py-16" aria-live="polite">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum favorito encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou buscar por outros termos.
            </p>
          </section>
        )}

        {/* Quick Actions */}
        {filteredFavorites.length > 0 && (
          <section className="mt-16" aria-label="Ações rápidas">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-8">
              <div className="text-center mb-6">
                <Sparkles className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Ações Rápidas
                </h2>
                <p className="text-gray-600">
                  Gerencie seus favoritos de forma eficiente
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <button
                  onClick={() => {
                    filteredFavorites.forEach((product) => addToCart(product));
                  }}
                  className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  type="button"
                >
                  <ShoppingCart className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Adicionar Todos ao Carrinho
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Compre todos os favoritos de uma vez
                  </p>
                </button>

                <button
                  className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  type="button"
                  onClick={() =>
                    alert(
                      "Funcionalidade de compartilhar lista não implementada ainda"
                    )
                  }
                >
                  <Share2 className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Compartilhar Lista
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Envie sua lista para amigos
                  </p>
                </button>

                <button
                  className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  type="button"
                  onClick={() =>
                    alert(
                      "Funcionalidade de criar coleção não implementada ainda"
                    )
                  }
                >
                  <BookOpen className="h-8 w-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Criar Coleção
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Organize em coleções temáticas
                  </p>
                </button>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
};

export default FavoritesPage;
