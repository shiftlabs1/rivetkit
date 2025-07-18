import { createClient } from "@rivetkit/actor/client";
import { createReactRivetKit } from "@rivetkit/react";
import { useEffect, useState } from "react";
import type { Registry } from "../actors/registry";
import type { Message } from "./actor";

const client = createClient<Registry>("http://localhost:8080");
const { useActor, useActorEvent } = createReactRivetKit(client);

export function ChatRoom({ roomId = "general" }) {
	// Connect to specific chat room using tags
	const [{ actor }] = useActor("chatRoom", {
		tags: { roomId },
	});

	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");

	// Load initial state
	useEffect(() => {
		if (actor) {
			// Load chat history
			actor.getHistory().then(setMessages);
		}
	}, [actor]);

	// Listen for real-time updates from the server
	useActorEvent({ actor, event: "newMessage" }, (message) => {
		setMessages((prev) => [...prev, message]);
	});

	const sendMessage = () => {
		if (actor && input.trim()) {
			actor.sendMessage("User", input);
			setInput("");
		}
	};

	return (
		<div className="chat-container">
			<div className="room-header">
				<h3>Chat Room: {roomId}</h3>
			</div>

			<div className="messages">
				{messages.length === 0 ? (
					<div className="empty-message">
						No messages yet. Start the conversation!
					</div>
				) : (
					messages.map((msg, i) => (
						<div key={i} className="message">
							<b>{msg.sender}:</b> {msg.text}
							<span className="timestamp">
								{new Date(msg.timestamp).toLocaleTimeString()}
							</span>
						</div>
					))
				)}
			</div>

			<div className="input-area">
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyPress={(e) => e.key === "Enter" && sendMessage()}
					placeholder="Type a message..."
				/>
				<button onClick={sendMessage}>Send</button>
			</div>
		</div>
	);
}
