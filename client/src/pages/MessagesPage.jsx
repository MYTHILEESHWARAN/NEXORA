import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiSearch, HiPaperAirplane, HiArrowLeft, HiTrash, HiChat } from 'react-icons/hi';
import Avatar from '../components/common/Avatar.jsx';
import { MessageSkeleton } from '../components/common/Skeleton.jsx';
import { messageAPI, userAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { timeAgo, formatTime } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messageAPI.getConversations().then(({ data }) => {
      setConversations(data.conversations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (userId && !selectedConv) {
      userAPI.getUser(userId).then(({ data }) => {
        setSelectedConv({ otherUser: data.user });
        loadMessages(userId);
      }).catch(() => {});
    }
  }, [userId]);

  const loadMessages = useCallback(async (uid) => {
    setMessagesLoading(true);
    try {
      const { data } = await messageAPI.getMessages(uid);
      setMessages(data.messages || []);
    } finally { setMessagesLoading(false); }
  }, []);

  const selectConversation = (conv) => {
    setSelectedConv(conv);
    loadMessages(conv.otherUser._id);
    navigate('/messages/' + conv.otherUser._id, { replace: true });
    setConversations(prev => prev.map(c => c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c));
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg) => {
      const myId = currentUser._id;
      const otherId = selectedConv?.otherUser._id;
      if (selectedConv && (msg.sender._id === otherId || msg.sender._id === myId || msg.sender === otherId || msg.sender === myId)) {
        setMessages(prev => [...prev, msg]);
        socket.emit('messageRead', { senderId: msg.sender._id || msg.sender, conversationId: msg.conversationId });
      }
      setConversations(prev => {
        const existing = prev.find(c => c.conversationId === msg.conversationId);
        if (existing) {
          return prev.map(c => c.conversationId === msg.conversationId
            ? { ...c, lastMessage: { content: msg.content, sender: msg.sender._id || msg.sender, createdAt: msg.createdAt }, unreadCount: (msg.sender._id === myId || msg.sender === myId) ? c.unreadCount : c.unreadCount + 1 }
            : c);
        }
        return prev;
      });
    };
    const handleTyping = ({ senderId }) => { if (senderId === selectedConv?.otherUser._id) setTyping(true); };
    const handleStopTyping = ({ senderId }) => { if (senderId === selectedConv?.otherUser._id) setTyping(false); };
    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);
    socket.on('userStopTyping', handleStopTyping);
    return () => { socket.off('newMessage', handleNewMessage); socket.off('userTyping', handleTyping); socket.off('userStopTyping', handleStopTyping); };
  }, [socket, selectedConv, currentUser]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socket && selectedConv) {
      socket.emit('typing', { receiverId: selectedConv.otherUser._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => socket.emit('stopTyping', { receiverId: selectedConv.otherUser._id }), 1500);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !selectedConv) return;
    setSending(true);
    const content = input.trim();
    setInput('');
    try {
      const { data } = await messageAPI.sendMessage(selectedConv.otherUser._id, content);
      setMessages(prev => [...prev, data.message]);
      socket?.emit('stopTyping', { receiverId: selectedConv.otherUser._id });
    } catch { toast.error('Failed to send message'); setInput(content); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleDeleteMessage = async (msgId) => {
    try {
      await messageAPI.deleteMessage(msgId);
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, deleted: true, content: 'This message was deleted' } : m));
    } catch { toast.error('Failed to delete message'); }
  };

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try { const { data } = await userAPI.searchUsers(searchQuery); setSearchResults(data.users || []); }
      catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  return (
    <div className='flex h-screen overflow-hidden bg-gray-50 dark:bg-nexora-dark'>
      <div className={'w-full md:w-80 flex-shrink-0 border-r border-gray-100 dark:border-nexora-border bg-white dark:bg-nexora-card flex flex-col ' + (selectedConv ? 'hidden md:flex' : 'flex')}>
        <div className='p-4 border-b border-gray-100 dark:border-nexora-border'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-3'>Messages</h2>
          <div className='relative'>
            <HiSearch className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input type='text' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder='Search or start new chat...' className='input-field pl-9 py-2 text-sm' />
          </div>
        </div>
        <div className='flex-1 overflow-y-auto'>
          {searchQuery ? (
            searchResults.length > 0 ? searchResults.map(u => (
              <button key={u._id} onClick={() => { selectConversation({ otherUser: u }); setSearchQuery(''); }}
                className='w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
                <Avatar user={u} size='md' showOnline isOnline={isUserOnline(u._id)} />
                <div className='text-left'><p className='font-semibold text-sm text-gray-900 dark:text-white'>{u.name}</p><p className='text-xs text-gray-500'>@{u.username}</p></div>
              </button>
            )) : <p className='p-4 text-center text-sm text-gray-400'>No users found</p>
          ) : loading ? Array(5).fill(0).map((_, i) => <MessageSkeleton key={i} />) : conversations.length === 0 ? (
            <div className='p-8 text-center'><HiChat className='w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3' /><p className='text-sm text-gray-400'>No conversations yet</p></div>
          ) : conversations.map(conv => (
            <button key={conv.conversationId} onClick={() => selectConversation(conv)}
              className={'w-full flex items-center gap-3 p-3 transition-colors ' + (selectedConv?.otherUser._id === conv.otherUser._id ? 'bg-primary-50 dark:bg-primary-950' : 'hover:bg-gray-50 dark:hover:bg-gray-800')}>
              <div className='relative flex-shrink-0'>
                <Avatar user={conv.otherUser} size='md' />
                {isUserOnline(conv.otherUser._id) && <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-nexora-card' />}
              </div>
              <div className='flex-1 min-w-0 text-left'>
                <div className='flex justify-between items-center'>
                  <p className='font-semibold text-sm text-gray-900 dark:text-white truncate'>{conv.otherUser.name}</p>
                  <span className='text-xs text-gray-400 flex-shrink-0'>{timeAgo(conv.lastMessage?.createdAt)}</span>
                </div>
                <p className={'text-xs truncate mt-0.5 ' + (conv.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400')}>
                  {conv.lastMessage?.sender === currentUser._id ? 'You: ' : ''}{conv.lastMessage?.content}
                </p>
              </div>
              {conv.unreadCount > 0 && <span className='badge flex-shrink-0'>{conv.unreadCount}</span>}
            </button>
          ))}
        </div>
      </div>

      {selectedConv ? (
        <div className='flex-1 flex flex-col min-w-0'>
          <div className='flex items-center gap-3 p-4 border-b border-gray-100 dark:border-nexora-border bg-white dark:bg-nexora-card'>
            <button onClick={() => { setSelectedConv(null); navigate('/messages'); }} className='md:hidden btn-ghost p-2'><HiArrowLeft className='w-5 h-5' /></button>
            <Avatar user={selectedConv.otherUser} size='md' showOnline isOnline={isUserOnline(selectedConv.otherUser._id)} />
            <div className='flex-1 min-w-0'>
              <p className='font-bold text-gray-900 dark:text-white'>{selectedConv.otherUser.name}</p>
              <p className='text-xs text-gray-400'>{typing ? <span className='text-primary-500'>typing...</span> : isUserOnline(selectedConv.otherUser._id) ? <span className='text-green-500'>Online</span> : '@' + selectedConv.otherUser.username}</p>
            </div>
          </div>
          <div className='flex-1 overflow-y-auto p-4 space-y-3'>
            {messagesLoading ? (
              <div className='flex justify-center py-8'><div className='flex gap-1'>{[0,1,2].map(i => <div key={i} className='w-2 h-2 bg-primary-400 rounded-full animate-bounce' style={{ animationDelay: i*0.15+'s' }} />)}</div></div>
            ) : messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-center py-16'>
                <Avatar user={selectedConv.otherUser} size='xl' />
                <p className='font-semibold text-gray-900 dark:text-white mt-3'>{selectedConv.otherUser.name}</p>
                <p className='text-sm text-gray-400 mt-1'>Start a conversation</p>
              </div>
            ) : messages.map((msg, idx) => {
              const isOwn = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
              return (
                <div key={msg._id} className={'flex ' + (isOwn ? 'justify-end' : 'justify-start') + ' group'}>
                  <div className={'max-w-xs lg:max-w-md flex flex-col gap-0.5 ' + (isOwn ? 'items-end' : 'items-start')}>
                    <div className={'relative px-4 py-2.5 rounded-2xl text-sm ' + (isOwn ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white dark:bg-nexora-card text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm') + (msg.deleted ? ' opacity-60 italic' : '')}>
                      {msg.content}
                      {isOwn && !msg.deleted && (
                        <button onClick={() => handleDeleteMessage(msg._id)} className='absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all'>
                          <HiTrash className='w-3.5 h-3.5' />
                        </button>
                      )}
                    </div>
                    {idx === messages.length - 1 && <span className='text-[10px] text-gray-400 px-1'>{formatTime(msg.createdAt)}</span>}
                  </div>
                </div>
              );
            })}
            {typing && (
              <div className='flex justify-start'>
                <div className='bg-white dark:bg-nexora-card rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm'>
                  <div className='flex gap-1'>{[0,1,2].map(i => <div key={i} className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: i*0.15+'s' }} />)}</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className='p-4 border-t border-gray-100 dark:border-nexora-border bg-white dark:bg-nexora-card'>
            <div className='flex items-end gap-2 bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary-500 transition'>
              <textarea value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={'Message ' + selectedConv.otherUser.name + '...'} rows={1} maxLength={1000}
                className='flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none focus:outline-none max-h-32 py-1.5' />
              <button onClick={handleSend} disabled={!input.trim() || sending} className='p-2 text-primary-600 dark:text-primary-400 disabled:opacity-30 hover:scale-110 transition-transform flex-shrink-0'>
                <HiPaperAirplane className='w-5 h-5 rotate-90' />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className='hidden md:flex flex-1 items-center justify-center'>
          <div className='text-center'>
            <HiChat className='w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-gray-400 dark:text-gray-500 mb-1'>Your messages</h3>
            <p className='text-sm text-gray-400 dark:text-gray-600'>Select a conversation or start a new one</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;