import React, {
  useState,
  createContext,
  useContext,
  useReducer,
  ReactNode,
} from "react";
import {
  Search,
  Filter,
  Star,
  ShoppingCart,
  Eye,
  Heart,
  ArrowRight,
  X,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

// Types
interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  description: string;
  popularity: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

// Cart Context
const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM":
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id
      );
      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          isOpen: true,
        };
      }
      const newItems = [
        ...state.items,
        { product: action.payload, quantity: 1 },
      ];
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        isOpen: true,
      };

    case "REMOVE_ITEM":
      const filteredItems = state.items.filter(
        (item) => item.product.id !== action.payload
      );
      return {
        ...state,
        items: filteredItems,
        total: calculateTotal(filteredItems),
      };

    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        const filteredItems = state.items.filter(
          (item) => item.product.id !== action.payload.id
        );
        return {
          ...state,
          items: filteredItems,
          total: calculateTotal(filteredItems),
        };
      }
      const updatedItems = state.items.map((item) =>
        item.product.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
      };

    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      };

    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      };

    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
};

const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    isOpen: false,
  });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Cart Sidebar Component
const CartSidebar: React.FC = () => {
  const { state, dispatch } = useCart();

  const handleUpdateQuantity = (id: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const handleRemoveItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  return (
    <>
      {/* Overlay */}
      {state.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => dispatch({ type: "CLOSE_CART" })}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          state.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Carrinho (
              {state.items.reduce((acc, item) => acc + item.quantity, 0)})
            </h2>
            <button
              onClick={() => dispatch({ type: "CLOSE_CART" })}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2">
                        {item.product.title}
                      </h3>
                      <p className="text-blue-600 font-bold">
                        R$ {item.product.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="p-1 hover:bg-red-100 hover:text-red-600 rounded ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-800">
                  Total:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  R$ {state.total.toFixed(2)}
                </span>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  Finalizar Compra
                </button>
                <button
                  onClick={() => dispatch({ type: "CLEAR_CART" })}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm"
                >
                  Limpar Carrinho
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const ProductsPageContent: React.FC = () => {
  const { state, dispatch } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [priceFilter, setPriceFilter] = useState<string[]>([]);

  const categories = [
    { id: "todos", name: "Todos", count: 0 },
    { id: "cursos", name: "Cursos", count: 0 },
    { id: "ebooks", name: "E-books", count: 0 },
    { id: "templates", name: "Templates", count: 0 },
  ];

  const products = [
    {
      id: 1,
      title: "Curso Completo de Marketing Digital",
      category: "cursos",
      price: 297,
      originalPrice: 497,
      rating: 4.9,
      reviews: 1234,
      image:
        "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop",
      badge: "Mais Vendido",
      description:
        "Aprenda estratégias avançadas de marketing digital do zero ao avançado",
      popularity: 10,
    },
    {
      id: 2,
      title: "E-book: Copywriting Persuasivo",
      category: "ebooks",
      price: 49,
      originalPrice: 89,
      rating: 4.8,
      reviews: 856,
      image:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
      badge: "Novo",
      description: "Técnicas comprovadas para escrever textos que convertem",
      popularity: 8,
    },
    {
      id: 3,
      title: "Templates de Instagram para Negócios",
      category: "templates",
      price: 67,
      originalPrice: null,
      rating: 4.7,
      reviews: 432,
      image:
        "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=300&fit=crop",
      badge: null,
      description: "Pack com 100+ templates editáveis para Instagram",
      popularity: 6,
    },
    {
      id: 4,
      title: "Curso de React e TypeScript",
      category: "cursos",
      price: 397,
      originalPrice: 597,
      rating: 5.0,
      reviews: 678,
      image:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
      badge: "Premium",
      description:
        "Domine o desenvolvimento frontend moderno com React e TypeScript",
      popularity: 9,
    },
    {
      id: 5,
      title: "E-book: Gestão Financeira Pessoal",
      category: "ebooks",
      price: 29,
      originalPrice: 59,
      rating: 4.6,
      reviews: 945,
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
      badge: null,
      description: "Guia completo para organizar suas finanças pessoais",
      popularity: 7,
    },
    {
      id: 6,
      title: "Templates de Landing Pages",
      category: "templates",
      price: 89,
      originalPrice: 149,
      rating: 4.8,
      reviews: 321,
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      badge: "Oferta",
      description: "10 templates profissionais de landing pages responsivas",
      popularity: 5,
    },
    {
      id: 7,
      title: "Curso de Python para Data Science",
      category: "cursos",
      price: 347,
      originalPrice: 497,
      rating: 4.9,
      reviews: 1567,
      image:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
      badge: "Mais Vendido",
      description:
        "Aprenda Python aplicado à ciência de dados com projetos reais",
      popularity: 10,
    },
    {
      id: 8,
      title: "E-book: Design Thinking na Prática",
      category: "ebooks",
      price: 39,
      originalPrice: 79,
      rating: 4.7,
      reviews: 634,
      image:
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop",
      badge: null,
      description: "Metodologia completa de Design Thinking com cases práticos",
      popularity: 6,
    },
    {
      id: 9,
      title: "Templates de Apresentação Corporativa",
      category: "templates",
      price: 97,
      originalPrice: 147,
      rating: 4.8,
      reviews: 289,
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
      badge: null,
      description: "50+ slides profissionais para apresentações de negócios",
      popularity: 4,
    },
    {
      id: 10,
      title: "Curso de UX/UI Design Completo",
      category: "cursos",
      price: 447,
      originalPrice: 697,
      rating: 4.9,
      reviews: 892,
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
      badge: "Premium",
      description:
        "Do wireframe ao protótipo: aprenda design de interfaces do zero",
      popularity: 9,
    },
    {
      id: 11,
      title: "E-book: SEO Avançado 2024",
      category: "ebooks",
      price: 59,
      originalPrice: 99,
      rating: 4.8,
      reviews: 743,
      image:
        "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=300&fit=crop",
      badge: "Novo",
      description: "Estratégias atualizadas de SEO para ranquear no Google",
      popularity: 8,
    },
    {
      id: 12,
      title: "Templates de Email Marketing",
      category: "templates",
      price: 79,
      originalPrice: null,
      rating: 4.6,
      reviews: 156,
      image:
        "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop",
      badge: null,
      description: "25 templates responsivos para campanhas de email marketing",
      popularity: 3,
    },
  ];

  // Atualizar contadores das categorias baseado nos produtos
  const updateCategoryCounts = () => {
    const counts = {
      todos: products.length,
      cursos: 0,
      ebooks: 0,
      templates: 0,
    };
    products.forEach((product) => {
      if (product.category in counts) {
        counts[product.category as keyof typeof counts]++;
      }
    });
    return categories.map((cat) => ({
      ...cat,
      count: counts[cat.id as keyof typeof counts] || 0,
    }));
  };

  const categoriesWithCounts = updateCategoryCounts();

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "todos" || product.category === selectedCategory;
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesPrice = true;
    if (priceFilter.length > 0) {
      matchesPrice = priceFilter.some((range) => {
        switch (range) {
          case "0-50":
            return product.price <= 50;
          case "51-200":
            return product.price > 50 && product.price <= 200;
          case "201+":
            return product.price > 200;
          default:
            return true;
        }
      });
    }

    return matchesCategory && matchesSearch && matchesPrice;
  });

  // Função de ordenação
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.popularity - a.popularity;
      case "newest":
        return b.id - a.id; // Assumindo que IDs maiores são mais novos
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handlePriceFilterChange = (range: string, checked: boolean) => {
    if (checked) {
      setPriceFilter([...priceFilter, range]);
    } else {
      setPriceFilter(priceFilter.filter((r) => r !== range));
    }
  };

  const handleAddToCart = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case "Mais Vendido":
        return "bg-red-100 text-red-800";
      case "Novo":
        return "bg-green-100 text-green-800";
      case "Premium":
        return "bg-purple-100 text-purple-800";
      case "Oferta":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Nossos{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Produtos
                </span>
              </h1>
              <p className="text-gray-600">
                Descubra conteúdos premium para acelerar seu crescimento
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="popular">Mais Populares</option>
                <option value="newest">Mais Recentes</option>
                <option value="price-low">Menor Preço</option>
                <option value="price-high">Maior Preço</option>
                <option value="rating">Melhor Avaliados</option>
              </select>

              {/* Cart Button */}
              <button
                onClick={() => dispatch({ type: "TOGGLE_CART" })}
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Carrinho</span>
                {state.items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {state.items.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Categorias</h4>
                  <div className="space-y-2">
                    {categoriesWithCounts.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex justify-between items-center ${
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-sm">{category.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Faixa de Preço
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) =>
                          handlePriceFilterChange("0-50", e.target.checked)
                        }
                      />
                      <span className="ml-2 text-gray-600">Até R$ 50</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) =>
                          handlePriceFilterChange("51-200", e.target.checked)
                        }
                      />
                      <span className="ml-2 text-gray-600">R$ 51 - R$ 200</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) =>
                          handlePriceFilterChange("201+", e.target.checked)
                        }
                      />
                      <span className="ml-2 text-gray-600">
                        Acima de R$ 200
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Produtos Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Mostrando{" "}
                <span className="font-semibold">{sortedProducts.length}</span>{" "}
                de <span className="font-semibold">{products.length}</span>{" "}
                produtos
              </p>
              {(selectedCategory !== "todos" ||
                searchTerm ||
                priceFilter.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedCategory("todos");
                    setSearchTerm("");
                    setPriceFilter([]);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {product.badge && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(
                            product.badge
                          )}`}
                        >
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-all duration-200">
                      <Heart className="h-4 w-4" />
                    </button>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <Eye className="h-4 w-4" />
                        <span>Ver Detalhes</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center mb-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-800">
                          R$ {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            R$ {product.originalPrice}
                          </span>
                        )}
                      </div>
                      {product.originalPrice && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          -
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          %
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Adicionar ao Carrinho</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 flex items-center space-x-2 mx-auto">
                <span>Carregar Mais Produtos</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
