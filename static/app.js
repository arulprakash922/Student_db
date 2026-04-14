const showAllBtn = document.getElementById('show-all-btn');
const studentsTable = document.getElementById('students-table');
const studentsBody = document.getElementById('students-body');
const chatSendBtn = document.getElementById('chat-send-btn');
const chatBox = document.getElementById('chat-box');
const chatError = document.getElementById('chat-error');
const chatWidgetToggle = document.getElementById('chat-widget-toggle');
const chatWidgetStatus = document.querySelector('.chat-widget-status');
const chatWidgetIcon = document.querySelector('.chat-widget-icon');
const chatPanel = document.getElementById('chat-panel');
const chatCloseBtn = document.getElementById('chat-close-btn');

function renderRows(students) {
    studentsBody.innerHTML = '';
    students.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.age}</td>
            <td>${s.department}</td>
            <td>${s.marks}</td>
            <td>
                <a href="/edit/${s.id}">Edit</a> |
                <a href="/delete/${s.id}">Delete</a>
            </td>
        `;
        studentsBody.appendChild(row);
    });
}

async function loadStudents() {
    try {
        const response = await fetch('/students');
        if (!response.ok) {
            throw new Error('Could not load students');
        }
        const students = await response.json();
        renderRows(students);
        studentsTable.classList.remove('hidden');
    } catch (error) {
        alert(error.message);
    }
}

async function sendMessage() {
    const msgInput = document.getElementById('msg');
    const msg = msgInput.value.trim();
    if (!msg) {
        chatError.textContent = 'Please enter a question before sending.';
        return;
    }

    chatError.textContent = '';

    try {
        const res = await fetch('/chat-mini', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message: msg})
        });

        const data = await res.json();

        if (!res.ok) {
            const detail = data.detail || data.error || 'Chat service unavailable.';
            chatError.textContent = `Error ${res.status}: ${detail}`;
            return;
        }

        chatBox.innerHTML += `
            <div class="chat-message user-message"><strong>You:</strong> ${msg}</div>
            <div class="chat-message bot-message"><strong>Bot:</strong> ${data.response}</div>
        `;
        msgInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        chatError.textContent = 'Unable to contact the chat service. Please try again later.';
    }
}

function updateChatToggleState(open) {
    if (open) {
        chatWidgetStatus.textContent = 'Close';
        chatWidgetIcon.textContent = '✕';
        chatWidgetToggle.classList.add('open');
        chatWidgetToggle.setAttribute('aria-label', 'Close chat');
    } else {
        chatWidgetStatus.textContent = 'Chat';
        chatWidgetIcon.textContent = '💬';
        chatWidgetToggle.classList.remove('open');
        chatWidgetToggle.setAttribute('aria-label', 'Open chat');
    }
}

function toggleChatPanel() {
    const isHidden = chatPanel.classList.toggle('hidden');
    updateChatToggleState(!isHidden);
}

window.addEventListener('DOMContentLoaded', () => {
    chatPanel.classList.add('hidden');
    updateChatToggleState(false);
    showAllBtn.addEventListener('click', loadStudents);
    chatSendBtn.addEventListener('click', sendMessage);
    chatWidgetToggle.addEventListener('click', toggleChatPanel);
    chatCloseBtn.addEventListener('click', () => {
        chatPanel.classList.add('hidden');
        updateChatToggleState(false);
    });
    loadStudents();
});
