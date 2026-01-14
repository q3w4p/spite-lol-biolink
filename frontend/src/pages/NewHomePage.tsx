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
  CheckCircle,
  MessageCircle,
  Image,
  Lock,
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

// Feature card with hover effect
const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 h-full hover:border-[#059669]/30 transition-all duration-300">
        <div className="w-12 h-12 rounded-lg bg-[#059669]/10 flex items-center justify-center mb-4 group-hover:bg-[#059669]/20 transition-colors">
          <Icon className="w-6 h-6 text-[#059669]" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// Comparison table component
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
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1a1a1a]">
            <th className="text-left p-4 text-gray-400 font-medium">Feature</th>
            <th className="text-center p-4 text-[#059669] font-semibold">spite.lol</th>
            <th className="text-center p-4 text-gray-400 font-medium">Others</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b border-[#1a1a1a] last:border-0">
              <td className="p-4 text-white">{feature.name}</td>
              <td className="p-4 text-center">
                <Check className="w-5 h-5 text-[#059669] mx-auto" />
              </td>
              <td className="p-4 text-center text-gray-500 text-sm">{feature.others}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Testimonial card
const TestimonialCard = ({ quote, author, role }: { quote: string; author: string; role: string }) => (
  <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#059669] text-[#059669]" />
      ))}
    </div>
    <p className="text-gray-300 mb-4 leading-relaxed">"{quote}"</p>
    <div>
      <p className="font-semibold text-white">{author}</p>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  </div>
);

const NewHomePage = ({ user }: NewHomePageProps) => {
  return (
    <div className="min-h-screen bg-black">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-background-static opacity-50" />
      
      {/* Navbar */}
      <GlassNavbar user={user} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="inline-flex items-center gap-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-full px-4 py-2 mb-8"
          >
            <span className="text-[#059669] text-sm font-medium">All Premium Features • 100% Free</span>
          </motion.div>
          
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="flex justify-center mb-6"
          >
            <img 
              src="/logo.png" 
              alt="spite.lol" 
              className="w-24 h-24 object-contain"
            />
          </motion.div>
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            <span className="text-[#059669]">spite.lol</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-2xl md:text-3xl font-semibold mb-6"
          >
            <span className="text-white">Your Bio, </span>
            <span className="text-[#059669]">Reimagined</span>
          </motion.h2>
          
          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-10"
          >
            Create a stunning, customizable bio page that truly stands out. 
            All the premium features you love from other platforms — completely free.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#0a0a0a] text-[#059669] border border-[#059669] px-8 py-3 rounded-lg font-semibold hover:bg-[#059669]/10 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#0a0a0a] text-gray-300 border border-[#1a1a1a] px-8 py-3 rounded-lg font-semibold hover:border-[#333] hover:text-white transition-all"
            >
              Sign In
            </a>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-[#059669]">Powerful</span> Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
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
            className="text-center mb-16"
          >
            <span className="text-[#059669] text-sm font-semibold mb-2 block">Premium Features — All Free</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Pay Elsewhere?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
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
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Compare & Save
            </h2>
            <p className="text-gray-400">
              See how spite.lol stacks up against the competition
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Creators
            </h2>
            <p className="text-gray-400">
              Join thousands of creators who've made the switch
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <TestimonialCard
                quote="Finally a biolink platform that doesn't nickel and dime you for basic features. The animations are incredible!"
                author="Alex M."
                role="Content Creator"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <TestimonialCard
                quote="Switched from guns.lol and saved $7/month. spite.lol has even more features and looks way better."
                author="Jordan K."
                role="Streamer"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <TestimonialCard
                quote="The customization options are insane. My profile looks so professional now. 10/10 would recommend!"
                author="Sam T."
                role="Artist"
              />
            </motion.div>
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
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Stand Out?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of creators who've already upgraded their online presence. 
              Create your stunning biolink page in minutes.
            </p>
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#0a0a0a] text-[#059669] border border-[#059669] px-8 py-3 rounded-lg font-semibold hover:bg-[#059669]/10 transition-all"
            >
              Create Your Page
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="text-gray-500 text-sm mt-6">
              No credit card required • Free forever • Setup in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#1a1a1a] relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="spite.lol" className="w-8 h-8" />
            <span className="text-[#059669] font-semibold">spite.lol</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="/terms" className="hover:text-[#059669] transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-[#059669] transition-colors">Privacy</a>
            <a href="https://discord.gg/spite" className="hover:text-[#059669] transition-colors">Discord</a>
          </div>
          <p className="text-gray-500 text-sm">
            Need help? <a href="mailto:contact@spite.lol" className="text-[#059669]">contact@spite.lol</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NewHomePage;
