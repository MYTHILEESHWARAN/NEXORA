import { Link } from 'react-router-dom';
import { HiLightningBolt, HiUserGroup, HiGlobe, HiShieldCheck, HiArrowRight } from 'react-icons/hi';
import Logo from '../components/common/Logo.jsx';

const features = [
  { icon: HiUserGroup, title: 'Connect with People', desc: 'Follow friends, creators, and interesting people from all around the world.', color: 'from-blue-500 to-cyan-500' },
  { icon: HiGlobe, title: 'Share Your World', desc: 'Post your thoughts, photos, and moments with your community instantly.', color: 'from-violet-500 to-purple-500' },
  { icon: HiLightningBolt, title: 'Real-Time Updates', desc: 'Stay connected with live notifications, messages, and activity feeds.', color: 'from-primary-500 to-indigo-500' },
  { icon: HiShieldCheck, title: 'Safe & Secure', desc: 'Your privacy matters. Full control over your data and who sees your content.', color: 'from-green-500 to-teal-500' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-nexora-darker dark:via-nexora-dark dark:to-nexora-card">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-nexora-darker/80 backdrop-blur-xl border-b border-gray-100 dark:border-nexora-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary">Log In</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 text-sm font-medium mb-8 animate-fade-in">
          <HiLightningBolt className="w-4 h-4" />
          <span>The next generation social platform</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight animate-slide-up">
          Connect.{' '}
          <span className="gradient-text">Share.</span>{' '}
          Discover.
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Your world, your people, your <span className="font-bold gradient-text">NEXORA</span>.
          <br />
          Join millions sharing moments that matter.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="btn-primary text-base px-8 py-3 gap-2 shadow-lg shadow-primary-500/25">
            Get Started Free <HiArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="btn-outline text-base px-8 py-3">
            Sign In
          </Link>
        </div>

        {/* Mock Phone Preview */}
        <div className="mt-20 relative">
          <div className="max-w-xs mx-auto">
            <div className="bg-gradient-to-b from-nexora-card to-nexora-dark rounded-3xl p-1 shadow-2xl shadow-primary-500/20 border border-primary-500/20">
              <div className="bg-nexora-darker rounded-[22px] p-4 space-y-3 min-h-[400px]">
                {/* Mock posts */}
                {[
                  { name: 'Alex Rivera', handle: 'alex', color: 'from-orange-400 to-pink-500', text: 'Just launched my new project! 🚀 So excited to share it with everyone.' },
                  { name: 'Sam Chen', handle: 'sam', color: 'from-cyan-400 to-blue-500', text: 'Beautiful sunset from the mountains today 🌄 Nature never disappoints.' },
                  { name: 'Jordan Lee', handle: 'jordan', color: 'from-violet-400 to-purple-500', text: 'Hot take: dark mode is always the right choice 🌙' },
                ].map((item, i) => (
                  <div key={i} className="bg-nexora-card rounded-xl p-3 border border-nexora-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={'w-8 h-8 rounded-full bg-gradient-to-br ' + item.color + ' flex items-center justify-center'}>
                        <span className="text-white text-xs font-bold">{item.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">{item.name}</p>
                        <p className="text-gray-500 text-[10px]">@{item.handle}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Everything you need to <span className="gradient-text">connect</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            NEXORA brings people together with powerful features built for modern social connection.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={i} className="card p-6 hover:shadow-lg transition-shadow group">
              <div className={'w-12 h-12 rounded-2xl bg-gradient-to-br ' + color + ' flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-primary-500/30">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to join NEXORA?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            Create your free account today and start connecting with people who share your interests.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors text-base">
            Create Free Account <HiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-nexora-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <Logo size="sm" />
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} NEXORA. Connect. Share. Discover.</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
