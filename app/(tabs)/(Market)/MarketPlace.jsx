import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Share as ShareIcon,
  Star,
  Trash2,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from "react-native";
import ScreenWrapper from '../../../components/ScreenWrapper';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../../context/AuthContext';

// Supabase client
const SUPABASE_URL = 'https://zyvilaqlbsmbwxtdulvt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dmlsYXFsYnNtYnd4dGR1bHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzg0NzcsImV4cCI6MjA3NjY1NDQ3N30.yWKACrRr_7mTLK5IDx-Ty0P00vF9ZkAea3FIWFPb7dM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const categories = ["All", "Vegetables", "Fruits", "Supplies", "Equipment", "Seeds"];

export default function Marketplace() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [likedItems, setLikedItems] = useState([]);
  const [marketItems, setMarketItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingItem, setRatingItem] = useState(null);
  const [userRating, setUserRating] = useState(0);

  // New Item States
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemCategory, setNewItemCategory] = useState(categories[1]);
  const [newItemCondition, setNewItemCondition] = useState("New");
  const [newItemImage, setNewItemImage] = useState(null);

  // Fixed Image Picker function
  const pickImage = async () => {
    try {
      console.log('Starting image picker...');
      
      // Check if ImagePicker is available
      if (!ImagePicker || typeof ImagePicker.launchImageLibraryAsync !== 'function') {
        console.log('ImagePicker not available');
        throw new Error('Image picker not available');
      }
  
      // Request permissions
      console.log('Requesting permissions...');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Sorry, we need camera roll permissions to make this work!");
        return;
      }
  
      console.log('Permissions granted, launching image library...');
      
      // Use a simple approach without MediaTypeOptions
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
  
      console.log('Image picker result:', result);
  
      // Handle the result based on Expo version
      if (result.canceled) {
        console.log('User cancelled image selection');
        return;
      }
  
      // For newer Expo versions (SDK 48+)
      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Image selected (new format):', imageUri);
        setNewItemImage(imageUri);
        return;
      }
  
      // For older Expo versions
      if (result.uri) {
        console.log('Image selected (old format):', result.uri);
        setNewItemImage(result.uri);
        return;
      }
  
      console.log('No image selected');
      
    } catch (error) {
      console.log('Image picker error details:', error);
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
      
      // Fallback to default image
      const defaultImage = "https://picsum.photos/800/600?random=" + Math.random();
      console.log('Using default image:', defaultImage);
      setNewItemImage(defaultImage);
      Alert.alert('Info', 'Using default product image');
    }
  };

  // Load market items from database
  useEffect(() => {
    fetchMarketItems();
    if (user) {
      fetchUserLikes();
    }
  }, [user]);

  // Get likes count for an item from marketplace_likes table
  const getLikesCount = async (productId) => {
    try {
      const { count, error } = await supabase
        .from('marketplace_likes')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting likes count:', error);
      return 0;
    }
  };

  // Get messages count for an item from marketplace_messages table
  const getMessagesCount = async (productId) => {
    try {
      const { count, error } = await supabase
        .from('marketplace_messages')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting messages count:', error);
      return 0;
    }
  };

  // Get user's rating for an item
  const getUserRating = async (productId) => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('marketplace_ratings')
        .select('rating')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return 0;
        throw error;
      }

      return data?.rating || 0;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return 0;
    }
  };

  // Get average rating for an item
  const getAverageRating = async (productId) => {
    try {
      const { data, error } = await supabase
        .from('marketplace')
        .select('ratings')
        .eq('product_id', productId)
        .single();

      if (error) throw error;
      
      return data?.ratings || 0;
    } catch (error) {
      console.error('Error getting rating:', error);
      return 0;
    }
  };

  const fetchMarketItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace')
        .select('*')
        .order('posted_at', { ascending: false });

      if (error) {
        console.log('Database error, using local storage:', error.message);
        await loadMarketItemsFromStorage();
        return;
      }

      // Get counts for each item from related tables
      const itemsWithCounts = await Promise.all(
        data.map(async (item) => {
          const likesCount = item.likes_count || 0;
          const messagesCount = await getMessagesCount(item.product_id);
          const averageRating = await getAverageRating(item.product_id);
          const userItemRating = user ? await getUserRating(item.product_id) : 0;
          
          // Get user info for supplier details
          let supplierName = 'Unknown Supplier';
          let supplierLocation = 'Unknown Location';
          
          if (item.user_id) {
            try {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('full_name, location')
                .eq('id', item.user_id)
                .single();
              
              if (!userError && userData) {
                supplierName = userData.full_name || 'Unknown Supplier';
                supplierLocation = userData.location || 'Unknown Location';
              }
            } catch (userErr) {
              console.log('Error fetching user data:', userErr);
            }
          }
          
          return {
            id: item.product_id,
            product_id: item.product_id,
            name: item.product_name,
            description: item.description,
            price: Number(item.price),
            quantity: item.quantity,
            supplier: { 
              name: supplierName, 
              location: supplierLocation,
              id: item.user_id 
            },
            postedDate: formatTimeAgo(item.posted_at),
            image: item.image_url,
            category: item.category,
            condition: item.condition || 'New',
            rating: Number(averageRating) || 0,
            userRating: Number(userItemRating) || 0,
            likes: likesCount,
            messages: messagesCount,
            views: item.views_count || 0,
            shares: item.shares_count || 0,
            posted_at: item.posted_at,
            user_id: item.user_id
          };
        })
      );

      setMarketItems(itemsWithCounts);
      await AsyncStorage.setItem('marketplace_items', JSON.stringify(itemsWithCounts));

    } catch (error) {
      console.error('Error fetching market items:', error);
      await loadMarketItemsFromStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadMarketItemsFromStorage = async () => {
    try {
      const savedItems = await AsyncStorage.getItem('marketplace_items');
      if (savedItems) {
        setMarketItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.log('Error loading from storage:', error);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('marketplace_likes')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) {
        console.log('Error fetching likes from database');
        await loadUserLikesFromStorage();
        return;
      }

      setLikedItems(data.map(like => like.product_id));
      await AsyncStorage.setItem('marketplace_likes', JSON.stringify(data.map(like => like.product_id)));

    } catch (error) {
      console.error('Error fetching likes:', error);
      await loadUserLikesFromStorage();
    }
  };

  const loadUserLikesFromStorage = async () => {
    try {
      const savedLikes = await AsyncStorage.getItem('marketplace_likes');
      if (savedLikes) {
        setLikedItems(JSON.parse(savedLikes));
      }
    } catch (error) {
      console.log('Error loading likes from storage:', error);
    }
  };

  // Delete item function
  const deleteItem = async (itemId) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to delete items');
      return;
    }

    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // First check if the user owns this item
              const { data: itemData, error: fetchError } = await supabase
                .from('marketplace')
                .select('user_id')
                .eq('product_id', itemId)
                .single();

              if (fetchError) throw fetchError;

              if (!itemData || itemData.user_id !== user.id) {
                Alert.alert('Error', 'You can only delete your own items');
                return;
              }

              // Delete related data first (likes, ratings, messages)
              await supabase.from('marketplace_likes').delete().eq('product_id', itemId);
              await supabase.from('marketplace_ratings').delete().eq('product_id', itemId);
              await supabase.from('marketplace_messages').delete().eq('product_id', itemId);

              // Delete the main item
              const { error: deleteError } = await supabase
                .from('marketplace')
                .delete()
                .eq('product_id', itemId);

              if (deleteError) throw deleteError;

              // Update local state
              setMarketItems(prev => prev.filter(item => item.id !== itemId));
              
              // Close modals if open
              setDetailsModalVisible(false);
              setRatingModalVisible(false);
              
              Alert.alert('Success', 'Item deleted successfully');
              
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item: ' + error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Handle rating item
  const handleRateItem = (item) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to rate items');
      return;
    }
  
    setRatingItem(item);
    const currentUserRating = item.userRating || 0;
    setUserRating(currentUserRating);
    
    console.log('Opening rating modal - Item:', item.name, 'Current rating:', currentUserRating);
    setRatingModalVisible(true);
  };

  // SIMPLIFIED: Handle star tap with regular 1-5 rating
  const handleStarTap = (starNumber) => {
    setUserRating(starNumber);
  };

  // Submit rating function for regular 1-5 stars
  const submitRating = async () => {
    if (!user || !ratingItem) return;

    try {
      setLoading(true);

      // Get current rating data
      const { data: currentData, error: fetchError } = await supabase
        .from('marketplace')
        .select('ratings, rating_count, rating_total')
        .eq('product_id', ratingItem.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      // Calculate new average
      const currentRating = currentData?.ratings || 0;
      const currentCount = currentData?.rating_count || 0;
      const currentTotal = currentData?.rating_total || 0;

      // Check if user already rated this item
      const { data: userRatingData, error: userRatingError } = await supabase
        .from('marketplace_ratings')
        .select('rating')
        .eq('product_id', ratingItem.id)
        .eq('user_id', user.id)
        .single();

      let newCount = currentCount;
      let newTotal = currentTotal;

      if (userRatingError && userRatingError.code === 'PGRST116') {
        // User hasn't rated before - add new rating
        newCount = currentCount + 1;
        newTotal = currentTotal + userRating;
        
        // Insert user's rating
        const { error: insertError } = await supabase
          .from('marketplace_ratings')
          .insert({
            product_id: ratingItem.id,
            user_id: user.id,
            rating: userRating,
            created_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      } else {
        // User has rated before - update existing rating
        const oldUserRating = userRatingData?.rating || 0;
        newTotal = currentTotal - oldUserRating + userRating;
        
        // Update user's rating
        const { error: updateError } = await supabase
          .from('marketplace_ratings')
          .update({
            rating: userRating,
            created_at: new Date().toISOString()
          })
          .eq('product_id', ratingItem.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Calculate new average
      const newAverage = newCount > 0 ? Number((newTotal / newCount).toFixed(1)) : 0;

      // Update the marketplace table with new rating data
      const { error: updateError } = await supabase
        .from('marketplace')
        .update({
          ratings: newAverage,
          rating_count: newCount,
          rating_total: newTotal
        })
        .eq('product_id', ratingItem.id);

      if (updateError) throw updateError;

      // Update local state
      setMarketItems(prev => prev.map(item => 
        item.id === ratingItem.id 
          ? { 
              ...item, 
              rating: newAverage,
              userRating: userRating 
            } 
          : item
      ));

      setRatingModalVisible(false);
      Alert.alert('Success', `Rating submitted: ${userRating} stars!`);

    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (productId) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to like items');
      return;
    }
  
    try {
      const isLiked = likedItems.includes(productId);
      const currentItem = marketItems.find(item => item.id === productId);
      const currentLikes = currentItem?.likes || 0;
      
      if (isLiked) {
        // Unlike - remove from likes table and decrement count
        const { error: deleteError } = await supabase
          .from('marketplace_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
  
        if (deleteError && deleteError.code !== 'PGRST116') throw deleteError;
  
        // Update likes_count in marketplace table
        const newLikesCount = Math.max(0, currentLikes - 1);
        const { error: updateError } = await supabase
          .from('marketplace')
          .update({ likes_count: newLikesCount })
          .eq('product_id', productId);
  
        if (updateError) {
          console.error('Error updating likes_count:', updateError);
          throw updateError;
        }
  
        setLikedItems(prev => prev.filter(id => id !== productId));
        setMarketItems(prev => prev.map(item => 
          item.id === productId ? { ...item, likes: newLikesCount } : item
        ));
  
        console.log('✅ Unliked item:', productId, 'New count:', newLikesCount);
  
      } else {
        // Like - add to likes table and increment count
        const { error: insertError } = await supabase
          .from('marketplace_likes')
          .insert({ 
            user_id: user.id, 
            product_id: productId 
          });
  
        if (insertError) {
          // If duplicate, just update the count
          if (insertError.code === '23505') {
            console.log('⚠️ Already liked, updating count only');
          } else {
            throw insertError;
          }
        }
  
        // Update likes_count in marketplace table
        const newLikesCount = currentLikes + 1;
        const { error: updateError } = await supabase
          .from('marketplace')
          .update({ likes_count: newLikesCount })
          .eq('product_id', productId);
  
        if (updateError) {
          console.error('Error updating likes_count:', updateError);
          throw updateError;
        }
  
        setLikedItems(prev => [...prev, productId]);
        setMarketItems(prev => prev.map(item => 
          item.id === productId ? { ...item, likes: newLikesCount } : item
        ));
  
        console.log('✅ Liked item:', productId, 'New count:', newLikesCount);
      }
  
      await AsyncStorage.setItem('marketplace_likes', JSON.stringify(likedItems));
  
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      if (!['23505', 'PGRST116'].includes(error.code)) {
        Alert.alert('Error', 'Failed to update like');
      }
    }
  };

  const handleShare = async (item) => {
    try {
      await Share.share({
        message: `Check out this item on FarmConnect: ${item.name} for R${item.price} - ${item.description}`,
      });

      // Update shares count in database
      try {
        await supabase
          .from('marketplace')
          .update({ shares_count: (item.shares || 0) + 1 })
          .eq('product_id', item.id);
      } catch (dbError) {
        console.log('Share count update failed:', dbError);
      }

      const updatedItems = marketItems.map(i => 
        i.id === item.id ? { ...i, shares: (i.shares || 0) + 1 } : i
      );
      
      setMarketItems(updatedItems);
      await AsyncStorage.setItem('marketplace_items', JSON.stringify(updatedItems));

    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleMessage = async (item) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to message suppliers');
      return;
    }

    Alert.prompt(
      `Message ${item.supplier.name}`,
      'Enter your message:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async (message) => {
            if (message && message.trim()) {
              try {
                const { error } = await supabase
                  .from('marketplace_messages')
                  .insert({
                    product_id: item.id,
                    from_user_id: user.id,
                    to_user_id: item.supplier.id || user.id,
                    message: message.trim()
                  });

                if (error) throw error;

                Alert.alert('Success', `Message sent to ${item.supplier.name}! They will contact you soon.`);
                
                const messagesCount = await getMessagesCount(item.id);
                setMarketItems(prev => prev.map(i => 
                  i.id === item.id ? { ...i, messages: messagesCount } : i
                ));

              } catch (error) {
                console.error('Error sending message:', error);
                Alert.alert('Error', 'Failed to send message');
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const addItem = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to list items');
      return;
    }
  
    if (!newItemName.trim() || !newItemPrice) {
      Alert.alert("Missing fields", "Please enter at least a name and a price.");
      return;
    }
  
    setLoading(true);
  
    try {
      let imageUrl = "https://picsum.photos/800/600?random=" + Math.random();
  
      // 🎯 TRY TO UPLOAD USER'S SELECTED IMAGE
      if (newItemImage && newItemImage.startsWith('file://')) {
        console.log('🖼️ User selected image, attempting upload...');
        
        try {
          imageUrl = await uploadImageToSupabase(newItemImage, user.id);
          console.log('✅ Success! Using uploaded image:', imageUrl);
        } catch (uploadError) {
          console.error('❌ Upload failed:', uploadError);
          
          // Show specific error message
          let errorMessage = 'Image upload failed. ';
          
          if (uploadError.message.includes('RLS') || uploadError.message.includes('permissions')) {
            errorMessage += 'Please check storage bucket permissions in Supabase.';
          } else if (uploadError.message.includes('Bucket not found')) {
            errorMessage += 'Please create marketPlaceImages bucket in Supabase Storage.';
          } else {
            errorMessage += 'Using default image instead.';
            imageUrl = "https://picsum.photos/800/600?random=" + Math.random();
          }
          
          Alert.alert('Upload Issue', errorMessage);
        }
      }
  
      const itemData = {
        product_name: newItemName.trim(),
        description: newItemDescription.trim() || "No description provided.",
        price: parseFloat(newItemPrice),
        quantity: parseInt(newItemQuantity) || 1,
        category: newItemCategory,
        condition: newItemCondition,
        image_url: imageUrl,
        user_id: user.id,
        posted_at: new Date().toISOString(),
        likes_count: 0,
        views_count: 0,
        shares_count: 0,
        rating: 0,
        ratings: 0,
        rating_count: 0,
        rating_total: 0,
        is_sold: false
      };
  
      console.log('💾 Inserting item with image URL:', imageUrl);
  
      const { data, error } = await supabase
        .from('marketplace')
        .insert(itemData)
        .select();
  
      if (error) throw error;
  
      console.log('✅ Item inserted successfully:', data);
  
      await fetchMarketItems();
      setModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Item listed successfully!');
  
    } catch (error) {
      console.error('💥 Error adding item:', error);
      Alert.alert('Error', 'Failed to list item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSafeImageUrl = (imageUrl, itemId) => {
    try {
      // If no image URL, use default
      if (!imageUrl) {
        return "https://picsum.photos/800/600?random=" + itemId;
      }
      
      // If it's a local file path, use default (local files might be cleared)
      if (imageUrl.startsWith('file://')) {
        return "https://picsum.photos/800/600?random=" + itemId;
      }
      
      // If it's already an HTTP URL, use it
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Fallback to default
      return "https://picsum.photos/800/600?random=" + itemId;
    } catch (error) {
      console.log('Error in getSafeImageUrl:', error);
      return "https://picsum.photos/800/600?random=" + itemId;
    }
  };
  
  // Separate function for image upload
  const uploadImageToSupabase = async (localUri, userId) => {
    try {
      console.log('Starting image upload from:', localUri);
      
      if (!localUri || !localUri.startsWith('file://')) {
        throw new Error('Invalid local image URI');
      }
  
      // Generate unique file name
      const fileExtension = localUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `marketplace/${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      
      console.log('📁 Uploading file as:', fileName);
  
      // Create FormData for the upload
      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        name: fileName,
        type: `image/${fileExtension}`,
      });
  
      console.log('Uploading to Supabase Storage...');
  
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('marketPlaceImages')
        .upload(fileName, formData);
  
      if (error) {
        console.error('Supabase upload error:', error);
        
        // Provide specific error messages
        if (error.message.includes('row-level security')) {
          throw new Error('Storage permissions not configured. Please check RLS policies for marketPlaceImages bucket.');
        }
        if (error.message.includes('Bucket not found')) {
          throw new Error('Storage bucket not found. Please create marketPlaceImages bucket in Supabase.');
        }
        throw error;
      }
  
      console.log('Upload successful, getting public URL...');
  
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('marketPlaceImages')
        .getPublicUrl(fileName);
  
      console.log('Public URL:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
  
    } catch (error) {
      console.error('Error in uploadImageToSupabase:', error);
      throw error;
    }
  };

  const resetForm = () => {
    setNewItemName("");
    setNewItemPrice("");
    setNewItemQuantity("1");
    setNewItemDescription("");
    setNewItemCategory(categories[1]);
    setNewItemCondition("New");
    setNewItemImage(null);
  };

  const handleViewDetails = async (item) => {
    setSelectedItem(item);
    setDetailsModalVisible(true);

    try {
      await supabase
        .from('marketplace')
        .update({ views_count: (item.views || 0) + 1 })
        .eq('product_id', item.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }

    const updatedItems = marketItems.map(i => 
      i.id === item.id ? { ...i, views: (i.views || 0) + 1 } : i
    );
    
    setMarketItems(updatedItems);
    await AsyncStorage.setItem('marketplace_items', JSON.stringify(updatedItems));
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  const filteredItems = marketItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <ScreenWrapper bg="#f3f9f2">
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0b7a3a" style={styles.loader} />
          <Text style={styles.loadingText}>Loading marketplace...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="#f3f9f2">
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Marketplace</Text>
        <Pressable style={styles.listButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.listButtonText}>+ List Item</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search marketplace..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Category Chips */}
      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {categories.map((cat) => {
            const selected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Items List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        {filteredItems.map((item) => (
          <View key={item.id} style={styles.card}>
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: getSafeImageUrl(item.image, item.id) }} 
                style={styles.itemImage} 
                resizeMode="cover" 
                onError={(e) => {
                  console.log('Image failed to load, using fallback:', item.id);
                }}
              />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
              {/* Delete button for item owner */}
              {user && item.user_id === user.id && (
                <Pressable 
                  style={styles.deleteButton}
                  onPress={() => deleteItem(item.id)}
                >
                  <Trash2 size={16} color="#fff" />
                </Pressable>
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text numberOfLines={1} style={styles.itemTitle}>{item.name}</Text>
              <Text numberOfLines={2} style={styles.itemDescription}>{item.description}</Text>

              <View style={styles.metaRow}>
                <View>
                  <Text style={styles.priceText}>R{item.price}</Text>
                  <Text style={styles.availableText}>{item.quantity} available</Text>
                </View>
                {/* UPDATED: Better aligned rating with smaller margin */}
                <Pressable onPress={() => handleRateItem(item)} style={styles.rating}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                </Pressable>
              </View>

              <View style={styles.supplierRow}>
                <View style={styles.supplierInfo}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{item.supplier.name[0]}</Text>
                  </View>
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.supplierName}>{item.supplier.name}</Text>
                    <View style={styles.locationRow}>
                      <MapPin size={12} color="#666" />
                      <Text style={styles.locationText}>{item.supplier.location}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.postedText}>{item.postedDate}</Text>
              </View>

              <View style={styles.actionsRow}>
                <View style={styles.iconGroup}>
                  <Pressable onPress={() => toggleLike(item.id)} style={styles.iconButton}>
                    <Heart 
                      size={18} 
                      color={likedItems.includes(item.id) ? "red" : "#555"}
                      fill={likedItems.includes(item.id) ? "red" : "none"}
                    />
                    <Text style={styles.iconCount}>{item.likes}</Text>
                  </Pressable>
                  <Pressable onPress={() => handleMessage(item)} style={styles.iconButton}>
                    <MessageCircle size={18} color="#555" />
                  </Pressable>
                  <Pressable onPress={() => handleShare(item)} style={styles.iconButton}>
                    <ShareIcon size={18} color="#555" />
                  </Pressable>
                </View>
                <Pressable style={styles.viewButton} onPress={() => handleViewDetails(item)}>
                  <Eye size={14} color="#fff" />
                  <Text style={styles.viewButtonText}>View Details</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No items match your search</Text>
            <Text style={styles.emptySubtitle}>Try changing the category or search term.</Text>
          </View>
        )}
      </ScrollView>

      {/* ADD ITEM MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: "90%" }]}>
            <ScrollView showsVerticalScrollIndicator={true}>
              <Text style={styles.modalTitle}>List New Item</Text>
              <Text style={styles.modalSubtitle}>
                Create a listing for your agricultural product or equipment
              </Text>

              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                placeholder="e.g., Fresh Organic Tomatoes"
                value={newItemName}
                onChangeText={setNewItemName}
                style={styles.modalInput}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                placeholder="Describe your item in detail..."
                value={newItemDescription}
                onChangeText={setNewItemDescription}
                style={[styles.modalInput, { height: 80 }]}
                multiline
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.label}>Price (R) *</Text>
                  <TextInput
                    placeholder="0.00"
                    value={newItemPrice}
                    onChangeText={setNewItemPrice}
                    keyboardType="numeric"
                    style={styles.modalInput}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    placeholder="1"
                    value={newItemQuantity}
                    onChangeText={setNewItemQuantity}
                    keyboardType="numeric"
                    style={styles.modalInput}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={newItemCategory}
                      onValueChange={(val) => setNewItemCategory(val)}
                    >
                      {categories.slice(1).map((c) => (
                        <Picker.Item label={c} value={c} key={c} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={styles.label}>Condition</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={newItemCondition}
                      onValueChange={(val) => setNewItemCondition(val)}
                    >
                      <Picker.Item label="New" value="New" />
                      <Picker.Item label="Used" value="Used" />
                    </Picker>
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Image</Text>
              <Pressable style={styles.imageUpload} onPress={pickImage}>
                <Text style={{ color: "#666" }}>
                  {newItemImage ? "Image Selected" : "Click to upload image"}
                </Text>
              </Pressable>
              {newItemImage && (
                <Image
                  source={{ uri: newItemImage }}
                  style={{ width: "100%", height: 180, borderRadius: 8, marginVertical: 10 }}
                />
              )}

              <View style={styles.row}>
                <Pressable onPress={addItem} style={[styles.postButton, { flex: 1, marginRight: 6 }]}>
                  <Text style={styles.postButtonText}>Post Item</Text>
                </Pressable>
                <Pressable onPress={() => setModalVisible(false)} style={[styles.cancelButton, { flex: 1, marginLeft: 6 }]}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal visible={detailsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: "85%", paddingBottom: 30 }]}>
            <ScrollView showsVerticalScrollIndicator={true}>
              {selectedItem && (
                <>
                  <Image source={{ uri: selectedItem.image }} style={{ width: "100%", height: 220, borderRadius: 8 }} />
                  <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 12 }}>{selectedItem.name}</Text>
                  <Text style={{ color: "#444", marginVertical: 8 }}>{selectedItem.description}</Text>
                  
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Price:</Text>
                      <Text style={styles.detailValue}>R{selectedItem.price}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Quantity:</Text>
                      <Text style={styles.detailValue}>{selectedItem.quantity} available</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Category:</Text>
                      <Text style={styles.detailValue}>{selectedItem.category}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Condition:</Text>
                      <Text style={styles.detailValue}>{selectedItem.condition}</Text>
                    </View>
                  </View>

                  <View style={styles.supplierSection}>
                    <Text style={styles.sectionTitle}>Supplier Information</Text>
                    <Text style={styles.supplierText}>{selectedItem.supplier.name}</Text>
                    <View style={styles.locationRow}>
                      <MapPin size={14} color="#666" />
                      <Text style={styles.locationText}>{selectedItem.supplier.location}</Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Text style={styles.statNumber}>{selectedItem.likes}</Text>
                      <Text style={styles.statLabel}>Likes</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statNumber}>{selectedItem.views}</Text>
                      <Text style={styles.statLabel}>Views</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statNumber}>{selectedItem.shares}</Text>
                      <Text style={styles.statLabel}>Shares</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statNumber}>{selectedItem.rating.toFixed(1)}</Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                  </View>

                  {/* UPDATED: Rate button with star icon */}
                  <View style={styles.detailsActions}>
                    <Pressable onPress={() => handleRateItem(selectedItem)} style={[styles.rateButton, { flex: 1, marginRight: 6 }]}>
                      <Star size={16} color="#333" />
                      <Text style={styles.rateButtonText}>Rate Item</Text>
                    </Pressable>
                    {user && selectedItem.user_id === user.id && (
                      <Pressable onPress={() => deleteItem(selectedItem.id)} style={[styles.deleteButtonModal, { flex: 1, marginLeft: 6 }]}>
                        <Trash2 size={16} color="#fff" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </Pressable>
                    )}
                  </View>

                  <Pressable onPress={() => setDetailsModalVisible(false)} style={[styles.modalButton, { marginTop: 12, marginBottom: 20 }]}>
                    <Text style={{ color: "white", fontWeight: "600" }}>Close</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SIMPLIFIED: RATING MODAL with regular 1-5 stars */}
      <Modal visible={ratingModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate this Item</Text>
            <Text style={styles.modalSubtitle}>
              How would you rate {ratingItem?.name}?
            </Text>

            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => handleStarTap(star)}
                  style={styles.starButton}
                >
                  <Star
                    size={32}
                    color="#FFD700"
                    fill={userRating >= star ? "#FFD700" : "none"}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={styles.ratingText}>
              {userRating === 0 ? 'Select a rating' : `You rated: ${userRating} stars`}
            </Text>

            <View style={styles.row}>
              <Pressable onPress={submitRating} style={[styles.postButton, { flex: 1, marginRight: 6 }]}>
                <Text style={styles.postButtonText}>Submit Rating</Text>
              </Pressable>
              <Pressable onPress={() => setRatingModalVisible(false)} style={[styles.cancelButton, { flex: 1, marginLeft: 6 }]}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { marginTop:-30, flex: 1, paddingHorizontal: 10, paddingTop: 5, backgroundColor: "#ffffffff" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "800", color: "#0b7a3a" },
  listButton: { backgroundColor: "#0b7a3a", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  listButtonText: { color: "white", fontWeight: "700" },

  searchRow: { marginVertical: 8 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },

  chipsWrap: { marginVertical: 8 },
  chipsScroll: { alignItems: "center", paddingVertical: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dfe7df",
    marginRight: 8,
    backgroundColor: "transparent",
  },
  chipSelected: { backgroundColor: "#0b7a3a", borderColor: "#0b7a3a" },
  chipText: { fontSize: 12, color: "#3a3a3a" },
  chipTextSelected: { color: "#ffffff", fontWeight: "700" },

  list: { marginTop: 4, paddingHorizontal: 0 },

  card: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },

  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#eee",
    position: "relative",
  },
  itemImage: { width: "100%", height: "100%" },

  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#e6f7ea",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: "#0b7a3a", fontWeight: "700", fontSize: 11 },

  // Delete button styles
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(220, 53, 69, 0.9)",
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },

  content: { flex: 1, padding: 12, justifyContent: "space-between", alignItems: "flex-start" },
  itemTitle: { fontSize: 16, fontWeight: "800", color: "#0b7a3a", marginBottom: 4, textAlign: "left" },
  itemDescription: { color: "#5b6b59", fontSize: 13, textAlign: "left" },

  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, width: "100%" },
  priceText: { fontSize: 18, fontWeight: "800", color: "#0b7a3a" },
  availableText: { fontSize: 12, color: "#8b8b8b" },
  // UPDATED: Better aligned rating
  rating: { 
    flexDirection: "row", 
    alignItems: "center",
    marginLeft: 4 // Reduced margin for better alignment
  },
  ratingText: { 
    marginLeft: 4, // Reduced margin
    fontWeight: "700", 
    color: "#333",
    fontSize: 14 
  },

  supplierRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, width: "100%" },
  supplierInfo: { flexDirection: "row", alignItems: "center", minWidth: 0 },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dff1de",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#0b7a3a", fontWeight: "800" },
  supplierName: { fontWeight: "700" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  locationText: { marginLeft: 6, fontSize: 12, color: "#6b6b6b" },
  postedText: { fontSize: 12, color: "#9aa09b" },

  actionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, width: "100%" },
  iconGroup: { flexDirection: "row", alignItems: "center" },
  iconButton: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  iconCount: { marginLeft: 6, fontSize: 12, color: "#333" },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b7a3a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: { color: "#fff", marginLeft: 6, fontWeight: "700", fontSize: 12 },

  emptyState: { alignItems: "center", marginTop: 48 },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6, color: "#333" },
  emptySubtitle: { fontSize: 13, color: "#666" },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalCard: { backgroundColor: "white", padding: 20, borderRadius: 12, width: "92%" },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6, color: "#0b7a3a" },
  modalSubtitle: { color: "#666", marginBottom: 12, fontSize: 13 },
  label: { fontWeight: "700", marginTop: 12, marginBottom: 6, fontSize: 13, color: "#333" },
  modalInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 14,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  imageUpload: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: "#0b7a3a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  postButtonText: { color: "white", fontWeight: "800", fontSize: 15 },
  cancelButton: {
    backgroundColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: { color: "#333", fontWeight: "700", fontSize: 15 },
  modalButton: { 
    backgroundColor: "#0b7a3a", 
    padding: 14,
    borderRadius: 8, 
    alignItems: "center",
    marginHorizontal: 10,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  
  // New styles for details modal
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  detailItem: {
    width: '48%',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  supplierSection: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  supplierText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b7a3a',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#f0f8f4',
    borderRadius: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0b7a3a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // SIMPLIFIED: Rating modal styles for regular 1-5 stars
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },

  // UPDATED: Details modal actions
  detailsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  rateButtonText: {
    color: '#333',
    fontWeight: '700',
    marginLeft: 6,
  },
  deleteButtonModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
  },

  loader: { marginBottom: 16 },
  loadingText: { color: "#0b7a3a", fontSize: 16, fontWeight: "600" },
});