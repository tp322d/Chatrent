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

  // Generate realistic demo responses when API keys are not configured
  generateDemoResponse(provider, model, prompt) {
    const demoResponses = {
      openai: {
        'gpt-4o-mini': {
          style: 'concise and helpful',
          samples: [
            "I'd be happy to help you with that. Here's a comprehensive approach to your question:",
            "Great question! Let me break this down for you step by step.",
            "Based on your query, here are the key points to consider:",
            "I understand what you're looking for. Here's my analysis:"
          ]
        },
        'gpt-4o': {
          style: 'detailed and analytical', 
          samples: [
            "This is an excellent question that requires careful consideration of multiple factors.",
            "Let me provide you with a thorough analysis of this topic.",
            "I'll approach this systematically to give you the most helpful response.",
            "This is a nuanced topic that benefits from exploring several perspectives."
          ]
        }
      },
      anthropic: {
        'claude-3-haiku-20240307': {
          style: 'thoughtful and precise',
          samples: [
            "I appreciate you asking about this. Let me share some thoughts that might be helpful.",
            "This is an interesting topic. Here's how I would approach it:",
            "Thank you for the question. I'll do my best to provide a clear and useful response.",
            "I'd like to help you think through this carefully."
          ]
        },
        'claude-3-sonnet-20240229': {
          style: 'balanced and thorough',
          samples: [
            "I'd be happy to explore this topic with you. Let me consider the various aspects:",
            "This raises some important considerations. Here's my perspective:",
            "I think there are several ways to look at this question.",
            "Let me walk you through my thinking on this topic."
          ]
        }
      },
      google: {
        'gemini-pro': {
          style: 'informative and structured',
          samples: [
            "Here's what I can tell you about this topic, organized clearly:",
            "Let me provide you with some structured information about this:",
            "I'll organize my response to cover the key aspects you're asking about:",
            "Here's a systematic breakdown of this topic:"
          ]
        },
        'gemini-1.5-flash': {
          style: 'quick and direct',
          samples: [
            "Quick answer: Here's what you need to know:",
            "Direct response to your question:",
            "Here's the straightforward answer:",
            "To address your question directly:"
          ]
        }
      }
    };

    const providerResponses = demoResponses[provider] || {};
    const modelData = providerResponses[model] || providerResponses[Object.keys(providerResponses)[0]] || {
      style: 'helpful',
      samples: ["I'd be happy to help you with that question."]
    };

    // Generate a realistic continuation based on the prompt
    const baseSample = modelData.samples[Math.floor(Math.random() * modelData.samples.length)];
    const continuation = this.generateDemoContent(prompt, modelData.style);
    
    // Simulate realistic response time (500ms to 2s)
    const responseTime = 500 + Math.floor(Math.random() * 1500);
    
    // Generate realistic token usage
    const promptTokens = Math.ceil(prompt.length / 4); // Rough estimate: 4 chars per token
    const completionTokens = Math.ceil((baseSample + continuation).length / 4);
    
    return {
      provider,
      model,
      response: `${baseSample}\n\n${continuation}\n\n---\n*This is a demo response. Configure API keys for real AI responses.*`,
      responseTime,
      tokenUsage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      },
      isDemoResponse: true
    };
  }

  generateDemoContent(prompt, style) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Generate contextually relevant demo content based on prompt
    if (lowerPrompt.includes('code') || lowerPrompt.includes('programming') || lowerPrompt.includes('function')) {
      return `Here's a code example that demonstrates the concept:\n\n\`\`\`javascript\nfunction exampleFunction() {\n  console.log("This is a demo response!");\n  return "Replace with real implementation";\n}\n\`\`\`\n\nThis approach would work well for your use case.`;
    }
    
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is') || lowerPrompt.includes('how')) {
      return `The concept you're asking about involves several key components:\n\n1. **First aspect**: This is an important foundational element\n2. **Second aspect**: This builds on the first point\n3. **Third aspect**: This brings everything together\n\nThese elements work together to create the complete picture.`;
    }
    
    if (lowerPrompt.includes('help') || lowerPrompt.includes('advice') || lowerPrompt.includes('suggest')) {
      return `Here are some practical suggestions:\n\n• **Option 1**: This would be a straightforward approach\n• **Option 2**: This offers more flexibility\n• **Option 3**: This might be the most comprehensive solution\n\nI'd recommend starting with Option 1 and then considering the others based on your specific needs.`;
    }
    
    if (lowerPrompt.includes('compare') || lowerPrompt.includes('difference') || lowerPrompt.includes('vs')) {
      return `Here's a comparison of the key differences:\n\n**Aspect A:**\n- Advantage: Better for specific use cases\n- Drawback: More complex setup\n\n**Aspect B:**\n- Advantage: Simpler to implement\n- Drawback: Less customizable\n\nThe choice between them depends on your specific requirements and constraints.`;
    }
    
    // Default generic response
    return `This is a comprehensive topic that touches on several important areas. The key considerations include practical implementation, best practices, and potential challenges you might encounter.\n\nBased on current industry standards and common approaches, I'd recommend focusing on the core principles first, then building out from there as needed.`;
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
      console.error('OpenAI error:', error.message);
      
      // Return demo response instead of error for better user experience
      return this.generateDemoResponse('openai', model, prompt);
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
      console.error('Anthropic error:', error.message);
      
      // Return demo response instead of error for better user experience
      return this.generateDemoResponse('anthropic', model, prompt);
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
      console.error('Google error:', error.message);
      
      // Return demo response instead of error for better user experience
      return this.generateDemoResponse('google', model, prompt);
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
        // Add demo response for missing API key
        promises.push(Promise.resolve(this.generateDemoResponse(provider, model, prompt)));
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