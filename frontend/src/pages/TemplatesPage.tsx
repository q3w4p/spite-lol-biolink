import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Layout, Star, Search, Plus, Eye, Link2, TrendingUp, Clock, Upload, Heart
} from 'lucide-react';
import api from '../utils/api';

interface Template {
  id: string;
  name: string;
  author: string;
  authorAvatar: string;
  preview: string;
  uses: number;
  stars: number;
  trending: boolean;
  tags: string[];
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [favorites, setFavorites] = useState<Template[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<Template[]>([]);
  const [activeTab, setActiveTab] = useState('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      setTemplates(response.data.templates || []);
      setMyTemplates(response.data.myTemplates || []);
      setFavorites(response.data.favorites || []);
      setRecentlyUsed(response.data.recentlyUsed || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // Set sample templates for display
      const sampleTemplates: Template[] = [
        {
          id: '1',
          name: 'free cool dark bio',
          author: 'cisek',
          authorAvatar: '',
          preview: '/templates/dark-bio.jpg',
          uses: 110594,
          stars: 11004,
          trending: true,
          tags: ['free', 'bio', 'dark'],
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'Your name, non premium ver...',
          author: 'ak213',
          authorAvatar: '',
          preview: '/templates/anime-bio.jpg',
          uses: 93358,
          stars: 7967,
          trending: true,
          tags: ['anime', 'nonpremium', 'yourname', '4kedits'],
          createdAt: '2024-02-15'
        },
        {
          id: '3',
          name: 'svart',
          author: 'yuez',
          authorAvatar: '',
          preview: '/templates/svart.jpg',
          uses: 86246,
          stars: 9098,
          trending: true,
          tags: ['#black', '#idk'],
          createdAt: '2024-03-01'
        },
        {
          id: '4',
          name: 'Best 4K bio v2',
          author: 'cisek',
          authorAvatar: '',
          preview: '/templates/4k-bio.jpg',
          uses: 65962,
          stars: 7941,
          trending: true,
          tags: ['free', 'Best4kbio', 'dark', 'cisek'],
          createdAt: '2024-03-15'
        },
        {
          id: '5',
          name: 'Minimal Dark',
          author: 'designer',
          authorAvatar: '',
          preview: '/templates/minimal.jpg',
          uses: 45000,
          stars: 5200,
          trending: false,
          tags: ['minimal', 'dark', 'clean'],
          createdAt: '2024-04-01'
        },
        {
          id: '6',
          name: 'Neon Glow',
          author: 'neonmaster',
          authorAvatar: '',
          preview: '/templates/neon.jpg',
          uses: 38000,
          stars: 4100,
          trending: false,
          tags: ['neon', 'glow', 'cyberpunk'],
          createdAt: '2024-04-15'
        },
        {
          id: '7',
          name: 'City Nights',
          author: 'urbanist',
          authorAvatar: '',
          preview: '/templates/city.jpg',
          uses: 29000,
          stars: 3500,
          trending: false,
          tags: ['city', 'night', 'urban'],
          createdAt: '2024-05-01'
        },
        {
          id: '8',
          name: 'Aesthetic Pink',
          author: 'pinkfan',
          authorAvatar: '',
          preview: '/templates/pink.jpg',
          uses: 52000,
          stars: 6200,
          trending: true,
          tags: ['aesthetic', 'pink', 'cute'],
          createdAt: '2024-05-15'
        }
      ];
      setTemplates(sampleTemplates);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      await api.post(`/templates/${templateId}/use`);
      alert('Template applied successfully!');
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template');
    }
  };

  const handleFavorite = async (templateId: string) => {
    try {
      await api.post(`/templates/${templateId}/favorite`);
      // Update local state
      const template = templates.find(t => t.id === templateId);
      if (template) {
        if (favorites.some(f => f.id === templateId)) {
          setFavorites(favorites.filter(f => f.id !== templateId));
        } else {
          setFavorites([...favorites, template]);
        }
      }
    } catch (error) {
      console.error('Failed to favorite template:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  const getDisplayTemplates = () => {
    let displayTemplates: Template[] = [];
    
    switch (activeTab) {
      case 'library':
        displayTemplates = templates;
        break;
      case 'favorites':
        displayTemplates = favorites;
        break;
      case 'recent':
        displayTemplates = recentlyUsed;
        break;
      case 'uploads':
        displayTemplates = myTemplates;
        break;
      default:
        displayTemplates = templates;
    }

    // Filter by search
    if (searchQuery) {
      displayTemplates = displayTemplates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    switch (sortBy) {
      case 'trending':
        displayTemplates = [...displayTemplates].sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        break;
      case 'popular':
        displayTemplates = [...displayTemplates].sort((a, b) => b.uses - a.uses);
        break;
      case 'newest':
        displayTemplates = [...displayTemplates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'stars':
        displayTemplates = [...displayTemplates].sort((a, b) => b.stars - a.stars);
        break;
    }

    return displayTemplates;
  };

  const tabs = [
    { id: 'library', label: 'Template Library', icon: Layout },
    { id: 'favorites', label: 'Favorite Templates', icon: Heart },
    { id: 'recent', label: 'Last Used Templates', icon: Clock },
    { id: 'uploads', label: 'My Uploads', icon: Upload }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Layout className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-semibold">Discover the perfect spite.lol Template for your Profile</h1>
          </div>
          <p className="text-gray-400">Browse community-created templates, or design your own to share with the spite.lol community.</p>
        </motion.div>

        {/* Tabs and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </motion.div>

        {/* Search and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Explore community-created templates"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white outline-none focus:border-emerald-500"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white outline-none"
            >
              <option value="trending">Trending</option>
              <option value="popular">Most Used</option>
              <option value="newest">Newest</option>
              <option value="stars">Most Stars</option>
            </select>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {getDisplayTemplates().map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass-card rounded-xl overflow-hidden group"
            >
              {/* Preview Image */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900">
                {template.preview ? (
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layout className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                
                {/* Favorite Button */}
                <button
                  onClick={() => handleFavorite(template.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                    favorites.some(f => f.id === template.id)
                      ? 'bg-yellow-500 text-black'
                      : 'bg-black/50 text-yellow-400 hover:bg-black/70'
                  }`}
                >
                  <Star className="w-4 h-4" fill={favorites.some(f => f.id === template.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-white mb-1 truncate">{template.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gray-700 rounded-full" />
                  <span className="text-sm text-gray-400">@{template.author}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <span className="text-emerald-500">●</span>
                    {formatNumber(template.uses)} uses
                  </span>
                  {template.trending && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {formatNumber(template.stars)}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Use Template
                  </button>
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {getDisplayTemplates().length === 0 && !loading && (
          <div className="text-center py-12">
            <Layout className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No templates found</h3>
            <p className="text-gray-500">
              {activeTab === 'uploads' 
                ? "You haven't created any templates yet."
                : activeTab === 'favorites'
                ? "You haven't favorited any templates yet."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Need help? <a href="mailto:contact@spite.lol" className="text-emerald-500 hover:underline">contact@spite.lol</a>
        </p>
      </div>
    </div>
  );
}
