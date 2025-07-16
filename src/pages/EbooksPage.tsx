import React, { useState, useMemo } from "react";
import {
  Book,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Download,
  Eye,
  Clock,
  FileText,
  Bookmark,
  TrendingUp,
  Award,
  Users,
  ChevronDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";

interface EbooksPageProps {
  products: Product[];
}

const EbooksPage: React.FC<EbooksPageProps> = ({ products }) => {
  const { dispatch } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar apenas e-books
  const ebooks = useMemo(() => {
    return products.filter(
      (product) =>
        product.category === "Design" ||
        product.format === "PDF" ||
        product.name.toLowerCase().includes("e-book") ||
        product.description.toLowerCase().includes("e-book") ||
        product.description.toLowerCase().includes("guia") ||
        product.description.toLowerCase().includes("manual")
    );
  }, [products]);

  // Categorias específicas para e-books
  const categories = useMemo(() => {
    const ebookCategories = [
      "Todos",
      "Programação",
      "Design",
      "Marketing",
      "Negócios",
      "Produtividade",
    ];
    return ebookCategories;
  }, []);

  // Filtros aplicados
  const filteredEbooks = useMemo(() => {
    let filtered = ebooks.filter((ebook) => {
      const matchesSearch =
        ebook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ebook.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "Todos" || ebook.category === selectedCategory;
      const matchesPrice =
        ebook.price >= priceRange[0] && ebook.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Ordenação
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // popularity
        filtered.sort((a, b) => b.reviews - a.reviews);
    }

    return filtered;
  }, [ebooks, searchTerm, selectedCategory, priceRange, sortBy]);

  const addToCart = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
    dispatch({ type: "OPEN_CART" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const EbookCard: React.FC<{ ebook: Product; viewMode: "grid" | "list" }> = ({
    ebook,
    viewMode,
  }) => {
    if (viewMode === "list") {
      return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <img
                src={ebook.image}
                alt={ebook.name}
                className="w-24 h-32 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm text-blue-600 font-medium">
                    {ebook.category}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {ebook.name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {formatPrice(ebook.price)}
                  </div>
                  {ebook.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(ebook.originalPrice)}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {ebook.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{ebook.rating}</span>
                    <span>({ebook.reviews})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{ebook.fileSize}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{ebook.format}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Bookmark className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => addToCart(ebook)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="relative">
          <img
            src={ebook.image}
            alt={ebook.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors">
              <Eye className="h-4 w-4 text-gray-600 hover:text-blue-600" />
            </button>
          </div>
          {ebook.originalPrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
              {Math.round(
                ((ebook.originalPrice - ebook.price) / ebook.originalPrice) *
                  100
              )}
              % OFF
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-600 font-medium">
              {ebook.category}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{ebook.rating}</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {ebook.name}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {ebook.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>{ebook.fileSize}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="h-4 w-4" />
                <span>{ebook.format}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-800">
                {formatPrice(ebook.price)}
              </span>
              {ebook.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(ebook.originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={() => addToCart(ebook)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Book className="h-12 w-12 mr-3" />
              <h1 className="text-4xl lg:text-5xl font-bold">
                E-books Premium
              </h1>
            </div>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Descubra conhecimento de qualidade em formato digital. Guias
              completos, manuais práticos e conteúdo exclusivo.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{ebooks.length}+</div>
              <div className="text-sm opacity-80">E-books</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">50k+</div>
              <div className="text-sm opacity-80">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">4.8</div>
              <div className="text-sm opacity-80">Avaliação</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">24h</div>
              <div className="text-sm opacity-80">Acesso</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar e-books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço: {formatPrice(priceRange[0])} -{" "}
                    {formatPrice(priceRange[1])}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="popularity">Mais Popular</option>
                    <option value="newest">Mais Recente</option>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {filteredEbooks.length} E-books Encontrados
            </h2>
            {searchTerm && (
              <p className="text-gray-600">Resultados para "{searchTerm}"</p>
            )}
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredEbooks.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-6"
            }
          >
            {filteredEbooks.map((ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum e-book encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou buscar por outros termos.
            </p>
          </div>
        )}

        {/* Featured Categories */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Categorias em Destaque
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
              <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Marketing Digital
              </h3>
              <p className="text-gray-600 mb-4">
                Estratégias e técnicas para aumentar suas vendas online
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Ver E-books →
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Desenvolvimento
              </h3>
              <p className="text-gray-600 mb-4">
                Guias completos para programadores e desenvolvedores
              </p>
              <button className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                Ver E-books →
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Negócios
              </h3>
              <p className="text-gray-600 mb-4">
                Conhecimento essencial para empreendedores
              </p>
              <button className="text-green-600 font-medium hover:text-green-700 transition-colors">
                Ver E-books →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EbooksPage;
