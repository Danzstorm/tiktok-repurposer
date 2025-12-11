'use client';

import { useState, useEffect } from 'react';
import { Loader2, Video, FileText, Sparkles, Globe, Upload, File as FileIcon, X, Twitter, Instagram, Youtube, ListOrdered } from 'lucide-react';
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
  const [scriptStructure, setScriptStructure] = useState('none');
  const [showStructureInfo, setShowStructureInfo] = useState(false);
  const [customStructure, setCustomStructure] = useState('');

  // Predefined script structures
  const scriptStructures: Record<string, { name: string; description: string; structure: string }> = {
    none: { name: 'Sin estructura (libre)', description: 'Gemini decide la mejor estructura', structure: '' },
    problemSolution: {
      name: 'Problema-Solución',
      description: 'Ideal para productos/servicios',
      structure: `1. HOOK/ATENCIÓN - Abre la curiosidad con algo impactante
2. PROBLEMA - Presenta el problema y agrándalo (dolor del cliente)
3. SOLUCIÓN - Resuelve el problema, muestra el beneficio y explica el "por qué"
4. CONCLUSIÓN - Resume lo aprendido en una frase
5. CTA - Llamada a la acción clara (qué debe hacer ahora)`
    },
    aida: {
      name: 'AIDA',
      description: 'Clásico de marketing',
      structure: `1. ATENCIÓN - Captura la atención inmediatamente
2. INTERÉS - Genera interés con datos o historia
3. DESEO - Crea deseo mostrando beneficios
4. ACCIÓN - Indica la acción específica a tomar`
    },
    storytelling: {
      name: 'Storytelling',
      description: 'Conecta emocionalmente',
      structure: `1. GANCHO - Empieza en medio de la acción/conflicto
2. CONTEXTO - Breve background (quién, qué, cuándo)
3. CONFLICTO - El problema o desafío enfrentado
4. RESOLUCIÓN - Cómo se resolvió
5. LECCIÓN - Qué aprendiste / CTA emocional`
    },
    educational: {
      name: 'Educativo/Tutorial',
      description: 'Enseña algo valioso',
      structure: `1. PROMESA - Qué van a aprender (resultado)
2. CREDIBILIDAD - Por qué deberían escucharte
3. CONTENIDO - Pasos claros y accionables (3-5 puntos)
4. RESUMEN - Recapitula los puntos clave
5. CTA - Pide seguir/guardar/compartir`
    },
    custom: {
      name: '✏️ Personalizada',
      description: 'Define tu propia estructura',
      structure: ''
    }
  };

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

      // Add script structure if selected
      if (scriptStructure === 'custom' && customStructure.trim()) {
        formData.append('scriptStructure', customStructure);
      } else if (scriptStructure !== 'none' && scriptStructure !== 'custom') {
        formData.append('scriptStructure', scriptStructures[scriptStructure].structure);
      }

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

  // Determine if content is a text post (Twitter/X) vs video
  const isTextPost = result && (result.metadata?.text_content && !result.videoPath) ||
    (result?.metadata?.platform === 'Twitter' || result?.metadata?.platform === 'X');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4">
            TikTok & Instagram Repurposer AI
          </h1>
          <p className="text-gray-400">
            Transform TikTok and Instagram videos into optimized content for other platforms using Gemini AI.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: Input + Original Content */}
          <div className="space-y-6">
            {/* Input Form Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl">
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
                    placeholder="Pega aquí el enlace (TikTok, Instagram, YouTube, Twitter...)"
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

                {/* Script Structure Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4" />
                    Estructura del Guión (Opcional)
                  </label>
                  <select
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                    value={scriptStructure}
                    onChange={(e) => {
                      setScriptStructure(e.target.value);
                      setShowStructureInfo(e.target.value !== 'none');
                    }}
                  >
                    {Object.entries(scriptStructures).map(([key, value]) => (
                      <option key={key} value={key}>{value.name}</option>
                    ))}
                  </select>

                  {/* Show structure preview */}
                  {showStructureInfo && scriptStructure !== 'none' && scriptStructure !== 'custom' && (
                    <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-xs text-pink-400 mb-2">{scriptStructures[scriptStructure].description}</p>
                      <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">
                        {scriptStructures[scriptStructure].structure}
                      </pre>
                    </div>
                  )}

                  {/* Custom structure textarea */}
                  {scriptStructure === 'custom' && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-xs text-pink-400 mb-2">Define tu propia estructura (cada línea es una sección):</p>
                      <textarea
                        value={customStructure}
                        onChange={(e) => setCustomStructure(e.target.value)}
                        placeholder={`Ejemplo:
1. HOOK - Captura la atención
2. PROBLEMA - Presenta el dolor
3. SOLUCIÓN - Tu propuesta
4. PRUEBA - Testimonios o datos
5. CTA - Qué hacer ahora`}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all text-sm font-mono h-32 resize-y"
                      />
                    </div>
                  )}
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

            {/* Original Content Card - BELOW INPUT (Platform-specific) */}
            {result && (
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
                    {isTextPost ? <FileText className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    {isTextPost ? 'Original Post' : 'Original Video'}
                  </h3>
                  {/* Platform Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white border flex items-center gap-1 ${result.metadata.platform === 'TikTok' ? 'bg-black border-gray-600' :
                    result.metadata.platform === 'Instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-pink-400' :
                      result.metadata.platform === 'YouTube' ? 'bg-red-600 border-red-500' :
                        (result.metadata.platform === 'Twitter' || result.metadata.platform === 'X') ? 'bg-black border-gray-600' :
                          'bg-gray-700 border-gray-600'
                    }`}>
                    {result.metadata.platform === 'YouTube' && <Youtube className="w-3 h-3" />}
                    {result.metadata.platform === 'Instagram' && <Instagram className="w-3 h-3" />}
                    {result.metadata.platform === 'TikTok' && <span className="text-xs">♪</span>}
                    {(result.metadata.platform === 'Twitter' || result.metadata.platform === 'X') && <Twitter className="w-3 h-3" />}
                    {result.metadata.platform || 'Video'}
                  </span>
                </div>

                {isTextPost ? (
                  // Twitter/X Text Post Card
                  <div className="bg-white text-black rounded-xl p-6 shadow-lg max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                        {result.metadata.uploader ? result.metadata.uploader[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{result.metadata.uploader || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">@{result.metadata.uploader || 'user'}</p>
                      </div>
                      <Twitter className="w-5 h-5 text-blue-400 ml-auto" />
                    </div>

                    <p className="text-lg mb-4 whitespace-pre-wrap font-sans">{result.metadata.text_content || result.metadata.description}</p>

                    {result.metadata.image_url && (
                      <div className="rounded-lg overflow-hidden border border-gray-200 mb-2">
                        <img
                          src={result.metadata.image_url}
                          alt="Post attachment"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      {result.metadata.upload_date ? new Date(result.metadata.upload_date).toLocaleDateString() : ''}
                    </div>
                  </div>
                ) : (
                  // Video Player (TikTok, Instagram, YouTube)
                  <>
                    <div className={`mx-auto bg-black rounded-lg overflow-hidden mb-4 relative flex items-center justify-center ${(result.metadata.width && result.metadata.height && result.metadata.width > result.metadata.height)
                      ? 'aspect-video w-full'
                      : 'aspect-[9/16] max-h-[500px]'
                      }`}>
                      {result.videoPath ? (
                        <video
                          src={result.videoPath}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-500 text-center p-4">
                          <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Video not available for preview</p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="bg-gray-900/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 uppercase mb-1">Original Description</p>
                      <p className="text-sm text-gray-300">{result.metadata.description}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Results (only when result exists) */}
          {result && (
            <div className="space-y-6">
              <ResultDisplay result={result} language={language} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
