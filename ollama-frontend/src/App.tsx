// App.tsx
import { useState, useRef } from 'react';
import axios from 'axios';

type Tab = 'generate' | 'stream' | 'chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState('deepseek-r1:14b');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
  const controllerRef = useRef<AbortController>();

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await axios.post('http://localhost:8000/generate', {
        prompt,
        model,
        temperature,
        max_tokens: maxTokens
      });
      setResponse(result.data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleStream = async () => {
    setLoading(true);
    setError('');
    setResponse('');
    controllerRef.current = new AbortController();

    try {
      const response = await fetch('http://localhost:8000/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
        signal: controllerRef.current?.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setResponse(prev => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    setLoading(true);
    setError('');
    const newMessages = [...messages, { role: 'user', content: prompt } as Message];
    setMessages(newMessages);

    try {
      const result = await axios.post('http://localhost:8000/chat', {
        messages: newMessages,
        model,
        temperature,
        max_tokens: maxTokens
      });

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: result.data.response }
      ]);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const stopGeneration = () => {
    controllerRef.current?.abort();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Ollama Frontend</h1>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {(['generate', 'stream', 'chat'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Temperature ({temperature})
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full mt-1"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Máximo de Tokens
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
              />
            </label>
          </div>
        </div>

        {/* Input Area */}
        <div className="mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Escribe tu prompt aquí..."
            className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={activeTab === 'generate' ? handleGenerate : activeTab === 'stream' ? handleStream : handleChat}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Procesando...' : 'Enviar'}
          </button>
          {loading && activeTab === 'stream' && (
            <button
              onClick={stopGeneration}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Detener
            </button>
          )}
        </div>

        {/* Response Area */}
        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {activeTab === 'chat' ? (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${msg.role === 'user'
                  ? 'bg-blue-50 ml-6'
                  : 'bg-green-50 mr-6'
                  }`}
              >
                <strong className="block mb-1 text-sm capitalize">
                  {msg.role}:
                </strong>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap min-h-40">
            {response}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;