const authFetch = async (url, options = {}, navigate) => {
  const response = await fetch(url, options);
  if (response.status === 401) {
    localStorage.removeItem('token');
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
    return { ok: false, data: null };
  }
  const data = await response.json();
  if (response.ok && navigate) {
    navigate('/');
  }
  return { ok: response.ok, data };
};

export const api = {

  uploadFile: async (file, navigate) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return { ok: false, data: null };
    }

    const formData = new FormData();
    formData.append('file', file);

    return await authFetch('http://localhost:8000/api/upload-file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    }, navigate);
  },

  login: async (email, password) => {
    const response = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },

  register: async (name, email, password) => {
    const response = await fetch('http://localhost:8000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },

  forgotPassword: async (email) => {
    const response = await fetch('http://localhost:8000/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },

  resetPassword: async (token, email, password, password_confirmation, id) => {
    const response = await fetch(`http://localhost:8000/api/reset-password/${token}/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password, password_confirmation, id: Number(id) }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },

  validateResetToken: async (token) => {
    const response = await fetch(`http://localhost:8000/api/reset-password/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },

  sendMessage: async (message, navigate, conversation_id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login')
    }
    return await authFetch(`http://localhost:8000/api/conversation/${conversation_id}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ message, conversation_id }),
    }, navigate);
  },

  getMessages: async (conversation_id, navigate) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return { ok: false, data: null };
    }
    return await authFetch(`http://localhost:8000/api/conversation/${conversation_id}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    }, navigate);
  },


  logout: async (navigate) => {
    const token = localStorage.getItem('token');
    const response = await authFetch('http://localhost:8000/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    }, navigate);
    if (response.ok) {
      localStorage.removeItem('token');
    }
    return response;
  },

  getPusherConfig: async (token) => {
    const response = await fetch('http://localhost:8000/api/config/pusher', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },

  createConversation: async (title, navigate) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login')
    }
    return await authFetch('http://localhost:8000/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    }, navigate);
  },

  getConversations: async (navigate) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login')
    }
    return await authFetch('http://localhost:8000/api/conversations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    }, navigate);
  },

  getConversation: async (id, navigate) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return { ok: false, data: null };
    }
    return await authFetch(`http://localhost:8000/api/conversations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    }, navigate);
  },

  updateConversation: async (id, title, navigate) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return { ok: false, data: null };
    }
    return await authFetch(`http://localhost:8000/api/conversations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    }, navigate);
  },

  deleteConversation: async (id, navigate) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return { ok: false, data: null };
    }
    return await authFetch(`http://localhost:8000/api/conversations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }, navigate);
  },
};