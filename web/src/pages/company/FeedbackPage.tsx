import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';

export default function CompanyFeedbackPage() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => await api.post('/feedback/company', { rating, comment }),
    onSuccess: () => {
      setSuccess(true);
      setRating(5);
      setComment('');
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-h2 font-bold text-primary">Placement Process Feedback</h1>
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
        {success && (
          <div className="mb-4 p-4 bg-success/10 text-success rounded-md font-medium">
            Thank you! Your feedback helps us improve.
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? 'text-warning' : 'text-border'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Comments</label>
            <textarea 
              rows={5}
              required
              placeholder="Tell us about your experience with the placement process..."
              className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-primary"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full py-2 bg-primary text-surface rounded font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
