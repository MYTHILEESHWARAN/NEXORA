import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', linkTo = '/', className = '' }) => {
  const sizeClasses = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl' };
  const boxSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  return (
    <Link to={linkTo} className={'inline-flex items-center gap-2 ' + className}>
      <div className={'relative ' + boxSize + ' rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg'}>
        <span className="text-white font-black text-sm">N</span>
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-pink-500 rounded-full" />
      </div>
      <span className={sizeClasses[size] + ' font-black tracking-tight bg-gradient-to-r from-primary-600 to-violet-600 dark:from-primary-400 dark:to-violet-400 bg-clip-text text-transparent'}>
        NEXORA
      </span>
    </Link>
  );
};

export default Logo;
