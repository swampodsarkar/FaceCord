import * as AgoraRTC from "agora-rtc-react";
import AgoraRTC_NG from "agora-rtc-sdk-ng";

// IMPORTANT: Agora requires an App ID to function. 
export const AGORA_APP_ID = "78e0fd577ac24263a2dcb2d9397c8bba";

// Initialize Agora Client
export const useAgoraClient = AgoraRTC.useRTCClient;
export const useAgoraContext = AgoraRTC.useRTCClient;

export const client = AgoraRTC_NG.createClient({ mode: "rtc", codec: "vp8" });
