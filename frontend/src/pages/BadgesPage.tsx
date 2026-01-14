import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench, HelpCircle, Crown, BadgeCheck, Heart, Gift, Star, Bug, Zap, 
  Trophy, Medal, Award, Users, Image, Globe, Sparkles, ChevronDown, Eye
} from 'lucide-react';
import api from '../utils/api';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_purchasable: boolean;
  is_earnable: boolean;
  earn_action: string | null;
  has_badge?: boolean;
  is_monochrome?: boolean;
}

interface UserBadge {
  badge_id: number;
  is_monochrome: boolean;
}

const iconMap: { [key: string]: any } = {
  Wrench, HelpCircle, Crown, BadgeCheck, Heart, Gift, Star, Bug, Zap,
  Trophy, Medal, Award, Users, Image, Globe
};

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [filter, setFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const [badgesRes, userBadgesRes] = await Promise.all([
        api.get('/badges'),
        api.get('/badges/user')
      ]);
      setBadges(badgesRes.data.badges || []);
      setUserBadges(userBadgesRes.data.badges || []);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      // Set default badges for display
      setBadges([
        { id: 1, name: 'Staff', description: 'Be a part of the spite.lol staff team.', icon: 'Wrench', color: '#3b82f6', is_purchasable: false, is_earnable: false, earn_action: null },
        { id: 2, name: 'Helper', description: 'Be active and help users in the community.', icon: 'HelpCircle', color: '#eab308', is_purchasable: false, is_earnable: true, earn_action: 'join_discord' },
        { id: 3, name: 'Premium', description: 'Purchase the premium package.', icon: 'Crown', color: '#a855f7', is_purchasable: true, is_earnable: false, earn_action: null },
        { id: 4, name: 'Verified', description: 'Purchase or be a known content creator.', icon: 'BadgeCheck', color: '#3b82f6', is_purchasable: true, is_earnable: true, earn_action: null },
        { id: 5, name: 'Donor', description: 'Donate at least $10 to spite.lol.', icon: 'Heart', color: '#ef4444', is_purchasable: false, is_earnable: true, earn_action: 'donate' },
        { id: 6, name: 'Gifter', description: 'Gift a spite.lol product to another user.', icon: 'Gift', color: '#f97316', is_purchasable: false, is_earnable: true, earn_action: 'gift' },
        { id: 7, name: 'OG', description: 'Be an early supporter of spite.lol.', icon: 'Star', color: '#eab308', is_purchasable: false, is_earnable: true, earn_action: null },
        { id: 8, name: 'Bug Hunter', description: 'Report a bug to the spite.lol team.', icon: 'Bug', color: '#22c55e', is_purchasable: false, is_earnable: true, earn_action: 'report_bug' },
        { id: 9, name: 'Server Booster', description: 'Boost the spite.lol discord server.', icon: 'Zap', color: '#f472b6', is_purchasable: false, is_earnable: true, earn_action: 'boost_server' },
        { id: 10, name: 'Image Host', description: 'Purchase the Image Host.', icon: 'Image', color: '#f97316', is_purchasable: true, is_earnable: false, earn_action: null },
        { id: 11, name: 'Domain Legend', description: 'Add a public custom domain to spite.lol Image Host.', icon: 'Globe', color: '#ef4444', is_purchasable: false, is_earnable: true, earn_action: 'add_domain' },
        { id: 12, name: 'Winner', description: 'Win a spite.lol event.', icon: 'Trophy', color: '#eab308', is_purchasable: false, is_earnable: true, earn_action: null },
        { id: 13, name: 'Second Place', description: 'Get second place in a spite.lol event.', icon: 'Medal', color: '#9ca3af', is_purchasable: false, is_earnable: true, earn_action: null },
        { id: 14, name: 'Third Place', description: 'Get third place in a spite.lol event.', icon: 'Award', color: '#cd7f32', is_purchasable: false, is_earnable: true, earn_action: null },
        { id: 15, name: 'The Million', description: 'Celebration badge for 1M users.', icon: 'Users', color: '#a855f7', is_purchasable: false, is_earnable: true, earn_action: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const hasBadge = (badgeId: number) => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  };

  const getActionButton = (badge: Badge) => {
    if (hasBadge(badge.id)) {
      return { text: 'Owned', disabled: true };
    }
    if (badge.is_purchasable) {
      return { text: 'Purchase', disabled: false };
    }
    if (badge.earn_action === 'join_discord') {
      return { text: 'Join Discord', disabled: false };
    }
    if (badge.earn_action === 'donate') {
      return { text: 'Donate', disabled: false };
    }
    if (badge.earn_action === 'gift') {
      return { text: 'Gift', disabled: false };
    }
    if (badge.earn_action === 'report_bug') {
      return { text: 'Report', disabled: false };
    }
    if (badge.earn_action === 'boost_server') {
      return { text: 'Boost', disabled: false };
    }
    if (badge.earn_action === 'add_domain') {
      return { text: 'Add Domain', disabled: false };
    }
    return null;
  };

  const filteredBadges = badges.filter(badge => {
    if (filter === 'all') return true;
    if (filter === 'owned') return hasBadge(badge.id);
    if (filter === 'purchasable') return badge.is_purchasable;
    if (filter === 'earnable') return badge.is_earnable;
    return true;
  });

  const IconComponent = ({ iconName, color }: { iconName: string; color: string }) => {
    const Icon = iconMap[iconName] || Star;
    return <Icon className="w-5 h-5" style={{ color }} />;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Filter */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 text-xl font-semibold hover:text-gray-300 transition-colors"
            >
              {filter === 'all' ? 'All Badges' : filter === 'owned' ? 'Owned Badges' : filter === 'purchasable' ? 'Purchasable' : 'Earnable'}
              <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden z-50 min-w-[160px]"
              >
                {['all', 'owned', 'purchasable', 'earnable'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setShowDropdown(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-white/5 transition-colors capitalize ${filter === f ? 'text-emerald-500' : 'text-gray-400'}`}
                  >
                    {f === 'all' ? 'All Badges' : f}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filteredBadges.map((badge, index) => {
            const action = getActionButton(badge);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${badge.color}20` }}
                  >
                    <IconComponent iconName={badge.icon} color={badge.color} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{badge.name}</h3>
                    <p className="text-sm text-gray-500">{badge.description}</p>
                  </div>
                </div>
                
                {action && (
                  <button
                    disabled={action.disabled}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      action.disabled
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {action.text}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Custom Badges Section */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold">Custom Badges</h2>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              New
            </span>
          </div>
          
          <p className="text-gray-400 mb-6">
            Custom badges allow you to create your own badges with a custom icon and name. 
            You can edit your custom badges by using edit credits.
          </p>
          
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
              Purchase
            </button>
            <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/10 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview Custom Badge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
