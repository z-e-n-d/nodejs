let currentUserEmail = "";
let currentUsername = "";

// Switch between forms
function showSignup() {
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('feed').style.display = 'none';
}

function showLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('feed').style.display = 'none';
}

function showFeed(username, email) {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('feed').style.display = 'block';
    document.getElementById('welcome-message').innerText = `Hello, ${username}!`;
    currentUserEmail = email;
    currentUsername = username;
    loadPosts();
}

// Display a temporary message
function showMessage(message, success = true) {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = success ? '#d4edda' : '#f8d7da';
    messageDiv.style.color = success ? '#155724' : '#721c24';
    messageDiv.innerText = message;
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Handle Sign-Up
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch('https://nodejs-rwqk.onrender.com/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const result = await response.json();
        if (response.ok) {
            showMessage('Sign-up successful! Please log in.', true);
            showLogin();
        } else {
            showMessage(result.error, false);
        }
    } catch (error) {
        showMessage('Failed to connect to the server.', false);
    }
});

// Handle Log-In
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('https://nodejs-rwqk.onrender.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if (response.ok) {
            showMessage('Login successful!', true);
            showFeed(result.username, email);
        } else {
            showMessage(result.error, false);
        }
    } catch (error) {
        showMessage('Failed to connect to the server.', false);
    }
});

// Post Popup
function showPostPopup() {
    document.getElementById('post-popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function hidePostPopup() {
    document.getElementById('post-popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

// Submit Post
async function submitPost() {
    const description = document.getElementById('post-description').value;
    const fileInput = document.getElementById('post-file');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('description', description);
    formData.append('file', file);

    try {
        const response = await fetch('https://nodejs-rwqk.onrender.com/posts', {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            showMessage('Post created successfully!', true);
            hidePostPopup();
            loadPosts();
        } else {
            const result = await response.json();
            showMessage(result.error, false);
        }
    } catch (error) {
        showMessage('Failed to connect to the server.', false);
    }
}

// Load Posts
async function loadPosts() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    try {
        const response = await fetch('https://nodejs-rwqk.onrender.com/posts');
        const posts = await response.json();

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';

            const username = document.createElement('p');
            username.className = 'post-username';
            username.innerText = `Posted by: ${post.username || 'Anonymous'}`;
            postElement.appendChild(username);

            const description = document.createElement('p');
            description.className = 'post-description';
            description.innerText = post.description;
            postElement.appendChild(description);

            if (post.fileUrl) {
                const image = document.createElement('img');
                image.src = `https://nodejs-rwqk.onrender.com${post.fileUrl}`;
                image.alt = 'Post image';
                postElement.appendChild(image);
            }

            if (currentUserEmail === 'zozo.toth.2022home@gmail.com') {
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button';
                deleteButton.innerText = 'Delete';
                deleteButton.onclick = () => deletePost(post.id);
                postElement.appendChild(deleteButton);
            }

            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        showMessage('Failed to load posts.', false);
    }
}

// Delete Post
async function deletePost(postId) {
    try {
        const response = await fetch(`https://nodejs-rwqk.onrender.com/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'x-user-email': currentUserEmail },
        });

        if (response.ok) {
            showMessage('Post deleted successfully!', true);
            loadPosts();
        } else {
            const result = await response.json();
            showMessage(result.error, false);
        }
    } catch (error) {
        showMessage('Failed to delete post.', false);
    }
}

// File Preview
function previewFile() {
    const file = document.getElementById('post-file').files[0];
    const filePreview = document.getElementById('file-preview');
    const reader = new FileReader();

    reader.onload = function (e) {
        filePreview.style.display = 'block';
        filePreview.src = e.target.result;
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}
