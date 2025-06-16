import { BackendRoutes } from '@/config/apiRoutes';
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useUser } from '../useUser';

interface ApprovedKeywordParams {
  keywordID: string;
  isApproved: boolean;
}

interface ApprovedResponse {
  success: boolean;
  message: string;
}

const useApprovedKeyword = (): UseMutationResult<ApprovedResponse, AxiosError, ApprovedKeywordParams> => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ keywordID, isApproved }: ApprovedKeywordParams) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const response = await axios.post<ApprovedResponse>(
          `${BackendRoutes.APPROVED_KEYWORD}/${keywordID}`,
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
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      queryClient.invalidateQueries({ queryKey: ['approved'] });
    }
  });
};

export default useApprovedKeyword;
