import { BackendRoutes } from '@/config/apiRoutes';
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useUser } from '../useUser';

interface ApprovedQuizParams {
  quizID: string;
  isApproved: boolean;
}

interface ApprovedResponse {
  success: boolean;
  message: string;
}

const useApprovedQuiz = (): UseMutationResult<ApprovedResponse, AxiosError, ApprovedQuizParams> => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ quizID, isApproved }: ApprovedQuizParams) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const response = await axios.post<ApprovedResponse>(
          `${BackendRoutes.APPROVED_QUIZ}/${quizID}`,
          {
            Approved: isApproved
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
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['approved'] });
    }
  });
};

export default useApprovedQuiz;
