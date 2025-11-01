import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { nlpApi } from '../../services/nlpApi';
import { ChatbotMessage, ChatbotResponse } from '../../types/nlp';
import './HealthChatbot.css';

interface HealthChatbotProps {
  userId: string;
  onEmergencyDetected?: (response: ChatbotResponse) => void;
}

const HealthChatbot: React.FC<HealthChatbotProps> = ({
  userId,
  onEmergencyDetected
}) => {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize conversation with welcome message
    initializeConversation();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    try {
      const conversation = await nlpApi.startChatbotConversation(userId);
      setConversationId(conversation.conversationId);
      
      // Add welcome message
      const welcomeMessage: ChatbotMessage = {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your health assistant. I can help you understand symptoms, provide general health information, and answer questions about your health. Please note that I cannot provide medical diagnoses or replace professional medical advice. How can I help you today?",
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    } catch (err) {
      setError('Failed to initialize chatbot');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatbotMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await nlpApi.processChatbotQuery(
        userId,
        inputMessage,
        conversationHistory
      );

      const assistantMessage: ChatbotMessage = {
        id: response.id,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp),
        metadata: {
          intent: response.intent,
          confidence: response.confidence,
          suggestedActions: response.suggestedActions
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle emergency detection
      if (response.requiresHumanReview) {
        onEmergencyDetected?.(response);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      const errorMessage: ChatbotMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact your healthcare provider if this is urgent.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case 'emergency':
        return <AlertTriangle className="intent-icon emergency" />;
      case 'symptom_inquiry':
        return <Clock className="intent-icon symptom" />;
      case 'medication_inquiry':
        return <CheckCircle className="intent-icon medication" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return '';
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  return (
    <div className="health-chatbot">
      <div className="chatbot-header">
        <div className="header-content">
          <MessageCircle className="header-icon" />
          <div>
            <h3>Health Assistant</h3>
            <p>AI-powered health information and support</p>
          </div>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? (
                <User className="avatar-icon" />
              ) : (
                <Bot className="avatar-icon" />
              )}
            </div>
            
            <div className="message-content">
              <div className="message-bubble">
                <p>{message.content}</p>
                
                {message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
                  <div className="suggested-actions">
                    <h5>Suggested Actions:</h5>
                    <ul>
                      {message.metadata.suggestedActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="message-meta">
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                
                {message.metadata?.intent && (
                  <div className="message-intent">
                    {getIntentIcon(message.metadata.intent)}
                    <span>{message.metadata.intent.replace('_', ' ')}</span>
                  </div>
                )}
                
                {message.metadata?.confidence && (
                  <div className={`confidence-indicator ${getConfidenceColor(message.metadata.confidence)}`}>
                    {(message.metadata.confidence * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">
              <Bot className="avatar-icon" />
            </div>
            <div className="message-content">
              <div className="message-bubble typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chatbot-error">
          <AlertTriangle className="error-icon" />
          {error}
        </div>
      )}

      <div className="chatbot-input">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your health, symptoms, or general health questions..."
            className="message-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            <Send className="send-icon" />
          </button>
        </div>
        
        <div className="input-disclaimer">
          <p>
            This chatbot provides general health information only and cannot replace professional medical advice.
            For emergencies, contact emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthChatbot;