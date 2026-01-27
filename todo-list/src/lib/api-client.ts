import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface RequestOptions extends RequestInit {
    params?: Record<string, string>
}

// Helper to get activeOrgId from localStorage
function getActiveOrgId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('activeOrgId')
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options

    let url = `${API_BASE_URL}${endpoint}`
    if (params) {
        const searchParams = new URLSearchParams(params)
        url += `?${searchParams.toString()}`
    }

    // Get active org ID for X-Org-ID header
    const activeOrgId = getActiveOrgId()

    // Build headers object
    const headers: Record<string, string> = {
        // Default to JSON, but allow overriding (e.g. key undefined for FormData)
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true', // Bypass LocalTunnel warning page
        'ngrok-skip-browser-warning': 'true', // Bypass Ngrok warning page
    }

    // Merge with init.headers if provided
    if (init.headers) {
        Object.assign(headers, init.headers)
    }

    if (activeOrgId) {
        headers['X-Org-ID'] = activeOrgId
    }

    // Check if body is FormData - do this LAST to ensure no Content-Type overrides it
    const isFormData = init.body instanceof FormData;
    if (isFormData) {
        delete headers['Content-Type']; // Let browser set multipart/form-data with boundary
    }

    const response = await fetch(url, {
        ...init,
        credentials: 'include',
        headers,
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }))

        // Prioritize 'error' or 'message' fields
        const errorMessage = errorData.error || errorData.message || 'Request failed';

        // Handle Unauthorized (401) - Redirect to login
        // Handle Unauthorized (401) - Redirect to login
        if (response.status === 401) {
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                // Prevent infinite redirect loop if already on auth pages
                console.warn('Unauthorized access. Redirecting to login...');
                window.location.href = '/login';
                return {} as T;
            }
        }

        // Handle Organization Access Denied (403)
        if (response.status === 403 && (errorMessage === 'Access to organization denied' || errorMessage.includes('organization'))) {
            if (typeof window !== 'undefined') {
                console.warn('Access denied to organization. Clearing invalid org ID and reloading...');
                localStorage.removeItem('activeOrgId');
                // Optional: Force reload to re-fetch valid orgs or default
                window.location.reload();
                return {} as T; // Return empty to prevent crash before reload
            }
        }

        // If the error message is an object (e.g. nested validation errors), stringify it
        const finalMessage = typeof errorMessage === 'object'
            ? JSON.stringify(errorMessage)
            : String(errorMessage);

        // Global Error Notification
        toast.error(finalMessage)

        throw new Error(finalMessage)
    }

    return response.json()
}

export const apiClient = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => {
        const isFormData = data instanceof FormData;
        return request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: isFormData ? (data as FormData) : JSON.stringify(data)
        });
    },

    put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => {
        const isFormData = data instanceof FormData;
        return request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: isFormData ? (data as FormData) : JSON.stringify(data)
        });
    },

    patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => {
        const isFormData = data instanceof FormData;
        return request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: isFormData ? (data as FormData) : JSON.stringify(data)
        });
    },

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'DELETE' }),
}
