import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Feedback {
  navigationRating: number;
  accuracyRating: number;
  aiQualityRating: number;
  performanceRating: number;
  technicalNotes: string;
}

export function BetaFeedback() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback>({
    navigationRating: 0,
    accuracyRating: 0,
    aiQualityRating: 0,
    performanceRating: 0,
    technicalNotes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // Get user info
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: !submitted,
  });

  const calculateAverageScore = (): number => {
    if (!feedback.navigationRating || !feedback.accuracyRating || !feedback.aiQualityRating || !feedback.performanceRating) {
      return 0;
    }
    return (feedback.navigationRating + feedback.accuracyRating + feedback.aiQualityRating + feedback.performanceRating) / 4;
  };

  const handleRatingChange = (category: keyof Feedback, rating: number) => {
    setFeedback(prev => ({
      ...prev,
      [category]: rating,
    }));
  };

  const handleSubmit = async () => {
    if (!feedback.navigationRating || !feedback.accuracyRating || !feedback.aiQualityRating || !feedback.performanceRating) {
      toast({
        title: "Required Field",
        description: "Please rate all categories before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/beta-feedback', feedback);
      setSubmitted(true);
      toast({
        title: "Thank You!",
        description: "Your feedback helps build a tougher tool.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              Thank you, {user?.firstName || 'User'}. Your feedback helps build a tougher tool.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => {
                setSubmitted(false);
                setFeedback({
                  navigationRating: 0,
                  accuracyRating: 0,
                  aiQualityRating: 0,
                  performanceRating: 0,
                  technicalNotes: '',
                });
              }}
              className="w-full"
            >
              Submit More Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageScore = calculateAverageScore();
  const isComplete = feedback.navigationRating > 0 && feedback.accuracyRating > 0 && feedback.aiQualityRating > 0 && feedback.performanceRating > 0;

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Beta Feedback</h1>
          <p className="text-muted-foreground">Help us improve ArcSide™ by sharing your feedback. Rate your experience across 4 key categories.</p>
        </div>

        {/* Rating Categories */}
        <div className="space-y-6 mb-8">
          <RatingCard
            title="Navigation & Ease of Use"
            description="How easy is it to navigate the app and find what you need?"
            rating={feedback.navigationRating}
            onChange={(r) => handleRatingChange('navigationRating', r)}
          />
          
          <RatingCard
            title="Calculation Accuracy"
            description="How accurate are the calculations and results?"
            rating={feedback.accuracyRating}
            onChange={(r) => handleRatingChange('accuracyRating', r)}
          />
          
          <RatingCard
            title="AI Assistant Quality"
            description="How helpful and accurate is the AI assistant?"
            rating={feedback.aiQualityRating}
            onChange={(r) => handleRatingChange('aiQualityRating', r)}
          />
          
          <RatingCard
            title="Overall App Performance"
            description="How is the overall performance and reliability?"
            rating={feedback.performanceRating}
            onChange={(r) => handleRatingChange('performanceRating', r)}
          />
        </div>

        {/* Total Score */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Session Score</p>
              <p className="text-4xl font-bold text-primary">
                {isComplete ? averageScore.toFixed(1) : '-'}/5
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Notes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Technical Notes</CardTitle>
            <CardDescription>Any bugs, suggestions, or specific feedback? Let us know.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Tell us what's on your mind..."
              value={feedback.technicalNotes}
              onChange={(e) => setFeedback(prev => ({ ...prev, technicalNotes: e.target.value }))}
              className="min-h-32 resize-none"
              data-testid="textarea-technical-notes"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={!isComplete}
          className="w-full"
          data-testid="button-submit-feedback"
        >
          Submit Feedback
        </Button>
      </div>
    </div>
  );
}

function RatingCard({
  title,
  description,
  rating,
  onChange,
}: {
  title: string;
  description: string;
  rating: number;
  onChange: (rating: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onChange(star)}
              className="p-1 hover:scale-110 transition-transform"
              data-testid={`star-${title.replace(/\s+/g, '-').toLowerCase()}-${star}`}
            >
              <Star
                size={32}
                className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
              />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
