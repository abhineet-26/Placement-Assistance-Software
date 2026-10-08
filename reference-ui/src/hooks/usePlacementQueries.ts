import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Application, InterviewSlot, JobPosting, OfferRecord, PlacementNotice } from '../types';

export function useJobs(params?: { status?: string; roleType?: string }) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => api.getJobs(params),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => api.getJob(id),
    enabled: Boolean(id),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newJob: Omit<JobPosting, 'id' | 'createdAt' | 'applicantCount'>) =>
      api.createJob(newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
  });
}

export function useModerateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: 'published' | 'closed' | 'draft';
      notes?: string;
    }) => api.moderateJob(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
  });
}

export function useApplications(params?: {
  studentId?: string;
  jobId?: string;
  companyId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => api.getApplications(params),
  });
}

export function useApplyJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, resumeId }: { jobId: string; resumeId: string }) =>
      api.applyToJob(jobId, resumeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appId,
      status,
      currentRound,
      notes,
      rejectionReason,
    }: {
      appId: string;
      status: Application['status'];
      currentRound?: string;
      notes?: string;
      rejectionReason?: string;
    }) => api.updateApplicationStatus(appId, status, currentRound, notes, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useBatchForwardApplications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appIds: string[]) => api.batchForwardApplicationsToCompany(appIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useInterviews(params?: { studentId?: string; companyName?: string }) {
  return useQuery({
    queryKey: ['interviews', params],
    queryFn: () => api.getInterviews(params),
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slot: Omit<InterviewSlot, 'id' | 'status'>) => api.scheduleInterview(slot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useUpdateInterviewStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      feedback,
    }: {
      id: string;
      status: InterviewSlot['status'];
      feedback?: string;
    }) => api.updateInterviewStatus(id, status, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}

export function useOffers(params?: { studentId?: string; companyId?: string }) {
  return useQuery({
    queryKey: ['offers', params],
    queryFn: () => api.getOffers(params),
  });
}

export function useIssueOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offer: Omit<OfferRecord, 'id' | 'status' | 'issuedAt'>) => api.issueOffer(offer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
  });
}

export function useRespondOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, response }: { offerId: string; response: 'accepted' | 'declined' }) =>
      api.respondToOffer(offerId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => api.getCompanies(),
  });
}

export function useSetCompanyVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      status,
      reason,
    }: {
      companyId: string;
      status: 'approved' | 'rejected';
      reason?: string;
    }) => api.setCompanyVerification(companyId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
  });
}

export function useNotices() {
  return useQuery({
    queryKey: ['notices'],
    queryFn: () => api.getNotices(),
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notice: Omit<PlacementNotice, 'id' | 'publishedAt'>) => api.createNotice(notice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['adminMetrics'],
    queryFn: () => api.getAdminMetrics(),
  });
}
