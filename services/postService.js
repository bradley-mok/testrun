import { supabase } from '../lib/supabase';
import { uploadFile } from './imageService';

export const createOrUpdatePost = async (post) => {
  try {
    // upload image/video if provided
    if (post.file && typeof post.file === 'object') {
      const isImage = post?.file?.type?.startsWith?.('image');
      const folderName = isImage ? 'postImages' : 'postVideos';
      const fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
      if (fileResult.success) {
        // store the uploaded file URL (or object) in post.file
        post.file = fileResult.data;
      } else {
        return fileResult;
      }
    }

    // Prepare RPC params
    // RPC expects: p_user_id, p_content, p_post_type, p_images (text[]), p_metadata (jsonb)
    const p_user_id = post.user_id; // must be UUID
    const p_content = post.content ?? null;
    const p_post_type = post.post_type ?? null;

    // If post.file is a single URL or object, convert to text[] (URLs)
    let p_images = null;
    if (post.file) {
      // If you store file as an object with url property, adapt as needed:
      if (Array.isArray(post.file)) {
        p_images = post.file.map(f => (typeof f === 'string' ? f : f.url || f.image_url || null)).filter(Boolean);
      } else if (typeof post.file === 'string') {
        p_images = [post.file];
      } else if (typeof post.file === 'object') {
        const url = post.file.url || post.file.image_url || post.file.path || null;
        if (url) p_images = [url];
      }
    }

    const p_metadata = post.metadata ? post.metadata : null;

    const { data, error } = await supabase.rpc('create_post', {
      p_user_id,
      p_content,
      p_post_type,
      p_images,
      p_metadata
    });

    if (error) {
      console.log('create_post rpc error: ', error);
      return { success: false, msg: 'Could not create your post' };
    }

    // RPC returns rows; take the first row as the created post
    const created = Array.isArray(data) ? data[0] : data;

    return { success: true, data: created };
  } catch (error) {
    console.log('createOrUpdatePost error: ', error);
    return { success: false, msg: 'Could not create your post' };
  }
};


export const getPostDetails = async (postId, currentUserId = null) => {
  try {
    const { data, error } = await supabase.rpc("get_post_details", {
      p_post_id: postId,
      p_current_user_id: currentUserId, // Optional, can be null
    });

    if (error) {
      console.error("getPostDetails error:", error);
      return { success: false, msg: "Failed to fetch post details", error };
    }

    if (!data) {
      return { success: false, msg: "Post not found" };
    }

    return { success: true, data };
  } catch (err) {
    console.error("getPostDetails exception:", err);
    return { success: false, msg: "Unexpected error occurred", error: err };
  }
};
