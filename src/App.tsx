import React, { useEffect, useState } from "react";
import "./App.css";
import { RetellWebClient } from "retell-client-js-sdk";
import { useSearchParams } from "react-router-dom";

const agentId = process.env.REACT_APP_AGENT;
const backendUrl = process.env.REACT_APP_BACKEND_URL;
interface RegisterCallResponse {
  callId?: string;
  sampleRate: number;
}

const webClient = new RetellWebClient();

const App = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams(); // Hook to access search parameters
  const meetingId = searchParams.get("meetingId");

  // Initialize the SDK
  useEffect(() => {
    // Setup event listeners
    webClient.on("conversationStarted", () => {});

    webClient.on("audio", (audio: Uint8Array) => {});

    webClient.on("conversationEnded", ({ code, reason }) => {
      setIsCalling(false); // Update button to "Start" when conversation ends
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false); // Update button to "Start" in case of error
    });

    webClient.on("update", (update) => {
      // Print live transcript as needed
    });
  }, []);

  const toggleConversation = async () => {
    if (isCalling) {
      webClient.stopConversation();
    } else {
      const registerCallResponse = await registerCall(agentId || "");
      if (registerCallResponse.callId) {
        webClient
          .startConversation({
            callId: registerCallResponse.callId,
            sampleRate: registerCallResponse.sampleRate,
            enableUpdate: true,
          })
          .catch(console.error);
        setIsCalling(true); // Update button to "Stop" when conversation starts
      }
    }
  };

  async function registerCall(agentId: string): Promise<RegisterCallResponse> {
    try {
      // Replace with your server url
      const response = await fetch(
        `${backendUrl}/register-call-on-your-server`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentId: agentId,
            meetingId: meetingId || "0",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: RegisterCallResponse = await response.json();
      return data;
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={toggleConversation} id="startHeidy">
          {isCalling ? "Stop" : "Start"}
        </button>
      </header>
    </div>
  );
};

export default App;
