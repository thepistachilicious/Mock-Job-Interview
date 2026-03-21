import axiosInstance from './axios';

export interface AgoraTokenResponse {
  token: string;
  channel_name: string; // backend field name
  app_id: string;
  uid: number;
  expire_seconds: number;
}

export const fetchAgoraToken = async (sessionId: string): Promise<AgoraTokenResponse> => {
  // Backend requires the JWT as a query param (in addition to the Bearer header)
  const jwt =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const { data } = await axiosInstance.post<AgoraTokenResponse>(
    `/api/v1/voice/${sessionId}/agora-token`,
    {},
    { params: { token: jwt ?? '' } },
  );

  return data;
};
