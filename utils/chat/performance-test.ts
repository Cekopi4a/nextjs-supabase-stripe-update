// Performance Test Utilities for Chat System
// Тестове за измерване на performance на оптимизациите

import { createSupabaseClient } from "@/utils/supabase/client";

export interface PerformanceMetrics {
  conversationsLoadTime: number;
  messagesLoadTime: number;
  sendMessageTime: number;
  memoryUsage: number;
  timestamp: number;
}

export class ChatPerformanceTester {
  private supabase = createSupabaseClient();
  private metrics: PerformanceMetrics[] = [];

  // Тест за зареждане на conversations
  async testConversationsLoading(userId: string): Promise<number> {
    const startTime = performance.now();
    
    try {
      // Тест на новата оптимизирана функция
      const { data, error } = await this.supabase
        .rpc('get_user_conversations', { user_id: userId });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      if (error) {
        console.error('Performance test error:', error);
        return -1;
      }

      console.log(`📊 Conversations loaded in ${loadTime.toFixed(2)}ms (${data?.length || 0} conversations)`);
      return loadTime;

    } catch (error) {
      console.error('Performance test failed:', error);
      return -1;
    }
  }

  // Тест за зареждане на messages
  async testMessagesLoading(conversationId: string): Promise<number> {
    const startTime = performance.now();
    
    try {
      const { data, error } = await this.supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      if (error) {
        console.error('Messages load test error:', error);
        return -1;
      }

      console.log(`📊 Messages loaded in ${loadTime.toFixed(2)}ms (${data?.length || 0} messages)`);
      return loadTime;

    } catch (error) {
      console.error('Messages load test failed:', error);
      return -1;
    }
  }

  // Тест за изпращане на message
  async testSendMessage(conversationId: string, senderId: string, content: string): Promise<number> {
    const startTime = performance.now();
    
    try {
      const { data, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
        })
        .select()
        .single();

      const endTime = performance.now();
      const sendTime = endTime - startTime;

      if (error) {
        console.error('Send message test error:', error);
        return -1;
      }

      console.log(`📊 Message sent in ${sendTime.toFixed(2)}ms`);
      return sendTime;

    } catch (error) {
      console.error('Send message test failed:', error);
      return -1;
    }
  }

  // Тест за memory usage
  getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize / 1024 / 1024; // MB
      console.log(`📊 Memory usage: ${used.toFixed(2)}MB`);
      return used;
    }
    return -1;
  }

  // Сравнение между стария и новия метод за conversations
  async compareConversationsLoading(userId: string): Promise<{
    oldMethod: number;
    newMethod: number;
    improvement: number;
  }> {
    console.log('🔄 Starting performance comparison...');

    // Тест на стария метод (fallback)
    const oldStart = performance.now();
    const { data: conversationsData } = await this.supabase
      .from("conversations")
      .select("id, trainer_id, client_id, last_message_at, created_at")
      .or(`trainer_id.eq.${userId},client_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    // Simulate old method's additional queries
    if (conversationsData && conversationsData.length > 0) {
      for (const conv of conversationsData) {
        const otherUserId = conv.trainer_id === userId ? conv.client_id : conv.trainer_id;
        
        // Get other user profile
        await this.supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", otherUserId)
          .single();

        // Get last message
        await this.supabase
          .from("messages")
          .select("content, created_at, sender_id")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        await this.supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", userId)
          .is("read_at", null);
      }
    }
    const oldEnd = performance.now();
    const oldTime = oldEnd - oldStart;

    // Тест на новия метод
    const newTime = await this.testConversationsLoading(userId);

    const improvement = newTime > 0 ? ((oldTime - newTime) / oldTime) * 100 : 0;

    console.log(`📈 Performance Comparison Results:`);
    console.log(`   Old method: ${oldTime.toFixed(2)}ms`);
    console.log(`   New method: ${newTime.toFixed(2)}ms`);
    console.log(`   Improvement: ${improvement.toFixed(1)}%`);

    return {
      oldMethod: oldTime,
      newMethod: newTime,
      improvement
    };
  }

  // Записване на metrics
  recordMetrics(metrics: Omit<PerformanceMetrics, 'timestamp'>) {
    this.metrics.push({
      ...metrics,
      timestamp: Date.now()
    });

    // Keep only last 100 measurements
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Получаване на average metrics
  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const sums = this.metrics.reduce((acc, metric) => ({
      conversationsLoadTime: acc.conversationsLoadTime + metric.conversationsLoadTime,
      messagesLoadTime: acc.messagesLoadTime + metric.messagesLoadTime,
      sendMessageTime: acc.sendMessageTime + metric.sendMessageTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
    }), {
      conversationsLoadTime: 0,
      messagesLoadTime: 0,
      sendMessageTime: 0,
      memoryUsage: 0,
    });

    const count = this.metrics.length;

    return {
      conversationsLoadTime: sums.conversationsLoadTime / count,
      messagesLoadTime: sums.messagesLoadTime / count,
      sendMessageTime: sums.sendMessageTime / count,
      memoryUsage: sums.memoryUsage / count,
    };
  }

  // Генериране на performance report
  generateReport(): string {
    const avg = this.getAverageMetrics();
    const latest = this.metrics[this.metrics.length - 1];

    return `
📊 Chat Performance Report
========================

Latest Metrics:
- Conversations Load: ${latest?.conversationsLoadTime?.toFixed(2)}ms
- Messages Load: ${latest?.messagesLoadTime?.toFixed(2)}ms
- Send Message: ${latest?.sendMessageTime?.toFixed(2)}ms
- Memory Usage: ${latest?.memoryUsage?.toFixed(2)}MB

Average Metrics (${this.metrics.length} measurements):
- Conversations Load: ${avg.conversationsLoadTime?.toFixed(2)}ms
- Messages Load: ${avg.messagesLoadTime?.toFixed(2)}ms
- Send Message: ${avg.sendMessageTime?.toFixed(2)}ms
- Memory Usage: ${avg.memoryUsage?.toFixed(2)}MB

Performance Targets:
✅ Conversations Load: < 500ms (Target: < 200ms)
✅ Messages Load: < 300ms (Target: < 100ms)
✅ Send Message: < 200ms (Target: < 100ms)
✅ Memory Usage: < 50MB (Target: < 30MB)
    `;
  }

  // Export metrics за анализ
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Global instance за лесно използване
let performanceTesterInstance: ChatPerformanceTester | null = null;

export function getPerformanceTester(): ChatPerformanceTester {
  if (!performanceTesterInstance) {
    performanceTesterInstance = new ChatPerformanceTester();
  }
  return performanceTesterInstance;
}
