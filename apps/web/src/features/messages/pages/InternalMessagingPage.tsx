import { useState, useEffect, useRef } from 'react';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { 
  useGetInboxQuery, 
  useGetConversationQuery, 
  useSendMessageMutation,
  useLazySearchStaffQuery,
} from '../api/messageApi';
import type { InboxItem, StaffSearchResult } from '../api/messageApi';
import type { SharedMessage } from '@medicalink/shared';
import { useAppSelector } from '../../../store/hooks';
import { format } from 'date-fns';
import { Search, Send, User, MessageSquare } from 'lucide-react';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function InternalMessagingPage() {
  const { user } = useAppSelector(state => state.auth);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: inboxData, isLoading: isInboxLoading } = useGetInboxQuery();
  const { data: convoData, isLoading: isConvoLoading } = useGetConversationQuery(
    { otherUserId: selectedContactId as string },
    { skip: !selectedContactId }
  );
  
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [searchStaff, { data: searchData, isFetching: isSearching }] = useLazySearchStaffQuery();

  const inbox = inboxData?.data || [];
  const conversation = convoData?.data || [];
  const searchResults = searchData?.data || [];

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchStaff(searchQuery);
    }
  }, [searchQuery, searchStaff]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedContactId) return;

    try {
      await sendMessage({
        receiverId: selectedContactId,
        content: messageInput
      }).unwrap();
      setMessageInput('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const selectedContact = inbox.find(i => i.contact._id === selectedContactId)?.contact;
  const isSearchActive = searchQuery.length > 2;

  return (
    <PageWrapper title="Internal Messaging">
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex h-[700px]">
        
        {/* Sidebar: Inbox & Search */}
        <div className="w-80 border-r border-border flex flex-col bg-muted/5">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isSearchActive ? (
              <div className="p-2">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Search Results
                </div>
                {isSearching ? (
                  <div className="flex justify-center p-4"><LoadingSpinner /></div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center p-4 text-sm text-muted-foreground">No staff found</div>
                ) : (
                  searchResults.map((staff: StaffSearchResult) => (
                    <button
                      key={staff._id}
                      onClick={() => {
                        setSelectedContactId(staff._id);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg text-left transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {staff.firstName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{staff.firstName} {staff.lastName}</p>
                        <p className="text-xs text-muted-foreground">{staff.designation || staff.role}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : isInboxLoading ? (
              <div className="flex justify-center p-8"><LoadingSpinner /></div>
            ) : inbox.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">No recent conversations.</p>
                <p className="text-xs mt-1">Search for a staff member to start chatting.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {inbox.map((item: InboxItem) => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedContactId(item.contact._id)}
                    className={`w-full flex items-start gap-3 p-4 hover:bg-muted/30 text-left transition-colors ${selectedContactId === item.contact._id ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                  >
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {item.contact.firstName[0]}
                      </div>
                      {item.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-card">
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className={`text-sm truncate ${item.unreadCount > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'}`}>
                          {item.contact.firstName} {item.contact.lastName}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {format(new Date(item.latestMessage.createdAt), 'h:mm a')}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${item.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {item.latestMessage.senderId === user?.id ? 'You: ' : ''}
                        {item.latestMessage.content}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background relative">
          {!selectedContactId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium text-foreground">Your Messages</p>
              <p className="text-sm mt-1">Select a conversation or start a new one</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-border flex items-center px-6 bg-card/50 backdrop-blur-sm z-10 sticky top-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {selectedContact?.firstName?.[0] || <User className="h-4 w-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : 'Loading...'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedContact?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col-reverse">
                {isConvoLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 justify-end">
                    {[...conversation].reverse().map((msg: SharedMessage, idx, arr) => {
                      const isMe = msg.senderId === user?.id;
                      const showAvatar = !isMe && (idx === 0 || arr[idx - 1].senderId === user?.id);
                      
                      return (
                        <div key={msg._id} className={`flex gap-3 max-w-[75%] ${isMe ? 'self-end' : 'self-start'}`}>
                          {!isMe && (
                            <div className="w-8 shrink-0">
                              {showAvatar && (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                                  {selectedContact?.firstName[0]}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div 
                              className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                isMe 
                                  ? 'bg-primary text-primary-foreground rounded-br-none' 
                                  : 'bg-muted text-foreground rounded-bl-none'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                              {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-card border-t border-border">
                <form 
                  onSubmit={handleSend}
                  className="flex items-end gap-2 bg-muted/30 border border-border/50 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all"
                >
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[44px] text-sm py-3 px-2"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || isSending}
                    className="h-11 w-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSending ? <LoadingSpinner className="h-5 w-5 text-white" /> : <Send className="h-5 w-5 ml-0.5" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
