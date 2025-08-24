import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Save, Eye, EyeOff, Key, User } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile, updateApiKeys } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    theme: user?.settings?.theme || 'system'
  });

  const [apiKeysData, setApiKeysData] = useState({
    openai: '',
    anthropic: '',
    google: ''
  });

  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    google: false
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        name: profileData.name,
        settings: { theme: profileData.theme }
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeysSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateApiKeys(apiKeysData);
      toast.success('API keys updated successfully');
      
      // Clear the form
      setApiKeysData({
        openai: '',
        anthropic: '',
        google: ''
      });
    } catch (error) {
      toast.error('Failed to update API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleKeyVisibility = (provider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'api-keys', name: 'API Keys', icon: <Key className="h-4 w-4" /> }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your profile and API configurations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input max-w-md"
                required
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                className="input max-w-md bg-gray-50 text-gray-500"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                id="theme"
                value={profileData.theme}
                onChange={(e) => setProfileData({ ...profileData, theme: e.target.value })}
                className="input max-w-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-6">
          <div className="card p-8">
            <div className="flex items-start space-x-3 mb-6">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Key className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">API Keys</h2>
                <p className="text-gray-600 mt-1">
                  Configure your API keys to use different AI models. Keys are encrypted and stored securely.
                </p>
              </div>
            </div>

            <form onSubmit={handleApiKeysSubmit} className="space-y-6">
              <div>
                <label htmlFor="openai" className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    id="openai"
                    type={showKeys.openai ? 'text' : 'password'}
                    value={apiKeysData.openai}
                    onChange={(e) => setApiKeysData({ ...apiKeysData, openai: e.target.value })}
                    className="input pr-10"
                    placeholder="sk-..."
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleKeyVisibility('openai')}
                  >
                    {showKeys.openai ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Required for GPT models. Get your key from{' '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    OpenAI Platform
                  </a>
                </p>
              </div>

              <div>
                <label htmlFor="anthropic" className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic API Key
                </label>
                <div className="relative">
                  <input
                    id="anthropic"
                    type={showKeys.anthropic ? 'text' : 'password'}
                    value={apiKeysData.anthropic}
                    onChange={(e) => setApiKeysData({ ...apiKeysData, anthropic: e.target.value })}
                    className="input pr-10"
                    placeholder="sk-ant-..."
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleKeyVisibility('anthropic')}
                  >
                    {showKeys.anthropic ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Required for Claude models. Get your key from{' '}
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    Anthropic Console
                  </a>
                </p>
              </div>

              <div>
                <label htmlFor="google" className="block text-sm font-medium text-gray-700 mb-2">
                  Google API Key
                </label>
                <div className="relative">
                  <input
                    id="google"
                    type={showKeys.google ? 'text' : 'password'}
                    value={apiKeysData.google}
                    onChange={(e) => setApiKeysData({ ...apiKeysData, google: e.target.value })}
                    className="input pr-10"
                    placeholder="AIza..."
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleKeyVisibility('google')}
                  >
                    {showKeys.google ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Required for Gemini models. Get your key from{' '}
                  <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    Google AI Studio
                  </a>
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? 'Saving...' : 'Save API Keys'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security Notice */}
          <div className="card p-6 bg-amber-50 border-amber-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <Key className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-800">Security Notice</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>API keys are encrypted before storage</li>
                    <li>Keys are only used to make requests to their respective AI services</li>
                    <li>We never log or store API responses containing sensitive data</li>
                    <li>You can revoke API keys anytime from the provider's dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;