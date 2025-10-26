'use client';

import { useState } from 'react';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
  Settings,
  FileText,
  Briefcase,
  Award,
  Code,
  User,
  Mail,
  Github,
  Linkedin,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Database,
  Zap
} from 'lucide-react';

type Tab = 'overview' | 'content' | 'settings' | 'analytics';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication - en production, utiliser un vrai système d'auth
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Mot de passe incorrect');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="w-full max-w-md p-8 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Accès réservé aux administrateurs</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Entrez le mot de passe"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
    { id: 'content', label: 'Contenu', icon: FileText },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'analytics', label: 'Analytiques', icon: Zap },
  ];

  const stats = [
    { label: 'Projets', value: '5', icon: Briefcase, color: 'text-blue-500' },
    { label: 'Compétences', value: '28', icon: Code, color: 'text-green-500' },
    { label: 'Certifications', value: '12', icon: Award, color: 'text-purple-500' },
    { label: 'Visiteurs', value: '1,234', icon: Eye, color: 'text-orange-500' },
  ];

  const recentActivity = [
    { action: 'Projet ajouté', item: 'AI Security Analyzer', time: '2h ago' },
    { action: 'Compétence mise à jour', item: 'LangGraph', time: '5h ago' },
    { action: 'Certification ajoutée', item: 'AWS Solutions Architect', time: '1d ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background py-12">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">Gérez votre portfolio</p>
            </div>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
              <EyeOff className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-muted/50 ${stat.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Actif
                        </Badge>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Activité Récente</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.item}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Actions Rapides</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <Upload className="h-6 w-6 mb-2" />
                    Importer
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Exporter
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <RefreshCw className="h-6 w-6 mb-2" />
                    Synchroniser
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    Backup
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'content' && (
            <div className="grid gap-6">
              {/* Projects Management */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Gestion des Projets
                  </h2>
                  <Button size="sm">Ajouter un projet</Button>
                </div>
                <p className="text-muted-foreground">
                  Gérez vos projets, ajoutez de nouvelles réalisations, modifiez les descriptions et les technologies utilisées.
                </p>
              </div>

              {/* Skills Management */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Gestion des Compétences
                  </h2>
                  <Button size="sm">Ajouter une compétence</Button>
                </div>
                <p className="text-muted-foreground">
                  Mettez à jour vos compétences techniques, ajoutez de nouvelles technologies et modifiez les niveaux d'expertise.
                </p>
              </div>

              {/* Certifications Management */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Gestion des Certifications
                  </h2>
                  <Button size="sm">Ajouter une certification</Button>
                </div>
                <p className="text-muted-foreground">
                  Ajoutez vos nouvelles certifications, mettez à jour les dates d'expiration et gérez les badges.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid gap-6">
              {/* Profile Settings */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations du Profil
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        defaultValue="Liron Himbert"
                        className="w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue="contact@example.com"
                        className="w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <Button>Sauvegarder les modifications</Button>
                </div>
              </div>

              {/* Social Links */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Réseaux Sociaux</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </label>
                    <input
                      type="url"
                      defaultValue="https://github.com/username"
                      className="w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      defaultValue="https://linkedin.com/in/username"
                      className="w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <Button>Sauvegarder les liens</Button>
                </div>
              </div>

              {/* Site Settings */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Paramètres du Site</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">Mode sombre</p>
                      <p className="text-sm text-muted-foreground">Activer le thème sombre par défaut</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">Maintenance</p>
                      <p className="text-sm text-muted-foreground">Mettre le site en mode maintenance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid gap-6">
              {/* Analytics Overview */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Statistiques de Visites</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-1">Aujourd'hui</p>
                    <p className="text-2xl font-bold text-foreground">42</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-1">Cette semaine</p>
                    <p className="text-2xl font-bold text-foreground">289</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-1">Ce mois</p>
                    <p className="text-2xl font-bold text-foreground">1,234</p>
                  </div>
                </div>
              </div>

              {/* Popular Pages */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Pages Populaires</h2>
                <div className="space-y-3">
                  {[
                    { page: '/projects', views: 456 },
                    { page: '/skills', views: 342 },
                    { page: '/', views: 298 },
                    { page: '/about', views: 187 },
                  ].map((item) => (
                    <div
                      key={item.page}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <span className="text-foreground font-medium">{item.page}</span>
                      <Badge variant="secondary">{item.views} vues</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
