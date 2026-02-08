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
        console.log('authApi.login called')
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        })
        if (error) throw { response: { data: { error: error.message }, status: 401 } }

        console.log('SignIn success, fetching profile...')
        // Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        if (profileError) console.error('Error fetching profile in login:', profileError)
        console.log('Profile fetched:', profile)

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
        console.log('authApi.logout called')
        const { error } = await supabase.auth.signOut()
        if (error) console.error('SignOut error:', error)
        console.log('SignOut success')
        return formatResponse({ message: 'Logged out' }, error)
    },
    me: async (currentUser = null) => {
        console.log('authApi.me called', currentUser ? 'with user' : 'without user')
        let user = currentUser

        if (!user) {
            const { data, error } = await supabase.auth.getUser()
            if (error || !data.user) throw { response: { status: 401 } }
            user = data.user
            console.log('getUser success (fetched), profile for:', user.id)
        } else {
            console.log('Using provided user, skipping getUser:', user.id)
        }

        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) console.error('Error fetching profile in me:', profileError)
        console.log('Profile fetch result:', profile)

        // Lazy creation: If profile doesn't exist, create it (e.g. if trigger failed)
        if (!profile) {
            console.log('Profile missing, attempting lazy creation...')
            // Generate a random 8-character invite code
            const generateInviteCode = () => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                let code = ''
                for (let i = 0; i < 8; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length))
                }
                return code
            }
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    name: user.user_metadata?.name || 'No Name',
                    color: user.user_metadata?.color || 'blue',
                    invite_code: generateInviteCode()
                })
                .select()
                .single()

            if (!createError) {
                profile = newProfile
            } else {
                console.error('Lazy creation failed:', createError)
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
                assignee:profiles!assignee_id(id, name, color)
            `)
            .eq('id', id)
            .single()

        if (error) return formatResponse(null, error)

        // Fetch subtasks separately to avoid relation issues
        const { data: subtasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('parent_id', id)
            .order('created_at')

        return { data: { ...data, subtasks: subtasks || [] } }
    },
    create: async (data) => {
        // Get current user's couple_id
        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

        const { data: newTask, error } = await supabase
            .from('tasks')
            .insert({
                ...data,
                couple_id: profile?.couple_id || null,
                assignee_id: data.assignee_id || null,
                created_by: user.id
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
        // Find the partner by their invite_code
        const { data: partner, error: partnerError } = await supabase
            .from('profiles')
            .select('id, couple_id, name')
            .eq('invite_code', inviteCode.toUpperCase())
            .single()

        if (partnerError || !partner) {
            throw new Error('招待コードが見つかりません')
        }

        const { data: { user } } = await supabase.auth.getUser()

        // Can't pair with yourself
        if (partner.id === user.id) {
            throw new Error('自分自身とはペアリングできません')
        }

        let coupleId = partner.couple_id

        // If partner doesn't have a couple yet, create one
        if (!coupleId) {
            const { data: newCouple, error: coupleError } = await supabase
                .from('couples')
                .insert({ invite_code: inviteCode.toUpperCase() })
                .select()
                .single()

            if (coupleError) throw new Error('ペア作成に失敗しました')
            coupleId = newCouple.id

            // Update partner's profile with couple_id
            await supabase
                .from('profiles')
                .update({ couple_id: coupleId })
                .eq('id', partner.id)
        }

        // Update current user's profile with couple_id
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ couple_id: coupleId })
            .eq('id', user.id)

        if (updateError) throw new Error('ペアリングに失敗しました')

        return { data: { message: `${partner.name}さんとペアリングしました！` } }
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
