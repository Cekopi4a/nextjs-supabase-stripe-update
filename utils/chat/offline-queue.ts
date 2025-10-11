// Offline Message Queue System
// Запазва съобщения когато потребителят е offline и ги изпраща при reconnect

import { createSupabaseClient } from "@/utils/supabase/client";

export interface QueuedMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  timestamp: number;
  retry_count: number;
  max_retries: number;
}

export class OfflineMessageQueue {
  private queue: QueuedMessage[] = [];
  private isProcessing = false;
  private supabase = createSupabaseClient();
  private onMessageSent?: (message: QueuedMessage) => void;
  private onMessageFailed?: (message: QueuedMessage, error: Error) => void;

  constructor(
    onMessageSent?: (message: QueuedMessage) => void,
    onMessageFailed?: (message: QueuedMessage, error: Error) => void
  ) {
    this.onMessageSent = onMessageSent;
    this.onMessageFailed = onMessageFailed;
    
    // Load existing queue from localStorage
    this.loadFromStorage();
    
    // Listen for online/offline events
    this.setupEventListeners();
    
    // Process queue when online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  // Добавяне на съобщение в queue
  async queueMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<string> {
    const messageId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedMessage: QueuedMessage = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      timestamp: Date.now(),
      retry_count: 0,
      max_retries: 3,
    };

    this.queue.push(queuedMessage);
    this.saveToStorage();

    // Ако сме online, опитай да изпратиш веднага
    if (navigator.onLine && !this.isProcessing) {
      this.processQueue();
    }

    return messageId;
  }

  // Изпращане на съобщение директно (без queue)
  async sendMessageDirectly(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Обработване на queue
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 Processing offline queue: ${this.queue.length} messages`);

    while (this.queue.length > 0 && navigator.onLine) {
      const message = this.queue[0];
      
      try {
        // Опитай да изпратиш съобщението
        const sentMessage = await this.sendMessageDirectly(
          message.conversation_id,
          message.sender_id,
          message.content
        );

        // Успешно изпратено - премахни от queue
        this.queue.shift();
        this.saveToStorage();
        
        // Уведоми за успешно изпращане
        if (this.onMessageSent) {
          this.onMessageSent(message);
        }

        console.log(`✅ Offline message sent: ${message.id}`);

      } catch (error) {
        console.error(`❌ Failed to send offline message: ${message.id}`, error);
        
        // Увеличи retry count
        message.retry_count++;
        
        if (message.retry_count >= message.max_retries) {
          // Премахни от queue ако е достигнал max retries
          this.queue.shift();
          this.saveToStorage();
          
          // Уведоми за неуспешно изпращане
          if (this.onMessageFailed) {
            this.onMessageFailed(message, error as Error);
          }
          
          console.error(`💀 Message permanently failed: ${message.id}`);
        } else {
          // Опитай следващото съобщение
          this.queue.shift();
          this.queue.push(message); // Добави в края на queue
          this.saveToStorage();
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    this.isProcessing = false;
    console.log(`🏁 Finished processing queue. Remaining: ${this.queue.length}`);
  }

  // Event listeners за online/offline
  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Back online - processing queue');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline');
    });
  }

  // Запазване в localStorage
  private saveToStorage() {
    try {
      localStorage.setItem('chat-offline-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue to localStorage:', error);
    }
  }

  // Зареждане от localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('chat-offline-queue');
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`📦 Loaded ${this.queue.length} offline messages`);
      }
    } catch (error) {
      console.error('Failed to load offline queue from localStorage:', error);
      this.queue = [];
    }
  }

  // Публични методи
  getQueueLength(): number {
    return this.queue.length;
  }

  getQueue(): QueuedMessage[] {
    return [...this.queue];
  }

  clearQueue(): void {
    this.queue = [];
    this.saveToStorage();
  }

  // Cleanup стари съобщения (по-стари от 24 часа)
  cleanupOldMessages(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.queue = this.queue.filter(msg => msg.timestamp > oneDayAgo);
    this.saveToStorage();
  }

  // Destroy instance
  destroy(): void {
    window.removeEventListener('online', this.processQueue);
    window.removeEventListener('offline', () => {});
  }
}

// Singleton instance
let offlineQueueInstance: OfflineMessageQueue | null = null;

export function getOfflineQueue(): OfflineMessageQueue {
  if (!offlineQueueInstance) {
    offlineQueueInstance = new OfflineMessageQueue();
  }
  return offlineQueueInstance;
}

export function destroyOfflineQueue(): void {
  if (offlineQueueInstance) {
    offlineQueueInstance.destroy();
    offlineQueueInstance = null;
  }
}
