'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { fetchAgoraToken } from '@/api/agoraService';
import { useInterviewStore } from '@/store/useInterviewStore';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnecting';

export interface UseAgoraReturn {
  join: (sessionId: string) => Promise<void>;
  leave: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  connectionState: ConnectionState;
  micOn: boolean;
  camOn: boolean;
  error: string | null;
  localVideoRef: React.RefObject<HTMLDivElement | null>;
  remoteUsers: IAgoraRTCRemoteUser[];
}

export function useAgora(): UseAgoraReturn {
  const { micId, cameraId } = useInterviewStore();

  // Refs — survive renders, never trigger re-renders
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const videoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const joiningRef = useRef(false);  // guards against double-join
  const leavingRef = useRef(false);  // guards against double-leave
  const localVideoRef = useRef<HTMLDivElement>(null);

  // Mirror of connectionState as a ref — prevents stale closures in join/leave callbacks.
  // Without this, join/leave would need connectionState in their deps arrays,
  // making them recreate on every state change and causing effect re-runs.
  const connectionStateRef = useRef<ConnectionState>('idle');

  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Always update both the ref and state together
  const updateConnectionState = useCallback((s: ConnectionState) => {
    connectionStateRef.current = s;
    setConnectionState(s);
  }, []);

  // Single client instance — created once, reused across joins
  const getClient = useCallback((): IAgoraRTCClient => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    return clientRef.current;
  }, []);

  // ─── Track cleanup ─────────────────────────────────────────────────────────
  const stopTracks = useCallback(() => {
    audioTrackRef.current?.stop();
    audioTrackRef.current?.close();
    audioTrackRef.current = null;

    videoTrackRef.current?.stop();
    videoTrackRef.current?.close();
    videoTrackRef.current = null;
  }, []);

  // ─── Remote user event handlers ────────────────────────────────────────────
  const handleUserPublished = useCallback(
    async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      const client = clientRef.current;
      if (!client) return;

      await client.subscribe(user, mediaType);

      if (mediaType === 'video') {
        // Deduplicate by uid; component effect plays track once DOM ref is set
        setRemoteUsers((prev) => [...prev.filter((u) => u.uid !== user.uid), user]);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    },
    [],
  );

  const handleUserLeft = useCallback((user: IAgoraRTCRemoteUser) => {
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
  }, []);

  // Register listeners once per client instance
  useEffect(() => {
    const client = getClient();
    client.on('user-published', handleUserPublished);
    client.on('user-left', handleUserLeft);
    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-left', handleUserLeft);
    };
  }, [getClient, handleUserPublished, handleUserLeft]);

  // Hard cleanup on unmount (page navigation / tab close)
  useEffect(() => {
    return () => {
      stopTracks();
      clientRef.current?.leave().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Join ─────────────────────────────────────────────────────────────────
  // Stable callback: uses connectionStateRef instead of connectionState state,
  // so it is NOT recreated on every state change. This prevents the parent
  // useEffect (which has join as dep) from re-firing on every connection update.
  const join = useCallback(
    async (sessionId: string) => {
      // Guard: joiningRef prevents double-click / StrictMode double-invoke;
      // connectionStateRef.current avoids the stale closure problem
      if (joiningRef.current || connectionStateRef.current === 'connected') return;
      joiningRef.current = true;
      setError(null);
      updateConnectionState('connecting');

      try {
        const tokenData = await fetchAgoraToken(sessionId);
        const appId = tokenData.app_id || process.env.NEXT_PUBLIC_AGORA_APP_ID || '';

        console.debug('[Agora] joining channel:', tokenData.channel_name, '| uid:', tokenData.uid);

        const client = getClient();

        // MUST await client.join() before any publish — Agora requirement
        await client.join(appId, tokenData.channel_name, tokenData.token, tokenData.uid ?? 0);

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { microphoneId: micId || undefined },
          { cameraId: cameraId || undefined },
        );

        audioTrackRef.current = audioTrack;
        videoTrackRef.current = videoTrack;

        // Play local preview — DOM container is muted to avoid echo
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        await client.publish([audioTrack, videoTrack]);
        updateConnectionState('connected');
      } catch (err) {
        console.error('[Agora] join failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to join channel');
        stopTracks();
        await clientRef.current?.leave().catch(() => {});
        updateConnectionState('idle');
      } finally {
        joiningRef.current = false;
      }
    },
    // connectionState intentionally NOT in deps — use connectionStateRef instead
    [micId, cameraId, getClient, stopTracks, updateConnectionState],
  );

  // ─── Leave ────────────────────────────────────────────────────────────────
  // Stable callback: uses connectionStateRef + leavingRef for guards
  const leave = useCallback(async () => {
    if (leavingRef.current || connectionStateRef.current !== 'connected') return;
    leavingRef.current = true;
    updateConnectionState('disconnecting');

    try {
      if (clientRef.current) {
        await clientRef.current.unpublish().catch(() => {});
        await clientRef.current.leave().catch(() => {});
      }
      stopTracks();
      setRemoteUsers([]);
      setMicOn(true);
      setCamOn(true);
      updateConnectionState('idle');
    } catch (err) {
      console.error('[Agora] leave failed:', err);
      updateConnectionState('idle');
    } finally {
      leavingRef.current = false;
    }
  }, [stopTracks, updateConnectionState]);

  // ─── Mic / Camera toggles ─────────────────────────────────────────────────
  const toggleMic = useCallback(async () => {
    if (!audioTrackRef.current) return;
    const next = !micOn;
    await audioTrackRef.current.setEnabled(next);
    setMicOn(next);
  }, [micOn]);

  const toggleCamera = useCallback(async () => {
    if (!videoTrackRef.current) return;
    const next = !camOn;
    await videoTrackRef.current.setEnabled(next);
    setCamOn(next);
  }, [camOn]);

  return {
    join,
    leave,
    toggleMic,
    toggleCamera,
    connectionState,
    micOn,
    camOn,
    error,
    localVideoRef,
    remoteUsers,
  };
}
