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
        // Query tasks - filter out subtasks (parent_id is null)
        let query = supabase
            .from('tasks')
            .select('*')
            .is('parent_id', null)
            .order('created_at', { ascending: false })

        if (params?.status === 'completed') {
            query = query.eq('completed', true)
        } else if (params?.status === 'incomplete') {
            query = query.eq('completed', false)
        }

        const { data, error } = await query

        if (error) return formatResponse(null, error)

        // Fetch assignees separately for tasks that have assignee_id
        const assigneeIds = [...new Set((data || []).filter(t => t.assignee_id).map(t => t.assignee_id))]
        let assigneeMap = {}
        if (assigneeIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, color')
                .in('id', assigneeIds)
            assigneeMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
        }

        // Fetch subtasks for all parent tasks
        const taskIds = (data || []).map(t => t.id)
        let subtasksMap = {}
        if (taskIds.length > 0) {
            const { data: subtasks } = await supabase
                .from('tasks')
                .select('*')
                .in('parent_id', taskIds)
                .order('created_at')

            // Group subtasks by parent_id
            for (const st of subtasks || []) {
                if (!subtasksMap[st.parent_id]) {
                    subtasksMap[st.parent_id] = []
                }
                subtasksMap[st.parent_id].push(st)
            }
        }

        // Format data with subtasks info
        const tasks = (data || []).map(t => {
            const subtasks = subtasksMap[t.id] || []
            const completedSubtasks = subtasks.filter(st => st.completed).length
            const subtasksCount = subtasks.length
            const progress = subtasksCount > 0 ? Math.round((completedSubtasks / subtasksCount) * 100) : null

            return {
                ...t,
                comments_count: 0, // Skip comments count to avoid relation errors
                assignee: t.assignee_id ? assigneeMap[t.assignee_id] : null,
                subtasks,
                subtasks_count: subtasksCount,
                completed_subtasks: completedSubtasks,
                progress
            }
        })

        return formatResponse({ tasks, meta: { total_count: tasks.length } }, error)
    },
    get: async (id) => {
        // Simple query without relations to avoid schema mismatch errors
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return formatResponse(null, error)

        // Fetch assignee separately if exists
        let assignee = null
        if (data.assignee_id) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, name, color')
                .eq('id', data.assignee_id)
                .single()
            assignee = profile
        }

        // Fetch subtasks separately
        const { data: subtasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('parent_id', id)
            .order('created_at')

        // Fetch comments with user profiles
        let comments = []
        const { data: rawComments, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('task_id', id)
            .order('created_at', { ascending: true })

        if (!commentsError && rawComments && rawComments.length > 0) {
            const userIds = [...new Set(rawComments.map(c => c.user_id))]
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, color')
                .in('id', userIds)
            const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
            comments = rawComments.map(c => ({ ...c, user: profileMap[c.user_id] || { name: 'Unknown', color: 'gray' } }))
        }

        return { data: { ...data, assignee, subtasks: subtasks || [], comments } }
    },
    create: async (data) => {
        // Get current user's couple_id
        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

        // Build task data - only include fields that definitely exist in the table
        const taskData = {
            title: data.title,
            description: data.description || null,
            due_date: data.due_date || null,
            couple_id: profile?.couple_id || null,
            assignee_id: data.assignee_id || null,
            parent_id: data.parent_id || null
        }

        // Try inserting the task
        const { data: newTask, error } = await supabase
            .from('tasks')
            .insert(taskData)
            .select()
            .single()

        return formatResponse(newTask, error)
    },
    update: async (id, data) => {
        // Only update known fields to avoid column mismatch errors
        const updateData = {}
        if (data.title !== undefined) updateData.title = data.title
        if (data.description !== undefined) updateData.description = data.description
        if (data.due_date !== undefined) updateData.due_date = data.due_date
        if (data.assignee_id !== undefined) updateData.assignee_id = data.assignee_id
        if (data.completed !== undefined) updateData.completed = data.completed

        const { data: updatedTask, error } = await supabase
            .from('tasks')
            .update(updateData)
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
        // Simple query to avoid relation errors
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: true })

        if (error) return formatResponse(null, error)

        // Fetch user profiles separately
        const userIds = [...new Set(data.map(c => c.user_id))]
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, color')
            .in('id', userIds)

        const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
        const commentsWithUsers = data.map(c => ({ ...c, user: profileMap[c.user_id] || { name: 'Unknown', color: 'gray' } }))

        return formatResponse(commentsWithUsers, null)
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
            .select()
            .single()

        if (error) return formatResponse(null, error)

        // Fetch user profile separately
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, color')
            .eq('id', user.id)
            .single()

        return formatResponse({ ...data, user: profile || { name: 'You', color: 'blue' } }, null)
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

// Admin API for user management (requires Service Role Key)
import { supabaseAdmin, isAdminClientAvailable } from '../lib/supabaseAdmin'

export const adminApi = {
    // Check if admin operations are available
    isAvailable: () => isAdminClientAvailable(),

    // List all users with their auth data
    listUsers: async () => {
        if (!supabaseAdmin) {
            throw new Error('管理機能が利用できません。Service Role Keyを設定してください。')
        }

        // Get auth users
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
        if (error) throw new Error(error.message)

        // Get profiles for additional data (exclude soft-deleted)
        const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .is('deleted_at', null)

        const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {})

        // Merge auth users with profiles, only include users with active profiles
        const usersWithProfiles = users
            .filter(u => profileMap[u.id])
            .map(u => ({
                id: u.id,
                email: u.email,
                name: profileMap[u.id]?.name || 'No Name',
                role: profileMap[u.id]?.role || 'user',
                color: profileMap[u.id]?.color || 'blue',
                couple_id: profileMap[u.id]?.couple_id,
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at
            }))

        return { data: usersWithProfiles }
    },

    // Create a new user
    createUser: async ({ email, password, name, role = 'user' }) => {
        if (!supabaseAdmin) {
            throw new Error('管理機能が利用できません')
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        })

        if (authError) throw new Error(authError.message)

        // Create profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: authData.user.id,
                name,
                role,
                color: 'blue'
            })

        if (profileError) console.error('Profile creation error:', profileError)

        return { data: { user: authData.user, message: 'ユーザーを作成しました' } }
    },

    // Update user (email, password, or profile data)
    updateUser: async (userId, updates) => {
        if (!supabaseAdmin) {
            throw new Error('管理機能が利用できません')
        }

        // Update auth data if email or password provided
        if (updates.email || updates.password) {
            const authUpdates = {}
            if (updates.email) authUpdates.email = updates.email
            if (updates.password) authUpdates.password = updates.password

            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates)
            if (authError) throw new Error(authError.message)
        }

        // Update profile data
        const profileUpdates = {}
        if (updates.name !== undefined) profileUpdates.name = updates.name
        if (updates.role !== undefined) profileUpdates.role = updates.role
        if (updates.color !== undefined) profileUpdates.color = updates.color

        if (Object.keys(profileUpdates).length > 0) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update(profileUpdates)
                .eq('id', userId)

            if (profileError) throw new Error(profileError.message)
        }

        return { data: { message: 'ユーザーを更新しました' } }
    },

    // Delete user (soft delete)
    deleteUser: async (userId) => {
        if (!supabaseAdmin) {
            throw new Error('管理機能が利用できません')
        }

        // Soft delete: set deleted_at timestamp instead of actually deleting
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', userId)

        if (error) throw new Error(error.message)

        return { data: { message: 'ユーザーを削除しました' } }
    }
}

const api = {
    auth: authApi,
    tasks: tasksApi,
    comments: commentsApi,
    couples: couplesApi,
    admin: adminApi
}

export { api }
export default api
