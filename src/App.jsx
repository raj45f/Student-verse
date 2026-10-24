import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GraduationCap,
  Heart,
  MessageCircle,
  Share2,
  Search,
  PlusCircle,
  Users,
  User,
  LogOut,
  LogIn,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Video,
  Film,
  Camera,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Home,
  Compass,
  Send,
  Info,
  ShieldCheck,
  CheckCheck,
  Zap,
  UserPlus,
  UserMinus,
  UserCheck,
  HeartHandshake,
  Bell,
  Clock,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Smile,
  ChevronRight,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabase';

// Helper: Compress and resize image file to <100KB JPEG for fast, zero-failure uploads
const compressImageFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Helper: Extract YouTube embed URL if input is a YouTube link
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
};

// Seed student peers for Discover & Follow (Verified registered student accounts)
const SUGGESTED_PEERS = [
  {
    id: 'user-mock-1',
    full_name: 'Aarav Sharma',
    username: 'aarav_tech',
    campus: 'IIT Delhi',
    bio: 'CS Junior | Hackathon Enthusiast | Building web apps & LLMs',
    avatar_url: '',
    followers_count: 142,
  },
  {
    id: 'user-mock-2',
    full_name: 'Priya Patel',
    username: 'priya_codes',
    campus: 'BITS Pilani',
    bio: 'Pre-final year @ BITS | Robotics & Embedded Systems',
    avatar_url: '',
    followers_count: 98,
  },
  {
    id: 'user-mock-3',
    full_name: 'Rohan Gupta',
    username: 'rohan_g',
    campus: 'Delhi University',
    bio: 'Economics & Math | Placement Aspirant & DSA sprint organizer',
    avatar_url: '',
    followers_count: 67,
  },
  {
    id: 'user-mock-4',
    full_name: 'Kavya Nair',
    username: 'kavya_n',
    campus: 'NIT Trichy',
    bio: 'ECE Sophomore | IoT, Drone Tech & Open Source Explorer',
    avatar_url: '',
    followers_count: 115,
  },
  {
    id: 'user-mock-5',
    full_name: 'Tanmay Joshi',
    username: 'tanmay_j',
    campus: 'IIT Bombay',
    bio: 'Mechanical Eng | Autonomous Vehicles & CAD Design',
    avatar_url: '',
    followers_count: 83,
  },
  {
    id: 'user-mock-6',
    full_name: 'Ananya Sen',
    username: 'ananya_design',
    campus: 'NID Ahmedabad',
    bio: 'UI/UX & Product Design Lead | Figma & Human-Centered Design',
    avatar_url: '',
    followers_count: 124,
  },
  {
    id: 'user-mock-7',
    full_name: 'Vikram Verma',
    username: 'vikram_ai',
    campus: 'IIIT Hyderabad',
    bio: 'Machine Learning & NLP Researcher | PyTorch geek & Kaggle Master',
    avatar_url: '',
    followers_count: 156,
  },
  {
    id: 'user-mock-8',
    full_name: 'Sneha Roy',
    username: 'sneha_bits',
    campus: 'BITS Goa',
    bio: 'Fintech, Algorithmic Trading & Web3 Explorer | Cycling enthusiast',
    avatar_url: '',
    followers_count: 79,
  },
  {
    id: 'user-mock-9',
    full_name: 'Devansh Rao',
    username: 'dev_rao',
    campus: 'IIT Madras',
    bio: 'Aerospace Engineering | Rocketry Club Lead & Propulsion Systems',
    avatar_url: '',
    followers_count: 91,
  },
];

// Seed initial incoming friend requests
const INITIAL_INCOMING_REQUESTS = [
  {
    id: 'req-1',
    senderId: 'user-mock-3',
    senderName: 'Rohan Gupta',
    username: 'rohan_g',
    campus: 'Delhi University',
    bio: 'Economics & Math | Placement Aspirant & DSA sprints',
    avatarUrl: '',
    time: '25m ago',
  },
  {
    id: 'req-2',
    senderId: 'user-mock-4',
    senderName: 'Kavya Nair',
    username: 'kavya_n',
    campus: 'NIT Trichy',
    bio: 'ECE Sophomore | IoT, Drone Tech & Open Source',
    avatarUrl: '',
    time: '2h ago',
  },
];

// Sample campus stories for top Instagram-style stories tray
const MOCK_CAMPUS_STORIES = [
  {
    id: 'story-1',
    username: 'rupam.sin',
    name: 'Rupam Sinha',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    campus: 'IIT Delhi',
    time: '2h ago',
    caption: 'Library cram session for midterms 📚✨',
    hasUnseen: true,
  },
  {
    id: 'story-2',
    username: 'shreya_08',
    name: 'Shreya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
    campus: 'BITS Pilani',
    time: '4h ago',
    caption: 'Sunset vibes at the tech lawn 🌅🎶',
    hasUnseen: true,
  },
  {
    id: 'story-3',
    username: 'harshit_tiw',
    name: 'Harshit Tiwari',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    campus: 'Delhi University',
    time: '6h ago',
    caption: 'Annual college cultural fest day 1! 🎸🔥',
    hasUnseen: true,
  },
  {
    id: 'story-4',
    username: 'thakur_ay',
    name: 'Aayush Thakur',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    campus: 'NIT Trichy',
    time: '8h ago',
    caption: 'Robotics hackathon finals underway 🤖⚡',
    hasUnseen: true,
  },
  {
    id: 'story-5',
    username: 'sky_aakas',
    name: 'Aakash Verma',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    campus: 'IIT Bombay',
    time: '12h ago',
    caption: 'Canteen samosa & chai break with team ☕🥟',
    hasUnseen: false,
  },
  {
    id: 'story-6',
    username: 'aruu.2.0',
    name: 'Aarushi Patel',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80',
    campus: 'SRM University',
    time: '14h ago',
    caption: 'Late night lab experiment finally worked! 🎉🔬',
    hasUnseen: false,
  },
];

// Sample mock communities
const MOCK_COMMUNITIES = [
  {
    id: 'comm-1',
    name: 'Coding & AI Club',
    description: 'Build hackathon projects, learn open-source, debate LLMs, and pair program with fellow engineering students.',
    category: 'Technology',
    member_count: 342,
  },
  {
    id: 'comm-2',
    name: 'Campus Creators',
    description: 'Designers, photographers, video editors, and content makers collaborating across colleges and campuses.',
    category: 'Creative & Arts',
    member_count: 188,
  },
  {
    id: 'comm-3',
    name: 'Placement Prep Circle',
    description: 'DSA question sprints, mock technical & HR interviews, resume reviews, and internship referrals.',
    category: 'Career & Growth',
    member_count: 512,
  },
  {
    id: 'comm-4',
    name: 'Study Buddies',
    description: 'Find focused study partners for semester exams, share revision notes, and stay accountable together.',
    category: 'Academics',
    member_count: 275,
  },
];

// Seed posts with Photo & Video
const MOCK_POSTS = [
  {
    id: 'post-1',
    user_id: 'user-mock-1',
    content: "🚀 Excited to kick off StudentVerse! We're building an Instagram-style network made specifically for students across colleges to connect, collaborate, and share campus vibes.",
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    video_url: null,
    media_type: 'photo',
    likes_count: 42,
    comments_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    profiles: {
      id: 'user-mock-1',
      full_name: 'Aarav Sharma',
      username: 'aarav_tech',
      campus: 'IIT Delhi',
      avatar_url: '',
      bio: 'CS Junior | Hackathon Enthusiast | Building web apps',
    },
  },
  {
    id: 'post-2',
    user_id: 'user-mock-2',
    content: '🎥 Here is a quick 15-second teaser of our autonomous rover project built for the annual campus robotics festival! Check out the omnidirectional wheels in action.',
    image_url: null,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    media_type: 'video',
    likes_count: 85,
    comments_count: 12,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    profiles: {
      id: 'user-mock-2',
      full_name: 'Priya Patel',
      username: 'priya_codes',
      campus: 'BITS Pilani',
      avatar_url: '',
      bio: 'Pre-final year @ BITS | Robotics & Embedded Systems',
    },
  },
  {
    id: 'post-3',
    user_id: 'user-mock-3',
    content: 'Anyone preparing for summer internships? The Placement Prep Circle is hosting a LeetCode blind-75 sprint this weekend. DM or drop a comment to join our study group! 💻📚',
    image_url: null,
    video_url: null,
    media_type: 'text',
    likes_count: 28,
    comments_count: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    profiles: {
      id: 'user-mock-3',
      full_name: 'Rohan Gupta',
      username: 'rohan_g',
      campus: 'Delhi University',
      avatar_url: '',
      bio: 'Economics & Math | Placement Aspirant',
    },
  },
];

// Campus club channels (Messages load real-time from Supabase - Zero clones)
const INITIAL_CHATS = [
  {
    id: 'chat-coding-ai',
    type: 'community',
    communityId: 'comm-1',
    name: 'Coding & AI Club',
    tag: '#tech-talk',
    badge: 'Club Channel',
    avatarText: 'AI',
    online: true,
    lastMessage: 'Live campus chat channel',
    time: '',
    messages: [],
  },
  {
    id: 'chat-creators',
    type: 'community',
    communityId: 'comm-2',
    name: 'Campus Creators',
    tag: '#design-video',
    badge: 'Club Channel',
    avatarText: 'CC',
    online: true,
    lastMessage: 'Design & creators hub',
    time: '',
    messages: [],
  },
  {
    id: 'chat-placement',
    type: 'community',
    communityId: 'comm-3',
    name: 'Placement Prep Circle',
    tag: '#mock-interviews',
    badge: 'Club Channel',
    avatarText: 'PP',
    online: true,
    lastMessage: 'Interview & DSA discussions',
    time: '',
    messages: [],
  },
];

export default function App() {
  // Supabase & Auth State
  const [session, setSession] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App Data State
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [userLikes, setUserLikes] = useState(new Set());
  const [userMemberships, setUserMemberships] = useState(new Set());
  const [loadingPosts, setLoadingPosts] = useState(false);

  // FOLLOW / UNFOLLOW SYSTEM STATE
  const [followingUserIds, setFollowingUserIds] = useState(new Set());

  // FRIEND REQUEST & CONNECTIONS STATE (Loaded from Supabase & synced via Realtime)
  const [friendships, setFriendships] = useState(new Set());
  const [sentFriendRequests, setSentFriendRequests] = useState(new Set());
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [connectionsSubTab, setConnectionsSubTab] = useState('requests'); // 'requests' | 'discover' | 'friends'

  // REGISTERED ACCOUNTS & STUDENT SEARCH STATE
  const [registeredStudents, setRegisteredStudents] = useState(SUGGESTED_PEERS);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('all');

  // Comments State (keyed by postId)
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInputText, setCommentInputText] = useState('');

  // Feed & Navigation State
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'communities' | 'chat' | 'connections' | 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' | 'following' | 'photos' | 'videos' | 'my_campus'

  // Post Composer State (Photo & Video Attachments)
  const [postText, setPostText] = useState('');
  const [postMediaType, setPostMediaType] = useState('text');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [mediaInputMode, setMediaInputMode] = useState(null);
  const [submittingPost, setSubmittingPost] = useState(false);

  // Chatting State
  const [chatConversations, setChatConversations] = useState(INITIAL_CHATS);
  const [selectedChatId, setSelectedChatId] = useState('chat-coding-ai');
  const [chatMessageText, setChatMessageText] = useState('');
  const [chatMediaUrl, setChatMediaUrl] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const activeTabRef = useRef(activeTab);
  const selectedChatIdRef = useRef(selectedChatId);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  // Modals & Feedback
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    campus: '',
  });
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    campus: '',
    bio: '',
    avatarUrl: '',
  });
  const [toastMessage, setToastMessage] = useState(null);

  // Instagram-Style Feed & Stories State
  const [campusStories, setCampusStories] = useState(MOCK_CAMPUS_STORIES);
  const [activeStory, setActiveStory] = useState(null);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [inlineComments, setInlineComments] = useState({});

  // Floating Create Post Modal State
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postEffect, setPostEffect] = useState('normal');

  // Add Story Modal State
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);
  const [storyMode, setStoryMode] = useState('photo'); // 'photo' | 'video' | 'notes'
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyNoteText, setStoryNoteText] = useState('');
  const [storyNoteBg, setStoryNoteBg] = useState('linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)');
  const [selectedStorySong, setSelectedStorySong] = useState('Lo-Fi Campus Chill 🎧');
  const [selectedStoryEffect, setSelectedStoryEffect] = useState('normal');
  const [selectedStoryEmojis, setSelectedStoryEmojis] = useState(['🔥']);

  // Avatar file upload handler
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setProfileForm((prev) => ({ ...prev, avatarUrl: compressed }));
      setCurrentUserProfile((prev) => (prev ? { ...prev, avatar_url: compressed } : prev));
      showToast('📸 Profile photo selected! Click Save to apply.');

      if (isSupabaseConfigured && session?.user) {
        await supabase
          .from('profiles')
          .update({ avatar_url: compressed, updated_at: new Date().toISOString() })
          .eq('id', session.user.id);
        showToast('✅ Profile photo saved!');
      }
    } catch (err) {
      console.error(err);
      showToast('Error processing profile photo');
    }
  };

  // Story file upload handler (photo or video)
  const handleStoryFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.type.startsWith('video/')) {
        setStoryMode('video');
        const url = URL.createObjectURL(file);
        setStoryMediaUrl(url);
        showToast('🎥 Campus reel selected for story!');
      } else {
        setStoryMode('photo');
        const compressed = await compressImageFile(file);
        setStoryMediaUrl(compressed);
        showToast('📷 Photo selected for story!');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading media');
    }
  };

  // Publish Story
  const handlePublishStory = () => {
    if (storyMode === 'notes' && !storyNoteText.trim()) {
      showToast('Please type a campus note first!');
      return;
    }

    const newStory = {
      id: `story-user-${Date.now()}`,
      username: currentUserProfile?.username || 'you',
      name: currentUserProfile?.full_name || 'You',
      avatar: currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      mediaUrl: storyMediaUrl || (storyMode === 'notes' ? '' : 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'),
      isVideo: storyMode === 'video',
      isNote: storyMode === 'notes',
      noteText: storyNoteText,
      noteBg: storyNoteBg,
      song: selectedStorySong !== 'None' ? selectedStorySong : null,
      effect: selectedStoryEffect,
      emojis: selectedStoryEmojis,
      campus: currentUserProfile?.campus || 'Campus',
      time: 'Just now',
      hasUnseen: true,
      caption: storyCaption || storyNoteText || 'Campus vibe ✨',
    };

    setCampusStories((prev) => [newStory, ...prev]);
    setIsAddStoryModalOpen(false);
    setStoryMediaUrl('');
    setStoryNoteText('');
    setStoryCaption('');
    showToast('🎉 Your story has been shared to campus!');
  };

  const handleToggleSavePost = (postId) => {
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        showToast('Removed from Saved bookmarks');
      } else {
        next.add(postId);
        showToast('Saved to your bookmarks! 🔖');
      }
      return next;
    });
  };

  const handleInlineCommentSubmit = async (postId, e) => {
    e?.preventDefault();
    const commentText = inlineComments[postId]?.trim();
    if (!commentText) return;

    if (!session?.user) {
      handleQuickDemoLogin();
    }

    const newCommentObj = {
      id: `comment-inline-${Date.now()}`,
      post_id: postId,
      content: commentText,
      created_at: new Date().toISOString(),
      profiles: {
        id: session?.user?.id || 'demo-student-id',
        full_name: currentUserProfile?.full_name || 'You',
        username: currentUserProfile?.username || 'you',
        avatar_url: currentUserProfile?.avatar_url || '',
      },
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentObj],
    }));

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
      )
    );

    setInlineComments((prev) => ({ ...prev, [postId]: '' }));
    showToast('💬 Comment posted!');

    if (isSupabaseConfigured && session?.user) {
      try {
        await supabase.from('comments').insert({
          post_id: postId,
          user_id: session.user.id,
          content: commentText,
        });
      } catch (err) {
        console.error('Error inserting comment:', err);
      }
    }
  };

  // Toast Helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Scroll to bottom of active chat
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatConversations, selectedChatId, activeTab]);

  // Helper to get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'SV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper for human-readable relative timestamp
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'just now';
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${Math.max(1, diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Instant 1-Click Demo Login Helper
  const handleQuickDemoLogin = () => {
    const mockUser = {
      id: 'demo-student-id',
      email: 'student@campus.edu',
    };
    const mockProfile = {
      id: 'demo-student-id',
      full_name: 'Aditya Verma',
      username: 'aditya_v',
      campus: 'IIT Delhi',
      bio: 'CS Sophomore | Hackathon Builder | Learning React & AI',
      avatar_url: '',
    };
    setSession({ user: mockUser });
    setCurrentUserProfile(mockProfile);
    setProfileForm({
      fullName: mockProfile.full_name,
      campus: mockProfile.campus,
      bio: mockProfile.bio,
      avatarUrl: '',
    });
    setIsAuthModalOpen(false);
    setActiveTab('feed');
    showToast('👋 Welcome back, Aditya Verma! Good to see you on campus.');
  };

  // 1. Initial Auth & Session Setup
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      setPosts(MOCK_POSTS);
      setCommunities(MOCK_COMMUNITIES);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        await loadUserProfile(newSession.user.id);
      } else {
        setCurrentUserProfile(null);
        setUserLikes(new Set());
        setUserMemberships(new Set());
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 2. Fetch User Profile
  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error loading user profile:', error.message);
      }

      if (data) {
        setCurrentUserProfile(data);
        setProfileForm({
          fullName: data.full_name || '',
          campus: data.campus || '',
          bio: data.bio || '',
          avatarUrl: data.avatar_url || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  // 3. Load Posts & Communities
  const loadPosts = async () => {
    if (!isSupabaseConfigured) return;
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          image_url,
          video_url,
          media_type,
          likes_count,
          comments_count,
          created_at,
          profiles:user_id (id, full_name, username, campus, avatar_url, bio)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);

      if (session?.user?.id) {
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', session.user.id);

        if (likesData) {
          setUserLikes(new Set(likesData.map((l) => l.post_id)));
        }

        // Load follow relationships
        const { data: followData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', session.user.id);

        if (followData) {
          setFollowingUserIds(new Set(followData.map((f) => f.following_id)));
        }
      }
    } catch (err) {
      console.error('Error loading posts:', err.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadCommunities = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('campus_communities')
        .select('*')
        .order('name');

      if (error) throw error;
      setCommunities(data || []);

      if (session?.user?.id) {
        const { data: memberData } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', session.user.id);

        if (memberData) {
          setUserMemberships(new Set(memberData.map((m) => m.community_id)));
        }
      }
    } catch (err) {
      console.error('Error loading communities:', err.message);
    }
  };

  // Fetch registered student directory from Supabase profiles
  const loadRegisteredStudents = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, campus, bio, avatar_url, followers_count')
        .order('full_name', { ascending: true });

      if (!error && data && data.length > 0) {
        // Merge Supabase registered accounts with suggested seeds
        const dbIds = new Set(data.map((p) => p.id));
        const merged = [
          ...data,
          ...SUGGESTED_PEERS.filter((p) => !dbIds.has(p.id)),
        ];
        setRegisteredStudents(merged);
      }
    } catch (err) {
      console.warn('Error loading registered students from Supabase:', err.message);
    }
  };

  // Load real friend requests, sent requests, and accepted friendships from Supabase
  const loadFriendshipsAndRequests = async (userId) => {
    if (!isSupabaseConfigured || !userId) return;
    try {
      // 1. Fetch pending requests received by current user
      const { data: incomingData, error: inError } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          created_at,
          profiles:sender_id (id, full_name, username, campus, avatar_url, bio)
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!inError && incomingData) {
        const formatted = incomingData.map((item) => ({
          id: item.id,
          senderId: item.sender_id,
          senderName: item.profiles?.full_name || 'Student Peer',
          username: item.profiles?.username || 'student',
          campus: item.profiles?.campus || 'Campus Peer',
          bio: item.profiles?.bio || '',
          avatarUrl: item.profiles?.avatar_url || '',
          time: getRelativeTime(item.created_at),
        }));
        setIncomingRequests(formatted);
      }

      // 2. Fetch pending requests sent by current user
      const { data: sentData, error: sentError } = await supabase
        .from('friend_requests')
        .select('receiver_id')
        .eq('sender_id', userId)
        .eq('status', 'pending');

      if (!sentError && sentData) {
        setSentFriendRequests(new Set(sentData.map((s) => s.receiver_id)));
      }

      // 3. Fetch accepted friendships
      const { data: acceptedData, error: accError } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (!accError && acceptedData) {
        const friendIds = new Set();
        acceptedData.forEach((row) => {
          if (row.sender_id === userId) {
            friendIds.add(row.receiver_id);
          } else {
            friendIds.add(row.sender_id);
          }
        });
        setFriendships(friendIds);
      }
    } catch (err) {
      console.warn('Error loading friend requests:', err.message);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadPosts();
      loadCommunities();
      loadRegisteredStudents();
      if (session?.user?.id) {
        loadFriendshipsAndRequests(session.user.id);
      }
    }
  }, [session?.user?.id]);

  // ============================================================================
  // REAL-TIME FRIEND REQUESTS SUBSCRIPTION
  // ============================================================================
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user?.id) return;

    const currentUserId = session.user.id;

    const channel = supabase
      .channel(`realtime-friend-requests-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
        },
        async (payload) => {
          console.log('⚡ Realtime friend_requests change:', payload);

          // CASE 1: REAL-TIME INCOMING FRIEND REQUEST (INSERT)
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new;
            if (newRow.receiver_id === currentUserId && newRow.status === 'pending') {
              // Fetch sender profile details to display real info
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('id, full_name, username, campus, avatar_url, bio')
                .eq('id', newRow.sender_id)
                .single();

              const reqObj = {
                id: newRow.id,
                senderId: newRow.sender_id,
                senderName: senderProfile?.full_name || 'Student Peer',
                username: senderProfile?.username || 'student',
                campus: senderProfile?.campus || 'Campus Peer',
                bio: senderProfile?.bio || '',
                avatarUrl: senderProfile?.avatar_url || '',
                time: 'Just now',
                isLiveRealtime: true,
              };

              setIncomingRequests((prev) => [
                reqObj,
                ...prev.filter((r) => r.id !== newRow.id && r.senderId !== newRow.sender_id),
              ]);
              showToast(`🔔 Real-time Friend Request from ${reqObj.senderName}!`);
            }
          }

          // CASE 2: STATUS UPDATED (e.g. ACCEPTED)
          if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new;

            // Recipient accepted a request sent by us!
            if (updatedRow.sender_id === currentUserId && updatedRow.status === 'accepted') {
              setSentFriendRequests((prev) => {
                const s = new Set(prev);
                s.delete(updatedRow.receiver_id);
                return s;
              });

              setFriendships((prev) => {
                const s = new Set(prev);
                s.add(updatedRow.receiver_id);
                return s;
              });

              setFollowingUserIds((prev) => {
                const s = new Set(prev);
                s.add(updatedRow.receiver_id);
                return s;
              });

              const recipientProfile = registeredStudents.find((s) => s.id === updatedRow.receiver_id);
              const name = recipientProfile?.full_name || 'Your campus peer';
              showToast(`🎉 ${name} accepted your friend request!`);
            }

            // If we are the receiver and request was accepted or declined elsewhere
            if (updatedRow.receiver_id === currentUserId && updatedRow.status !== 'pending') {
              setIncomingRequests((prev) => prev.filter((r) => r.id !== updatedRow.id));
            }
          }

          // CASE 3: REQUEST CANCELLED OR REMOVED (DELETE)
          if (payload.eventType === 'DELETE') {
            const oldRow = payload.old;
            if (oldRow?.receiver_id === currentUserId) {
              setIncomingRequests((prev) => prev.filter((r) => r.id !== oldRow.id));
            }
            if (oldRow?.sender_id === currentUserId) {
              setSentFriendRequests((prev) => {
                const s = new Set(prev);
                s.delete(oldRow.receiver_id);
                return s;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, registeredStudents]);

  // ============================================================================
  // LOAD REAL CHAT MESSAGES FROM SUPABASE
  // ============================================================================
  const loadChatMessages = async (chat) => {
    if (!isSupabaseConfigured || !session?.user?.id || !chat) return;
    const currentUserId = session.user.id;

    try {
      let query = supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          community_id,
          content,
          media_url,
          media_type,
          created_at,
          profiles:sender_id (id, full_name, username, campus, avatar_url)
        `)
        .order('created_at', { ascending: true })
        .limit(80);

      if (chat.type === 'direct') {
        const partnerId = chat.targetUserId || chat.partnerId;
        if (!partnerId) return;
        query = query.or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`
        );
      } else if (chat.type === 'community' && chat.communityId) {
        query = query.eq('community_id', chat.communityId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const formatted = data.map((m) => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.profiles?.full_name || 'Student',
          campus: m.profiles?.campus || 'Campus Peer',
          content: m.content,
          mediaUrl: m.media_url,
          createdAt: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: m.sender_id === currentUserId,
        }));

        setChatConversations((prev) =>
          prev.map((c) =>
            c.id === chat.id
              ? {
                  ...c,
                  messages: formatted,
                  lastMessage: formatted.length > 0 ? formatted[formatted.length - 1].content : (c.type === 'direct' ? 'No messages yet' : c.lastMessage),
                }
              : c
          )
        );
      }
    } catch (err) {
      console.warn('Error loading chat messages:', err.message);
    }
  };

  // Sync connected friends into Direct Messages list automatically
  useEffect(() => {
    if (friendships.size === 0) return;

    setChatConversations((prev) => {
      let updated = [...prev];
      let changed = false;

      friendships.forEach((friendId) => {
        const friend = registeredStudents.find((s) => s.id === friendId);
        if (!friend) return;

        const exists = updated.some(
          (c) => c.type === 'direct' && (c.targetUserId === friendId || c.partnerId === friendId)
        );
        if (!exists) {
          changed = true;
          updated.push({
            id: `chat-direct-${friendId}`,
            name: friend.full_name,
            type: 'direct',
            targetUserId: friendId,
            partnerId: friendId,
            campus: friend.campus || 'Campus Peer',
            online: true,
            avatarText: getInitials(friend.full_name),
            badge: 'Campus Friend',
            lastMessage: 'Connected as friends! Say hi 👋',
            time: 'Recent',
            messages: [],
          });
        }
      });

      return changed ? updated : prev;
    });
  }, [friendships, registeredStudents]);

  // Load chat messages when active conversation or chat tab changes
  useEffect(() => {
    if (activeTab === 'chat' && isSupabaseConfigured && session?.user?.id) {
      const activeChat = chatConversations.find((c) => c.id === selectedChatId);
      if (activeChat) {
        loadChatMessages(activeChat);
      }
    }
  }, [selectedChatId, activeTab, session?.user?.id]);

  // ============================================================================
  // REAL-TIME DIRECT & COMMUNITY MESSAGES SUBSCRIPTION (SUPABASE WEBSOCKETS)
  // ============================================================================
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user?.id) return;

    const currentUserId = session.user.id;

    const messagesChannel = supabase
      .channel(`realtime:messages:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('⚡ Realtime message received from Supabase:', payload);
          const newMsg = payload.new;

          const isForMeDirect = newMsg.receiver_id === currentUserId;
          const isFromMe = newMsg.sender_id === currentUserId;
          const isCommunity = Boolean(newMsg.community_id);

          if (!isForMeDirect && !isFromMe && !isCommunity) return;

          let senderName = 'Student Peer';
          let senderCampus = 'Campus Peer';

          if (isFromMe) {
            senderName = currentUserProfile?.full_name || 'Me';
            senderCampus = currentUserProfile?.campus || 'Campus';
          } else {
            const { data: prof } = await supabase
              .from('profiles')
              .select('full_name, campus')
              .eq('id', newMsg.sender_id)
              .single();
            if (prof) {
              senderName = prof.full_name || 'Student Peer';
              senderCampus = prof.campus || 'Campus';
            }
          }

          const formattedMessage = {
            id: newMsg.id,
            senderId: newMsg.sender_id,
            senderName,
            campus: senderCampus,
            content: newMsg.content,
            mediaUrl: newMsg.media_url,
            createdAt: new Date(newMsg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: isFromMe,
          };

          let targetChatId = null;

          setChatConversations((prev) => {
            let matched = null;
            if (newMsg.community_id) {
              matched = prev.find((c) => c.communityId === newMsg.community_id);
            } else {
              const partnerId = isFromMe ? newMsg.receiver_id : newMsg.sender_id;
              matched = prev.find(
                (c) => c.type === 'direct' && (c.targetUserId === partnerId || c.partnerId === partnerId)
              );
            }

            if (matched) {
              targetChatId = matched.id;
              return prev.map((c) => {
                if (c.id === matched.id) {
                  if (c.messages.some((m) => m.id === newMsg.id || (m.content === newMsg.content && m.isMine === isFromMe))) {
                    return c;
                  }
                  return {
                    ...c,
                    lastMessage: newMsg.content || 'Sent an attachment',
                    time: 'Just now',
                    messages: [...(c.messages || []), formattedMessage],
                  };
                }
                return c;
              });
            } else if (!isFromMe) {
              const newConvId = `chat-direct-${newMsg.sender_id}`;
              targetChatId = newConvId;
              const newConv = {
                id: newConvId,
                name: senderName,
                type: 'direct',
                targetUserId: newMsg.sender_id,
                partnerId: newMsg.sender_id,
                campus: senderCampus,
                online: true,
                avatarText: getInitials(senderName),
                badge: 'Direct Message',
                lastMessage: newMsg.content || 'Sent an attachment',
                time: 'Just now',
                messages: [formattedMessage],
              };
              return [newConv, ...prev];
            }
            return prev;
          });

          if (!isFromMe) {
            const currentTab = activeTabRef.current;
            const currentChatId = selectedChatIdRef.current;
            if (currentTab !== 'chat' || currentChatId !== targetChatId) {
              showToast(`💬 ${senderName}: ${newMsg.content.slice(0, 45)}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [session?.user?.id]);

  // ============================================================================
  // REAL-TIME LOCAL BROWSER BUS (BROADCASTCHANNEL - MULTI-TAB LIVE SYNC)
  // ============================================================================
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel('studentverse_realtime_chat');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_CHAT_MESSAGE') {
          const { message, targetUserId, communityId, chatId } = event.data;
          const currentId = session?.user?.id || 'demo-student-id';

          const isForMe = targetUserId === currentId;
          const isCommunity = Boolean(communityId);

          if (!isForMe && !isCommunity) return;

          let targetChatId = null;

          setChatConversations((prev) => {
            const partnerId = message.senderId;
            const existingConv = prev.find(
              (c) =>
                (c.type === 'direct' && (c.targetUserId === partnerId || c.partnerId === partnerId)) ||
                (c.type === 'community' && c.communityId === communityId)
            );

            const incomingMsg = { ...message, isMine: false };

            if (existingConv) {
              targetChatId = existingConv.id;
              return prev.map((c) => {
                if (c.id === existingConv.id) {
                  if (c.messages.some((m) => m.id === message.id)) return c;
                  return {
                    ...c,
                    lastMessage: message.content,
                    time: 'Just now',
                    messages: [...(c.messages || []), incomingMsg],
                  };
                }
                return c;
              });
            } else if (isForMe) {
              const newConvId = `chat-direct-${partnerId}`;
              targetChatId = newConvId;
              const newConv = {
                id: newConvId,
                name: message.senderName,
                type: 'direct',
                targetUserId: partnerId,
                partnerId: partnerId,
                campus: message.campus,
                online: true,
                avatarText: getInitials(message.senderName),
                badge: 'Direct Message',
                lastMessage: message.content,
                time: 'Just now',
                messages: [incomingMsg],
              };
              return [newConv, ...prev];
            }
            return prev;
          });

          if (activeTabRef.current !== 'chat' || selectedChatIdRef.current !== targetChatId) {
            showToast(`💬 ${message.senderName}: ${message.content.slice(0, 45)}`);
          }
        }
      };
    } catch (e) {
      // Ignore if BroadcastChannel is unavailable
    }

    return () => {
      bc?.close();
    };
  }, [session?.user?.id]);

  // ============================================================================
  // FOLLOW / UNFOLLOW HANDLERS
  // ============================================================================
  const handleToggleFollow = async (targetUserId, targetName) => {
    if (!session?.user) {
      handleQuickDemoLogin();
    }

    const isFollowing = followingUserIds.has(targetUserId);
    const updated = new Set(followingUserIds);

    if (isFollowing) {
      updated.delete(targetUserId);
      setFollowingUserIds(updated);
      showToast(`Unfollowed ${targetName}`);
    } else {
      updated.add(targetUserId);
      setFollowingUserIds(updated);
      showToast(`You are now following ${targetName} 🎓`);
    }

    if (isSupabaseConfigured && session?.user?.id) {
      try {
        if (isFollowing) {
          await supabase
            .from('follows')
            .delete()
            .match({ follower_id: session.user.id, following_id: targetUserId });
        } else {
          await supabase
            .from('follows')
            .insert({ follower_id: session.user.id, following_id: targetUserId });
        }
      } catch (err) {
        console.warn('Follow toggle error in DB:', err.message);
      }
    }
  };

  // ============================================================================
  // FRIEND REQUEST HANDLERS (REAL-TIME SEND, ACCEPT, DECLINE, CANCEL)
  // ============================================================================
  const handleSendFriendRequest = async (targetUserId, targetName) => {
    if (!session?.user) {
      handleQuickDemoLogin();
    }

    const updated = new Set(sentFriendRequests);
    updated.add(targetUserId);
    setSentFriendRequests(updated);
    showToast(`Friend request sent to ${targetName} ⏳`);

    if (isSupabaseConfigured && session?.user?.id) {
      try {
        const { error } = await supabase
          .from('friend_requests')
          .insert({
            sender_id: session.user.id,
            receiver_id: targetUserId,
            status: 'pending',
          });
        if (error) {
          console.warn('Friend request insert error:', error.message);
        }
      } catch (err) {
        console.warn('Friend request insert error:', err.message);
      }
    }
  };

  const handleCancelFriendRequest = async (targetUserId) => {
    const updated = new Set(sentFriendRequests);
    updated.delete(targetUserId);
    setSentFriendRequests(updated);
    showToast('Friend request cancelled.');

    if (isSupabaseConfigured && session?.user?.id) {
      try {
        await supabase
          .from('friend_requests')
          .delete()
          .eq('sender_id', session.user.id)
          .eq('receiver_id', targetUserId)
          .eq('status', 'pending');
      } catch (err) {
        console.warn('Cancel friend request error:', err.message);
      }
    }
  };

  const handleAcceptFriendRequest = async (requestId, senderId, senderName) => {
    // 1. Remove from incoming requests list
    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));

    // 2. Add to friends set
    const updatedFriends = new Set(friendships);
    updatedFriends.add(senderId);
    setFriendships(updatedFriends);

    // 3. Automatically follow each other
    const updatedFollows = new Set(followingUserIds);
    updatedFollows.add(senderId);
    setFollowingUserIds(updatedFollows);

    showToast(`🤝 You and ${senderName} are now campus friends!`);

    if (isSupabaseConfigured && session?.user?.id) {
      try {
        await supabase
          .from('friend_requests')
          .update({
            status: 'accepted',
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        await supabase
          .from('follows')
          .upsert([
            { follower_id: session.user.id, following_id: senderId },
            { follower_id: senderId, following_id: session.user.id },
          ]);
      } catch (err) {
        console.warn('Accept friend request DB error:', err.message);
      }
    }
  };

  const handleDeclineFriendRequest = async (requestId) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
    showToast('Friend request declined.');

    if (isSupabaseConfigured && session?.user?.id) {
      try {
        await supabase
          .from('friend_requests')
          .delete()
          .eq('id', requestId);
      } catch (err) {
        console.warn('Decline friend request error:', err.message);
      }
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    const updated = new Set(friendships);
    updated.delete(friendId);
    setFriendships(updated);
    showToast(`Removed ${friendName} from friends.`);

    if (isSupabaseConfigured && session?.user?.id) {
      try {
        await supabase
          .from('friend_requests')
          .delete()
          .or(
            `and(sender_id.eq.${session.user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${session.user.id})`
          );
      } catch (err) {
        console.warn('Remove friend error:', err.message);
      }
    }
  };

  // 1-Click Interactive Real-Time Request Tester (for instant browser verification)
  const handleSimulateIncomingRequest = () => {
    showToast('Simulating live friend request from another student in 1.5 seconds...');
    setTimeout(() => {
      const existingSenderIds = new Set([
        ...incomingRequests.map((r) => r.senderId),
        ...friendships,
        session?.user?.id,
      ]);
      const candidate =
        registeredStudents.find((s) => !existingSenderIds.has(s.id)) ||
        registeredStudents[0];

      if (candidate) {
        const simReq = {
          id: `live-req-${Date.now()}`,
          senderId: candidate.id,
          senderName: candidate.full_name,
          username: candidate.username,
          campus: candidate.campus,
          bio: candidate.bio,
          avatarUrl: candidate.avatar_url,
          time: 'Just now',
          isLiveRealtime: true,
        };
        setIncomingRequests((prev) => [simReq, ...prev]);
        showToast(`🔔 Real-time Friend Request received from ${candidate.full_name} (${candidate.campus})!`);
      }
    }, 1500);
  };

  // ============================================================================
  // MEDIA POST COMPOSER & ACTIONS
  // ============================================================================
  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'photo') {
      try {
        showToast('Compressing photo...');
        const compressedBase64 = await compressImageFile(file);
        setPostMediaUrl(compressedBase64);
        setPostMediaType('photo');
        showToast('Photo attached ready to post!');
      } catch (err) {
        console.error('Image compression failed:', err);
        showToast('Could not read image file. Please try another.');
      }
    } else if (type === 'video') {
      const objectUrl = URL.createObjectURL(file);
      setPostMediaUrl(objectUrl);
      setPostMediaType('video');
      showToast('Video clip attached ready to post!');
    }
  };

  const attachSampleMedia = (type, url) => {
    setPostMediaUrl(url);
    setPostMediaType(type);
    showToast(`Sample ${type} attached!`);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    let activeSession = session;
    let activeProfile = currentUserProfile;

    if (!activeSession?.user) {
      handleQuickDemoLogin();
      activeSession = { user: { id: 'demo-student-id' } };
      activeProfile = {
        id: 'demo-student-id',
        full_name: 'Aditya Verma',
        username: 'aditya_v',
        campus: 'IIT Delhi',
      };
    }

    const trimmedContent = postText.trim();
    if (!trimmedContent && !postMediaUrl) {
      showToast('Please type something or attach a photo/video.');
      return;
    }

    const finalContent = trimmedContent || (postMediaType === 'photo' ? 'Campus photo update 📸' : postMediaType === 'video' ? 'Campus video clip 🎥' : 'Campus update');

    setSubmittingPost(true);

    const imageUrl = postMediaType === 'photo' ? postMediaUrl : null;
    const videoUrl = postMediaType === 'video' ? postMediaUrl : null;

    if (!isSupabaseConfigured) {
      const newMockPost = {
        id: `mock-${Date.now()}`,
        user_id: activeSession.user.id,
        content: finalContent,
        image_url: imageUrl,
        video_url: videoUrl,
        media_type: postMediaType,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        profiles: activeProfile || {
          id: 'demo-student-id',
          full_name: 'Aditya Verma',
          username: 'aditya_v',
          campus: 'IIT Delhi',
        },
      };

      setPosts([newMockPost, ...posts]);
      setPostText('');
      setPostMediaUrl('');
      setPostMediaType('text');
      setMediaInputMode(null);
      setSubmittingPost(false);
      showToast('🎉 Your post is live on the campus feed!');
      return;
    }

    try {
      let result = await supabase
        .from('posts')
        .insert({
          user_id: activeSession.user.id,
          content: finalContent,
          image_url: imageUrl,
          video_url: videoUrl,
          media_type: postMediaType,
        })
        .select(`
          id,
          user_id,
          content,
          image_url,
          video_url,
          media_type,
          likes_count,
          comments_count,
          created_at,
          profiles:user_id (id, full_name, username, campus, avatar_url, bio)
        `)
        .single();

      if (result.error && (result.error.message?.includes('video_url') || result.error.message?.includes('media_type'))) {
        result = await supabase
          .from('posts')
          .insert({
            user_id: activeSession.user.id,
            content: finalContent + (videoUrl ? `\n\n🎥 Video: ${videoUrl}` : ''),
            image_url: imageUrl || videoUrl,
          })
          .select(`
            id,
            user_id,
            content,
            image_url,
            likes_count,
            comments_count,
            created_at,
            profiles:user_id (id, full_name, username, campus, avatar_url, bio)
          `)
          .single();
      }

      if (result.error) throw result.error;

      setPosts([result.data, ...posts]);
      setPostText('');
      setPostMediaUrl('');
      setPostMediaType('text');
      setMediaInputMode(null);
      showToast('🎉 Your post is live on the campus feed!');
    } catch (err) {
      console.error('Create post error:', err);
      const fallbackPost = {
        id: `local-${Date.now()}`,
        user_id: activeSession.user.id,
        content: finalContent,
        image_url: imageUrl,
        video_url: videoUrl,
        media_type: postMediaType,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        profiles: activeProfile,
      };
      setPosts([fallbackPost, ...posts]);
      setPostText('');
      setPostMediaUrl('');
      setPostMediaType('text');
      setMediaInputMode(null);
      showToast('Post added to feed!');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!session?.user) {
      handleQuickDemoLogin();
    }

    const isLiked = userLikes.has(postId);
    const updatedLikes = new Set(userLikes);

    if (isLiked) {
      updatedLikes.delete(postId);
      setUserLikes(updatedLikes);
      setPosts(posts.map((p) => (p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p)));
    } else {
      updatedLikes.add(postId);
      setUserLikes(updatedLikes);
      setPosts(posts.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p)));
    }

    if (!isSupabaseConfigured || !session?.user) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .match({ post_id: postId, user_id: session.user.id });
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: session.user.id });
      }
    } catch (err) {
      console.error('Like toggle failed:', err.message);
    }
  };

  const handleDeletePost = async (postId, authorId) => {
    if (!window.confirm('Delete this post?')) return;
    setPosts(posts.filter((p) => p.id !== postId));

    if (!isSupabaseConfigured) {
      showToast('Post deleted.');
      return;
    }

    try {
      await supabase.from('posts').delete().eq('id', postId);
      showToast('Post deleted successfully.');
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  const handleToggleComments = async (postId) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
      return;
    }
    setExpandedCommentsPostId(postId);

    if (!commentsMap[postId] && isSupabaseConfigured) {
      setLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            post_id,
            user_id,
            content,
            created_at,
            profiles:user_id (id, full_name, username, campus, avatar_url)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setCommentsMap((prev) => ({ ...prev, [postId]: data || [] }));
      } catch (err) {
        console.error('Failed to load comments:', err.message);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!session?.user) {
      handleQuickDemoLogin();
    }

    const trimmed = commentInputText.trim();
    if (!trimmed) return;

    const currentComments = commentsMap[postId] || [];
    setCommentInputText('');

    const newComment = {
      id: `comment-${Date.now()}`,
      post_id: postId,
      user_id: session?.user?.id || 'demo-student-id',
      content: trimmed,
      created_at: new Date().toISOString(),
      profiles: currentUserProfile || {
        id: 'demo-student-id',
        full_name: 'Aditya Verma',
        username: 'aditya_v',
        campus: 'IIT Delhi',
      },
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...currentComments, newComment],
    }));
    setPosts(posts.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p)));

    if (!isSupabaseConfigured || !session?.user) return;

    try {
      await supabase.from('comments').insert({
        post_id: postId,
        user_id: session.user.id,
        content: trimmed,
      });
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleToggleCommunity = async (communityId) => {
    if (!session?.user) {
      handleQuickDemoLogin();
    }

    const isMember = userMemberships.has(communityId);
    const updated = new Set(userMemberships);

    if (isMember) {
      updated.delete(communityId);
      setUserMemberships(updated);
      setCommunities(
        communities.map((c) =>
          c.id === communityId ? { ...c, member_count: Math.max(0, c.member_count - 1) } : c
        )
      );
      showToast('You left the community.');
    } else {
      updated.add(communityId);
      setUserMemberships(updated);
      setCommunities(
        communities.map((c) =>
          c.id === communityId ? { ...c, member_count: c.member_count + 1 } : c
        )
      );
      showToast('🎉 Joined club! Check out their group chat.');
    }

    if (!isSupabaseConfigured || !session?.user) return;

    try {
      if (isMember) {
        await supabase
          .from('community_members')
          .delete()
          .match({ community_id: communityId, user_id: session.user.id });
      } else {
        await supabase
          .from('community_members')
          .insert({ community_id: communityId, user_id: session.user.id });
      }
    } catch (err) {
      console.error('Community toggle error:', err);
    }
  };

  // 10. Chatting: Send Message in Active Conversation (Supabase Real-time DB insert)
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!session?.user) {
      handleQuickDemoLogin();
    }

    const text = chatMessageText.trim();
    if (!text && !chatMediaUrl) return;

    const activeChat = chatConversations.find((c) => c.id === selectedChatId);
    if (!activeChat) return;

    const currentUserId = session?.user?.id || 'demo-student-id';
    const myName = currentUserProfile?.full_name || 'Student';
    const myCampus = currentUserProfile?.campus || 'IIT Delhi';

    const localMessageId = `msg-${Date.now()}`;
    const newMessage = {
      id: localMessageId,
      senderId: currentUserId,
      senderName: myName,
      campus: myCampus,
      content: text,
      mediaUrl: chatMediaUrl || null,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };

    // Optimistic UI update
    setChatConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedChatId) {
          return {
            ...c,
            lastMessage: text || 'Sent an attachment',
            time: 'Just now',
            messages: [...(c.messages || []), newMessage],
          };
        }
        return c;
      })
    );

    const savedMediaUrl = chatMediaUrl;
    setChatMessageText('');
    setChatMediaUrl('');

    // If Supabase is configured and authenticated, save to database
    if (isSupabaseConfigured && session?.user?.id) {
      try {
        if (activeChat.type === 'direct') {
          const partnerId = activeChat.targetUserId || activeChat.partnerId;
          if (partnerId) {
            await supabase.from('messages').insert({
              sender_id: session.user.id,
              receiver_id: partnerId,
              content: text || 'Photo',
              media_url: savedMediaUrl || null,
              media_type: savedMediaUrl ? 'photo' : null,
            });
          }
        } else if (activeChat.type === 'community' && activeChat.communityId) {
          await supabase.from('messages').insert({
            sender_id: session.user.id,
            community_id: activeChat.communityId,
            content: text || 'Photo',
            media_url: savedMediaUrl || null,
            media_type: savedMediaUrl ? 'photo' : null,
          });
        }
      } catch (err) {
        console.warn('Failed to insert message to Supabase:', err.message);
      }
    }

    // Cross-tab broadcast for real-time delivery across open browser tabs
    try {
      const bc = new BroadcastChannel('studentverse_realtime_chat');
      bc.postMessage({
        type: 'NEW_CHAT_MESSAGE',
        chatId: selectedChatId,
        targetUserId: activeChat.targetUserId || activeChat.partnerId,
        communityId: activeChat.communityId,
        message: {
          id: localMessageId,
          senderId: currentUserId,
          senderName: myName,
          campus: myCampus,
          content: text,
          mediaUrl: savedMediaUrl || null,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      });
      bc.close();
    } catch (e) {
      // Ignore if BroadcastChannel not available
    }
  };

  const addQuickEmoji = (emoji) => {
    setChatMessageText((prev) => prev + emoji);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!isSupabaseConfigured) {
      handleQuickDemoLogin();
      return;
    }

    if (authMode === 'signup') {
      const { email, password, fullName, username, campus } = authForm;
      const cleanName = fullName.trim() || 'Student';
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: cleanName,
              username: username.trim().toLowerCase(),
              campus: campus.trim(),
            },
          },
        });

        if (error) throw error;

        if (data?.session) {
          showToast(`🎉 Welcome to StudentVerse, ${cleanName}! Your campus space is ready.`);
          setIsAuthModalOpen(false);
          setActiveTab('feed');
          await loadUserProfile(data.session.user.id);
        } else {
          setAuthSuccessMsg('Sign-up successful! Please check your email to confirm or sign in.');
          showToast(`🎉 Welcome to StudentVerse, ${cleanName}! You can now sign in.`);
        }
      } catch (err) {
        setAuthError(err.message || 'Signup failed.');
      }
    } else {
      const { email, password } = authForm;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        const userMeta = data?.user?.user_metadata;
        const displayName = userMeta?.full_name || email.split('@')[0] || 'Student';

        showToast(`👋 Welcome back, ${displayName}! Good to see you on campus.`);
        setIsAuthModalOpen(false);
        setActiveTab('feed');
      } catch (err) {
        setAuthError(err.message || 'Invalid login credentials.');
      }
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setCurrentUserProfile(null);
    setUserLikes(new Set());
    setUserMemberships(new Set());
    showToast('👋 You have been signed out. See you soon on campus!');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updates = {
      id: session?.user?.id || 'demo-student-id',
      full_name: profileForm.fullName.trim(),
      campus: profileForm.campus.trim(),
      bio: profileForm.bio.trim(),
      avatar_url: profileForm.avatarUrl.trim(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && session?.user) {
      await supabase.from('profiles').upsert(updates);
    }

    setCurrentUserProfile((prev) => ({ ...prev, ...updates }));
    setRegisteredStudents((prev) => {
      const idx = prev.findIndex((p) => p.id === updates.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updates };
        return copy;
      }
      return [updates, ...prev];
    });
    setIsProfileModalOpen(false);
    showToast('Profile updated successfully!');
    loadPosts();
  };

  // Direct Chat launcher for any student card
  const startDirectChatWithStudent = (student) => {
    let conv = chatConversations.find(
      (c) => c.type === 'direct' && (c.targetUserId === student.id || c.partnerId === student.id || c.name === student.full_name)
    );
    if (!conv) {
      const newConvId = `chat-direct-${student.id}`;
      conv = {
        id: newConvId,
        name: student.full_name,
        type: 'direct',
        targetUserId: student.id,
        partnerId: student.id,
        campus: student.campus || 'Campus Peer',
        online: true,
        avatarText: getInitials(student.full_name),
        badge: 'Direct Message',
        lastMessage: 'Started conversation',
        time: 'Just now',
        messages: [],
      };
      setChatConversations((prev) => [conv, ...prev]);
    }
    setSelectedChatId(conv.id);
    setActiveTab('chat');
    if (isSupabaseConfigured && session?.user?.id) {
      loadChatMessages(conv);
    }
    showToast(`Opened direct chat with ${student.full_name} 💬`);
  };

  // Unique colleges dynamically from registered accounts
  const availableColleges = useMemo(() => {
    const colleges = new Set();
    registeredStudents.forEach((s) => {
      if (s.campus && s.campus.trim()) {
        colleges.add(s.campus.trim());
      }
    });
    return ['all', ...Array.from(colleges)];
  }, [registeredStudents]);

  // Current logged in user ID to strictly exclude own account from friend search
  const currentUserId = session?.user?.id || currentUserProfile?.id || 'demo-student-id';

  // Filtered registered students for Search & Discover
  const filteredStudents = useMemo(() => {
    const q = studentSearchQuery.trim().toLowerCase();
    const cleanQ = q.replace(/^@/, '');

    return registeredStudents
      // Rule 1: Exclude own logged-in account (only search OTHER registered student accounts)
      .filter((student) => student.id !== currentUserId)
      // Rule 2: Filter by college
      .filter((student) => {
        if (selectedCollegeFilter === 'all') return true;
        return (student.campus || '').toLowerCase() === selectedCollegeFilter.toLowerCase();
      })
      // Rule 3: Search query matches name, username, campus, or bio
      .filter((student) => {
        if (!q) return true;
        const nameMatch = (student.full_name || '').toLowerCase().includes(q);
        const handleMatch = (student.username || '').toLowerCase().replace(/^@/, '').includes(cleanQ);
        const campusMatch = (student.campus || '').toLowerCase().includes(q);
        const bioMatch = (student.bio || '').toLowerCase().includes(q);
        return nameMatch || handleMatch || campusMatch || bioMatch;
      });
  }, [registeredStudents, currentUserId, selectedCollegeFilter, studentSearchQuery]);

  // Filtered Posts based on search & media/follow filter tabs
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Filter by FOLLOWING only
      if (feedFilter === 'following') {
        if (!followingUserIds.has(post.user_id)) return false;
      }
      // 2. Filter by Photos
      if (feedFilter === 'photos') {
        if (!post.image_url && post.media_type !== 'photo') return false;
      }
      // 3. Filter by Videos
      if (feedFilter === 'videos') {
        if (!post.video_url && post.media_type !== 'video') return false;
      }
      // 4. Filter by Campus
      if (feedFilter === 'my_campus') {
        const userCampus = currentUserProfile?.campus || '';
        if (userCampus && post.profiles?.campus?.toLowerCase() !== userCampus.toLowerCase()) {
          return false;
        }
      }

      // Filter by active tab if looking at profile
      if (activeTab === 'profile') {
        if (post.user_id !== session?.user?.id && post.user_id !== 'demo-student-id') return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch = post.content?.toLowerCase().includes(q);
        const authorMatch = post.profiles?.full_name?.toLowerCase().includes(q);
        const usernameMatch = post.profiles?.username?.toLowerCase().includes(q);
        const campusMatch = post.profiles?.campus?.toLowerCase().includes(q);
        return textMatch || authorMatch || usernameMatch || campusMatch;
      }

      return true;
    });
  }, [posts, feedFilter, searchQuery, activeTab, currentUserProfile, session, followingUserIds]);

  const currentChat =
    chatConversations.find((c) => c.id === selectedChatId) ||
    chatConversations[0] || {
      id: 'default',
      name: 'Campus Chat',
      type: 'direct',
      messages: [],
      badge: 'Chat',
      avatarText: 'SV',
      campus: 'Campus',
    };

  // 1. Initial Loading Screen while checking existing session
  if (authLoading) {
    return (
      <div className="auth-portal-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--primary)' }}>
          <div className="brand-logo-icon" style={{ width: '64px', height: '64px', borderRadius: '18px', animation: 'pulse 1.8s infinite' }}>
            <GraduationCap size={32} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>StudentVerse</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Connecting to campus...</p>
        </div>
      </div>
    );
  }

  // 2. Full-Screen Instagram-Style Split Login & Sign-Up Portal if user is not authenticated
  if (!session?.user) {
    return (
      <div className="insta-auth-page">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="toast-banner" style={{ zIndex: 9999 }}>
            <Sparkles size={18} color="#a855f7" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="insta-auth-container">
          {/* ================================================================
              LEFT COLUMN: INSTAGRAM-STYLE HERO BRAND & STORIES SHOWCASE
              ================================================================ */}
          <div className="insta-hero-side">
            {/* Top Brand Logo */}
            <div className="insta-brand-row">
              <div className="insta-brand-logo">
                <GraduationCap size={24} />
              </div>
              <span className="insta-brand-name">StudentVerse</span>
            </div>

            {/* Center Catchy Hero Headline & Stacked Mockup Cards */}
            <div className="insta-hero-center">
              <h1 className="insta-hero-title">
                <span className="insta-hero-badge">See</span> everyday moments from your{' '}
                <span className="insta-hero-highlight">close friends</span>.
              </h1>
              <p className="insta-hero-sub">
                Connect with campus peers, share college stories, post photos & videos, and stay in the loop in real time.
              </p>

              {/* Stacked Interactive Story Cards Mockup */}
              <div className="insta-mockup-stage">
                {/* Floating 3D Heart */}
                <div className="insta-float-heart">💖</div>

                {/* Left Card: Campus Vibe */}
                <div
                  className="insta-mockup-card card-left"
                  style={{
                    backgroundImage:
                      'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80)',
                  }}
                />

                {/* Right Card: College Friends Hangout */}
                <div
                  className="insta-mockup-card card-right"
                  style={{
                    backgroundImage:
                      'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80)',
                  }}
                >
                  <div className="insta-close-badge">⭐</div>
                </div>

                {/* Center Phone Card: Active Student Story */}
                <div
                  className="insta-mockup-card card-center"
                  style={{
                    backgroundImage:
                      'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%), url(https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80)',
                  }}
                >
                  {/* Floating Reaction Pill */}
                  <div className="insta-reaction-pill">
                    <span>🔮</span>
                    <span>👀</span>
                    <span>🤯</span>
                  </div>

                  {/* Top Story Progress Bar */}
                  <div className="insta-story-bar">
                    <div className="insta-story-fill" />
                  </div>

                  {/* Bottom Story Info Pill */}
                  <div className="insta-card-bottom">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        RG
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>@rohan_gupta</span>
                    </div>
                    <Heart size={18} color="#ec4899" fill="#ec4899" />
                  </div>
                </div>
              </div>
            </div>

            {/* Left Bottom Tagline */}
            <div style={{ color: '#52525b', fontSize: '0.85rem' }}>
              Made for college campuses across India & worldwide.
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN: INSTAGRAM-STYLE MODERN SLEEK AUTH FORM
              ================================================================ */}
          <div className="insta-form-side">
            <div className="insta-auth-box">
              <h2 className="insta-auth-title">
                {authMode === 'signup' ? 'Create your student account' : 'Log in to StudentVerse'}
              </h2>
              <p className="insta-auth-subtitle">
                {authMode === 'signup'
                  ? 'Join your campus peers, discover student communities, and chat.'
                  : 'Welcome back! Sign in to see updates from your campus peers.'}
              </p>

              {authError && (
                <div className="alert-box alert-error" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccessMsg && (
                <div className="alert-box alert-success" style={{ marginBottom: '16px' }}>
                  <CheckCircle size={16} />
                  <span>{authSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit}>
                {authMode === 'signup' && (
                  <>
                    <div className="insta-input-group">
                      <label className="insta-input-label">Full Name</label>
                      <input
                        type="text"
                        className="insta-input"
                        placeholder="e.g. Rohan Gupta"
                        required
                        value={authForm.fullName}
                        onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                      />
                    </div>

                    <div className="insta-input-group">
                      <label className="insta-input-label">Username</label>
                      <input
                        type="text"
                        className="insta-input"
                        placeholder="e.g. rohan_g"
                        required
                        value={authForm.username}
                        onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                      />
                    </div>

                    <div className="insta-input-group">
                      <label className="insta-input-label">College / Campus</label>
                      <input
                        type="text"
                        className="insta-input"
                        placeholder="e.g. IIT Delhi, Delhi University"
                        required
                        value={authForm.campus}
                        onChange={(e) => setAuthForm({ ...authForm, campus: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="insta-input-group">
                  <label className="insta-input-label">
                    {authMode === 'signup' ? 'Email address' : 'Mobile number, username or email address'}
                  </label>
                  <input
                    type="email"
                    className="insta-input"
                    placeholder="student@example.com"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                </div>

                <div className="insta-input-group">
                  <label className="insta-input-label">Password</label>
                  <input
                    type="password"
                    className="insta-input"
                    placeholder="Password (min 6 characters)"
                    required
                    minLength={6}
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                </div>

                <button type="submit" className="insta-submit-btn">
                  {authMode === 'signup' ? 'Create student account' : 'Log in'}
                </button>

                {authMode === 'signin' && (
                  <button
                    type="button"
                    className="insta-forgot-link"
                    onClick={() => showToast('ℹ️ Tip: Use 1-Click Instant Demo Login or enter registered credentials.')}
                  >
                    Forgotten password?
                  </button>
                )}
              </form>

              {/* Instagram-style Divider */}
              <div className="insta-divider">
                <span>OR</span>
              </div>

              {/* 1-Click Instant Demo Login button (styled like Log in with Facebook) */}
              <button
                type="button"
                className="insta-demo-btn"
                onClick={handleQuickDemoLogin}
              >
                <Zap size={18} />
                <span>⚡ Instant 1-Click Demo Login</span>
              </button>

              {/* Toggle between Login and Create Account */}
              <button
                type="button"
                className="insta-toggle-btn"
                onClick={() => {
                  setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
              >
                {authMode === 'signup' ? 'Have an account? Log in' : 'Create new account'}
              </button>

              {/* Branding Footer */}
              <div className="insta-brand-footer">
                <GraduationCap size={16} />
                <span>StudentVerse from Campus Meta</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container insta-layout-container">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="toast-banner">
          <Sparkles size={18} color="#a855f7" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================
          LEFT NAV RAIL (INSTAGRAM STYLE SLIM SIDEBAR)
          ======================================================================== */}
      <aside className="insta-nav-rail">
        <div className="insta-rail-top">
          {/* Brand Logo Icon */}
          <div className="insta-rail-logo" onClick={() => setActiveTab('feed')} title="StudentVerse Home">
            <GraduationCap size={26} />
          </div>

          {/* Navigation Icon Items */}
          <nav className="insta-rail-nav">
            <button
              className={`insta-rail-btn ${activeTab === 'feed' && feedFilter !== 'videos' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('feed');
                setFeedFilter('all');
              }}
              title="Home"
            >
              <Home size={24} />
            </button>

            <button
              className={`insta-rail-btn ${activeTab === 'connections' && connectionsSubTab === 'discover' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('connections');
                setConnectionsSubTab('discover');
              }}
              title="Search & Discover"
            >
              <Search size={24} />
            </button>

            <button
              className={`insta-rail-btn ${feedFilter === 'videos' && activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('feed');
                setFeedFilter('videos');
              }}
              title="Reels / Campus Videos"
            >
              <Film size={24} />
            </button>

            <button
              className={`insta-rail-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
              title="Messages"
            >
              <div className="insta-rail-icon-wrapper">
                <Send size={24} />
                <span className="insta-rail-dot" />
              </div>
            </button>

            <button
              className={`insta-rail-btn ${activeTab === 'connections' && connectionsSubTab === 'requests' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('connections');
                setConnectionsSubTab('requests');
              }}
              title="Notifications"
            >
              <div className="insta-rail-icon-wrapper">
                <Heart size={24} />
                {incomingRequests.length > 0 && (
                  <span className="insta-rail-count-badge">{incomingRequests.length}</span>
                )}
              </div>
            </button>

            <button
              className="insta-rail-btn"
              onClick={() => setIsCreatePostModalOpen(true)}
              title="Create Post"
            >
              <PlusCircle size={24} />
            </button>

            <button
              className={`insta-rail-btn ${activeTab === 'communities' ? 'active' : ''}`}
              onClick={() => setActiveTab('communities')}
              title="Explore Clubs"
            >
              <Compass size={24} />
            </button>

            <button
              className={`insta-rail-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
              title="My Profile"
            >
              <div className={`insta-rail-avatar-ring ${activeTab === 'profile' ? 'active' : ''}`}>
                {currentUserProfile?.avatar_url ? (
                  <img
                    src={currentUserProfile.avatar_url}
                    alt={currentUserProfile.full_name}
                    className="insta-rail-avatar-img"
                  />
                ) : (
                  <div className="insta-rail-avatar-initials">
                    {getInitials(currentUserProfile?.full_name || 'U')}
                  </div>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Menu / More Action */}
        <div className="insta-rail-bottom" style={{ position: 'relative' }}>
          <button
            className="insta-rail-btn"
            title="More Options"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
          >
            <Menu size={24} />
          </button>

          {moreMenuOpen && (
            <div className="insta-more-dropdown">
              <button
                className="insta-dropdown-item"
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setMoreMenuOpen(false);
                }}
              >
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
              <button
                className="insta-dropdown-item"
                onClick={() => {
                  setActiveTab('connections');
                  setMoreMenuOpen(false);
                }}
              >
                <Users size={16} />
                <span>Friends ({friendships.size})</span>
              </button>
              <div className="insta-dropdown-divider" />
              <button
                className="insta-dropdown-item danger"
                onClick={() => {
                  handleSignOut();
                  setMoreMenuOpen(false);
                }}
              >
                <LogOut size={16} />
                <span>Switch / Log Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================
          MOBILE TOP HEADER
          ======================================================================== */}
      <header className="mobile-top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="brand-logo-icon" style={{ width: '32px', height: '32px' }}>
            <GraduationCap size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1e1b4b' }}>StudentVerse</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('connections')}
            style={{ background: 'none', border: 'none', position: 'relative', color: activeTab === 'connections' ? 'var(--primary)' : 'var(--text-secondary)' }}
            aria-label="Friends & requests"
          >
            <HeartHandshake size={22} />
            {incomingRequests.length > 0 && (
              <span className="mobile-nav-badge">{incomingRequests.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            style={{ background: 'none', border: 'none', color: activeTab === 'chat' ? 'var(--primary)' : 'var(--text-secondary)' }}
            aria-label="Open chat"
          >
            <MessageCircle size={22} />
          </button>
          {session?.user ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div className="avatar-circle avatar-sm" style={{ background: 'var(--primary-gradient)' }}>
                {getInitials(currentUserProfile?.full_name || 'U')}
              </div>
            </button>
          ) : (
            <button
              onClick={handleQuickDemoLogin}
              className="action-pill-btn"
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', fontSize: '0.78rem', padding: '4px 10px' }}
            >
              Demo Login
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================
          MAIN CONTAINER (FEED, CHAT, CONNECTIONS, OR CLUBS)
          ======================================================================== */}
      <main className={`main-feed-container ${activeTab === 'chat' ? 'chat-mode' : activeTab === 'connections' ? 'wide-mode' : ''}`}>
        {/* MEDIA FILTER TABS */}
        {activeTab === 'feed' && (
          <div className="feed-header" style={{ marginBottom: '16px' }}>
            <div className="feed-filter-tabs">
              <button
                className={`filter-tab ${feedFilter === 'all' ? 'active' : ''}`}
                onClick={() => setFeedFilter('all')}
              >
                🌐 All Updates
              </button>

              {/* FOLLOWING FEED FILTER TAB */}
              <button
                className={`filter-tab ${feedFilter === 'following' ? 'active' : ''}`}
                onClick={() => setFeedFilter('following')}
              >
                <Users size={14} />
                <span>Following ({followingUserIds.size})</span>
              </button>

              <button
                className={`filter-tab ${feedFilter === 'photos' ? 'active' : ''}`}
                onClick={() => setFeedFilter('photos')}
              >
                📷 Photos
              </button>
              <button
                className={`filter-tab ${feedFilter === 'videos' ? 'active' : ''}`}
                onClick={() => setFeedFilter('videos')}
              >
                🎥 Campus Videos & Reels
              </button>
              {currentUserProfile?.campus && (
                <button
                  className={`filter-tab ${feedFilter === 'my_campus' ? 'active' : ''}`}
                  onClick={() => setFeedFilter('my_campus')}
                >
                  🎓 {currentUserProfile.campus}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================
            TAB 1: SOCIAL FEED (POSTS, PHOTOS & VIDEOS)
            ====================================================================== */}
        {activeTab === 'feed' && (
          <>
            {/* Top Instagram-Style Stories Tray */}
            <div className="stories-tray-container">
              <div className="stories-scroll-row" id="stories-scroll-container">
                {/* Current User Add Story */}
                <button
                  type="button"
                  className="story-item"
                  onClick={() => setIsAddStoryModalOpen(true)}
                  title="Add to your story"
                >
                  <div className="story-ring user-add">
                    <div className="story-avatar user-avatar-box">
                      {getInitials(currentUserProfile?.full_name || 'You')}
                    </div>
                    <div className="story-add-badge">+</div>
                  </div>
                  <span className="story-username">Your story</span>
                </button>

                {/* Campus Peer Stories */}
                {campusStories.map((story) => (
                  <button
                    type="button"
                    key={story.id}
                    className="story-item"
                    onClick={() => {
                      setActiveStory(story);
                      setCampusStories((prev) =>
                        prev.map((s) => (s.id === story.id ? { ...s, hasUnseen: false } : s))
                      );
                    }}
                    title={`View ${story.name}'s story`}
                  >
                    <div className={`story-ring ${story.hasUnseen ? 'unseen' : 'seen'}`}>
                      <img src={story.avatar} alt={story.name} className="story-avatar" />
                    </div>
                    <span className="story-username">{story.username}</span>
                  </button>
                ))}
              </div>

              {/* Scroll Right Button */}
              <button
                type="button"
                className="stories-arrow-btn"
                onClick={() => {
                  const container = document.getElementById('stories-scroll-container');
                  container?.scrollBy({ left: 180, behavior: 'smooth' });
                }}
                aria-label="Scroll stories right"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Posts Stream */}
            {loadingPosts ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="loading-skeleton-card">
                  <div className="skeleton-line" style={{ width: '40%' }} />
                  <div className="skeleton-line" style={{ width: '90%', height: '24px' }} />
                  <div className="skeleton-line" style={{ width: '60%' }} />
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <GraduationCap size={28} />
                </div>
                <h3 className="empty-state-title">No posts found</h3>
                <p className="empty-state-desc">
                  {feedFilter === 'following'
                    ? 'No posts from students you follow yet. Head to "Friends & Requests" to discover and follow peers!'
                    : feedFilter === 'photos'
                    ? 'No photos uploaded yet. Share the first campus photo above!'
                    : feedFilter === 'videos'
                    ? 'No videos uploaded yet. Share a project demo clip above!'
                    : 'Be the first student to publish an update or project idea!'}
                </p>
              </div>
            ) : (
              <div className="feed-posts-list">
                {filteredPosts.map((post) => {
                  const author = post.profiles || {};
                  const isAuthor = (session?.user?.id && session.user.id === post.user_id) || post.user_id === 'demo-student-id';
                  const isLiked = userLikes.has(post.id);
                  const isFollowing = followingUserIds.has(post.user_id);
                  const isFriend = friendships.has(post.user_id);
                  const hasSentRequest = sentFriendRequests.has(post.user_id);
                  const isSaved = savedPostIds.has(post.id);
                  const comments = commentsMap[post.id] || [];
                  const ytEmbed = getYouTubeEmbedUrl(post.video_url);
                  const isVideo = Boolean(post.video_url);

                  return (
                    <article key={post.id} className="insta-post-card">
                      {/* Post Header */}
                      <header className="insta-post-header">
                        <div className="insta-post-author-row">
                          <div className="insta-author-avatar-ring">
                            {author.avatar_url ? (
                              <img
                                src={author.avatar_url}
                                alt={author.full_name}
                                className="insta-author-avatar"
                              />
                            ) : (
                              <div
                                className="insta-author-avatar"
                                style={{
                                  background: 'var(--primary-gradient)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                }}
                              >
                                {getInitials(author.full_name || 'Student')}
                              </div>
                            )}
                          </div>
                          <div className="insta-post-author-info">
                            <div className="insta-post-username-line">
                              <span>
                                {author.username || author.full_name?.toLowerCase().replace(/\s+/g, '_') || 'student'}
                              </span>
                              <span className="insta-post-dot">•</span>
                              <span className="insta-post-time">{getRelativeTime(post.created_at)}</span>

                              {/* Follow Button directly in header */}
                              {!isAuthor && (
                                <>
                                  <span className="insta-post-dot">•</span>
                                  <button
                                    className={`insta-follow-link-btn ${isFollowing ? 'following' : ''}`}
                                    style={{ padding: '0 4px' }}
                                    onClick={() => handleToggleFollow(post.user_id, author.full_name)}
                                  >
                                    {isFollowing ? 'Following' : 'Follow'}
                                  </button>
                                </>
                              )}

                              {isFriend && (
                                <span className="friends-pill" style={{ marginLeft: '4px', fontSize: '0.68rem', padding: '1px 6px' }}>
                                  🤝 Friend
                                </span>
                              )}
                            </div>
                            <span className="insta-post-subtitle">
                              {isVideo ? '🎵 Original audio' : (author.campus || 'Campus')}
                            </span>
                          </div>
                        </div>

                        {/* Right Options */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {!isAuthor && !isFriend && (
                            <button
                              className={hasSentRequest ? 'btn-requested' : 'btn-follow'}
                              onClick={() => {
                                if (hasSentRequest) handleCancelFriendRequest(post.user_id);
                                else handleSendFriendRequest(post.user_id, author.full_name);
                              }}
                              style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                            >
                              {hasSentRequest ? 'Requested ⏳' : '+ Add Friend'}
                            </button>
                          )}

                          {isAuthor && (
                            <button
                              className="delete-post-btn"
                              title="Delete Post"
                              onClick={() => handleDeletePost(post.id, post.user_id)}
                              aria-label="Delete post"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}

                          <button
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            onClick={() => {
                              navigator.clipboard?.writeText(window.location.href);
                              showToast('Post link copied to clipboard!');
                            }}
                            title="More options"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </div>
                      </header>

                      {/* Post Media (Photo or Video) */}
                      {post.image_url && (
                        <div className="insta-post-media-container">
                          <img
                            src={post.image_url}
                            alt="Post attachment"
                            className="insta-post-media-img"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {post.video_url && (
                        <div className="insta-post-media-container">
                          {ytEmbed ? (
                            <iframe
                              src={ytEmbed}
                              title="YouTube video player"
                              className="post-video-iframe"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <>
                              <video
                                src={post.video_url}
                                loop
                                autoPlay
                                playsInline
                                muted={isGlobalMuted}
                                className="insta-post-media-video"
                              />
                              <button
                                type="button"
                                className="insta-media-mute-btn"
                                onClick={() => setIsGlobalMuted(!isGlobalMuted)}
                                title={isGlobalMuted ? 'Unmute' : 'Mute'}
                              >
                                {isGlobalMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Instagram Action Bar (Like, Comment, Share, Bookmark) */}
                      <div className="insta-post-action-bar">
                        <div className="insta-action-left">
                          <button
                            className={`insta-action-icon-btn ${isLiked ? 'liked' : ''}`}
                            onClick={() => handleToggleLike(post.id)}
                            aria-label={isLiked ? 'Unlike' : 'Like'}
                            title={isLiked ? 'Unlike' : 'Like'}
                          >
                            <Heart
                              size={24}
                              fill={isLiked ? 'var(--like-red)' : 'none'}
                              color={isLiked ? 'var(--like-red)' : 'currentColor'}
                            />
                          </button>

                          <button
                            className="insta-action-icon-btn"
                            onClick={() => handleToggleComments(post.id)}
                            aria-label="Comment"
                            title="Comment"
                          >
                            <MessageCircle size={24} />
                          </button>

                          <button
                            className="insta-action-icon-btn"
                            onClick={() => {
                              navigator.clipboard?.writeText(window.location.href);
                              showToast('Link copied to share with friends!');
                            }}
                            aria-label="Share"
                            title="Share"
                          >
                            <Send size={22} />
                          </button>
                        </div>

                        <button
                          className="insta-action-icon-btn"
                          onClick={() => handleToggleSavePost(post.id)}
                          aria-label={isSaved ? 'Remove Bookmark' : 'Bookmark'}
                          title={isSaved ? 'Saved' : 'Save'}
                        >
                          <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Post Details: Likes, Caption, Comments */}
                      <div className="insta-post-details">
                        <div className="insta-likes-count">
                          {(post.likes_count || 0) + (isLiked ? 1 : 0)} likes
                        </div>

                        {post.content && (
                          <div className="insta-caption">
                            <span className="insta-caption-author">
                              {author.username || author.full_name?.toLowerCase().replace(/\s+/g, '_') || 'student'}
                            </span>
                            {post.content}
                          </div>
                        )}

                        {/* View comments button / list */}
                        {(post.comments_count || 0) > 0 && (
                          <button
                            className="insta-view-comments-btn"
                            onClick={() => handleToggleComments(post.id)}
                          >
                            {expandedCommentsPostId === post.id
                              ? 'Hide comments'
                              : `View all ${post.comments_count} comments`}
                          </button>
                        )}

                        {/* Expanded Comments */}
                        {expandedCommentsPostId === post.id && (
                          <div style={{ marginBottom: '10px' }}>
                            {loadingComments ? (
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '4px 0' }}>
                                Loading comments...
                              </div>
                            ) : comments.length === 0 ? (
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '4px 0' }}>
                                No comments yet. Be the first to comment!
                              </div>
                            ) : (
                              comments.map((c) => (
                                <div key={c.id} className="insta-comment-row">
                                  <span style={{ fontWeight: 700, marginRight: '6px' }}>
                                    {c.profiles?.username || c.profiles?.full_name || 'student'}
                                  </span>
                                  <span>{c.content}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Inline Add a comment Form (Instagram style) */}
                        <form
                          className="insta-inline-comment-form"
                          onSubmit={(e) => handleInlineCommentSubmit(post.id, e)}
                        >
                          <Smile size={18} color="var(--text-muted)" />
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            className="insta-comment-input"
                            value={inlineComments[post.id] || ''}
                            onChange={(e) =>
                              setInlineComments({ ...inlineComments, [post.id]: e.target.value })
                            }
                          />
                          <button
                            type="submit"
                            className="insta-comment-post-btn"
                            disabled={!inlineComments[post.id]?.trim()}
                          >
                            Post
                          </button>
                        </form>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ======================================================================
            TAB 2: CONNECTIONS, FRIENDS & FOLLOW SECTION
            ====================================================================== */}
        {activeTab === 'connections' && (
          <div className="connections-container">
            <div style={{ marginBottom: '4px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e1b4b' }}>
                Campus Friends & Connections
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Manage incoming friend requests, follow peers across colleges, and build your campus network.
              </p>
            </div>

            {/* Sub-navigation tabs */}
            <div className="connections-subnav">
              <button
                className={`connection-tab-btn ${connectionsSubTab === 'requests' ? 'active' : ''}`}
                onClick={() => setConnectionsSubTab('requests')}
              >
                <Bell size={16} />
                <span>Friend Requests ({incomingRequests.length})</span>
                {incomingRequests.length > 0 && (
                  <span className="registered-tag" style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '1px 6px', fontSize: '0.68rem' }}>
                    Live
                  </span>
                )}
              </button>

              <button
                className={`connection-tab-btn ${connectionsSubTab === 'discover' ? 'active' : ''}`}
                onClick={() => setConnectionsSubTab('discover')}
              >
                <Search size={16} />
                <span>Find & Follow Students</span>
              </button>

              <button
                className={`connection-tab-btn ${connectionsSubTab === 'friends' ? 'active' : ''}`}
                onClick={() => setConnectionsSubTab('friends')}
              >
                <HeartHandshake size={16} />
                <span>My Friends ({friendships.size})</span>
              </button>
            </div>

            {/* SUBTAB 1: INCOMING FRIEND REQUESTS (REAL-TIME) */}
            {connectionsSubTab === 'requests' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Incoming Requests
                    </span>
                    <span className="registered-tag" style={{ background: '#f0fdf4', color: '#15803d' }}>
                      ⚡ Real-Time Active
                    </span>
                  </div>
                  <button
                    className="action-pill-btn"
                    style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    onClick={handleSimulateIncomingRequest}
                    title="Simulate receiving a live request from another student"
                  >
                    <Zap size={13} />
                    <span>Test Real-Time Incoming Request ⚡</span>
                  </button>
                </div>

                {incomingRequests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <HeartHandshake size={28} />
                    </div>
                    <h3 className="empty-state-title">No pending friend requests</h3>
                    <p className="empty-state-desc">
                      When students on StudentVerse send you a friend request, it will appear here in <strong>real-time</strong> instantly!
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button
                        className="action-pill-btn"
                        style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}
                        onClick={() => setConnectionsSubTab('discover')}
                      >
                        <Search size={14} />
                        <span>Search & Add Friends</span>
                      </button>
                      <button
                        className="action-pill-btn"
                        onClick={handleSimulateIncomingRequest}
                      >
                        <Zap size={14} />
                        <span>Simulate Incoming Request</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="widget-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '14px',
                          flexWrap: 'wrap',
                          borderLeft: req.isLiveRealtime ? '4px solid #10b981' : '1px solid var(--border-color)',
                          background: req.isLiveRealtime ? '#f0fdf4' : '#ffffff',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            className="avatar-circle avatar-md"
                            style={{ background: 'var(--primary-gradient)' }}
                          >
                            {getInitials(req.senderName)}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{req.senderName}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{req.username}</span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>• {req.time}</span>
                              {req.isLiveRealtime && (
                                <span className="registered-tag" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.68rem' }}>
                                  ⚡ Just Now (Live)
                                </span>
                              )}
                            </div>
                            <div className="campus-badge" style={{ marginTop: '2px' }}>
                              <GraduationCap size={12} />
                              <span>{req.campus}</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              {req.bio}
                            </p>
                          </div>
                        </div>

                        {/* Accept / Decline Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            className="btn-accept-friend"
                            onClick={() => handleAcceptFriendRequest(req.id, req.senderId, req.senderName)}
                          >
                            <UserCheck size={15} />
                            <span>Accept</span>
                          </button>
                          <button
                            className="btn-decline-friend"
                            onClick={() => handleDeclineFriendRequest(req.id)}
                          >
                            <X size={15} />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 2: DISCOVER & SEARCH REGISTERED STUDENTS */}
            {connectionsSubTab === 'discover' && (
              <div>
                {/* Search Bar & College Chips */}
                <div className="student-search-section">
                  <div className="student-search-input-box">
                    <Search size={18} className="search-icon" style={{ left: '16px' }} />
                    <input
                      type="text"
                      className="student-search-input"
                      placeholder="Search registered students by name, @username, or college (e.g. Aarav, @priya, IIT)..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                    />
                    {studentSearchQuery && (
                      <button
                        className="search-clear-btn"
                        style={{ right: '14px' }}
                        onClick={() => setStudentSearchQuery('')}
                        title="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* College Filter Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div className="college-filter-chips">
                      {availableColleges.map((college) => (
                        <button
                          key={college}
                          className={`college-chip-btn ${selectedCollegeFilter === college ? 'active' : ''}`}
                          onClick={() => setSelectedCollegeFilter(college)}
                        >
                          {college === 'all' ? '🏫 All Colleges' : college}
                        </button>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {filteredStudents.length} {filteredStudents.length === 1 ? 'registered account' : 'registered accounts'}
                    </div>
                  </div>
                </div>

                {/* Results Grid or Empty State */}
                {filteredStudents.length === 0 ? (
                  <div className="empty-state" style={{ padding: '36px 20px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
                    <div className="empty-state-icon">
                      <Search size={30} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h3 className="empty-state-title">No registered student found</h3>
                    <p className="empty-state-desc" style={{ maxWidth: '440px', margin: '0 auto 16px auto' }}>
                      {studentSearchQuery ? (
                        <>
                          We couldn't find any registered student account matching "<strong>{studentSearchQuery}</strong>"
                          {selectedCollegeFilter !== 'all' ? ` in ${selectedCollegeFilter}` : ''}.
                          <br />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Note: Only students who have registered accounts on StudentVerse appear in search.
                          </span>
                        </>
                      ) : (
                        'No registered students found for this college filter.'
                      )}
                    </p>
                    {(studentSearchQuery || selectedCollegeFilter !== 'all') && (
                      <button
                        className="action-pill-btn"
                        onClick={() => {
                          setStudentSearchQuery('');
                          setSelectedCollegeFilter('all');
                        }}
                        style={{ margin: '0 auto', background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary-border)' }}
                      >
                        Reset Search Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="student-peer-grid">
                    {filteredStudents.map((peer) => {
                      const isFollowing = followingUserIds.has(peer.id);
                      const isFriend = friendships.has(peer.id);
                      const hasSentRequest = sentFriendRequests.has(peer.id);

                      return (
                        <div key={peer.id} className="student-peer-card">
                          <div className="peer-card-top">
                            {peer.avatar_url ? (
                              <img
                                src={peer.avatar_url}
                                alt={peer.full_name}
                                className="avatar-circle avatar-md"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="avatar-circle avatar-md"
                                style={{ background: 'var(--primary-gradient)' }}
                              >
                                {getInitials(peer.full_name)}
                              </div>
                            )}
                            <div className="peer-card-meta">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="peer-card-name">{peer.full_name}</span>
                                <span className="registered-tag" title="Verified Registered Student Account">
                                  ✓ Account
                                </span>
                              </div>
                              <div className="peer-card-handle">@{peer.username}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                                <div className="campus-badge">
                                  <GraduationCap size={11} />
                                  <span>{peer.campus}</span>
                                </div>
                                <span className="peer-followers-badge">
                                  <Users size={10} />
                                  <span>{peer.followers_count || (isFollowing ? 1 : 0)} followers</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="peer-card-bio">{peer.bio || 'Campus student collaborating on StudentVerse.'}</p>

                          <div className="peer-card-actions">
                            {/* FOLLOW / UNFOLLOW TOGGLE */}
                            <button
                              className={isFollowing ? 'btn-following' : 'btn-follow'}
                              onClick={() => handleToggleFollow(peer.id, peer.full_name)}
                              title={isFollowing ? 'Click to unfollow' : 'Click to follow'}
                            >
                              {isFollowing ? (
                                <>
                                  <UserCheck size={14} />
                                  <span>Following</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus size={14} />
                                  <span>+ Follow</span>
                                </>
                              )}
                            </button>

                            {/* FRIEND REQUEST TOGGLE */}
                            {isFriend ? (
                              <span className="friends-pill">
                                🤝 Friends
                              </span>
                            ) : hasSentRequest ? (
                              <button
                                className="btn-requested"
                                onClick={() => handleCancelFriendRequest(peer.id)}
                                title="Cancel sent friend request"
                              >
                                <Clock size={13} />
                                <span>Requested ⏳</span>
                              </button>
                            ) : (
                              <button
                                className="btn-add-friend"
                                onClick={() => handleSendFriendRequest(peer.id, peer.full_name)}
                              >
                                <UserPlus size={14} />
                                <span>Add Friend</span>
                              </button>
                            )}

                            {/* DIRECT CHAT BUTTON */}
                            <button
                              className="btn-chat-peer"
                              onClick={() => startDirectChatWithStudent(peer)}
                              title={`Direct message with ${peer.full_name}`}
                            >
                              <MessageCircle size={13} />
                              <span>Chat</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 3: MY FRIENDS LIST */}
            {connectionsSubTab === 'friends' && (
              <div>
                {friendships.size === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Users size={28} />
                    </div>
                    <h3 className="empty-state-title">No friends connected yet</h3>
                    <p className="empty-state-desc">
                      Accept incoming friend requests or send requests in the "Find & Follow Students" tab!
                    </p>
                    <button
                      className="action-pill-btn"
                      style={{ margin: '12px auto 0 auto', background: 'var(--primary)', color: '#fff', border: 'none' }}
                      onClick={() => setConnectionsSubTab('discover')}
                    >
                      <Search size={14} />
                      <span>Find Students Now</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {registeredStudents.filter((p) => friendships.has(p.id)).map((friend) => (
                      <div
                        key={friend.id}
                        className="widget-card"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            className="avatar-circle avatar-md"
                            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                          >
                            {getInitials(friend.full_name)}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{friend.full_name}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{friend.username}</span>
                              <span className="friends-pill">🤝 Connected</span>
                            </div>
                            <div className="campus-badge" style={{ marginTop: '2px' }}>
                              <GraduationCap size={12} />
                              <span>{friend.campus}</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              {friend.bio}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            className="action-pill-btn"
                            style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary-border)' }}
                            onClick={() => startDirectChatWithStudent(friend)}
                          >
                            <MessageCircle size={15} />
                            <span>Message</span>
                          </button>
                          <button
                            className="btn-decline-friend"
                            onClick={() => handleRemoveFriend(friend.id, friend.full_name)}
                            title="Remove friend"
                          >
                            <UserMinus size={14} />
                            <span>Unfriend</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================================
            TAB 3: CAMPUS CHAT / MESSENGER PLACE
            ====================================================================== */}
        {activeTab === 'chat' && (
          <div className="chat-container">
            {/* Left Chat Sidebar (Conversations) */}
            <div className="chat-sidebar">
              <div className="chat-sidebar-header">
                <div className="chat-sidebar-title">
                  <MessageCircle size={20} color="var(--primary)" />
                  <span>Campus Chat</span>
                </div>
                <span className="campus-badge" style={{ margin: 0 }}>
                  Online
                </span>
              </div>

              {/* Chat Search */}
              <div className="chat-search-box">
                <input
                  type="text"
                  className="chat-search-input"
                  placeholder="Search clubs or students..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                />
              </div>

              {/* Chat Channel List */}
              <div className="chat-list">
                <div className="chat-section-label">Campus Club Channels</div>
                {chatConversations
                  .filter((c) => c.type === 'community')
                  .filter((c) => !chatSearchQuery || c.name.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                  .map((conv) => (
                    <button
                      key={conv.id}
                      className={`chat-channel-item ${selectedChatId === conv.id ? 'active' : ''}`}
                      onClick={() => setSelectedChatId(conv.id)}
                    >
                      <div className="chat-channel-avatar">
                        <div
                          className="avatar-circle avatar-sm"
                          style={{ background: 'var(--primary-gradient)' }}
                        >
                          {conv.avatarText}
                        </div>
                        {conv.online && <div className="online-indicator-dot" />}
                      </div>
                      <div className="chat-channel-meta">
                        <div className="chat-channel-name-row">
                          <span className="chat-channel-name">{conv.name}</span>
                          <span className="chat-channel-time">{conv.time}</span>
                        </div>
                        <div className="chat-channel-snippet">{conv.lastMessage}</div>
                      </div>
                    </button>
                  ))}

                <div className="chat-section-label" style={{ marginTop: '10px' }}>
                  Direct Messages (Students)
                </div>
                {chatConversations.filter((c) => c.type === 'direct').length === 0 ? (
                  <div style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No student DMs yet.<br />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('connections');
                        setConnectionsSubTab('discover');
                      }}
                      style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
                    >
                      Find students & message →
                    </button>
                  </div>
                ) : (
                  chatConversations
                    .filter((c) => c.type === 'direct')
                    .filter((c) => !chatSearchQuery || c.name.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                    .map((conv) => (
                      <button
                        key={conv.id}
                        className={`chat-channel-item ${selectedChatId === conv.id ? 'active' : ''}`}
                        onClick={() => setSelectedChatId(conv.id)}
                      >
                        <div className="chat-channel-avatar">
                          <div
                            className="avatar-circle avatar-sm"
                            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                          >
                            {conv.avatarText}
                          </div>
                          {conv.online && <div className="online-indicator-dot" />}
                        </div>
                        <div className="chat-channel-meta">
                          <div className="chat-channel-name-row">
                            <span className="chat-channel-name">{conv.name}</span>
                            <span className="chat-channel-time">{conv.time}</span>
                          </div>
                          <div className="chat-channel-snippet">{conv.lastMessage}</div>
                        </div>
                      </button>
                    ))
                )}
              </div>
            </div>

            {/* Right Chat Main Area */}
            <div className="chat-main-area">
              {/* Header */}
              <div className="chat-main-header">
                <div className="chat-header-user">
                  <div
                    className="avatar-circle avatar-md"
                    style={{ background: currentChat.type === 'community' ? 'var(--primary-gradient)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    {currentChat.avatarText}
                  </div>
                  <div>
                    <div className="chat-header-title">{currentChat.name}</div>
                    <div className="chat-header-subtitle">
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      <span>{currentChat.badge} • Active now</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="campus-badge">
                    <GraduationCap size={13} />
                    <span>{currentChat.campus || 'Cross-Campus'}</span>
                  </div>
                </div>
              </div>

              {/* Messages History */}
              <div className="chat-messages-history">
                {(currentChat.messages || []).length === 0 ? (
                  <div className="empty-state" style={{ padding: '36px 16px', margin: 'auto' }}>
                    <div className="empty-state-icon">
                      <MessageCircle size={28} />
                    </div>
                    <h3 className="empty-state-title">No messages yet</h3>
                    <p className="empty-state-desc" style={{ maxWidth: '340px', margin: '0 auto' }}>
                      Send a campus hello or share notes and ideas with <strong>{currentChat.name}</strong>! Messages arrive in real-time.
                    </p>
                  </div>
                ) : (
                  (currentChat.messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-row ${msg.isMine ? 'outgoing' : 'incoming'}`}
                    >
                      {!msg.isMine && (
                        <div
                          className="avatar-circle avatar-sm"
                          style={{ background: 'var(--primary-gradient)', flexShrink: 0 }}
                        >
                          {getInitials(msg.senderName)}
                        </div>
                      )}

                      <div className="message-bubble">
                        {!msg.isMine && (
                          <div className="message-sender-tag">
                            {msg.senderName} • <span style={{ color: 'var(--text-muted)' }}>{msg.campus}</span>
                          </div>
                        )}
                        <div>{msg.content}</div>

                        {msg.mediaUrl && (
                          <div className="message-media-attachment">
                            {msg.mediaUrl.endsWith('.mp4') || msg.mediaUrl.startsWith('blob:') ? (
                              <video src={msg.mediaUrl} controls />
                            ) : (
                              <img src={msg.mediaUrl} alt="Attached media" />
                            )}
                          </div>
                        )}

                        <div className="message-time-stamp">
                          <span>{msg.createdAt}</span>
                          {msg.isMine && <CheckCheck size={13} />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reaction Emojis */}
              <div className="chat-quick-emoji-bar">
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Quick Reactions:</span>
                {['🔥', '🚀', '💻', '💡', '❤️', '👏', '🎉', '🙌'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="emoji-pill"
                    onClick={() => addQuickEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Attached Photo Preview (if any) */}
              {chatMediaUrl && (
                <div style={{ padding: '8px 16px', background: '#121212', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={chatMediaUrl} alt="Attached preview" style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Photo attached</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Will be sent with message</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatMediaUrl('')}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                    title="Remove attached photo"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="chat-composer-bar">
                <label className="chat-attach-icon-btn" title="Send a photo in chat">
                  <Camera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImageFile(file);
                          setChatMediaUrl(compressed);
                          showToast('Photo attached to message.');
                        } catch (err) {
                          showToast('Could not load photo.');
                        }
                      }
                    }}
                  />
                </label>

                <input
                  type="text"
                  className="chat-input-field"
                  placeholder={`Message ${currentChat.name}...`}
                  value={chatMessageText}
                  onChange={(e) => setChatMessageText(e.target.value)}
                />

                <button
                  type="submit"
                  className="chat-send-icon-btn"
                  disabled={!chatMessageText.trim() && !chatMediaUrl}
                  title="Send Message"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================================
            TAB 4: EXPLORE CLUBS & COMMUNITIES
            ====================================================================== */}
        {activeTab === 'communities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ marginBottom: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e1b4b' }}>Campus Communities</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Join student clubs, collaborate across colleges, and join live club chat rooms.
              </p>
            </div>

            <div className="communities-list">
              {communities.map((club) => {
                const isMember = userMemberships.has(club.id);
                return (
                  <div key={club.id} className="community-item" style={{ padding: '16px' }}>
                    <div className="community-header">
                      <div>
                        <div className="community-name" style={{ fontSize: '1.05rem' }}>{club.name}</div>
                        <span className="community-category-pill" style={{ marginTop: '4px', display: 'inline-block' }}>
                          {club.category}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="action-pill-btn"
                          onClick={() => {
                            setActiveTab('chat');
                            setSelectedChatId(
                              club.id === 'comm-1' ? 'chat-coding-ai' : club.id === 'comm-2' ? 'chat-creators' : 'chat-placement'
                            );
                          }}
                        >
                          <MessageCircle size={14} />
                          <span>Chat Room</span>
                        </button>
                        <button
                          className={`join-community-btn ${isMember ? 'joined' : ''}`}
                          onClick={() => handleToggleCommunity(club.id)}
                        >
                          {isMember ? 'Joined ✓' : 'Join Club'}
                        </button>
                      </div>
                    </div>

                    <p className="community-desc" style={{ marginTop: '8px', fontSize: '0.86rem' }}>
                      {club.description}
                    </p>

                    <div className="community-footer" style={{ marginTop: '12px' }}>
                      <div className="community-member-count">
                        <Users size={15} />
                        <span>{club.member_count} student members</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================================
            TAB 5: MY PROFILE
            ====================================================================== */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="widget-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div className="profile-avatar-wrapper">
                  {currentUserProfile?.avatar_url ? (
                    <img
                      src={currentUserProfile.avatar_url}
                      alt={currentUserProfile.full_name}
                      className="profile-avatar-large"
                      style={{ margin: 0 }}
                    />
                  ) : (
                    <div className="profile-avatar-large" style={{ margin: 0 }}>
                      {getInitials(currentUserProfile?.full_name || 'You')}
                    </div>
                  )}
                  <label
                    htmlFor="profile-avatar-input-direct"
                    className="profile-avatar-camera-btn"
                    title="Change Profile Photo"
                  >
                    <Camera size={15} />
                    <input
                      id="profile-avatar-input-direct"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarFileChange}
                    />
                  </label>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                      {currentUserProfile?.full_name || 'Aditya Verma'}
                    </h2>
                    <div className="campus-badge">
                      <GraduationCap size={14} />
                      <span>{currentUserProfile?.campus || 'IIT Delhi'}</span>
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                    @{currentUserProfile?.username || 'aditya_v'}
                  </div>

                  {/* Profile Stats: Followers, Following, Friends */}
                  <div className="profile-stats-row" style={{ maxWidth: '340px', justifyContent: 'flex-start', gap: '28px' }}>
                    <div className="profile-stat-item">
                      <span className="profile-stat-number">{followingUserIds.size}</span>
                      <span className="profile-stat-label">Following</span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="profile-stat-number">{friendships.size}</span>
                      <span className="profile-stat-label">Friends</span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="profile-stat-number">{filteredPosts.length}</span>
                      <span className="profile-stat-label">Posts</span>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginTop: '8px' }}>
                    {currentUserProfile?.bio || 'CS Junior | Hackathon Builder | Learning React & AI'}
                  </p>
                </div>

                <button
                  className="edit-profile-action-btn"
                  style={{ width: 'auto', padding: '8px 18px' }}
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
                My Published Posts ({filteredPosts.length})
              </h3>
              {filteredPosts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Edit3 size={24} />
                  </div>
                  <h4 className="empty-state-title">No posts yet</h4>
                  <p className="empty-state-desc">You haven't published any posts yet. Head over to Campus Feed!</p>
                </div>
              ) : (
                <div className="feed-posts-list">
                  {filteredPosts.map((post) => (
                    <article key={post.id} className="post-card">
                      <div className="post-body" style={{ paddingTop: '16px' }}>
                        <p className="post-content-text">{post.content}</p>
                      </div>

                      {post.image_url && (
                        <div className="post-media-container">
                          <img src={post.image_url} alt="Attachment" className="post-image" />
                        </div>
                      )}

                      {post.video_url && (
                        <div className="post-media-container">
                          <video src={post.video_url} controls playsInline className="post-video" />
                        </div>
                      )}

                      <footer className="post-action-bar">
                        <div className="post-actions-group">
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            ❤️ {post.likes_count} likes • 💬 {post.comments_count} comments
                          </span>
                        </div>
                        <button
                          className="delete-post-btn"
                          onClick={() => handleDeletePost(post.id, post.user_id)}
                          title="Delete post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </footer>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================
          RIGHT SIDEBAR (INSTAGRAM "SUGGESTED FOR YOU" DESKTOP)
          ======================================================================== */}
      {activeTab !== 'chat' && (
        <aside className="insta-right-sidebar">
          {/* Top User Profile Switch Row */}
          <div className="insta-user-switch-row">
            <div className="insta-user-switch-left">
              {currentUserProfile?.avatar_url ? (
                <img
                  src={currentUserProfile.avatar_url}
                  alt={currentUserProfile.full_name}
                  className="insta-switch-avatar"
                />
              ) : (
                <div
                  className="insta-switch-avatar"
                  style={{
                    background: 'var(--primary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  {getInitials(currentUserProfile?.full_name || 'U')}
                </div>
              )}
              <div className="insta-switch-names">
                <span className="insta-switch-username">
                  {currentUserProfile?.username || 'student'}
                </span>
                <span className="insta-switch-fullname">
                  {currentUserProfile?.full_name || 'Student'}
                </span>
              </div>
            </div>
            <button
              className="insta-switch-action-btn"
              onClick={handleSignOut}
              title="Switch user account"
            >
              Switch
            </button>
          </div>

          {/* Suggested For You Header */}
          <div>
            <div className="insta-suggested-header">
              <span className="insta-suggested-title">Suggested for you</span>
              <button
                className="insta-see-all-link"
                onClick={() => {
                  setActiveTab('connections');
                  setConnectionsSubTab('discover');
                }}
              >
                See all
              </button>
            </div>

            {/* List of Suggested Peers */}
            <div className="insta-suggested-list">
              {registeredStudents
                .filter((p) => p.id !== currentUserId && !followingUserIds.has(p.id))
                .slice(0, 5)
                .map((peer, idx) => {
                  const isFollowing = followingUserIds.has(peer.id);
                  const reasons = [
                    'Suggested for you',
                    `Followed by ${peer.campus?.split(' ')[0] || 'campus'} peers`,
                    'Popular on campus',
                    'Active in tech clubs',
                    'New to StudentVerse',
                  ];
                  return (
                    <div key={peer.id} className="insta-suggested-item">
                      <div className="insta-suggested-user-info">
                        <div
                          className="insta-suggested-avatar"
                          style={{
                            background: 'var(--primary-gradient)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {getInitials(peer.full_name)}
                        </div>
                        <div className="insta-suggested-texts">
                          <span className="insta-suggested-username">
                            {peer.username || peer.full_name?.toLowerCase().replace(/\s+/g, '_')}
                          </span>
                          <span className="insta-suggested-relation">{reasons[idx % reasons.length]}</span>
                        </div>
                      </div>
                      <button
                        className={`insta-follow-link-btn ${isFollowing ? 'following' : ''}`}
                        onClick={() => handleToggleFollow(peer.id, peer.full_name)}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Incoming Requests notification widget if any */}
          {incomingRequests.length > 0 && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {incomingRequests.length} new friend requests
                </span>
              </div>
              <button
                className="insta-see-all-link"
                style={{ color: 'var(--primary)' }}
                onClick={() => {
                  setActiveTab('connections');
                  setConnectionsSubTab('requests');
                }}
              >
                Review
              </button>
            </div>
          )}

          {/* Instagram Footer Links */}
          <div className="insta-sidebar-footer-links">
            About • Help • Press • API • Jobs • Privacy • Terms • Locations • Language
          </div>
          <div className="insta-sidebar-footer-copy">
            © 2026 STUDENTVERSE FROM CAMPUS
          </div>
        </aside>
      )}

      {/* ========================================================================
          MOBILE BOTTOM NAVIGATION
          ======================================================================== */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <Home size={22} />
          <span>Feed</span>
        </button>

        {/* MOBILE FRIENDS & REQUESTS BUTTON */}
        <button
          className={`mobile-nav-btn ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          <HeartHandshake size={22} />
          <span>Friends</span>
          {incomingRequests.length > 0 && (
            <span className="mobile-nav-badge">{incomingRequests.length}</span>
          )}
        </button>

        {/* Mobile Create Floating Action */}
        <button
          className="mobile-create-fab"
          onClick={() => setIsCreatePostModalOpen(true)}
          aria-label="Create post"
        >
          <PlusCircle size={24} />
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageCircle size={22} />
          <span>Chat</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            if (!session?.user) {
              handleQuickDemoLogin();
            }
            setActiveTab('profile');
          }}
        >
          <User size={22} />
          <span>Profile</span>
        </button>
      </nav>

      {/* ========================================================================
          AUTH MODAL (SIGN IN / SIGN UP)
          ======================================================================== */}
      {isAuthModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIsAuthModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="modal-header">
              <div
                className="brand-logo-icon"
                style={{ width: '44px', height: '44px', margin: '0 auto 12px auto' }}
              >
                <GraduationCap size={24} />
              </div>
              <h3 className="modal-title">
                {authMode === 'signup' ? 'Create Student Account' : 'Welcome to StudentVerse'}
              </h3>
              <p className="modal-subtitle">
                {authMode === 'signup'
                  ? 'Connect with peers, share project media, and join campus chats.'
                  : 'Sign in to access your feed, like, and chat.'}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                className="form-submit-btn"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleQuickDemoLogin}
              >
                <Zap size={18} />
                <span>⚡ 1-Click Demo Student Login</span>
              </button>
            </div>

            <div className="auth-mode-toggle">
              <button
                className={`auth-mode-btn ${authMode === 'signin' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
              >
                Sign In
              </button>
              <button
                className={`auth-mode-btn ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
              >
                Sign Up
              </button>
            </div>

            {authError && (
              <div className="alert-box alert-error">
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            {authSuccessMsg && (
              <div className="alert-box alert-success">
                <CheckCircle size={16} />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Rohan Gupta"
                      required
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., rohan_codes"
                      required
                      value={authForm.username}
                      onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">College / Campus</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., IIT Delhi, BITS Pilani"
                      required
                      value={authForm.campus}
                      onChange={(e) => setAuthForm({ ...authForm, campus: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="student@example.com"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>

              <button type="submit" className="form-submit-btn">
                {authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================
          EDIT PROFILE MODAL
          ======================================================================== */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIsProfileModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="modal-header">
              <h3 className="modal-title">Edit Student Profile</h3>
              <p className="modal-subtitle">Keep your campus information up to date.</p>
            </div>

            {/* Profile Avatar Upload Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
              <div className="profile-avatar-wrapper" style={{ marginBottom: '8px' }}>
                {profileForm.avatarUrl ? (
                  <img
                    src={profileForm.avatarUrl}
                    alt="Avatar preview"
                    className="profile-avatar-large"
                    style={{ margin: 0, width: '84px', height: '84px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="profile-avatar-large"
                    style={{ margin: 0, width: '84px', height: '84px', fontSize: '1.6rem' }}
                  >
                    {getInitials(profileForm.fullName || 'You')}
                  </div>
                )}
                <label
                  htmlFor="profile-avatar-modal-input"
                  className="profile-avatar-camera-btn"
                  title="Upload New Profile Photo"
                >
                  <Camera size={16} />
                  <input
                    id="profile-avatar-modal-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarFileChange}
                  />
                </label>
              </div>

              <label
                htmlFor="profile-avatar-modal-input"
                style={{
                  color: 'var(--primary)',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Camera size={14} />
                <span>Upload Device Photo</span>
              </label>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">College / Campus</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.campus}
                  onChange={(e) => setProfileForm({ ...profileForm, campus: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio / Interests</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Share your major, hobbies, or what you're working on..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  maxLength={250}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileForm.avatarUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                />
              </div>

              <button type="submit" className="form-submit-btn">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bottom-Right "Messages" Pill (Screenshot Match) */}
      {activeTab !== 'chat' && (
        <div
          className="insta-floating-chat-pill"
          onClick={() => setActiveTab('chat')}
          title="Open Campus Live Chat"
        >
          <div className="insta-floating-chat-badge" />
          <MessageCircle size={18} />
          <span>Messages</span>
        </div>
      )}

      {/* ========================================================================
          FLOATING CREATE POST MODAL (INSTAGRAM POPUP)
          ======================================================================== */}
      {isCreatePostModalOpen && (
        <div
          className="insta-create-modal-overlay"
          onClick={() => setIsCreatePostModalOpen(false)}
        >
          <div
            className="insta-create-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="insta-create-modal-header">
              <h3 className="insta-create-modal-title">Create new campus post</h3>
              <button
                type="button"
                className="modal-close-btn"
                style={{ position: 'static' }}
                onClick={() => setIsCreatePostModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                await handleCreatePost(e);
                setIsCreatePostModalOpen(false);
              }}
            >
              <div className="insta-create-body">
                {/* Author row */}
                <div className="insta-create-author-row">
                  <div
                    className="avatar-circle avatar-sm"
                    style={{ background: 'var(--primary-gradient)' }}
                  >
                    {getInitials(currentUserProfile?.full_name || 'You')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {currentUserProfile?.full_name || 'You'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      🎓 {currentUserProfile?.campus || 'Campus Network'}
                    </div>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  className="insta-create-textarea"
                  placeholder={`What's on your mind, ${currentUserProfile?.full_name?.split(' ')[0] || 'student'}? Share your thoughts, project updates, or questions...`}
                  rows={4}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  maxLength={1500}
                  autoFocus
                />

                {/* Media Preview if attached */}
                {postMediaUrl && (
                  <div className="insta-create-preview-box">
                    <button
                      type="button"
                      className="insta-create-remove-media"
                      onClick={() => {
                        setPostMediaUrl('');
                        setPostMediaType('text');
                      }}
                      title="Remove attachment"
                    >
                      <X size={16} />
                    </button>
                    {postMediaType === 'photo' ? (
                      <img
                        src={postMediaUrl}
                        alt="Post Preview"
                        className={`insta-create-preview-img filter-${postEffect}`}
                      />
                    ) : (
                      <video
                        src={postMediaUrl}
                        controls
                        className={`insta-create-preview-video filter-${postEffect}`}
                      />
                    )}
                  </div>
                )}

                {/* Emoji quick bar */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    QUICK EMOJIS
                  </div>
                  <div className="insta-emoji-picker-row">
                    {['🔥', '🎓', '💻', '🚀', '❤️', '☕', '🎉', '⚡', '📚', '🍕', '✨', '💯'].map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        className="insta-emoji-pill"
                        onClick={() => setPostText((prev) => prev + ' ' + emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo/Video Filter Effects (if photo or video attached) */}
                {postMediaUrl && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      PHOTO / VIDEO FILTER EFFECTS
                    </div>
                    <div className="insta-effects-row">
                      {[
                        { id: 'normal', label: '✨ Normal' },
                        { id: 'warm', label: '🌅 Sunset' },
                        { id: 'neon', label: '🔮 Neon' },
                        { id: 'noir', label: '🖤 Noir B&W' },
                        { id: 'vintage', label: '🎞️ Vintage' },
                      ].map((eff) => (
                        <button
                          type="button"
                          key={eff.id}
                          className={`insta-effect-chip ${postEffect === eff.id ? 'active' : ''}`}
                          onClick={() => setPostEffect(eff.id)}
                        >
                          {eff.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Toolbar for Media Attachments */}
                <div className="insta-create-toolbar">
                  <div className="insta-create-tools-left">
                    {/* Attach Photo button with file picker */}
                    <label className="insta-tool-btn" style={{ cursor: 'pointer', margin: 0 }}>
                      <ImageIcon size={18} color="#0095f6" />
                      <span>Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'photo')}
                      />
                    </label>

                    {/* Attach Video button with file picker */}
                    <label className="insta-tool-btn" style={{ cursor: 'pointer', margin: 0 }}>
                      <Video size={18} color="#10b981" />
                      <span>Reel / Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'video')}
                      />
                    </label>
                  </div>

                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {postText.length} / 1500
                  </span>
                </div>
              </div>

              <div className="insta-create-modal-footer">
                <button
                  type="button"
                  className="action-pill-btn"
                  onClick={() => setIsCreatePostModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="publish-btn"
                  disabled={submittingPost || (!postText.trim() && !postMediaUrl)}
                >
                  <Send size={15} />
                  <span>{submittingPost ? 'Sharing...' : 'Share Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================
          ADD STORY MODAL (CAMERA, REEL, NOTES, MUSIC, EFFECTS, STICKERS)
          ======================================================================== */}
      {isAddStoryModalOpen && (
        <div
          className="insta-story-modal-overlay"
          onClick={() => setIsAddStoryModalOpen(false)}
        >
          <div
            className="insta-story-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="insta-story-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="story-ring" style={{ width: '28px', height: '28px' }}>
                  <Sparkles size={14} color="#fff" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                  Add to Campus Story
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                style={{ position: 'static' }}
                onClick={() => setIsAddStoryModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mode Tabs: Photo / Camera, Reel / Video, Notes */}
            <div className="insta-story-tabs">
              <button
                type="button"
                className={`insta-story-tab-btn ${storyMode === 'photo' ? 'active' : ''}`}
                onClick={() => setStoryMode('photo')}
              >
                <Camera size={16} />
                <span>Photo / Camera</span>
              </button>
              <button
                type="button"
                className={`insta-story-tab-btn ${storyMode === 'video' ? 'active' : ''}`}
                onClick={() => setStoryMode('video')}
              >
                <Film size={16} />
                <span>Campus Reel</span>
              </button>
              <button
                type="button"
                className={`insta-story-tab-btn ${storyMode === 'notes' ? 'active' : ''}`}
                onClick={() => setStoryMode('notes')}
              >
                <Edit3 size={16} />
                <span>Notes (Text)</span>
              </button>
            </div>

            <div className="insta-story-body">
              {/* Story Canvas / Preview */}
              <div
                className={`insta-story-canvas filter-${selectedStoryEffect}`}
                style={{
                  background:
                    storyMode === 'notes'
                      ? storyNoteBg
                      : '#000000',
                }}
              >
                {/* Background Track Tag if selected */}
                {selectedStorySong !== 'None' && (
                  <div className="insta-story-music-tag">
                    <span style={{ animation: 'pulse 1.2s infinite' }}>🎵</span>
                    <span>{selectedStorySong}</span>
                  </div>
                )}

                {/* Floating Emoji Sticker Overlay */}
                {selectedStoryEmojis.length > 0 && (
                  <div className="insta-story-sticker-overlay">
                    {selectedStoryEmojis.join(' ')}
                  </div>
                )}

                {/* Mode: Photo */}
                {storyMode === 'photo' && (
                  <>
                    {storyMediaUrl ? (
                      <img
                        src={storyMediaUrl}
                        alt="Story preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Camera size={44} color="var(--primary)" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '14px', fontWeight: 600 }}>
                          Select or Snap a Campus Photo
                        </p>
                        <label className="publish-btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Camera size={16} />
                          <span>Choose Device Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleStoryFileChange}
                          />
                        </label>
                      </div>
                    )}
                  </>
                )}

                {/* Mode: Video */}
                {storyMode === 'video' && (
                  <>
                    {storyMediaUrl ? (
                      <video
                        src={storyMediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Film size={44} color="#10b981" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '14px', fontWeight: 600 }}>
                          Select a Campus Reel Clip (MP4/WebM)
                        </p>
                        <label className="publish-btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Film size={16} />
                          <span>Choose Video Clip</span>
                          <input
                            type="file"
                            accept="video/*"
                            style={{ display: 'none' }}
                            onChange={handleStoryFileChange}
                          />
                        </label>
                      </div>
                    )}
                  </>
                )}

                {/* Mode: Notes */}
                {storyMode === 'notes' && (
                  <textarea
                    className="insta-story-notes-textarea"
                    placeholder="Share a campus thought, exam quote, or vibe..."
                    value={storyNoteText}
                    onChange={(e) => setStoryNoteText(e.target.value)}
                    maxLength={140}
                    rows={4}
                    autoFocus
                  />
                )}
              </div>

              {/* Note Gradient Selector (if in notes mode) */}
              {storyMode === 'notes' && (
                <div className="insta-story-options-section">
                  <div className="insta-story-opt-title">NOTES BACKGROUND GRADIENT</div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '2px 0' }}>
                    {[
                      { bg: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', label: 'Sunset' },
                      { bg: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', label: 'Ocean' },
                      { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', label: 'Emerald' },
                      { bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', label: 'Fire' },
                      { bg: '#18181b', label: 'Midnight' },
                    ].map((g, idx) => (
                      <button
                        type="button"
                        key={idx}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: g.bg,
                          border: storyNoteBg === g.bg ? '3px solid #ffffff' : '2px solid transparent',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        onClick={() => setStoryNoteBg(g.bg)}
                        title={g.label}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Background Song Selector */}
              <div className="insta-story-options-section">
                <div className="insta-story-opt-title">🎵 ADD BACKGROUND MUSIC / SONG</div>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
                  {[
                    'Lo-Fi Campus Chill 🎧',
                    'College Fest EDM Drop 🔥',
                    'Campus Rain Acoustic 🎸',
                    'Late Night Coding 💻',
                    'Canteen Chai Acoustic ☕',
                    'None',
                  ].map((track) => (
                    <button
                      type="button"
                      key={track}
                      className={`insta-effect-chip ${selectedStorySong === track ? 'active' : ''}`}
                      onClick={() => setSelectedStorySong(track)}
                    >
                      {track}
                    </button>
                  ))}
                </div>
              </div>

              {/* Effects & Filters */}
              <div className="insta-story-options-section">
                <div className="insta-story-opt-title">✨ STORY EFFECTS & FILTERS</div>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
                  {[
                    { id: 'normal', label: 'Normal' },
                    { id: 'warm', label: '🌅 Sunset Warm' },
                    { id: 'neon', label: '🔮 Neon Cyber' },
                    { id: 'noir', label: '🖤 Noir B&W' },
                    { id: 'vintage', label: '🎞️ Vintage Sepia' },
                  ].map((eff) => (
                    <button
                      type="button"
                      key={eff.id}
                      className={`insta-effect-chip ${selectedStoryEffect === eff.id ? 'active' : ''}`}
                      onClick={() => setSelectedStoryEffect(eff.id)}
                    >
                      {eff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji Stickers Bar */}
              <div className="insta-story-options-section">
                <div className="insta-story-opt-title">STICKER EMOJIS (TAP TO ADD/TOGGLE)</div>
                <div className="insta-emoji-picker-row">
                  {['🔥', '💖', '🎓', '⚡', '🚀', '📚', '☕', '🎉', '🍕', '🎧', '🌟', '💯'].map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      className={`insta-emoji-pill ${selectedStoryEmojis.includes(emoji) ? 'active' : ''}`}
                      style={{
                        borderColor: selectedStoryEmojis.includes(emoji) ? 'var(--primary)' : 'var(--border-color)',
                      }}
                      onClick={() => {
                        setSelectedStoryEmojis((prev) =>
                          prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
                        );
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption (optional) */}
              {storyMode !== 'notes' && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a caption to your story..."
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  maxLength={100}
                />
              )}
            </div>

            <div className="insta-create-modal-footer">
              <button
                type="button"
                className="action-pill-btn"
                onClick={() => setIsAddStoryModalOpen(false)}
              >
                Discard
              </button>
              <button
                type="button"
                className="publish-btn"
                onClick={handlePublishStory}
              >
                <Sparkles size={16} />
                <span>Share to Story</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          FULL-SCREEN STORIES VIEWER MODAL
          ======================================================================== */}
      {activeStory && (
        <div className="story-viewer-overlay" onClick={() => setActiveStory(null)}>
          <div className="story-viewer-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="story-viewer-close-btn"
              onClick={() => setActiveStory(null)}
              aria-label="Close story"
            >
              <X size={20} />
            </button>

            <div className="story-viewer-progress-bar">
              <div className="story-viewer-progress-fill" />
            </div>

            <div className="story-viewer-author-bar">
              <img
                src={activeStory.avatar}
                alt={activeStory.name}
                className="story-viewer-avatar"
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                  {activeStory.username}{' '}
                  <span style={{ opacity: 0.7, fontWeight: 400 }}>• {activeStory.time}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.8)' }}>
                  {activeStory.campus}
                </div>
              </div>
            </div>

            <div
              className={`story-viewer-media-wrapper filter-${activeStory.effect || 'normal'}`}
              style={{
                background: activeStory.isNote ? (activeStory.noteBg || 'linear-gradient(135deg, #7c3aed, #ec4899)') : '#000000',
              }}
            >
              {/* Song badge if present */}
              {activeStory.song && (
                <div className="insta-story-music-tag">
                  <span style={{ animation: 'pulse 1.2s infinite' }}>🎵</span>
                  <span>{activeStory.song}</span>
                </div>
              )}

              {/* Floating Emoji Stickers */}
              {activeStory.emojis?.length > 0 && (
                <div className="insta-story-sticker-overlay">
                  {activeStory.emojis.join(' ')}
                </div>
              )}

              {/* Media render */}
              {activeStory.isNote ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#ffffff', fontSize: '1.4rem', fontWeight: 800 }}>
                  "{activeStory.noteText}"
                </div>
              ) : activeStory.isVideo ? (
                <video
                  src={activeStory.mediaUrl}
                  autoPlay
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src={activeStory.mediaUrl}
                  alt={activeStory.caption}
                  className="story-viewer-img"
                />
              )}
            </div>

            <div className="story-viewer-footer">
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#ffffff', fontWeight: 500 }}>
                {activeStory.caption}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="text"
                  placeholder={`Reply to ${activeStory.username}...`}
                  className="story-reply-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      showToast(`💬 Reply sent to ${activeStory.name}!`);
                      setActiveStory(null);
                    }
                  }}
                />
                <button
                  type="button"
                  className="story-reply-send-btn"
                  onClick={() => {
                    showToast(`💬 Reply sent to ${activeStory.name}!`);
                    setActiveStory(null);
                  }}
                  aria-label="Send reply"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
