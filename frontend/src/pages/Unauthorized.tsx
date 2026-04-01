import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isClient, getDashboardUrl } = useAuth();
  const dashboardPath = getDashboardUrl();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-900 p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
            <ShieldOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent mb-2">
              Access Denied
            </h1>
            <p className="text-xl text-slate-300 mb-1">Insufficient permissions</p>
            {user ? (
              <p className="text-slate-400">
                Your account ({user.roles.map(r => r.name).join(', ')}) doesn't have access to this page.
              </p>
            ) : (
              <p className="text-slate-400">Please log in to continue.</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate(dashboardPath)}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            size="lg"
            className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-800/50"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Home Page
          </Button>
        </div>

        <p className="text-xs text-slate-500">
          Need access? Contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;

