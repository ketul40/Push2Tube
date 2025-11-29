import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { createVideoJob } from '@/services/videoJobService';
import { getUserById, updateUserPreferences } from '@/services/userService';
import { createErrorResponse, parseFirebaseError, ErrorCode } from '@/utils/errorHandler';
import { getTrendingTopics, TrendingTopic } from '@/services/trendingTopicsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle2, Lock, Globe, Eye, TrendingUp, X, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface PromptSubmissionComponentProps {
  user: FirebaseUser;
  onJobCreated?: (jobId: string) => void;
}

/**
 * PromptSubmissionComponent
 * Handles prompt submission for video generation
 * Requirements: 3.1, 3.2, 10.1, 10.2, 10.4, 10.5
 */
const PromptSubmissionComponent: React.FC<PromptSubmissionComponentProps> = ({ user, onJobCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('unlisted');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [defaultPrivacy, setDefaultPrivacy] = useState('unlisted');
  const [showTrendingTopics, setShowTrendingTopics] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [trendingTopics] = useState<TrendingTopic[]>(getTrendingTopics());

  const MAX_CHARS = 1000;
  const charCount = prompt.length;
  const charPercentage = (charCount / MAX_CHARS) * 100;

  // Load user's default privacy preference on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const userData = await getUserById(user.uid);
        if (userData && userData.defaultPrivacyStatus) {
          setDefaultPrivacy(userData.defaultPrivacyStatus);
          setPrivacyStatus(userData.defaultPrivacyStatus);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, [user.uid]);

  // Validate prompt (non-empty check)
  const validatePrompt = (value: string): boolean => {
    if (!value || value.trim() === '') {
      setValidationError('Prompt cannot be empty');
      return false;
    }
    setValidationError(null);
    return true;
  };

  // Handle prompt input change
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    
    // Clear selected topic if user manually edits
    if (selectedTopic && value !== selectedTopic.prompt) {
      setSelectedTopic(null);
    }
    
    // Clear validation error when user starts typing
    if (validationError && value.trim() !== '') {
      setValidationError(null);
    }
    
    // Clear success message when user starts typing again
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  };

  // Handle topic selection
  const handleTopicSelect = (topic: TrendingTopic) => {
    setSelectedTopic(topic);
    setPrompt(topic.prompt);
    setShowTrendingTopics(false);
    setValidationError(null);
    toast.success(`Selected: ${topic.title}`);
  };

  // Clear selected topic and prompt
  const handleClearSelection = () => {
    setSelectedTopic(null);
    setPrompt('');
    setShowTrendingTopics(true);
  };

  // Handle privacy status change
  const handlePrivacyChange = async (value: string) => {
    setPrivacyStatus(value);
    
    // Save as new default preference if different from current default
    if (value !== defaultPrivacy) {
      try {
        await updateUserPreferences(user.uid, {
          defaultPrivacyStatus: value,
        });
        setDefaultPrivacy(value);
        toast.success('Default privacy setting updated');
      } catch (error) {
        console.error('Error updating privacy preference:', error);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setSubmitSuccess(false);
    
    // Validate prompt
    if (!validatePrompt(prompt)) {
      const validationError = createErrorResponse(
        ErrorCode.VALIDATION_EMPTY_PROMPT,
        'Prompt cannot be empty'
      );
      toast.error(validationError.message);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create video job
      const jobId = await createVideoJob(user.uid, prompt, privacyStatus);
      
      // Clear form
      setPrompt('');
      setSelectedTopic(null);
      setShowTrendingTopics(true);
      setSubmitSuccess(true);
      toast.success('Video generation job created successfully!');
      
      // Notify parent component
      if (onJobCreated) {
        onJobCreated(jobId);
      }
    } catch (error) {
      console.error('Error creating video job:', error);
      const errorResponse = parseFirebaseError(error);
      toast.error(errorResponse.message, {
        action: {
          label: 'Retry',
          onClick: () => handleSubmit(e),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPrivacyIcon = (status: string) => {
    switch (status) {
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'unlisted':
        return <Eye className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="glass border-white/10 hover:border-neon-green/30 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-neon-green/10">
            <Sparkles className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <CardTitle className="text-xl">Create YouTube Short</CardTitle>
            <CardDescription>
              Describe your short viral video and let AI create it for you
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trending Topics Section */}
          {showTrendingTopics && !selectedTopic && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-neon-cyan" />
                  <label className="text-sm font-medium text-white">
                    Trending Ideas for YouTube Shorts
                  </label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTrendingTopics(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {trendingTopics.map((topic) => (
                  <Card
                    key={topic.id}
                    className="glass border-white/10 hover:border-neon-green/50 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleTopicSelect(topic)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs border-neon-cyan/50 text-neon-cyan">
                              {topic.category}
                            </Badge>
                            {topic.trending && (
                              <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">
                                🔥 Trending
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-neon-green transition-colors">
                            {topic.title}
                          </h4>
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                            {topic.description}
                          </p>
                        </div>
                        <Lightbulb className="w-4 h-4 text-neon-green/50 group-hover:text-neon-green transition-colors flex-shrink-0 ml-2" />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {topic.tags.slice(0, 3).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs border-white/20 text-gray-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex items-center justify-center pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTrendingTopics(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Or enter your own prompt
                </Button>
              </div>
            </div>
          )}

          {/* Selected Topic Display */}
          {selectedTopic && (
            <div className="space-y-2 p-4 rounded-lg bg-neon-green/10 border border-neon-green/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs border-neon-cyan/50 text-neon-cyan">
                      {selectedTopic.category}
                    </Badge>
                    <span className="text-sm font-semibold text-white">{selectedTopic.title}</span>
                  </div>
                  <p className="text-xs text-gray-300 mb-2">{selectedTopic.description}</p>
                  <p className="text-xs text-gray-400 italic">
                    💡 You can modify the prompt below or use it as-is
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-gray-400 hover:text-white flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium text-white flex items-center justify-between">
              <span>
                Video Prompt <span className="text-red-400">*</span>
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs ${charCount > MAX_CHARS * 0.9 ? 'border-red-500 text-red-400' : 'border-neon-cyan text-neon-cyan'}`}
              >
                {charCount} / {MAX_CHARS}
              </Badge>
            </label>
            <div className="relative">
              <Textarea
                id="prompt"
                value={prompt}
                onChange={handlePromptChange}
                placeholder={selectedTopic ? "Modify the prompt or use it as-is..." : "E.g., A cinematic time-lapse of a morning routine transformation with bright, energetic lighting..."}
                rows={6}
                maxLength={MAX_CHARS}
                disabled={isSubmitting}
                className={`resize-none bg-white/5 border-white/10 focus:border-neon-green/50 transition-all ${
                  validationError ? 'border-red-500/50' : ''
                } ${submitSuccess ? 'border-neon-green/50' : ''}`}
                aria-invalid={!!validationError}
                aria-describedby={validationError ? 'prompt-error' : undefined}
              />
              {/* Character progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-lg overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    charPercentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-neon-green to-neon-cyan'
                  }`}
                  style={{ width: `${Math.min(charPercentage, 100)}%` }}
                />
              </div>
            </div>
            {validationError && (
              <p id="prompt-error" className="text-sm text-red-400 flex items-center space-x-1">
                <span>⚠</span>
                <span>{validationError}</span>
              </p>
            )}
          </div>

          {/* Privacy Status */}
          <div className="space-y-2">
            <label htmlFor="privacy" className="text-sm font-medium text-white flex items-center justify-between">
              <span>Privacy Status</span>
              <Badge variant="outline" className="border-muted text-muted-foreground text-xs">
                Default: {defaultPrivacy}
              </Badge>
            </label>
            <Select value={privacyStatus} onValueChange={handlePrivacyChange} disabled={isSubmitting}>
              <SelectTrigger className="bg-white/5 border-white/10 focus:border-neon-cyan/50">
                <div className="flex items-center space-x-2">
                  {getPrivacyIcon(privacyStatus)}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-white/20">
                <SelectItem value="public" className="focus:bg-white/10">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </div>
                </SelectItem>
                <SelectItem value="unlisted" className="focus:bg-white/10">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Unlisted</span>
                  </div>
                </SelectItem>
                <SelectItem value="private" className="focus:bg-white/10">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This setting will be saved as your new default preference
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!showTrendingTopics && !selectedTopic && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTrendingTopics(true)}
                className="sm:w-auto border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Browse Ideas
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-neon-green to-neon-cyan hover:opacity-90 text-black font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Job...
                </>
              ) : submitSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Job Created!
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Short
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PromptSubmissionComponent;
