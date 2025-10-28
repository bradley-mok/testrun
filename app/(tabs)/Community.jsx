// community.jsx
import React, { useEffect, useState, useMemo } from "react";
import {  View, Text, ScrollView, FlatList, Image, TextInput, TouchableOpacity, Modal, StyleSheet, useWindowDimensions, Platform, Alert,} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Plus, Heart, MessageCircle, Share, Camera, X, Send, MoreVertical, MapPin, Clock, ThumbsUp, Sprout, Bug, Droplets, Sun, ImageIcon, Tag, Search, Mail, ArrowLeft,} from "lucide-react-native";
import { hp, wp } from "../../helpers/dimensions";
import ScreenWrapper from "../../components/ScreenWrapper";

export default function Community() {
  const { width, height } = useWindowDimensions();
  const orientation = height >= width ? "portrait" : "landscape";

  // Dialog states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  // Post composer / comments / messages
  const [selectedPost, setSelectedPost] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [postType, setPostType] = useState("general");
  const [newComment, setNewComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversationUserId, setSelectedConversationUserId] = useState(null);
  const [messagesView, setMessagesView] = useState("list");
  // Current user
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

  // Mock data (stateful)
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
    {
      id: 3,
      author: {
        id: 3,
        name: "Green Gardens",
        avatar:
          "https://images.unsplash.com/photo-1480044965905-02098d419e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        location: "Paarl, Western Cape",
        isVerified: false,
      },
      content:
        "🏆 Exciting news! Our lettuce crop just won the regional organic produce competition. Consistency in watering schedules and companion planting made all the difference. Happy to share our methods!",
      images: [
        "https://images.unsplash.com/photo-1595739431055-6c308d9f5af3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      ],
      tags: ["lettuce", "award", "organic", "competition"],
      timestamp: "6 hours ago",
      likes: 32,
      comments: 15,
      shares: 5,
      isLiked: false,
      type: "achievement",
    },
    {
      id: 4,
      author: {
        id: 4,
        name: "New Farmer Mike",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        location: "Wellington, Western Cape",
        isVerified: false,
      },
      content:
        "❓ Need advice from experienced farmers: I'm starting my first corn crop next season. What variety would you recommend for our climate? Also, what spacing works best? Any tips welcome! 🌽",
      images: [],
      tags: ["corn", "advice", "beginner", "planting"],
      timestamp: "8 hours ago",
      likes: 18,
      comments: 23,
      shares: 2,
      isLiked: true,
      type: "advice_request",
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
        content: "Those tomatoes look amazing! For extending harvest, try succession planting every 2-3 weeks.",
        timestamp: "1 hour ago",
        likes: 5,
        isLiked: false,
      },
      {
        id: 2,
        author: {
          id: 6,
          name: "Tom Greenhouse",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        },
        content:
          "Great harvest! I've found that indeterminate varieties can keep producing until the first frost if properly maintained.",
        timestamp: "45 minutes ago",
        likes: 3,
        isLiked: true,
      },
    ],
  });

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
      content: "Thanks for reaching out! I'd be happy to show you around. How about next Tuesday?",
      timestamp: "1 hour ago",
      isRead: true,
    },
    {
      id: 3,
      senderId: 4,
      recipientId: 1,
      content: "Hello! I'm new to farming and saw your expertise. Do you have any beginner tips for growing corn?",
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
      lastMessage: "Thanks for reaching out! I'd be happy to show you around...",
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
    {
      userId: 3,
      userName: "Green Gardens",
      userAvatar:
        "https://images.unsplash.com/photo-1480044965905-02098d419e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      lastMessage: "Congratulations on the award! 🏆",
      lastMessageTime: "Yesterday",
      unreadCount: 0,
    },
  ]);

  const cropTags = ["tomatoes", "corn", "lettuce", "peppers", "carrots", "beans", "herbs", "fruits"];
  const categoryTags = ["organic", "pest control", "irrigation", "fertilizer", "harvest", "planting", "equipment", "weather"];

  const postTypes = [
    { value: "crop_update", label: "Crop Update", icon: Sprout },
    { value: "problem", label: "Problem/Alert", icon: Bug },
    { value: "achievement", label: "Achievement", icon: ThumbsUp },
    { value: "advice_request", label: "Need Advice", icon: MessageCircle },
    { value: "general", label: "General", icon: Sun },
  ];

  const getPostTypeIcon = (type) => {
    const pt = postTypes.find((p) => p.value === type);
    const Icon = pt ? pt.icon : Sun;
    return <Icon size={14} />;
  };

  // Request image picker permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission required", "Permission to access media library is required!");
        }
      }
    })();
  }, []);

  // Image picker (multiple)
  const pickImages = async () => {
    try {
      // For simplicity, call image picker repeatedly or allow selecting single image multiple times.
      // Expo ImagePicker supports selecting multiple images only with launchImageLibraryAsync and allowsEditing false on some platforms.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:  [ImagePicker.MediaType.Image],
        allowsMultipleSelection: true, // may only work on some platforms/SDK versions
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets?.length) {
        const uris = result.assets.map((a) => a.uri);
        setPostImages((prev) => [...prev, ...uris]);
      } else if (!result.canceled && result.uri) {
        // older shape
        setPostImages((prev) => [...prev, result.uri]);
      }
    } catch (err) {
      console.warn("ImagePicker error", err);
    }
  };

  const removePostImage = (index) => {
    setPostImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) {
      Alert.alert("Can't post empty", "Please add some content to share.");
      return;
    }

    const newPost = {
      id: posts.length + 1,
      author: {
        id: currentUser.id,
        name: currentUser.fullName,
        avatar: currentUser.avatar,
        location: currentUser.location,
        isVerified: true,
      },
      content: postContent,
      images: postImages,
      tags: selectedTags,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      type: postType,
    };

    setPosts((prev) => [newPost, ...prev]);
    setPostContent("");
    setPostImages([]);
    setSelectedTags([]);
    setPostType("general");
    setIsPostModalOpen(false);
    Alert.alert("Posted", "Your post was shared successfully.");
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) {
      return;
    }
    const newCommentObj = {
      id: Date.now(),
      author: {
        id: currentUser.id,
        name: currentUser.fullName,
        avatar: currentUser.avatar,
      },
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      isLiked: false,
    };

    setCommentsByPost((prev) => ({
      ...prev,
      [selectedPost.id]: [...(prev[selectedPost.id] || []), newCommentObj],
    }));

    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === selectedPost.id ? { ...p, comments: p.comments + 1 } : p))
    );

    setNewComment("");
    Alert.alert("Comment added", "Your comment was posted.");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationUserId) return;

    const newMessageObj = {
      id: messages.length + 1,
      senderId: currentUser.id,
      recipientId: selectedConversationUserId,
      content: newMessage,
      timestamp: "Just now",
      isRead: false,
    };

    setMessages((prev) => [...prev, newMessageObj]);

    setConversations((prev) =>
      prev.map((conv) =>
        conv.userId === selectedConversationUserId
          ? {
              ...conv,
              lastMessage: newMessage.substring(0, 50) + (newMessage.length > 50 ? "..." : ""),
              lastMessageTime: "Just now",
              unreadCount: 0,
            }
          : conv
      )
    );

    setNewMessage("");
    Alert.alert("Message sent", "Your message was sent.");
  };

  const handleStartConversation = (userId, userName, userAvatar) => {
    const existing = conversations.find((c) => c.userId === userId);
    if (!existing) {
      setConversations((prev) => [
        {
          userId,
          userName,
          userAvatar,
          lastMessage: "",
          lastMessageTime: "Just now",
          unreadCount: 0,
        },
        ...prev,
      ]);
    }
    setSelectedConversationUserId(userId);
    setIsMessagesModalOpen(true);
  };

  const getConversationMessages = (userId) =>
    messages.filter(
      (msg) =>
        (msg.senderId === currentUser.id && msg.recipientId === userId) ||
        (msg.senderId === userId && msg.recipientId === currentUser.id)
    );

  const handleLikePost = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  // Render helpers
  const renderBadge = (text, colorStyle = {}) => (
    <View style={[styles.badge, colorStyle]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );

  const renderPost = ({ item: post }) => {
    const PostImageGrid = () => (
      <View style={styles.postImagesContainer}>
        {post.images && post.images.length > 0 ? (
          <View style={[styles.imagesGrid, post.images.length === 1 ? styles.gridOne : styles.gridTwo]}>
            {post.images.map((uri, idx) => (
              <Image key={idx.toString()} source={{ uri }} style={styles.postImage} resizeMode="cover" />
            ))}
          </View>
        ) : null}
      </View>
    );

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
          <View style={styles.headerText}>
            <View style={styles.topRow}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              {post.author.isVerified && renderBadge("Verified", styles.badgeSecondary)}
              <View style={[styles.typeBadge, post.type === "crop_update" ? styles.typeGreen : post.type === "problem" ? styles.typeRed : post.type === "achievement" ? styles.typeYellow : post.type === "advice_request" ? styles.typeBlue : styles.typeGray]}>
                {getPostTypeIcon(post.type)}
                <Text style={styles.typeBadgeText}>{post.type.replace(/_/g, " ")}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin size={12} />
                <Text style={styles.metaText}>{post.author.location}</Text>
              </View>
              <Text style={styles.metaDot}>•</Text>
              <View style={styles.metaItem}>
                <Clock size={12} />
                <Text style={styles.metaText}>{post.timestamp}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <MoreVertical size={18} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <Text style={styles.postContent}>{post.content}</Text>
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagRow}>
              {post.tags.map((t) => (
                <View key={t} style={styles.tagBadge}>
                  <Tag size={12} />
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Images */}
        {post.images && post.images.length > 0 && <PostImageGrid />}

        {/* Actions */}
        <View style={styles.cardFooter}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleLikePost(post.id)}>
              <Heart size={18} color={post.isLiked ? "#E02424" : undefined} />
              <Text style={styles.actionText}>{post.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setSelectedPost(post);
                setIsCommentsModalOpen(true);
              }}
            >
              <MessageCircle size={18} />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Share size={18} />
              <Text style={styles.actionText}>{post.shares}</Text>
            </TouchableOpacity>
          </View>

          {post.author.id !== currentUser.id && (
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => handleStartConversation(post.author.id, post.author.name, post.author.avatar)}
            >
              <Mail size={16} />
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper bg={"#F3F4F6"} >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>Connect with fellow farmers </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => {
                setMessagesView("list");
                setIsMessagesModalOpen(true);
              }}
            >
              <Mail size={16} />
              <Text style={styles.headerBtnText}>Messages</Text>
              {conversations.some((c) => c.unreadCount > 0) && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.headerBtn, styles.primaryBtn]} onPress={() => setIsPostModalOpen(true)}>
              <Plus size={16} color="#fff" />
              <Text style={[styles.headerBtnText, { color: "#fff" }]}>New Post</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feed */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.feed}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* New Post Modal */}
      <Modal visible={isPostModalOpen} animationType="slide" onRequestClose={() => setIsPostModalOpen(false)} transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: orientation === "portrait" ? "85%" : "90%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Post</Text>
              <TouchableOpacity onPress={() => setIsPostModalOpen(false)}>
                <X size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.label}>What's on your mind?</Text>
              <TextInput
                multiline
                value={postContent}
                onChangeText={setPostContent}
                placeholder="Share your farming update, question, or advice..."
                style={[styles.input, styles.textarea]}
              />

              <Text style={styles.label}>Post Type</Text>
              <View style={styles.postTypeRow}>
                {postTypes.map((pt) => {
                  const SelectedIcon = pt.icon;
                  const isActive = postType === pt.value;
                  return (
                    <TouchableOpacity
                      key={pt.value}
                      onPress={() => setPostType(pt.value)}
                      style={[styles.postTypeBtn, isActive && styles.postTypeBtnActive]}
                    >
                      <SelectedIcon size={16} color={isActive ? "#fff" : undefined} />
                      <Text style={[styles.postTypeBtnText, isActive && { color: "#fff" }]}>{pt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Images</Text>
              <View style={styles.imagesPickerRow}>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImages}>
                  <Camera size={18} />
                  <Text style={styles.imagePickerText}>Add photos</Text>
                </TouchableOpacity>

                <View style={styles.smallImagesRow}>
                  {postImages.map((uri, idx) => (
                    <View key={idx.toString()} style={styles.smallImageWrap}>
                      <Image source={{ uri }} style={styles.smallImage} />
                      <TouchableOpacity style={styles.smallImageRemove} onPress={() => removePostImage(idx)}>
                        <X size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.label}>Tags</Text>
              <Text style={styles.smallLabel}>Crops</Text>
              <View style={styles.tagsRow}>
                {cropTags.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => toggleTag(t)}
                    style={[styles.tagChip, selectedTags.includes(t) && styles.tagChipActive]}
                  >
                    <Text style={[styles.tagChipText, selectedTags.includes(t) && { color: "#fff" }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.smallLabel}>Categories</Text>
              <View style={styles.tagsRow}>
                {categoryTags.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => toggleTag(t)}
                    style={[styles.tagChip, selectedTags.includes(t) && styles.tagChipActive]}
                  >
                    <Text style={[styles.tagChipText, selectedTags.includes(t) && { color: "#fff" }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[styles.primaryBtnLarge]} onPress={handleCreatePost}>
                <Text style={styles.primaryBtnLargeText}>Share Post</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

{/* Messages Modal */}
      <Modal
        visible={isMessagesModalOpen}
        animationType="slide"
        onRequestClose={() => setIsMessagesModalOpen(false)}
        transparent
      >
        <View style={styles.modalOverlay}>
          <View
            // make modal take most of the screen so list & thread can fully fill
            style={[
              styles.messagesModal,
              {
                width: width * 0.95,
                height: orientation === "portrait" ? height * 0.92 : height * 0.88,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Messages</Text>
              <TouchableOpacity onPress={() => setIsMessagesModalOpen(false)}>
                <X size={20} />
              </TouchableOpacity>
            </View>

            {/* LIST OF CONVERSATIONS */}
            {messagesView === "list" ? (
              <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: wp(2), paddingBottom: wp(4) }} showsVerticalScrollIndicator>
                  {conversations.map((conv) => (
                    <TouchableOpacity
                      key={conv.userId}
                      onPress={() => {
                        setSelectedConversationUserId(conv.userId);
                        setMessagesView("thread");
                      }}
                      style={[
                        styles.conversationRow,
                        selectedConversationUserId === conv.userId && styles.conversationRowActive,
                      ]}
                    >
                      <Image source={{ uri: conv.userAvatar }} style={styles.convAvatar} />
                      <View style={styles.convText}>
                        <View style={styles.convTop}>
                          <Text style={styles.convName}>{conv.userName}</Text>
                          <Text style={styles.convTime}>{conv.lastMessageTime}</Text>
                        </View>
                        <Text style={styles.convSnippet}>{conv.lastMessage || "No messages yet"}</Text>
                      </View>

                      {conv.unreadCount > 0 && (
                        <View style={styles.unreadSmall}>
                          <Text style={styles.unreadSmallText}>{conv.unreadCount}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              /* THREAD VIEW (fills modal) */
              <View style={{ flex: 1 }}>
                <View style={[styles.threadHeader, { justifyContent: "flex-start" }]}>
                  <TouchableOpacity
                    onPress={() => {
                      setMessagesView("list");
                      setSelectedConversationUserId(null);
                    }}
                    style={{ marginRight: wp(3), padding: wp(1) }}
                  >
                    <ArrowLeft size={18} />
                  </TouchableOpacity>

                  <Image
                    source={{ uri: conversations.find((c) => c.userId === selectedConversationUserId)?.userAvatar }}
                    style={styles.convAvatar}
                  />
                  <View style={{ marginLeft: wp(2) }}>
                    <Text style={styles.convNameSmall}>
                      {conversations.find((c) => c.userId === selectedConversationUserId)?.userName}
                    </Text>
                    <Text style={styles.metaText}>Active now</Text>
                  </View>
                </View>

                <ScrollView
                  style={styles.threadMessages}
                  contentContainerStyle={{ padding: 12 }}
                  showsVerticalScrollIndicator
                >
{getConversationMessages(selectedConversationUserId).map((m) => {
                    const isSent = m.senderId === currentUser.id;
                    return (
                      <View
                        key={m.id.toString()}
                        style={[styles.threadMsgRow, isSent ? styles.threadMsgRight : styles.threadMsgLeft]}
                      >
                        {/* show avatar on left for received, on right for sent */}
                        {!isSent && (
                          <Image
                            source={{
                              uri:
                                conversations.find((c) => c.userId === selectedConversationUserId)
                                  ?.userAvatar,
                            }}
                            style={styles.threadAvatar}
                          />
                        )}

                        <View
                          style={[
                            styles.threadBubble,
                            isSent ? styles.threadBubbleSent : styles.threadBubbleRecv,
                          ]}
                        >
                          <Text style={[styles.threadText, isSent && styles.threadTextSent]}>{m.content}</Text>
                          <Text style={styles.threadTime}>{m.timestamp}</Text>
                        </View>

                        {isSent && (
                          <Image
                            source={{ uri: currentUser.avatar }}
                            style={styles.threadAvatar}
                          />
                        )}
                      </View>
                    );
                  })}
                </ScrollView>

                <View style={styles.threadComposer}>
                  <TextInput
                    placeholder="Type a message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    onSubmitEditing={handleSendMessage}
                    style={styles.messageInput}
                  />
                  <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                    <Send size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={isCommentsModalOpen}
        animationType="slide"
        onRequestClose={() => setIsCommentsModalOpen(false)}
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: orientation === "portrait" ? "85%" : "90%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Comments</Text>
              <TouchableOpacity onPress={() => setIsCommentsModalOpen(false)}>
                <X size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} style={{ flexGrow: 1 }}>
              {selectedPost ? (
                <>
                  <View style={styles.commentPostHeader}>
                    <Image source={{ uri: selectedPost.author.avatar }} style={styles.avatarSmall} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.authorNameSmall}>{selectedPost.author.name}</Text>
                      <Text style={styles.metaText}>{selectedPost.timestamp}</Text>
                      <Text style={[styles.postContent, { marginTop: hp(1) }]}>{selectedPost.content}</Text>
                    </View>
                  </View>

                  <View style={{ marginTop: hp(1) }}>
                    {(commentsByPost[selectedPost.id] || []).map((c) => (
                      <View key={c.id.toString()} style={styles.commentRow}>
                        <Image source={{ uri: c.author.avatar }} style={styles.avatarSmall} />
                        <View style={{ flex: 1 }}>
                          <View style={styles.commentBubble}>
                            <Text style={styles.commentAuthor}>{c.author.name}</Text>
                            <Text>{c.content}</Text>
                          </View>
                          <View style={styles.commentMetaRow}>
                            <TouchableOpacity style={styles.commentMetaBtn}>
                              <Heart size={14} color={c.isLiked ? "#E02424" : undefined} />
                              <Text style={styles.metaSmallText}>{c.likes}</Text>
                            </TouchableOpacity>
                            <Text style={styles.metaSmallText}>{c.timestamp}</Text>
                            <TouchableOpacity style={[styles.commentMetaBtn, { marginLeft: 8 }]}>
                              <Text style={styles.metaSmallText}>Reply</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Composer uses same input styling as New Post modal */}
                  <View style={[styles.commentComposer, { marginTop: hp(1) }]}>
                    <Image source={{ uri: currentUser.avatar }} style={styles.avatarSmall} />
                    <TextInput
                      placeholder="Write a comment..."
                      style={[styles.input, { flex: 1, marginLeft: wp(2) }]}
                      value={newComment}
                      onChangeText={setNewComment}
                      onSubmitEditing={handleAddComment}
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
                      <Send size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.modalBody}>
                  <Text>No post selected</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

// Styles
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F7F7" },
  container: { flex: 1, padding: wp(3) },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(1.6) },
  title: { fontSize: wp(5), fontWeight: "700", color: "#166534" },
  subtitle: { fontSize: wp(3), color: "#2f8b4bff" },
  headerActions: { flexDirection: "column", alignItems: "center", gap: wp(1.2) },
  headerBtn: { flexDirection: "row", alignItems: "center", padding: wp(1), borderRadius: wp(2.4), borderWidth: 1, borderColor: "#E6E6E6", marginRight: wp(2) },
  headerBtnText: { marginLeft: wp(1.2) },
  primaryBtn: { backgroundColor: "#25963eff", borderWidth: 0, paddingHorizontal: wp(1.2), paddingVertical: wp(0.8) },
  feed: { paddingBottom: hp(6) },
  card: { backgroundColor: "#ffffffff", borderRadius: wp(3), padding: wp(3), marginBottom: hp(1.6), overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "flex-start" },
  avatar: { width: wp(11.2), height: wp(11.2), borderRadius: wp(11.2) / 2, marginRight: wp(2.5) },
  headerText: { flex: 1 },
  topRow: { flexDirection: "row", alignItems: "center", gap: wp(2), flexWrap: "wrap" },
  authorName: { fontWeight: "700", color: "#0f172a", fontSize: wp(4) },
  badge: { paddingHorizontal: wp(2.2), paddingVertical: hp(0.5), borderRadius: wp(2.4), backgroundColor: "#e6e6e6", marginLeft: wp(1.2) },
  badgeText: { fontSize: wp(2.6), color: "#0f172a" },
  badgeSecondary: { backgroundColor: "#EEF2FF" },
  typeBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: wp(2.4), paddingVertical: hp(0.6), borderRadius: wp(3), marginLeft: wp(1) },
  typeBadgeText: { marginLeft: wp(1.5), fontSize: wp(3.2), textTransform: "capitalize" },
  typeGreen: { backgroundColor: "#ECFDF5" },
  typeRed: { backgroundColor: "#FEF2F2" },
  typeYellow: { backgroundColor: "#FFFBEB" },
  typeBlue: { backgroundColor: "#EFF6FF" },
  typeGray: { backgroundColor: "#F3F4F6" },
  metaRow: { flexDirection: "row", justifyContent:"flex-start", marginTop: hp(0.8),overflow:"hidden" , flexWrap:"wrap"},
  metaItem: { flexDirection: "row", alignItems: "center", gap: wp(1.6) },
  metaText: { fontSize: wp(3.2), color: "#475569", marginLeft: wp(0.6) },
  metaDot: { marginHorizontal: wp(1.6), color: "#9CA3AF" },
  iconButton: { padding: wp(1.2) },
  cardBody: { marginTop: hp(1) },
  postContent: { fontSize: wp(3.6), color: "#0f172a", lineHeight: hp(2.6) },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: wp(2), marginTop: hp(1) },
  tagBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: wp(2), paddingVertical: hp(0.6), backgroundColor: "#F3F4F6", borderRadius: wp(3), marginRight: wp(1.2) },
  tagText: { marginLeft: wp(1.5), fontSize: wp(3) },
  postImagesContainer: { marginTop: hp(1) },
  imagesGrid: { gap: wp(2) },
  gridOne: { flexDirection: "column" },
  gridTwo: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  postImage: { width: "100%", height: hp(24), borderRadius: wp(2.4), marginBottom: hp(1) },
  cardFooter: { marginTop: hp(1.6), flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  actionsLeft: { flexDirection: "row", alignItems: "center", gap: wp(4) },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: wp(2) },
  actionText: { fontSize: wp(3.2), marginLeft: wp(1) },
  messageBtn: { flexDirection: "row", alignItems: "center", gap: wp(2), paddingHorizontal: wp(2.4), paddingVertical: hp(0.8), borderRadius: wp(2.4), borderWidth: 1, borderColor: "#E6E6E6" },
  messageBtnText: { color: "#309B48", fontWeight: "600", fontSize: wp(3) },

  // modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: wp(4) },
  modalContent: { backgroundColor: "#fff", borderRadius: wp(3), overflow: "hidden", alignSelf: "stretch" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: wp(3), borderBottomWidth: 1, borderColor: "#F1F5F9" },
  modalTitle: { fontSize: wp(4.2), fontWeight: "700" },
  modalBody: { padding: wp(3) },
  label: { fontSize: wp(3.2), fontWeight: "600", marginBottom: hp(0.6) },
  smallLabel: { fontSize: wp(2.8), color: "#64748B", marginTop: hp(0.8), marginBottom: hp(0.6) },
  input: { borderWidth: 1, borderColor: "#E6E6E6", borderRadius: wp(2), padding: wp(2), backgroundColor: "#fff" },
  textarea: { minHeight: hp(12), textAlignVertical: "top" },
  postTypeRow: { flexDirection: "row", flexWrap: "wrap", gap: wp(2) },
  postTypeBtn: { flexDirection: "row", alignItems: "center", gap: wp(2), paddingHorizontal: wp(2.4), paddingVertical: hp(0.8), borderRadius: wp(2.4), borderWidth: 1, borderColor: "#E6E6E6", marginRight: wp(2), marginBottom: hp(1) },
  postTypeBtnActive: { backgroundColor: "#309B48", borderWidth: 0 },
  postTypeBtnText: { marginLeft: wp(1.2) },
  imagesPickerRow: { flexDirection: "row", alignItems: "center", gap: wp(3) },
  imagePickerBtn: { flexDirection: "row", alignItems: "center", gap: wp(2), padding: wp(2), borderRadius: wp(2.4), borderWidth: 1, borderColor: "#E6E6E6" },
  imagePickerText: { fontSize: wp(3) },
  smallImagesRow: { flexDirection: "row", gap: wp(2), flexWrap: "wrap" },
  smallImageWrap: { position: "relative" },
  smallImage: { width: wp(16), height: wp(16), borderRadius: wp(2) },
  smallImageRemove: { position: "absolute", top: -hp(0.6), right: -wp(1.2), backgroundColor: "#EF4444", padding: wp(1), borderRadius: wp(2.6) },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: wp(2) },
  tagChip: { paddingHorizontal: wp(3), paddingVertical: hp(0.8), borderRadius: wp(6), borderWidth: 1, borderColor: "#E6E6E6", marginRight: wp(1.2), marginBottom: hp(0.8) },
  tagChipActive: { backgroundColor: "#309B48", borderWidth: 0 },
  tagChipText: { fontSize: wp(3) },

  primaryBtnLarge: { backgroundColor: "#309B48", paddingVertical: hp(1.6), borderRadius: wp(3), marginTop: hp(1.2), alignItems: "center" },
  primaryBtnLargeText: { color: "#fff", fontWeight: "700", fontSize: wp(3.4) },

  // messages modal
  messagesModal: { backgroundColor: "#fff", borderRadius: wp(3), overflow: "hidden", alignSelf: "stretch" },
  messagesContainer: { flexDirection: "row", height: hp(60) },
  conversationsCol: { width: wp(66), borderRightWidth: 1, borderColor: "#F1F5F9" },
  searchRow: { flexDirection: "row", alignItems: "center", padding: wp(2), borderBottomWidth: 1, borderColor: "#F1F5F9" },
  searchInput: { marginLeft: wp(2), flex: 1, height: hp(4.8) },
  conversationsList: { flex: 1, padding: wp(2) },
  conversationRow: { flexDirection: "row", alignItems: "center", padding: wp(2), borderRadius: wp(2), marginBottom: hp(1) },
  conversationRowActive: { backgroundColor: "#F8FAFC" },
  convAvatar: { width: wp(11.2), height: wp(11.2), borderRadius: wp(11.2) / 2, marginRight: wp(2) },
  convText: { flex: 1 },
  convTop: { flexDirection: "row", justifyContent: "space-between" },
  convName: { fontWeight: "700", fontSize: wp(3.4) },
  convTime: { fontSize: wp(2.8), color: "#64748B" },
  convSnippet: { fontSize: wp(3), color: "#64748B" },

  unreadBadge: { position: "absolute", top: -hp(0.8), right: -wp(1.6), backgroundColor: "#DC2626", width: wp(5.6), height: wp(5.6), borderRadius: wp(2.8), alignItems: "center", justifyContent: "center" },
  unreadBadgeText: { color: "#fff", fontSize: wp(3), fontWeight: "700" },
  unreadSmall: { backgroundColor: "#309B48", paddingHorizontal: wp(2.4), paddingVertical: hp(0.6), borderRadius: wp(3) },
  unreadSmallText: { color: "#fff", fontSize: wp(3) },

  threadCol: { flex: 1 },
  threadHeader: { flexDirection: "row", alignItems: "center", padding: wp(3), borderBottomWidth: 1, borderColor: "#F1F5F9" },
  convNameSmall: { fontWeight: "700", fontSize: wp(3.6) },
  threadMessages: { flex: 1 },
  threadMsgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: hp(1.2) },
  threadMsgLeft: { justifyContent: "flex-start" },
  threadMsgRight: { justifyContent: "flex-end" },
  threadAvatar: { width: wp(9.2), height: wp(9.2), borderRadius: wp(9.2) / 2, marginHorizontal: wp(2) },
  threadBubble: { maxWidth: "70%", padding: wp(2.4), borderRadius: wp(3) },
  threadBubbleSent: { backgroundColor: "#309B48", color: "#fff" },
  threadBubbleRecv: { backgroundColor: "#F3F4F6" },
  threadText: { color: "#0f172a", fontSize: wp(3.2) },
  threadTextSent: { color: "#fff" },
  threadTime: { fontSize: wp(2.6), color: "#64748B", marginTop: hp(0.6) },
  threadComposer: { flexDirection: "row", alignItems: "center", padding: wp(2), borderTopWidth: 1, borderColor: "#F1F5F9" },
  messageInput: { flex: 1, borderWidth: 1, borderColor: "#E6E6E6", borderRadius: wp(3), paddingHorizontal: wp(3), height: hp(6) },
  sendBtn: { backgroundColor: "#309B48", padding: wp(2.4), borderRadius: wp(3), marginLeft: wp(2) },

  // comments
  commentPostHeader: { padding: wp(3), borderBottomWidth: 1, borderColor: "#F1F5F9", backgroundColor: "#FAFAFA", flexDirection: "row", gap: wp(3) },
  avatarSmall: { width: wp(9), height: wp(9), borderRadius: wp(9) / 2, marginRight: wp(2) },
  authorNameSmall: { fontWeight: "700", fontSize: wp(3.2) },
  commentRow: { flexDirection: "row", gap: wp(2), marginBottom: hp(1.2) },
  commentBubble: { backgroundColor: "#F3F4F6", padding: wp(2), borderRadius: wp(2) },
  commentAuthor: { fontWeight: "700", marginBottom: hp(0.4), fontSize: wp(3) },
  commentMetaRow: { flexDirection: "row", alignItems: "center", gap: wp(2), marginTop: hp(0.6) },
  commentMetaBtn: { flexDirection: "row", alignItems: "center", gap: wp(1.2) },
  metaSmallText: { fontSize: wp(2.8), color: "#64748B" },
  commentComposer: { flexDirection: "row", alignItems: "center", padding: wp(2), borderTopWidth: 1, borderColor: "#F1F5F9" },
  sendBtnSmall: { backgroundColor: "#309B48", padding: wp(2), borderRadius: wp(2.4), marginLeft: wp(2) },
  noConversation: { flex: 1, justifyContent: "center", alignItems: "center" },
});