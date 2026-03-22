/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface RemoteUser {
  uid: number | string;
  videoTrack?: any;
  audioTrack?: any;
  hasVideo: boolean;
  hasAudio: boolean;
}

export interface AgoraState {
  joined: boolean;
  localVideoTrack: any;
  localAudioTrack: any;
  remoteUsers: RemoteUser[];
  isVideoMuted: boolean;
  isAudioMuted: boolean;
  join: (appId: string, channel: string, token: string | null, uid?: number) => Promise<void>;
  leave: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleAudio: () => Promise<void>;
}

export function useAgora(): AgoraState {
  const clientRef = useRef<any>(null);
  const [joined, setJoined] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.leave().catch(() => {});
      }
    };
  }, []);

  const join = useCallback(
    async (appId: string, channel: string, token: string | null, uid?: number) => {
      appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
      channel = process.env.NEXT_PUBLIC_AGORA_CHANNEL_NAME || "";
      token = process.env.NEXT_PUBLIC_AGORA_TOKEN || "";

      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (user: any, mediaType: "audio" | "video") => {
        await client.subscribe(user, mediaType);
        setRemoteUsers((prev) => {
          const existing = prev.find((u) => u.uid === user.uid);
          if (existing) {
            return prev.map((u) =>
              u.uid === user.uid
                ? {
                    ...u,
                    videoTrack: mediaType === "video" ? user.videoTrack : u.videoTrack,
                    audioTrack: mediaType === "audio" ? user.audioTrack : u.audioTrack,
                    hasVideo: mediaType === "video" ? true : u.hasVideo,
                    hasAudio: mediaType === "audio" ? true : u.hasAudio,
                  }
                : u
            );
          }
          return [
            ...prev,
            {
              uid: user.uid,
              videoTrack: mediaType === "video" ? user.videoTrack : undefined,
              audioTrack: mediaType === "audio" ? user.audioTrack : undefined,
              hasVideo: mediaType === "video",
              hasAudio: mediaType === "audio",
            },
          ];
        });

        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
      });

      client.on("user-unpublished", (user: any, mediaType: "audio" | "video") => {
        setRemoteUsers((prev) =>
          prev.map((u) =>
            u.uid === user.uid
              ? {
                  ...u,
                  videoTrack: mediaType === "video" ? undefined : u.videoTrack,
                  audioTrack: mediaType === "audio" ? undefined : u.audioTrack,
                  hasVideo: mediaType === "video" ? false : u.hasVideo,
                  hasAudio: mediaType === "audio" ? false : u.hasAudio,
                }
              : u
          )
        );
      });

      client.on("user-left", (user: any) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      await client.join(appId, channel, token, uid || null);

      const [videoTrack, audioTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      await client.publish([videoTrack, audioTrack]);
      setJoined(true);
    },
    []
  );

  const leave = useCallback(async () => {
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (clientRef.current) {
      await clientRef.current.leave();
    }
    setJoined(false);
    setLocalVideoTrack(null);
    setLocalAudioTrack(null);
    setRemoteUsers([]);
    setIsVideoMuted(false);
    setIsAudioMuted(false);
  }, [localVideoTrack, localAudioTrack]);

  const toggleVideo = useCallback(async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  }, [localVideoTrack, isVideoMuted]);

  const toggleAudio = useCallback(async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  }, [localAudioTrack, isAudioMuted]);

  return {
    joined,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    isVideoMuted,
    isAudioMuted,
    join,
    leave,
    toggleVideo,
    toggleAudio,
  };
}