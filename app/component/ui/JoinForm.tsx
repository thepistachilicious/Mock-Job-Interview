/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import styles from "./JoinForm.module.css";

interface JoinFormProps {
  onJoin: (appId: string, channel: string, token: string | null, uid?: number) => Promise<void>;
}

export default function JoinForm({ onJoin }: JoinFormProps) {
  const [appId, setAppId] = useState(process.env.NEXT_PUBLIC_AGORA_APP_ID || "");
  const [channel, setChannel] = useState("ai-call");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!appId.trim()) return setError("Agora App ID is required");
    if (!channel.trim()) return setError("Channel name is required");

    setError("");
    setLoading(true);
    try {
      await onJoin(appId.trim(), channel.trim(), token.trim() || null);
    } catch (err: any) {
      setError(err.message || "Failed to join. Check your App ID and channel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.card}>
        <div className={styles.logoRow}>
          <span className={styles.logoMark}>◈</span>
          <span className={styles.logoText}>AuraCall</span>
        </div>

        <p className={styles.tagline}>AI-powered video with voice intelligence</p>

        <div className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Agora App ID</span>
            <input
              className={styles.input}
              type="text"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              spellCheck={false}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Channel Name</span>
            <input
              className={styles.input}
              type="text"
              placeholder="ai-call"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              Token <span className={styles.optional}>(optional)</span>
            </span>
            <input
              className={styles.input}
              type="text"
              placeholder="Leave blank for testing mode"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              spellCheck={false}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={`${styles.joinBtn} ${loading ? styles.loading : ""}`}
            onClick={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Joining…
              </>
            ) : (
              <>
                <span>Start Call</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        <p className={styles.hint}>
          Speech → Backend → AI → Voice pipeline powered by Web Speech API
        </p>
      </div>
    </div>
  );
}