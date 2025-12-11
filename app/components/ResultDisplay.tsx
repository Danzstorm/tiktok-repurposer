'use client';

import { useState } from 'react';
import { Video, FileText, Sparkles, BarChart2, MessageCircle, Share2, Instagram, Youtube, Twitter, ChevronDown, ChevronUp, Eye, Clapperboard, Mic } from 'lucide-react';

interface ResultDisplayProps {
    result: any;
    language: string;
}

export default function ResultDisplay({ result, language }: ResultDisplayProps) {
    const [showFullTranscription, setShowFullTranscription] = useState(false);

    if (!result) return null;

    // Handle both old format (string) and new format (object/array) for newContent
    const newContent = result.newContent || {};
    const hookData = typeof newContent.hook === 'object' ? newContent.hook : { visual: '', audio: newContent.hook || '' };
    const visualStoryboard = Array.isArray(newContent.visualStoryboard) ? newContent.visualStoryboard : [];
    const scriptLines = Array.isArray(newContent.script) ? newContent.script : [];
    const scriptText = typeof newContent.script === 'string' ? newContent.script : '';

    return (
        <div className="space-y-6">
            {/* Metrics Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
                        <BarChart2 className="w-5 h-5" />
                        Métricas ({result.metadata.platform || 'Video'})
                    </h3>
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

            {/* Analysis & Transcription Card */}
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
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-400 uppercase">Transcription (Original)</p>
                            <button
                                onClick={() => setShowFullTranscription(!showFullTranscription)}
                                className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
                            >
                                {showFullTranscription ? (
                                    <>
                                        <ChevronUp className="w-3 h-3" />
                                        Show less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-3 h-3" />
                                        Show full
                                    </>
                                )}
                            </button>
                        </div>
                        <div className={`bg-gray-900/50 p-3 rounded-lg overflow-y-auto transition-all duration-300 ${showFullTranscription ? 'max-h-96' : 'max-h-24'}`}>
                            <p className="text-xs text-gray-400 whitespace-pre-wrap">{result.transcription}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Generated Content Card */}
            <div className="bg-gradient-to-br from-pink-900/20 to-violet-900/20 backdrop-blur-sm p-6 rounded-2xl border border-pink-500/30 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-pink-400">
                    <Sparkles className="w-5 h-5" />
                    Tu Nuevo Contenido ({language})
                </h3>
                <div className="space-y-4">
                    {/* Concept - What new video you'll create */}
                    {newContent.concept && (
                        <div className="bg-gradient-to-r from-violet-600/20 to-pink-600/20 p-4 rounded-lg border border-violet-500/30">
                            <p className="text-xs text-violet-400 uppercase mb-1 font-bold">💡 Concepto del Video</p>
                            <p className="text-base font-medium text-white">{newContent.concept}</p>
                        </div>
                    )}

                    {/* Hook - Separated into Visual and Audio */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border-l-4 border-pink-500">
                        <p className="text-xs text-pink-400 uppercase mb-2 font-bold flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            Hook (Primeros 3 segundos)
                        </p>
                        {hookData.visual && hookData.audio ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-gray-800/50 p-3 rounded">
                                    <p className="text-xs text-blue-400 uppercase mb-1">👁️ Visual</p>
                                    <p className="text-sm">{hookData.visual}</p>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded">
                                    <p className="text-xs text-green-400 uppercase mb-1">🎙️ Audio</p>
                                    <p className="text-sm">{hookData.audio}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-lg font-medium">{hookData.audio || newContent.hook}</p>
                        )}
                    </div>

                    {/* Visual Storyboard */}
                    {visualStoryboard.length > 0 && (
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <p className="text-xs text-blue-400 uppercase mb-3 font-bold flex items-center gap-2">
                                <Clapperboard className="w-3 h-3" />
                                Visual Storyboard
                            </p>
                            <div className="space-y-2">
                                {visualStoryboard.map((scene: any, index: number) => (
                                    <div key={index} className="bg-gray-800/50 p-3 rounded">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-pink-500 font-bold text-sm">{scene.scene || index + 1}.</span>
                                            {scene.section && (
                                                <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded">
                                                    {scene.section}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-200 ml-5">{scene.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-xs text-green-400 uppercase mb-3 font-bold flex items-center gap-2">
                            <Mic className="w-3 h-3" />
                            Script (Audio)
                        </p>
                        {scriptLines.length > 0 ? (
                            <div className="space-y-2">
                                {scriptLines.map((line: any, index: number) => (
                                    <div key={index} className="bg-gray-800/50 p-3 rounded">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-green-500 font-bold text-sm">{line.line || index + 1}.</span>
                                            {line.section && (
                                                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                                                    {line.section}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-200 ml-5">{line.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-200 whitespace-pre-wrap font-mono">{scriptText}</p>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border-l-4 border-violet-500">
                        <p className="text-xs text-violet-400 uppercase mb-1 font-bold">Call to Action</p>
                        <p className="text-sm font-medium text-blue-300">{newContent.cta}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
