"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";

export default function WaitingRoom() {
  const router = useRouter();

  // =========================
  // STORE
  // =========================
  const setDevices = useInterviewStore((state) => state.setDevices);
  const jdDescription = useInterviewStore((state) => state.jdDescription);
  const jobPosition = useInterviewStore((state) => state.jobPosition);
  const company = useInterviewStore((state) => state.Company);
  const cvFile = useInterviewStore((state) => state.cvFile);

  // =========================
  // DERIVE STATE (NO useState)
  // =========================
  const isAuthorized =
    !!cvFile && !!jobPosition && !!company && !!jdDescription;

  // =========================
  // REDIRECT
  // =========================
  useEffect(() => {
    if (!isAuthorized) {
      router.replace("/interview/upload-cv");
    }
  }, [isAuthorized, router]);

  // =========================
  // DEVICES STATE
  // =========================
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // =========================
  // INIT DEVICES (FIX WARNING)
  // =========================
  useEffect(() => {
    if (!isAuthorized) return;

    let mounted = true;

    const initDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        if (!mounted) return;

        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        const audioInputs = devices.filter((d) => d.kind === "audioinput");

        setVideoDevices(videoInputs);
        setAudioDevices(audioInputs);

        if (videoInputs.length > 0) {
          setSelectedCamera((prev) => prev || videoInputs[0].deviceId);
        }

        if (audioInputs.length > 0) {
          setSelectedMic((prev) => prev || audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Lỗi lấy thiết bị:", err);
      }
    };

    initDevices();

    navigator.mediaDevices.ondevicechange = initDevices;

    return () => {
      mounted = false;
      navigator.mediaDevices.ondevicechange = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isAuthorized]);

  // =========================
  // START STREAM
  // =========================
  useEffect(() => {
    if (!isAuthorized) return;
    if (!selectedCamera && !selectedMic) return;

    let active = true;

    const startStream = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedCamera
            ? { deviceId: { exact: selectedCamera } }
            : true,
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
        });

        if (!active) return;

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Không truy cập được camera/mic:", err);
      }
    };

    startStream();

    return () => {
      active = false;
    };
  }, [selectedCamera, selectedMic, isAuthorized]);

  // =========================
  // ACTION
  // =========================
  const handleEnterInterview = () => {
    setDevices(selectedMic, selectedCamera);
    router.push("/interview");
  };

  // =========================
  // LOADING
  // =========================
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          Đang chuẩn bị phòng phỏng vấn...
        </p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* CAMERA */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
        </div>

        {/* SETTINGS */}
        <div className="flex flex-col gap-4">
          <select
            className="bg-card border border-border rounded-xl p-3"
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
          >
            {videoDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Camera"}
              </option>
            ))}
          </select>

          <select
            className="bg-card border border-border rounded-xl p-3"
            value={selectedMic}
            onChange={(e) => setSelectedMic(e.target.value)}
          >
            {audioDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Microphone"}
              </option>
            ))}
          </select>

          <button
            onClick={handleEnterInterview}
            className="mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition"
          >
            Vào phòng phỏng vấn
          </button>
        </div>
      </div>
    </div>
  );
}
