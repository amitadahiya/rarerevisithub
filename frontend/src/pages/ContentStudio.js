import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Send, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContentStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState('elegant');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/content/generate`, {
        prompt,
        platform,
        tone
      });
      
      setGeneratedContent(response.data.content);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsDraft = async () => {
    if (!generatedContent) {
      toast.error('Generate content first');
      return;
    }

    try {
      await axios.post(`${API}/posts`, {
        platform,
        content: generatedContent,
        status: 'draft'
      });
      
      toast.success('Saved as draft!');
      setGeneratedContent('');
      setPrompt('');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">Content Studio</h1>
        <p className="text-white/50">AI-powered content creation for your brand</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-[#121212] border border-white/5 rounded-sm p-6">
          <h2 className="text-2xl font-serif text-white mb-6">Create Content</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">Platform</label>
              <select
                data-testid="platform-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-10 px-4 text-sm transition-all duration-300 text-white"
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="pinterest">Pinterest</option>
                <option value="twitter">Twitter</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Tone</label>
              <select
                data-testid="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-10 px-4 text-sm transition-all duration-300 text-white"
              >
                <option value="elegant">Elegant</option>
                <option value="playful">Playful</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">What would you like to create?</label>
              <textarea
                data-testid="content-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Write a caption for Golden Oud perfume, highlighting its luxury and warmth..."
                rows={6}
                className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm p-4 text-sm transition-all duration-300 text-white placeholder:text-white/20 resize-none"
              />
            </div>

            <button
              data-testid="generate-content-button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black hover:bg-[#C5A059] font-medium rounded-sm px-6 py-3 transition-all duration-300 gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={20} />
              {loading ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-[#121212] border border-white/5 rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-white">Generated Content</h2>
            {generatedContent && (
              <button
                data-testid="copy-content-button"
                onClick={handleCopy}
                className="text-white/70 hover:text-[#D4AF37] transition-colors duration-300"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            )}
          </div>

          {generatedContent ? (
            <div className="space-y-4">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-4 min-h-[300px]">
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed" data-testid="generated-content-output">
                  {generatedContent}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  data-testid="save-draft-button"
                  onClick={handleSaveAsDraft}
                  className="bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-sm px-6 py-3 transition-all duration-300"
                >
                  Save as Draft
                </button>
                <button
                  data-testid="schedule-post-button"
                  className="bg-[#D4AF37] text-black hover:bg-[#C5A059] font-medium rounded-sm px-6 py-3 transition-all duration-300 gold-glow flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Schedule Post
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-white/30">
              <div className="text-center">
                <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                <p>Your generated content will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mood Inspiration */}
      <div className="mt-8 bg-[#121212] border border-white/5 rounded-sm p-6">
        <h2 className="text-2xl font-serif text-white mb-4">Shop by Mood Inspiration</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { mood: 'Sensual', img: 'https://images.unsplash.com/photo-1761329842950-f3551938e4da?w=400' },
            { mood: 'Fresh', img: 'https://images.unsplash.com/photo-1744639745305-3df711e1525a?w=400' },
            { mood: 'Woody', img: 'https://images.unsplash.com/photo-1743915834302-59e283ed17cd?w=400' },
            { mood: 'Floral', img: 'https://images.unsplash.com/photo-1714000699283-0b782721fe67?w=400' }
          ].map((item) => (
            <div 
              key={item.mood}
              className="relative h-32 rounded-sm overflow-hidden cursor-pointer group"
              onClick={() => setPrompt(`Create a caption for ${item.mood.toLowerCase()} fragrance collection`)}
            >
              <img src={item.img} alt={item.mood} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white font-serif text-xl">{item.mood}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;