import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '@/lib/user-store';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-900 flex items-center justify-center">
          <span className="text-2xl font-serif text-primary-foreground">运</span>
        </div>
        <p className="text-muted-foreground">正在加载...</p>
      </div>
    </div>
  );
}
