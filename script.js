// ============================================
// 📌 VIDEO HUB - Main JavaScript
// ============================================

// --- 🏠 Home Page: Videos दिखाना ---
async function loadVideos() {
    const container = document.getElementById('videoContainer');
    if (!container) return;
    
    container.innerHTML = '<p class="loading">⏳ Videos लोड हो रहे हैं...</p>';
    
    try {
        const { data: videos, error } = await supabaseClient
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!videos || videos.length === 0) {
            container.innerHTML = '<p class="loading">😅 अभी कोई Video नहीं है।</p>';
            return;
        }
        
        let html = '<div class="video-grid">';
        videos.forEach(video => {
            html += `
                <div class="video-card">
                    <img src="${video.thumbnail_url || 'https://via.placeholder.com/300x200?text=No+Thumbnail'}" 
                         alt="${video.title}" 
                         onclick="window.open('${video.flezen_link}', '_blank')">
                    <div class="content">
                        <h3>${video.title}</h3>
                        <p>${video.description || ''}</p>
                        <a href="${video.flezen_link}" target="_blank" class="watch-btn">▶ WATCH VIDEO</a>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading videos:', error);
        container.innerHTML = `<p class="error">❌ Error: ${error.message}</p>`;
    }
}

// --- 🔐 Login Function ---
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');
    
    message.textContent = '⏳ Logging in...';
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        message.style.color = '#28a745';
        message.textContent = '✅ Login Successful! Redirecting...';
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
        
    } catch (error) {
        message.style.color = '#dc3545';
        message.textContent = `❌ ${error.message}`;
    }
}

// --- 🚪 Logout Function ---
async function handleLogout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}

// --- 📝 Admin: Add Video ---
async function addVideo(event) {
    event.preventDefault();
    
    const title = document.getElementById('videoTitle').value;
    const flezenLink = document.getElementById('flezenLink').value;
    const thumbnailUrl = document.getElementById('thumbnailUrl').value;
    const description = document.getElementById('videoDescription').value;
    
    const submitBtn = event.target.querySelector('button');
    submitBtn.textContent = '⏳ Adding...';
    submitBtn.disabled = true;
    
    try {
        const { data, error } = await supabaseClient
            .from('videos')
            .insert([
                { 
                    title: title,
                    flezen_link: flezenLink,
                    thumbnail_url: thumbnailUrl || null,
                    description: description || null
                }
            ]);
        
        if (error) throw error;
        
        alert('✅ Video Successfully Added!');
        event.target.reset();
        loadAdminVideos(); // Refresh list
        
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    } finally {
        submitBtn.textContent = '➕ Video Add करें';
        submitBtn.disabled = false;
    }
}

// --- 📋 Admin: Load Videos for Management ---
async function loadAdminVideos() {
    const container = document.getElementById('adminVideoContainer');
    if (!container) return;
    
    container.innerHTML = '<p class="loading">⏳ Loading...</p>';
    
    try {
        const { data: videos, error } = await supabaseClient
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!videos || videos.length === 0) {
            container.innerHTML = '<p class="loading">😅 अभी कोई Video नहीं है।</p>';
            return;
        }
        
        let html = '<div class="video-grid">';
        videos.forEach(video => {
            html += `
                <div class="video-card">
                    <img src="${video.thumbnail_url || 'https://via.placeholder.com/300x200?text=No+Thumbnail'}" 
                         alt="${video.title}">
                    <div class="content">
                        <h3>${video.title}</h3>
                        <p>${video.description || ''}</p>
                        <div class="admin-actions">
                            <button class="edit-btn" onclick="editVideo('${video.id}')">✏️ Edit</button>
                            <button class="delete-btn" onclick="deleteVideo('${video.id}')">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<p class="error">❌ Error: ${error.message}</p>`;
    }
}

// --- ✏️ Admin: Edit Video ---
async function editVideo(id) {
    const newTitle = prompt('नया Title दें:');
    if (newTitle === null) return;
    
    const newDescription = prompt('नई Description दें (Optional):');
    if (newDescription === null) return;
    
    const newThumbnail = prompt('नई Thumbnail URL दें (Optional):');
    if (newThumbnail === null) return;
    
    const newLink = prompt('नया Flezen Link दें:');
    if (newLink === null) return;
    
    try {
        const { error } = await supabaseClient
            .from('videos')
            .update({
                title: newTitle,
                description: newDescription || null,
                thumbnail_url: newThumbnail || null,
                flezen_link: newLink
            })
            .eq('id', id);
        
        if (error) throw error;
        
        alert('✅ Video Updated Successfully!');
        loadAdminVideos();
        
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
}

// --- 🗑️ Admin: Delete Video ---
async function deleteVideo(id) {
    if (!confirm('क्या आप सच में ये Video Delete करना चाहते हैं?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('videos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        alert('✅ Video Deleted Successfully!');
        loadAdminVideos();
        
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
}

// --- 🔍 Check if User is Logged In (Admin Page Protection) ---
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    // Agar admin page hai aur login nahi hai toh login page pe bhejo
    if (window.location.pathname.includes('admin.html') && !session) {
        window.location.href = 'login.html';
    }
    
    // Agar login page hai aur already login hai toh admin page pe bhejo
    if (window.location.pathname.includes('login.html') && session) {
        window.location.href = 'admin.html';
    }
    
    return session;
}

// --- 🚀 Initialize Everything ---
document.addEventListener('DOMContentLoaded', async function() {
    
    // 🔐 Auth Check
    await checkAuth();
    
    // 🏠 Home Page - Videos Load
    if (document.getElementById('videoContainer')) {
        loadVideos();
    }
    
    // 🔐 Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 🚪 Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 📝 Admin - Add Video Form
    const videoForm = document.getElementById('videoForm');
    if (videoForm) {
        videoForm.addEventListener('submit', addVideo);
        loadAdminVideos();
    }
});
