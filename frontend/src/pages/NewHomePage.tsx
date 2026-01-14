import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Link2,
  BarChart3,
  Zap,
  Shield,
  Palette,
  Music,
  Globe,
  Layers,
  Star,
  ArrowRight,
  Check,
  MousePointer,
  Type,
  User,
  Mail,
  MessageCircle,
  Image,
  Lock,
  ChevronRight,
  Play,
} from "lucide-react";
import GlassNavbar from "../components/GlassNavbar";
import { User as UserType } from "../App";

interface NewHomePageProps {
  user: UserType | null;
}

// Animated counter component
const AnimatedCounter = ({ value, suffix = "" }: { value: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const numValue = parseInt(value.replace(/[^0-9]/g, ''));
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = numValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setCount(numValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [numValue]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Glass Feature Card
const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="glass-card rounded-2xl p-6 h-full hover:border-accent/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(5,150,105,0.1)]">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-accent transition-colors">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// Glass Comparison Table
const ComparisonTable = () => {
  const features = [
    { name: "Custom Themes", spite: true, others: "Premium" },
    { name: "Analytics Dashboard", spite: true, others: "Premium" },
    { name: "Custom Backgrounds", spite: true, others: "Premium" },
    { name: "Animated Effects", spite: true, others: "Premium" },
    { name: "Music Player", spite: true, others: "Premium" },
    { name: "Custom Cursors", spite: true, others: "Premium" },
    { name: "SEO Controls", spite: true, others: "Premium" },
    { name: "Unlimited Links", spite: true, others: "Limited" },
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-5 text-gray-400 font-medium">Feature</th>
            <th className="text-center p-5">
              <span className="text-accent font-bold">spite.lol</span>
            </th>
            <th className="text-center p-5 text-gray-400 font-medium">Others</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
              <td className="p-5 text-white">{feature.name}</td>
              <td className="p-5 text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/20">
                  <Check className="w-4 h-4 text-accent" />
                </span>
              </td>
              <td className="p-5 text-center text-gray-500 text-sm">{feature.others}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Glass Testimonial Card
const TestimonialCard = ({ quote, author, role, delay }: { quote: string; author: string; role: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <div className="glass-card rounded-2xl p-6 h-full hover:border-accent/30 transition-all duration-300">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
        ))}
      </div>
      <p className="text-gray-300 mb-6 leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-white">{author}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

// Stat Card
const StatCard = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="glass-card rounded-2xl p-6 text-center hover:border-accent/30 transition-all duration-300"
  >
    <p className="text-3xl md:text-4xl font-bold text-accent mb-1">{value}</p>
    <p className="text-gray-400 text-sm">{label}</p>
  </motion.div>
);

const NewHomePage = ({ user }: NewHomePageProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated gradient that follows mouse */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(5, 150, 105, 0.15), transparent 40%)`,
        }}
      />

      {/* Grid Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Navbar */}
      <GlassNavbar user={user} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-flex items-center gap-2 glass-card px-5 py-2.5 rounded-full">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-accent text-sm font-medium">All Premium Features • 100% Free</span>
            </span>
          </motion.div>
          
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex justify-center my-8"
          >
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="spite.lol" 
                className="w-28 h-28 object-contain relative z-10"
              />
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
            </div>
          </motion.div>
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-white">Your Bio, </span>
            <span className="text-accent">Reimagined</span>
          </motion.h1>
          
          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Create a stunning, customizable bio page with glassmorphism design. 
            All the premium features you love — completely free.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/register"
              className="group glass-card-accent px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#features"
              className="group glass-button px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              See Features
            </a>
          </motion.div>
        </div>

        {/* Hero Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-5xl mx-auto mt-20 relative"
        >
          <div className="glass-card rounded-3xl p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Mock Profile */}
              <div className="flex-1 glass-card rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-2xl font-bold border border-accent/20">
                    S
                  </div>
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      spite.lol
                      <span className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-accent" />
                      </span>
                    </h3>
                    <p className="text-gray-400 text-sm">@spite • UID: ABC123XY</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6">Creating the best biolink platform. All premium features, completely free.</p>
                
                <div className="space-y-3">
                  {['Portfolio', 'Discord Server', 'Twitter/X', 'GitHub'].map((link, i) => (
                    <div key={i} className="glass-button rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:border-accent/30 transition-all">
                      <span className="text-gray-200">{link}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Preview */}
              <div className="lg:w-72 space-y-4">
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Profile Views</span>
                    <BarChart3 className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-3xl font-bold">12,847</p>
                  <p className="text-accent text-sm">+23% this week</p>
                </div>
                
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Link Clicks</span>
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-3xl font-bold">3,291</p>
                  <p className="text-accent text-sm">+18% this week</p>
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Live Status</span>
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  </div>
                  <p className="text-lg font-medium text-accent">All Systems Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative blur */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value="50K+" label="Active Users" delay={0} />
            <StatCard value="500K+" label="Links Created" delay={0.1} />
            <StatCard value="5M+" label="Profile Views" delay={0.2} />
            <StatCard value="99.9%" label="Uptime" delay={0.3} />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-accent">Powerful</span> Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Everything you need to create an amazing biolink page — all included for free
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Link2} title="One Link" description="All your content in one beautiful place" delay={0} />
            <FeatureCard icon={Palette} title="Full Customization" description="Themes, colors, fonts - make it yours" delay={0.05} />
            <FeatureCard icon={BarChart3} title="Advanced Analytics" description="Track every view, click & engagement" delay={0.1} />
            <FeatureCard icon={Zap} title="Lightning Fast" description="Optimized for instant loading" delay={0.15} />
            <FeatureCard icon={Music} title="Music Player" description="Add your favorite tracks to your profile" delay={0.2} />
            <FeatureCard icon={MousePointer} title="Cursor Effects" description="Custom animated cursor styles" delay={0.25} />
            <FeatureCard icon={Layers} title="Multiple Layouts" description="Choose from stunning profile layouts" delay={0.3} />
            <FeatureCard icon={Type} title="Typewriter Effect" description="Animated text that captivates" delay={0.35} />
          </div>
        </div>
      </section>
      
      {/* Premium Features Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-4">
              <span className="text-accent text-sm font-medium">Premium Features — All Free</span>
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Pay Elsewhere?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Features that cost $5-10/month on other platforms are completely free on spite.lol
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Globe} title="Background Effects" description="Particles, gradients, and animated backgrounds" delay={0} />
            <FeatureCard icon={User} title="Username Effects" description="Glowing, rainbow, and animated username styles" delay={0.05} />
            <FeatureCard icon={Image} title="Media Embeds" description="Embed videos, music, and rich media content" delay={0.1} />
            <FeatureCard icon={MessageCircle} title="Visitor Guestbook" description="Let visitors leave messages on your profile" delay={0.15} />
            <FeatureCard icon={Mail} title="SEO Controls" description="Custom meta tags and social previews" delay={0.2} />
            <FeatureCard icon={Lock} title="Privacy Options" description="Hide views, control visibility settings" delay={0.25} />
          </div>
        </div>
      </section>
      
      {/* Comparison Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Compare & Save
            </h2>
            <p className="text-gray-400 text-lg">
              See how spite.lol stacks up against the competition
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ComparisonTable />
          </motion.div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Loved by <span className="text-accent">Creators</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of creators who've made the switch
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Finally a biolink platform that doesn't nickel and dime you for basic features. The glassmorphism design is incredible!"
              author="Alex M."
              role="Content Creator"
              delay={0}
            />
            <TestimonialCard
              quote="Switched from guns.lol and saved $7/month. spite.lol has even more features and looks way better."
              author="Jordan K."
              role="Streamer"
              delay={0.1}
            />
            <TestimonialCard
              quote="The customization options are insane. My profile looks so professional now. 10/10 would recommend!"
              author="Sam T."
              role="Artist"
              delay={0.2}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl p-12 text-center relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Stand Out?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
                Join thousands of creators who've already upgraded their online presence. 
                Create your stunning biolink page in minutes.
              </p>
              <a
                href="/register"
                className="group glass-card-accent px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300"
              >
                Create Your Page
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <p className="text-gray-500 text-sm mt-6">
                No credit card required • Free forever • Setup in 2 minutes
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="spite.lol" className="w-8 h-8" />
            <span className="text-xl font-bold">spite.lol</span>
          </div>
          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <a href="/login" className="hover:text-white transition-colors">Login</a>
            <a href="/register" className="hover:text-white transition-colors">Register</a>
            <a href="mailto:contact@spite.lol" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-gray-500 text-sm">
            Need help? <a href="mailto:contact@spite.lol" className="text-accent hover:underline">contact@spite.lol</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NewHomePage;
