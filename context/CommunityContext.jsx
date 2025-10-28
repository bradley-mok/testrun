import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

const CommunityContext = createContext(null);

export const useCommunity = () => {
  const ctx = useContext(CommunityContext);
  if (!ctx)
    throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
};

export function CommunityProvider({ children }) {
  const currentUser = useMemo(
    () => ({
      id: 1,
      name: "Hazel",
      fullName: "Hazel Johnson",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      location: "Stellenbosch, Western Cape",
    }),
    []
  );

  // ---------------------------------
  // Posts & Comments
  // ---------------------------------
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        id: 1,
        name: "Hazel Johnson",
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        location: "Stellenbosch, Western Cape",
        isVerified: true,
      },
      content:
        "🍅 My tomato harvest is looking incredible this season! The organic farming methods are really paying off. Here's a comparison from last month to now. Any tips for extending the harvest season?",
      images: [
        "https://images.unsplash.com/photo-1659817673498-3c45390f7c61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        "https://images.unsplash.com/photo-1553395297-65d3ecdc9b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      ],
      tags: ["tomatoes", "organic", "harvest"],
      timestamp: "2 hours ago",
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      type: "crop_update",
    },
    {
      id: 2,
      author: {
        id: 2,
        name: "Farm Supply Co",
        avatar:
          "https://images.unsplash.com/photo-1570197788417-0e82375c9371?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        location: "Somerset West, Western Cape",
        isVerified: true,
      },
      content:
        "🚨 PEST ALERT: We're seeing increased aphid activity in the Western Cape region. Early morning treatments with neem oil have been most effective. Anyone else dealing with this?",
      images: [],
      tags: ["pest control", "aphids", "neem oil", "alert"],
      timestamp: "4 hours ago",
      likes: 15,
      comments: 12,
      shares: 8,
      isLiked: true,
      type: "problem",
    },
  ]);

  const [commentsByPost, setCommentsByPost] = useState({
    1: [
      {
        id: 1,
        author: {
          id: 5,
          name: "Sarah Farm Expert",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b332c1c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        },
        content:
          "Those tomatoes look amazing! For extending harvest, try succession planting every 2-3 weeks.",
        timestamp: "1 hour ago",
        likes: 5,
        isLiked: false,
      },
    ],
  });

  // ---------------------------------
  // Messages & Conversations
  // ---------------------------------
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: 2,
      recipientId: 1,
      content:
        "Hi Hazel! I saw your post about tomatoes. Would love to visit your farm and learn more about your organic methods!",
      timestamp: "2 hours ago",
      isRead: true,
    },
    {
      id: 2,
      senderId: 1,
      recipientId: 2,
      content:
        "Thanks for reaching out! I'd be happy to show you around. How about next Tuesday?",
      timestamp: "1 hour ago",
      isRead: true,
    },
    {
      id: 3,
      senderId: 4,
      recipientId: 1,
      content:
        "Hello! I'm new to farming and saw your expertise. Do you have any beginner tips for growing corn?",
      timestamp: "30 minutes ago",
      isRead: false,
    },
  ]);

  const [conversations, setConversations] = useState([
    {
      userId: 2,
      userName: "Farm Supply Co",
      userAvatar:
        "https://images.unsplash.com/photo-1570197788417-0e82375c9371?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      lastMessage:
        "Thanks for reaching out! I'd be happy to show you around...",
      lastMessageTime: "1 hour ago",
      unreadCount: 0,
    },
    {
      userId: 4,
      userName: "New Farmer Mike",
      userAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      lastMessage: "Hello! I'm new to farming and saw your expertise...",
      lastMessageTime: "30 minutes ago",
      unreadCount: 1,
    },
  ]);

  // ---------------------------------
  // Helpers
  // ---------------------------------
  const createPost = useCallback(
    ({ content, images = [], tags = [], type = "general" }) => {
      if (!content?.trim()) return null;
      const newPost = {
        id: Date.now(),
        author: {
          id: currentUser.id,
          name: currentUser.fullName,
          avatar: currentUser.avatar,
          location: currentUser.location,
          isVerified: true,
        },
        content,
        images,
        tags,
        timestamp: "Just now",
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        type,
      };
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    },
    [currentUser]
  );

  const addComment = useCallback(
    (postId, content) => {
      if (!content?.trim()) return null;
      const newComment = {
        id: Date.now(),
        author: {
          id: currentUser.id,
          name: currentUser.fullName,
          avatar: currentUser.avatar,
        },
        content,
        timestamp: "Just now",
        likes: 0,
        isLiked: false,
      };
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: p.comments + 1 } : p
        )
      );
      return newComment;
    },
    [currentUser]
  );

  const sendMessage = useCallback(
    ({ recipientId, content }) => {
      if (!content?.trim()) return null;
      const msg = {
        id: Date.now(),
        senderId: currentUser.id,
        recipientId,
        content,
        timestamp: "Just now",
        isRead: false,
      };
      setMessages((prev) => [...prev, msg]);

      // Update conversation metadata
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.userId === recipientId);
        if (idx === -1) {
          const newConv = {
            userId: recipientId,
            userName: `User ${recipientId}`,
            userAvatar: `https://i.pravatar.cc/150?img=${recipientId}`,
            lastMessage: content,
            lastMessageTime: "Just now",
            unreadCount: 0,
          };
          return [newConv, ...prev];
        } else {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            lastMessage: content.substring(0, 60),
            lastMessageTime: "Just now",
            unreadCount: 0,
          };
          return updated;
        }
      });
      return msg;
    },
    [currentUser]
  );

  const toggleLikePost = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  }, []);

  const getConversationMessages = useCallback(
    (userId) =>
      messages.filter(
        (m) =>
          (m.senderId === currentUser.id && m.recipientId === userId) ||
          (m.senderId === userId && m.recipientId === currentUser.id)
      ),
    [messages, currentUser.id]
  );

  const markConversationAsRead = useCallback(
    (userId) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === userId ? { ...c, unreadCount: 0 } : c
        )
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === userId ? { ...m, isRead: true } : m
        )
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      currentUser,
      posts,
      createPost,
      commentsByPost,
      addComment,
      messages,
      conversations,
      sendMessage,
      toggleLikePost,
      getConversationMessages,
      markConversationAsRead,
      setConversations,
      setMessages,
      setPosts,
    }),
    [
      currentUser,
      posts,
      commentsByPost,
      messages,
      conversations,
      createPost,
      addComment,
      sendMessage,
      toggleLikePost,
      getConversationMessages,
      markConversationAsRead,
    ]
  );

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

export default CommunityProvider;
