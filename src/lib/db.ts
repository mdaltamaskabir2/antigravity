import { supabase } from '../supabaseClient';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleSupabaseError(error: any, operationType: OperationType, path: string | null) {
  console.error(`Supabase ${operationType} error on ${path}:`, error);
  throw new Error(error.message || 'An error occurred with Supabase.');
}

// FAQs
export const getFaqs = async () => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('createdAt', { ascending: true });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'faqs');
    return [];
  }
};

export const updateFaq = async (faqId: string, data: any) => {
  try {
    const { error } = await supabase
      .from('faqs')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', faqId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.UPDATE, `faqs/${faqId}`);
  }
};

export const addFaq = async (data: any) => {
  try {
    const { error } = await supabase
      .from('faqs')
      .insert([{ ...data, status: 'published', createdAt: new Date().toISOString() }]);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, 'faqs');
  }
};

export const deleteFaq = async (faqId: string) => {
  try {
    const { error } = await supabase.from('faqs').delete().eq('id', faqId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.DELETE, `faqs/${faqId}`);
  }
};

export const askQuestion = async (question: string, userEmail?: string) => {
  try {
    const { error } = await supabase
      .from('faqs')
      .insert([{ 
        question, 
        answer: '', 
        status: 'pending', 
        userEmail: userEmail || 'Anonymous',
        createdAt: new Date().toISOString() 
      }]);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, 'faqs');
  }
};

// Doubts
export const updateDoubt = async (doubtId: string, data: any) => {
  try {
    const { error } = await supabase
      .from('doubts')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', doubtId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.UPDATE, `doubts/${doubtId}`);
  }
};

export const getAllAdminDoubts = async () => {
  try {
    const { data, error } = await supabase
      .from('doubts')
      .select('*')
      .or('target.eq.admin,target.is.null')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'doubts');
    return [];
  }
};

export const getAnsweredDoubtsByUnit = async (unitId: string) => {
  try {
    const { data, error } = await supabase
      .from('doubts')
      .select('*')
      .eq('linkedUnitId', unitId)
      .eq('status', 'answered')
      .or('target.eq.admin,target.is.null')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'doubts');
    return [];
  }
};

export const getCommunityDoubts = async (unitId?: string) => {
  try {
    let query = supabase
      .from('doubts')
      .select('*')
      .eq('target', 'community')
      .order('createdAt', { ascending: false });
    
    if (unitId) {
      query = query.eq('linkedUnitId', unitId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'doubts');
    return [];
  }
};

export const addDoubt = async (data: any) => {
  try {
    const { error } = await supabase
      .from('doubts')
      .insert([{ ...data, status: 'pending', createdAt: new Date().toISOString() }]);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, 'doubts');
  }
};

export const deleteDoubt = async (doubtId: string) => {
  try {
    const { error } = await supabase.from('doubts').delete().eq('id', doubtId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.DELETE, `doubts/${doubtId}`);
  }
};

export const answerDoubt = async (doubtId: string, answer: string) => {
  try {
    const { error } = await supabase
      .from('doubts')
      .update({ answer, status: 'answered', answeredAt: new Date().toISOString() })
      .eq('id', doubtId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.UPDATE, `doubts/${doubtId}`);
  }
};

export const getMyDoubts = async (studentId: string) => {
  try {
    const { data, error } = await supabase
      .from('doubts')
      .select('*')
      .eq('studentId', studentId)
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'doubts');
    return [];
  }
};

// Site Settings
export const getSiteSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'global')
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.GET, 'site_settings/global');
  }
};

export const updateSiteSettings = async (data: any) => {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 'global', ...data });
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.WRITE, 'site_settings/global');
  }
};

// About Author
export const getAboutAuthor = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'about_author')
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.GET, 'site_settings/about_author');
  }
};

export const updateAboutAuthor = async (data: any) => {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 'about_author', ...data });
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.WRITE, 'site_settings/about_author');
  }
};

// Syllabus
export const getSyllabusUnits = async () => {
  try {
    const { data, error } = await supabase
      .from('syllabus')
      .select('*')
      .order('createdAt', { ascending: true });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'syllabus');
    return [];
  }
};

export const addSyllabusUnit = async (data: any) => {
  try {
    const { error } = await supabase
      .from('syllabus')
      .insert([{ ...data, createdAt: new Date().toISOString() }]);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, 'syllabus');
  }
};

export const updateSyllabusUnit = async (unitId: string, data: any) => {
  try {
    const { error } = await supabase
      .from('syllabus')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', unitId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.UPDATE, `syllabus/${unitId}`);
  }
};

export const deleteSyllabusUnit = async (unitId: string) => {
  try {
    const { error } = await supabase.from('syllabus').delete().eq('id', unitId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.DELETE, `syllabus/${unitId}`);
  }
};

// Notes
export const getNotes = async () => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'notes');
    return [];
  }
};

export const addNote = async (data: any) => {
  try {
    const { data: note, error } = await supabase
      .from('notes')
      .insert([{ ...data, createdAt: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return note.id;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, 'notes');
  }
};

export const updateNote = async (noteId: string, data: any) => {
  try {
    const { error } = await supabase
      .from('notes')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', noteId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.UPDATE, `notes/${noteId}`);
  }
};

export const deleteNote = async (noteId: string) => {
  try {
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.DELETE, `notes/${noteId}`);
  }
};

// Lectures
export const getLectures = async () => {
  try {
    const { data, error } = await supabase
      .from('lectures')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'lectures');
    return [];
  }
};

export const addLecture = async (data: any) => {
  try {
    const { data: lecture, error } = await supabase
      .from('lectures')
      .insert([{ ...data, createdAt: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return lecture.id;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, 'lectures');
  }
};

export const updateLecture = async (lectureId: string, data: any) => {
  try {
    const { error } = await supabase
      .from('lectures')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', lectureId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.UPDATE, `lectures/${lectureId}`);
  }
};

export const deleteLecture = async (lectureId: string) => {
  try {
    const { error } = await supabase.from('lectures').delete().eq('id', lectureId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.DELETE, `lectures/${lectureId}`);
  }
};

// QAs
export const getQas = async () => {
  try {
    const { data, error } = await supabase
      .from('qas')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'qas');
    return [];
  }
};

export const addQa = async (data: any) => {
  try {
    const { data: qa, error } = await supabase
      .from('qas')
      .insert([{ ...data, createdAt: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return qa.id;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, 'qas');
  }
};

export const updateQa = async (qaId: string, data: any) => {
  try {
    const { error } = await supabase
      .from('qas')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', qaId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.UPDATE, `qas/${qaId}`);
  }
};

export const deleteQa = async (qaId: string) => {
  try {
    const { error } = await supabase.from('qas').delete().eq('id', qaId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.DELETE, `qas/${qaId}`);
  }
};

// Storage Fallback (Still using Base64 in some components but providing the tool if needed)
export const uploadFile = async (file: File, path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(path, file);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(path);
    return publicUrl;
  } catch (error) {
    console.error("Storage upload error:", error);
    throw error;
  }
};

// Users
export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student');
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'users');
    return [];
  }
};

// Transactions
export const submitTransaction = async (data: any) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .insert([{ ...data, status: 'approved', createdAt: new Date().toISOString() }]);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, 'transactions');
  }
};

export const getPendingTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'pending')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'transactions');
    return [];
  }
};

export const updateTransactionStatus = async (transactionId: string, status: 'approved' | 'rejected') => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', transactionId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.UPDATE, `transactions/${transactionId}`);
  }
};

export const getMyVerifiedTransactions = async (studentId: string) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('studentId', studentId)
      .eq('status', 'approved');
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, 'transactions');
    return [];
  }
};
