import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = () => {
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialAccounts();
  }, []);

  const fetchSocialAccounts = async () => {
    try {
      const response = await axios.get(`${API}/social-accounts`);
      setSocialAccounts(response.data);
    } catch (error) {
      console.error('Error fetching social accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const platformInfo = {
    instagram: {
      name: 'Instagram',
      guide: 'Get API keys from Facebook Developer Console → Create App → Instagram Graph API',
      fields: ['App ID', 'App Secret', 'Access Token']
    },
    facebook: {
      name: 'Facebook',
      guide: 'Get API keys from Facebook Developer Console → Create App → Facebook Graph API',
      fields: ['App ID', 'App Secret', 'Access Token']
    },
    pinterest: {
      name: 'Pinterest',
      guide: 'Get API keys from Pinterest Developers → Create App → Get Access Token',
      fields: ['App ID', 'App Secret', 'Access Token']
    },
    twitter: {
      name: 'Twitter (X)',
      guide: 'Get API keys from Twitter Developer Portal → Create Project → Generate Keys',
      fields: ['API Key', 'API Secret', 'Bearer Token', 'Access Token', 'Access Secret']
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">Settings</h1>
        <p className="text-white/50">Configure your social media integrations</p>
      </div>

      {/* API Keys Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {socialAccounts.map((account) => {
          const info = platformInfo[account.platform];
          
          return (
            <div key={account.id} className="bg-[#121212] border border-white/5 rounded-sm p-6" data-testid={`settings-${account.platform}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-serif text-white mb-1">{info?.name || account.platform}</h3>
                  <div className="flex items-center gap-2">
                    {account.is_connected ? (
                      <>
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm text-green-500">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-400" />
                        <span className="text-sm text-red-400">Not Connected</span>
                      </>
                    )}
                  </div>
                </div>
                <Key size={24} className="text-[#D4AF37]" />
              </div>
              
              <p className="text-sm text-white/50 mb-4">{info?.guide}</p>
              
              <div className="space-y-3">
                {info?.fields.map((field) => (
                  <input
                    key={field}
                    type="password"
                    placeholder={field}
                    disabled
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-sm h-10 px-4 text-sm text-white placeholder:text-white/30 disabled:opacity-50"
                  />
                ))}
              </div>
              
              <button
                disabled
                className="w-full mt-4 bg-white/5 text-white/50 border border-white/10 rounded-sm px-6 py-3 cursor-not-allowed"
              >
                Connect (Available when you add API keys)
              </button>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="bg-[#121212] border border-[#D4AF37]/20 rounded-sm p-6">
        <h2 className="text-2xl font-serif text-white mb-4">How to Connect Your Accounts</h2>
        <div className="space-y-4 text-white/70 text-sm leading-relaxed">
          <p>
            <strong className="text-white">Step 1:</strong> Visit the developer portals mentioned above to create your apps and get API credentials.
          </p>
          <p>
            <strong className="text-white">Step 2:</strong> Once you have your API keys, contact support or use the integration settings to add them securely.
          </p>
          <p>
            <strong className="text-white">Step 3:</strong> After connecting, you'll be able to schedule posts, auto-reply to messages, and track analytics across all platforms.
          </p>
          <p className="text-[#D4AF37] mt-4">
            💡 For now, you can use the Content Studio to generate AI-powered captions and save drafts. Real posting will be enabled once you connect your accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;