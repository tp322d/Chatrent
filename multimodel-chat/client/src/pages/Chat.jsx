import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, Loader2, AlertCircle, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModelCard = ({ response, isLoading }) => {
  const getProviderColor = (provider) => {
    switch (provider) {
      case 'openai': return 'border-green-500 bg-green-50';
      case 'anthropic': return 'border-orange-500 bg-orange-50';
      case 'google': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getProviderName = (provider) => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'anthropic': return 'Anthropic';
      case 'google': return 'Google';
      default: return provider;
    }
  };

  return (
    <div className={`card p-6 border-l-4 ${getProviderColor(response?.provider || 'default')}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">
            {getProviderName(response?.provider || 'Unknown')}
          </h3>
          <p className="text-sm text-gray-600">{response?.model}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : response?.error ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      ) : response?.error ? (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
          {response.error}
        </div>
      ) : (
        <>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{response?.response}</p>
          </div>
          
          {response?.tokenUsage && (
            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
              <span>Tokens: {response.tokenUsage.totalTokens}</span>
              <span>Time: {response.responseTime}ms</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState([]);
  const [selectedModels, setSelectedModels] = useState([
    'gpt-4o-mini',
    'claude-3-haiku-20240307',
    'gemini-pro'
  ]);
  const [availableModels, setAvailableModels] = useState({});

  useEffect(() => {
    fetchAvailableModels();
  }, []);

  const fetchAvailableModels = async () => {
    try {
      const response = await axios.get('/api/chat/models/available');
      setAvailableModels(response.data.models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (selectedModels.length === 0) {
      toast.error('Please select at least one model');
      return;
    }

    setIsLoading(true);
    setResponses([]);

    try {
      const response = await axios.post('/api/chat/compare', {
        prompt: prompt.trim(),
        models: selectedModels
      });

      setResponses(response.data.responses);
      toast.success('Responses received!');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to get responses';
      toast.error(message);
      
      if (message.includes('API key')) {
        toast.error(
          <div>
            Please configure your API keys in{' '}
            <Link to="/settings" className="underline font-medium">
              Settings
            </Link>
          </div>
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModel = (provider, model) => {
    const modelId = model;
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(m => m !== modelId)
        : [...prev, modelId]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Model Comparison
        </h1>
        <p className="text-gray-600">
          Compare responses from multiple AI models side by side
        </p>
      </div>

      {/* Model Selection */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Select Models</h2>
        <div className="space-y-4">
          {Object.entries(availableModels).map(([provider, models]) => (
            <div key={provider}>
              <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                {provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : 'Google'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {models.map(model => (
                  <label 
                    key={model}
                    className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model)}
                      onChange={() => toggleModel(provider, model)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{model}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {selectedModels.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">Please select at least one model</span>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <form onSubmit={handleSubmit} className="card p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Your Prompt
            </label>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input resize-none"
              placeholder="Enter your prompt here... (e.g., 'Explain quantum computing in simple terms')"
              maxLength={5000}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {prompt.length}/5000
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Selected: {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''}
            </div>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim() || selectedModels.length === 0}
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Getting Responses...' : 'Compare Models'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {(responses.length > 0 || isLoading) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Responses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              selectedModels.map((model, index) => (
                <ModelCard key={`loading-${index}`} isLoading={true} />
              ))
            ) : (
              responses.map((response, index) => (
                <ModelCard key={index} response={response} isLoading={false} />
              ))
            )}
          </div>
        </div>
      )}

      {/* API Keys Notice */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <SettingsIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-700 font-medium">API Keys Required</p>
            <p className="text-blue-600 mt-1">
              Configure your API keys in{' '}
              <Link to="/settings" className="underline font-medium hover:text-blue-800">
                Settings
              </Link>{' '}
              to use the respective models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;