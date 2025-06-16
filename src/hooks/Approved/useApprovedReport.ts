import { BackendRoutes } from '@/config/apiRoutes';
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useUser } from '../useUser';

interface ApprovedReportParams {
  reportID: string;
  isApproved: boolean;
}

interface ApprovedResponse {
  success: boolean;
  message: string;
}

const useApprovedReport = (): UseMutationResult<ApprovedResponse, AxiosError, ApprovedReportParams> => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ reportID, isApproved }: ApprovedReportParams) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const response = await axios.post<ApprovedResponse>(
          `${BackendRoutes.APPROVED_REPORT}/${reportID}`,
          {
            Approved: isApproved
          },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "ngrok-skip-browser-warning": "true"
            }
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