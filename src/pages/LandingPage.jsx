import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Salad, Droplets, BarChart3, Shield, Smartphone, ArrowRight, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Salad, title: 'Smart Meal Planning', desc: 'Plan your daily meals with AI-powered nutrition recommendations tailored to your goals.' },
    { icon: Droplets, title: 'Hydration Tracker', desc: 'Track your water intake and stay hydrated with smart reminders and progress charts.' },
    { icon: BarChart3, title: 'Calorie & Macro Analytics', desc: 'Visualize your calories, proteins, carbs, and fats with beautiful interactive charts.' },
    { icon: Shield, title: 'Personalized Diet', desc: 'Get diet plans based on your BMI, weight goals, and dietary preferences (veg, keto, etc).' },
    { icon: Smartphone, title: 'OTP Secure Login', desc: 'Login with phone OTP or Google for a secure, seamless experience.' },
    { icon: Utensils, title: '50,000+ Food Database', desc: 'Access authentic nutritional data for Indian & international foods at your fingertips.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">MealMap</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg text-sm font-medium text-orange-700 hover:bg-orange-50 transition">Login</button>
            <button onClick={() => navigate('/signup')} className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg transition">Get Started</button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Your Personal Diet Companion
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
              Eat Smart.<br />
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Live Better.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              MealMap helps you plan meals, track calories, monitor hydration, and achieve your health goals with authentic food data and beautiful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/signup')} className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg hover:shadow-xl transition-all hover:scale-105">
                Start Your Journey <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/login')} className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-orange-200 text-orange-700 font-semibold text-lg hover:bg-orange-50 transition-all">
                I Already Have an Account
              </button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: '50,000+', sub: 'Food Items' },
                { label: '1M+', sub: 'Meals Logged' },
                { label: '98%', sub: 'Accuracy' },
                { label: '24/7', sub: 'Tracking' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-orange-100">
                  <div className="text-2xl font-bold text-orange-700">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-12">
            <ChevronDown className="w-6 h-6 text-orange-400 mx-auto animate-bounce" />
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">A complete diet planning ecosystem designed for your health goals.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all group"
              >
                <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-orange-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          MealMap — Your Personal Diet Planner. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
