import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Zap, Globe, Shield } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-primary-600" />,
      title: "Multi-Model Comparison",
      description: "Compare responses from OpenAI, Anthropic, and Google models side by side"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary-600" />,
      title: "Real-time Results",
      description: "Get responses from all models simultaneously with performance metrics"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary-600" />,
      title: "Multiple Providers",
      description: "Support for GPT-4, Claude, Gemini and more AI models"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "Secure & Private",
      description: "Your API keys and conversations are stored securely"
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          Compare AI Models
          <span className="block text-primary-600">Side by Side</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Send one prompt to multiple AI models and compare their responses instantly. 
          Make informed decisions about which AI model works best for your needs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link to="/chat" className="btn btn-primary text-lg px-8 py-3">
              Start Comparing
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary text-lg px-8 py-3">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="text-center space-y-4">
            <div className="flex justify-center">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
              1
            </div>
            <h3 className="text-xl font-semibold">Configure API Keys</h3>
            <p className="text-gray-600">
              Add your API keys for OpenAI, Anthropic, and Google in the settings
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
              2
            </div>
            <h3 className="text-xl font-semibold">Enter Your Prompt</h3>
            <p className="text-gray-600">
              Type your question or prompt and select which models to compare
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
              3
            </div>
            <h3 className="text-xl font-semibold">Compare Results</h3>
            <p className="text-gray-600">
              View responses side-by-side with performance metrics and token usage
            </p>
          </div>
        </div>
      </div>

      {/* Supported Models */}
      <div className="text-center space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">Supported Models</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-green-700 mb-4">OpenAI</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>GPT-4o</li>
              <li>GPT-4o-mini</li>
              <li>GPT-4 Turbo</li>
              <li>GPT-3.5 Turbo</li>
              <li>o1-preview</li>
              <li>o1-mini</li>
            </ul>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-orange-700 mb-4">Anthropic</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Claude 3.5 Sonnet</li>
              <li>Claude 3.5 Haiku</li>
              <li>Claude 3 Opus</li>
              <li>Claude 3 Sonnet</li>
              <li>Claude 3 Haiku</li>
            </ul>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Google</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Gemini Pro</li>
              <li>Gemini Pro Vision</li>
              <li>Gemini 1.5 Pro</li>
              <li>Gemini 1.5 Flash</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      {!user && (
        <div className="bg-primary-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of users comparing AI models to find the best fit for their needs
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
            Sign Up Now - It's Free
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;