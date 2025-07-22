import React, { useState, useMemo } from "react";
import { useEffect } from "react";
import {
  Layout, // ícone para site/template (lucide-react)
  Search,
  Filter,
  Grid,
  List,
  Star,
  Eye,
  ChevronDown,
} from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import { fetchProducts } from "../data/products";

interface SitesPageProps {
  products?: Product[];
}

const SitesPage: React.FC<SitesPageProps> = ({ products: propProducts }) => {
  const { dispatch } = useCart();
  const [products, setProducts] = useState<Product[]>(propProducts || []);
  const [loading, setLoading] = useState(!propProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!propProducts) {
      const loadProducts = async () => {
        try {
          const fetchedProducts = await fetchProducts();
          setProducts(fetchedProducts);
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
        } finally {
          setLoading(false);
        }
      };
      loadProducts();
    }
  }, [propProducts]);

  // Filtra apenas sites/templates
  const sites = useMemo(() => {
    return products.filter(
      (product) =>
        product.category === "Templates" || product.tags?.includes("template")
    );
  }, [products]);

  const categories = useMemo(() => {
    return ["Todos", "HTML", "React", "Tailwind", "Bootstrap", "WordPress"];
  }, []);

  const filteredSites = useMemo(() => {
    let filtered = sites.filter((site) => {
      const matchesSearch =
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "Todos" || site.category === selectedCategory;
      const matchesPrice =
        site.price >= priceRange[0] && site.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "newest":
        filtered.sort((a, b) =>
          (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "")
        );
        break;
      default:
        filtered.sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0));
    }

    return filtered;
  }, [sites, searchTerm, selectedCategory, priceRange, sortBy]);

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

  const SiteCard: React.FC<{ site: Product; viewMode: "grid" | "list" }> = ({
    site,
    viewMode,
  }) => {
    if (viewMode === "list") {
      return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 flex gap-6">
          <img
            src={site.image}
            alt={site.name}
            className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex flex-col flex-1">
            <h3 className="text-xl font-semibold text-gray-800">{site.name}</h3>
            <p className="text-gray-600 text-sm flex-1 line-clamp-2">
              {site.description}
            </p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-lg font-bold text-purple-600">
                {formatPrice(site.price)}
              </span>
              <button
                onClick={() => addToCart(site)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Comprar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <img
          src={site.image}
          alt={site.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {site.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {site.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-purple-600">
              {formatPrice(site.price)}
            </span>
            <button
              onClick={() => addToCart(site)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
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
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Layout className="h-12 w-12 mr-3" />
            <h1 className="text-4xl lg:text-5xl font-bold">
              Sites e Templates
            </h1>
          </div>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Modelos prontos para você lançar seu site com rapidez e estilo.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar sites e templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

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
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid md:grid-cols-3 gap-6">
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço: {formatPrice(priceRange[0])} -{" "}
                  {formatPrice(priceRange[1])}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Ordenar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="popularity">Mais Popular</option>
                  <option value="newest">Mais Recente</option>
                  <option value="rating">Melhor Avaliado</option>
                  <option value="price-low">Menor Preço</option>
                  <option value="price-high">Maior Preço</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {filteredSites.length} Sites e Templates Encontrados
            </h2>
            {searchTerm && (
              <p className="text-gray-600">Resultados para "{searchTerm}"</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="bg-gray-300 h-48 w-full"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                    <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSites.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-6"
            }
          >
            {filteredSites.map((site) => (
              <SiteCard key={site.id} site={site} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Layout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum site ou template encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou buscar por outro termo.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SitesPage;
