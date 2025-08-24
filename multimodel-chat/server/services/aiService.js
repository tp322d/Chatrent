const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    // Initialize clients with environment variables
    this.clients = {};
    
    if (process.env.OPENAI_API_KEY) {
      this.clients.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.clients.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }

    if (process.env.GOOGLE_API_KEY) {
      this.clients.google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    }
  }

  // OpenAI request
  async queryOpenAI(client, prompt, model = 'gpt-4o-mini') {
    const startTime = Date.now();
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048
      });

      const responseTime = Date.now() - startTime;
      const response = completion.choices[0].message.content;

      return {
        provider: 'openai',
        model,
        response,
        responseTime,
        tokenUsage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0
        },
        error: null
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('OpenAI error:', error.message);
      
      return {
        provider: 'openai',
        model,
        response: '',
        responseTime,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        error: this.formatError(error, 'OpenAI')
      };
    }
  }

  // Anthropic request
  async queryAnthropic(client, prompt, model = 'claude-3-haiku-20240307') {
    const startTime = Date.now();
    try {
      const completion = await client.messages.create({
        model,
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseTime = Date.now() - startTime;
      const response = completion.content[0].text;

      return {
        provider: 'anthropic',
        model,
        response,
        responseTime,
        tokenUsage: {
          promptTokens: completion.usage?.input_tokens || 0,
          completionTokens: completion.usage?.output_tokens || 0,
          totalTokens: (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0)
        },
        error: null
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('Anthropic error:', error.message);
      
      return {
        provider: 'anthropic',
        model,
        response: '',
        responseTime,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        error: this.formatError(error, 'Anthropic')
      };
    }
  }

  // Google request
  async queryGoogle(client, prompt, model = 'gemini-pro') {
    const startTime = Date.now();
    try {
      const genModel = client.getGenerativeModel({ model });
      const result = await genModel.generateContent(prompt);
      const response = result.response.text();

      const responseTime = Date.now() - startTime;

      return {
        provider: 'google',
        model,
        response,
        responseTime,
        tokenUsage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0
        },
        error: null
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('Google error:', error.message);
      
      return {
        provider: 'google',
        model,
        response: '',
        responseTime,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        error: this.formatError(error, 'Google')
      };
    }
  }

  // Main method to query multiple models simultaneously
  async queryMultipleModels(prompt, selectedModels) {
    const promises = [];

    // Default models if none selected
    const models = selectedModels?.length > 0 ? selectedModels : [
      'gpt-4o-mini',
      'claude-3-haiku-20240307', 
      'gemini-pro'
    ];

    const startTime = Date.now();

    // Create promises for each model
    for (const modelConfig of models) {
      let provider, model;
      
      if (typeof modelConfig === 'string') {
        // Infer provider from model name
        if (modelConfig.startsWith('gpt-') || modelConfig.startsWith('o1')) {
          provider = 'openai';
          model = modelConfig;
        } else if (modelConfig.startsWith('claude-')) {
          provider = 'anthropic';
          model = modelConfig;
        } else if (modelConfig.startsWith('gemini-')) {
          provider = 'google';
          model = modelConfig;
        }
      } else {
        provider = modelConfig.provider;
        model = modelConfig.model;
      }

      if (!provider || !model) continue;

      const client = this.clients[provider];
      if (!client) {
        // Add error response for missing API key
        promises.push(Promise.resolve({
          provider,
          model,
          response: '',
          responseTime: 0,
          tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          error: `Missing API key for ${provider}`
        }));
        continue;
      }

      // Add the appropriate promise
      switch (provider) {
        case 'openai':
          promises.push(this.queryOpenAI(client, prompt, model));
          break;
        case 'anthropic':
          promises.push(this.queryAnthropic(client, prompt, model));
          break;
        case 'google':
          promises.push(this.queryGoogle(client, prompt, model));
          break;
      }
    }

    // Wait for all requests to complete
    const responses = await Promise.all(promises);
    const totalResponseTime = Date.now() - startTime;

    return {
      responses,
      metadata: {
        totalResponseTime,
        timestamp: new Date()
      }
    };
  }

  // Format error messages
  formatError(error, provider) {
    if (error.status === 401) {
      return `Invalid API key for ${provider}`;
    }
    if (error.status === 429) {
      return `Rate limit exceeded for ${provider}`;
    }
    if (error.status >= 500) {
      return `${provider} server error`;
    }
    return error.message || `Unknown error with ${provider}`;
  }

  // Get available models for each provider
  getAvailableModels() {
    return {
      openai: [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-3.5-turbo',
        'o1-preview',
        'o1-mini'
      ],
      anthropic: [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
      ],
      google: [
        'gemini-pro',
        'gemini-pro-vision',
        'gemini-1.5-pro',
        'gemini-1.5-flash'
      ]
    };
  }
}

module.exports = new AIService();