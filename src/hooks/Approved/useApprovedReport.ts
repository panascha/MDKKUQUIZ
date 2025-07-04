import { BackendRoutes } from '@/config/apiRoutes';
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useUser } from '../useUser';

interface ApprovedReportParams {
  reportID: string;
  isApproved: boolean;
  reason: string;
}

interface ApprovedResponse {
  success: boolean;
  message: string;
}

const useApprovedReport = (): UseMutationResult<ApprovedResponse, AxiosError, ApprovedReportParams> => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ reportID, isApproved, reason }: ApprovedReportParams) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const response = await axios.post<ApprovedResponse>(
          `${BackendRoutes.APPROVED_REPORT}/${reportID}`,
          {
            Approved: isApproved,
            reason: reason,
          },
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          throw error;
        }
        throw new Error('An unexpected error occurred');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['approved'] });
    }
  });
};

export default useApprovedReport;