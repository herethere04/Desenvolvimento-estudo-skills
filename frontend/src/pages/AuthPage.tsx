import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      setAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setError(''); setLoading(true);
    try {
      await authService.register({ email, name, password });
      setMode('login');
      setSuccess('Conta criada com sucesso! Faça login.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta.');
    } finally { setLoading(false); }
  };

  const resetToMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-purple/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue mb-4 shadow-glow-purple">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-purple-light to-brand-blue bg-clip-text text-transparent">
            Kanban Ágil
          </h1>
          <p className="text-gray-500 mt-2">Gerencie seus projetos com eficiência</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tabs (only login/register) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex mb-6 bg-dark-800/50 rounded-xl p-1">
              <button
                onClick={() => resetToMode('login')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-brand-purple text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => resetToMode('register')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-brand-purple text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm animate-fade-in">
              {success}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">E-mail</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-brand-purple transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 transition-colors text-gray-400 hover:text-white" />
                    ) : (
                      <Eye className="w-5 h-5 transition-colors text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
              <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full mt-6">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nome</label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input w-full"
                  placeholder="Seu nome"
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">E-mail</label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full pr-12"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-brand-purple transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 transition-colors text-gray-400 hover:text-white" />
                    ) : (
                      <Eye className="w-5 h-5 transition-colors text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Repetir Senha</label>
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input w-full"
                  placeholder="Confirme sua senha"
                  required
                  minLength={6}
                />
              </div>
              <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Kanban Ágil © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
