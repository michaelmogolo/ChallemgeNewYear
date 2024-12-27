<template>
  <div class="chatbot">
    <div class="chat-window">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <div :class="msg.sender === 'user' ? 'user' : 'bot'">
          {{ msg.text }}
        </div>
      </div>
    </div>
    <input
      type="text"
      v-model="userMessage"
      @keyup.enter="sendMessage"
      placeholder="Posez une question..."
    />
    <button @click="sendMessage">Envoyer</button>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const userMessage = ref('');
    const messages = ref<{ sender: string; text: string }[]>([]);

    const sendMessage = async () => {
      if (!userMessage.value.trim()) return;

      // Ajouter le message de l'utilisateur
      messages.value.push({ sender: 'user', text: userMessage.value });

      // Envoyer la requête au backend
      try {
        const response = await axios.post('/api/chat', {
          message: userMessage.value,
        });
        messages.value.push({ sender: 'bot', text: response.data.message });
      } catch {
        messages.value.push({
          sender: 'bot',
          text: "Une erreur est survenue. Réessayez plus tard.",
        });
      }

      userMessage.value = '';
    };

    return {
      userMessage,
      messages,
      sendMessage,
    };
  },
};
</script>

<style>
.chatbot {
  width: 400px;
  margin: auto;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
}
.chat-window {
  height: 300px;
  overflow-y: scroll;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  padding: 10px;
}
.message {
  margin-bottom: 10px;
}
.user {
  text-align: right;
  color: blue;
}
.bot {
  text-align: left;
  color: green;
}
</style>
