import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ToggleLeft as Google,
  Facebook,
  Github,
  Shield,
  Smartphone,
  Key,
} from "lucide-react";
import Footer from "./Footer";

interface LoginPageProps {
  onClose?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">(
    "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    newsletter: true,
  });

  const [forgotForm, setForgotForm] = useState({
    email: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Simulação de login
    setTimeout(() => {
      if (loginForm.email && loginForm.password) {
        setMessage({ type: "success", text: "Login realizado com sucesso!" });
        setTimeout(() => {
          onClose?.();
        }, 1500);
      } else {
        setMessage({ type: "error", text: "Email ou senha inválidos." });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (registerForm.password !== registerForm.confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      setIsLoading(false);
      return;
    }

    if (!registerForm.acceptTerms) {
      setMessage({
        type: "error",
        text: "Você deve aceitar os termos de uso.",
      });
      setIsLoading(false);
      return;
    }

    // Simulação de cadastro
    setTimeout(() => {
      setMessage({
        type: "success",
        text: "Conta criada com sucesso! Verifique seu email.",
      });
      setTimeout(() => {
        setActiveTab("login");
        setMessage(null);
      }, 2000);
      setIsLoading(false);
    }, 1500);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Simulação de recuperação
    setTimeout(() => {
      setMessage({ type: "success", text: "Email de recuperação enviado!" });
      setTimeout(() => {
        setActiveTab("login");
        setMessage(null);
      }, 2000);
      setIsLoading(false);
    }, 1500);
  };

  const socialLogin = (provider: string) => {
    setMessage({ type: "success", text: `Redirecionando para ${provider}...` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">D</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">
              DigitalStore
            </span>
          </div>
          <p className="text-gray-600">Sua loja de produtos digitais</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Criar Conta
            </button>
          </div>

          <div className="p-6">
            {/* Message */}
            {message && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sua senha"
                    />
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={loginForm.rememberMe}
                      onChange={(e) =>
                        setLoginForm({
                          ...loginForm,
                          rememberMe: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Lembrar de mim
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab("forgot")}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Entrar</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={registerForm.confirmPassword}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirme sua senha"
                    />
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={registerForm.acceptTerms}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          acceptTerms: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Aceito os{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700">
                        termos de uso
                      </a>{" "}
                      e
                      <a href="#" className="text-blue-600 hover:text-blue-700">
                        {" "}
                        política de privacidade
                      </a>
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={registerForm.newsletter}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          newsletter: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Quero receber novidades e ofertas por email
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Criar Conta</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {activeTab === "forgot" && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Key className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Recuperar Senha
                  </h3>
                  <p className="text-sm text-gray-600">
                    Digite seu email para receber as instruções de recuperação
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={forgotForm.email}
                        onChange={(e) =>
                          setForgotForm({
                            ...forgotForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="seu@email.com"
                      />
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Enviar Email</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="w-full text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Voltar ao login
                  </button>
                </form>
              </div>
            )}

            {/* Social Login */}
            {activeTab !== "forgot" && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Ou continue com
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <button
                    onClick={() => socialLogin("Google")}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Google className="h-5 w-5 text-red-500" />
                  </button>

                  <button
                    onClick={() => socialLogin("Facebook")}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                  </button>

                  <button
                    onClick={() => socialLogin("GitHub")}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Github className="h-5 w-5 text-gray-800" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Seus dados estão protegidos com criptografia SSL</span>
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Voltar à loja
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
