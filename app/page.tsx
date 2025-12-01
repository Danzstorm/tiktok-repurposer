'use client';

import { useState, useEffect } from 'react';
import { Loader2, Video, FileText, Sparkles, BarChart2, Globe, MessageCircle, Share2, Instagram, Youtube, Twitter, Upload, File as FileIcon, X } from 'lucide-react';
import ResultDisplay from './components/ResultDisplay';

export default function Home() {
  const [url, setUrl] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('');
  const [goal, setGoal] = useState('');
  const [language, setLanguage] = useState('Spanish');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('url', url);
      formData.append('targetAudience', targetAudience);
      formData.append('tone', tone);
      formData.append('goal', goal);
      formData.append('language', language);

      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/process-video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4">
            TikTok & Instagram Repurposer AI
          </h1>
          <p className="text-gray-400">
            Transform TikTok and Instagram videos into optimized content for other platforms using Gemini AI.
          </p>
        </header>

        <div className={`grid grid-cols-1 ${result ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'} gap-8 transition-all duration-500`}>
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl h-fit">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Video className="w-5 h-5 text-pink-500" />
                Input Video
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Enlace del video</label>
                  <input
                    type="url"
                    required
                    placeholder="Pega aquí el enlace (TikTok, Instagram, YouTube...)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g., Millennials, Tech Enthusiasts"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tone</label>
                    <input
                      type="text"
                      placeholder="e.g., Professional, Funny"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Goal</label>
                    <input
                      type="text"
                      placeholder="e.g., Sell product"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Output Language
                  </label>
                  <select
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="Spanish">Spanish</option>
                    <option value="English">English</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Italian">Italian</option>
                  </select>
                </div>

                {/* File Upload Section (Collapsible) */}
                <div className="border-t border-gray-700 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUpload(!showUpload)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors mb-4"
                  >
                    <Upload className="w-4 h-4" />
                    {showUpload ? 'Hide Reference Documents' : 'Add Reference Documents (Optional)'}
                  </button>

                  {showUpload && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-pink-500 transition-colors bg-gray-900/30">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => {
                            if (e.target.files) {
                              setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white">
                          <Upload className="w-8 h-8" />
                          <span className="text-sm">Click to upload files (PDF, Word, TXT)</span>
                        </label>
                      </div>

                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-900/50 p-2 rounded border border-gray-700">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <span className="text-sm text-gray-300 truncate">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                                className="text-gray-500 hover:text-red-400 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Content
                    </>
                  )}
                </button>
              </form>
              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Video Player or Text Card */}

          </div>

          {/* Results Section - Only show if there is a result */}
          {result && (
            <div className="space-y-6">
              <ResultDisplay result={result} language={language} />

              {/* Metrics Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
                    <BarChart2 className="w-5 h-5" />
                    Métricas ({result.metadata.platform || 'Video'})
                  </h3>
                  {/* Visual Badge for Platform */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white border flex items-center gap-1 ${result.metadata.platform === 'TikTok' ? 'bg-black border-gray-600' :
                    result.metadata.platform === 'Instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-pink-400' :
                      result.metadata.platform === 'YouTube' ? 'bg-red-600 border-red-500' :
                        (result.metadata.platform === 'Twitter' || result.metadata.platform === 'X') ? 'bg-black border-gray-600' :
                          'bg-gray-700 border-gray-600'
                    }`}>
                    {result.metadata.platform === 'YouTube' && <Youtube className="w-3 h-3" />}
                    {result.metadata.platform === 'Instagram' && <Instagram className="w-3 h-3" />}
                    {(result.metadata.platform === 'Twitter' || result.metadata.platform === 'X') && <Twitter className="w-3 h-3" />}
                    {result.metadata.platform || 'Video'}
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Views */}
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Video className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-400 uppercase">Vistas</p>
                    </div>
                    <p className="text-xl font-bold">{result.metadata.view_count !== undefined ? result.metadata.view_count.toLocaleString() : '-'}</p>
                  </div>

                  {/* Likes */}
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3 text-pink-400" />
                      <p className="text-xs text-gray-400 uppercase">Likes</p>
                    </div>
                    <p className="text-xl font-bold">{result.metadata.like_count !== undefined ? result.metadata.like_count.toLocaleString() : '-'}</p>
                  </div>

                  {/* Comments */}
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-3 h-3 text-blue-400" />
                      <p className="text-xs text-gray-400 uppercase">Comentarios</p>
                    </div>
                    <p className="text-xl font-bold">{result.metadata.comment_count !== undefined ? result.metadata.comment_count.toLocaleString() : '-'}</p>
                  </div>

                  {/* Shares */}
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Share2 className="w-3 h-3 text-green-400" />
                      <p className="text-xs text-gray-400 uppercase">Compartidos</p>
                    </div>
                    <p className="text-xl font-bold">{result.metadata.share_count !== undefined ? result.metadata.share_count.toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Analysis Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-400">
                  <FileText className="w-5 h-5" />
                  Analysis & Transcription
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Detected Language</p>
                    <p className="text-sm font-medium text-green-400">{result.detectedLanguage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Analysis</p>
                    <p className="text-sm text-gray-300">{result.analysis}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Transcription (Original)</p>
                    <div className="bg-gray-900/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-xs text-gray-400 whitespace-pre-wrap">{result.transcription}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Content Card */}
              <div className="bg-gradient-to-br from-pink-900/20 to-violet-900/20 backdrop-blur-sm p-6 rounded-2xl border border-pink-500/30 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-pink-400">
                  <Sparkles className="w-5 h-5" />
                  New Content ({language})
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg border-l-4 border-pink-500">
                    <p className="text-xs text-pink-400 uppercase mb-1 font-bold">Hook</p>
                    <p className="text-lg font-medium">{result.newContent.hook}</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase mb-1">Video Script</p>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap font-mono">{result.newContent.script}</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase mb-1">Call to Action</p>
                    <p className="text-sm font-medium text-blue-300">{result.newContent.cta}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

