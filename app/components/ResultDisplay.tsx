import { Video, FileText, Sparkles, BarChart2, MessageCircle, Share2, Instagram, Youtube, Twitter } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for ReactPlayer
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface ResultDisplayProps {
    result: any;
    language: string;
}

export default function ResultDisplay({ result, language }: ResultDisplayProps) {
    if (!result) return null;

    const isTextPost = result.metadata.text_content || result.metadata.platform === 'Twitter' || result.metadata.platform === 'X';

    return (
        <div className="space-y-6">
            {/* Original Content Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-400">
                    {isTextPost ? <FileText className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    {isTextPost ? 'Original Post' : 'Original Video'}
                </h3>

                {isTextPost ? (
                    // Tweet/Text Card
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

                        <p className="text-lg mb-4 whitespace-pre-wrap font-sans">{result.metadata.text_content}</p>

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
                            {new Date(result.metadata.upload_date).toLocaleDateString()}
                        </div>
                    </div>
                ) : (
                    // Video Player
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
                            <ReactPlayer
                                url={result.metadata.original_url}
                                controls
                                width="100%"
                                height="100%"
                            />
                        )}
                    </div>
                )}

                {!isTextPost && (
                    <div className="bg-gray-900/50 p-3 rounded-lg mt-4">
                        <p className="text-xs text-gray-400 uppercase">Original Description</p>
                        <p className="text-sm text-gray-300">{result.metadata.description}</p>
                    </div>
                )}
            </div>

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
    );
}
