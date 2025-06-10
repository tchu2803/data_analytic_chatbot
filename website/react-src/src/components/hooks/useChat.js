import { useEffect, useState, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { api } from '../services/api';

export default function useChat(conversation_id, user) {
  const [messages, setMessages] = useState([]);
  const echoRef = useRef(null);

  useEffect(() => {
    if (!conversation_id) return;

    let channel;

    const setupPusher = async () => {
      const token = user?.token || localStorage.getItem('token');
      const { ok, data } = await api.getPusherConfig(token);
      if (!ok || !data) return;

      const echo = new Echo({
        broadcaster: 'pusher',
        key: data.key,
        cluster: data.cluster,
        forceTLS: true,
        disableStats: true,
        encrypted: true,
        authEndpoint: 'http://localhost:8000/broadcasting/auth',
        auth: {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      });

      echoRef.current = echo;

      // Dùng private channel vì backend dùng PrivateChannel
      channel = echo.private(`chat.${conversation_id}`);

      channel.listen('.message-sent', (e) => {
        const msg = e.message;
        if (!msg || !msg.content) return;

        setMessages(prev => [...prev, msg]);
      });

      console.log('📡 Connected to private chat channel:', `chat.${conversation_id}`);
    };

    setupPusher();

    return () => {
      if (echoRef.current) {
        echoRef.current.leave(`chat.${conversation_id}`);
        echoRef.current.disconnect();
        echoRef.current = null;
      }
      console.log('❌ Disconnected from chat channel:', `chat.${conversation_id}`);
    };
  }, [conversation_id]);

  return { messages, setMessages };
}
