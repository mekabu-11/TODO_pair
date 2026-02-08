// Supabase-based API
import { supabase } from '../lib/supabase'

// Helper to format Supabase response to match Axios response structure
const formatResponse = (data, error) => {
    if (error) {
        throw { response: { data: { error: error.message }, status: 500 } }
    }
    return { data }
}

export const authApi = {
    login: async (data) => {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        })
        if (error) throw { response: { data: { error: error.message }, status: 401 } }

        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        return { data: { user: { ...authData.user, ...profile }, message: 'Login successful' } }
    },
    signup: async (data) => {
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name,
                    color: 'blue' // Default color
                }
            }
        })
        if (error) throw { response: { data: { error: error.message }, status: 400 } }

        return { data: { user: authData.user, message: 'Signup successful' } }
    },
    logout: async () => {
        const { error } = await supabase.auth.signOut()
        return formatResponse({ message: 'Logged out' }, error)
    },
    me: async () => {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) throw { response: { status: 401 } }

        let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        // Lazy creation: If profile doesn't exist, create it (e.g. if trigger failed)
        if (!profile) {
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    name: user.user_metadata?.name || 'No Name',
                    color: user.user_metadata?.color || 'blue'
                })
                .select()
                .single()

            if (!createError) {
                profile = newProfile
            }
        }

        return { data: { user: { ...user, ...profile } } }
    }
}

export const tasksApi = {
    list: async (params) => {
        let query = supabase
            .from('tasks')
            .select(`
                *,
                assignee:profiles!assignee_id(id, name, color),
                comments(count)
            `)
            .order('created_at', { ascending: false })

        if (params?.status === 'completed') {
            query = query.eq('completed', true)
        } else if (params?.status === 'incomplete') {
            query = query.eq('completed', false)
        }

        const { data, error } = await query

        // Format data to match expected structure
        const tasks = data?.map(t => ({
            ...t,
            comments_count: t.comments?.[0]?.count || 0,
            assignee: t.assignee
        })) || []

        return formatResponse({ tasks, meta: { total_count: tasks.length } }, error)
    },
    get: async (id) => {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                assignee:profiles!assignee_id(id, name, color),
                subtasks(*)
            `)
            .eq('id', id)
            .single()
        return formatResponse(data, error)
    },
    create: async (data) => {
        // Get current user's couple_id
        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

        if (!profile?.couple_id) throw new Error('No couple associated')

        const { data: newTask, error } = await supabase
            .from('tasks')
            .insert({
                ...data,
                couple_id: profile.couple_id,
                assignee_id: data.assignee_id || null
            })
            .select()
            .single()
        return formatResponse(newTask, error)
    },
    update: async (id, data) => {
        const { data: updatedTask, error } = await supabase
            .from('tasks')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()
        return formatResponse(updatedTask, error)
    },
    delete: async (id) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id)
        return formatResponse({ success: true }, error)
    },
    complete: async (id, completed = true) => {
        const { data, error } = await supabase
            .from('tasks')
            .update({ completed })
            .eq('id', id)
            .select()
            .single()
        return formatResponse(data, error)
    }
}

export const subtasksApi = {
    create: async (taskId, title) => {
        const { data, error } = await supabase
            .from('tasks') // Subtasks are in tasks table with parent_id
            .insert({
                title,
                parent_id: taskId,
                // Need to fetch parent's couple_id
                couple_id: (await supabase.from('tasks').select('couple_id').eq('id', taskId).single()).data.couple_id
            })
            .select()
            .single()
        return formatResponse(data, error)
    },
    update: async (id, completed) => {
        const { data, error } = await supabase
            .from('tasks')
            .update({ completed })
            .eq('id', id)
            .select()
            .single()
        return formatResponse(data, error)
    },
    delete: async (id) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id)
        return formatResponse({ success: true }, error)
    }
}

export const commentsApi = {
    list: async (taskId) => {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                user:profiles(id, name, color)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true })
        return formatResponse(data, error)
    },
    create: async (taskId, content) => {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('comments')
            .insert({
                content,
                task_id: taskId,
                user_id: user.id
            })
            .select(`
                *,
                user:profiles(id, name, color)
            `)
            .single()
        return formatResponse(data, error)
    },
    delete: async (id) => {
        const { error } = await supabase.from('comments').delete().eq('id', id)
        return formatResponse({ success: true }, error)
    }
}

export const couplesApi = {
    join: async (inviteCode) => {
        const { data: couple, error } = await supabase.from('couples').select('id').eq('invite_code', inviteCode).single()
        if (error || !couple) throw new Error('Invalid invite code')

        const { data: { user } } = await supabase.auth.getUser()

        // Update profile with couple_id
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ couple_id: couple.id })
            .eq('id', user.id)

        return formatResponse({ message: 'Joined couple successfully' }, updateError)
    },
    show: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

        if (!profile?.couple_id) return { data: { partner: null } }

        const { data: partner } = await supabase
            .from('profiles')
            .select('*')
            .eq('couple_id', profile.couple_id)
            .neq('id', user.id)
            .single()

        return { data: { partner } }
    }
}

const api = {
    auth: authApi,
    tasks: tasksApi,
    comments: commentsApi,
    couples: couplesApi
}

export { api }
export default api
