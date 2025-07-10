import os
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

users = {}

def generate_hex_id():
    return ''.join(random.choices(string.hexdigits, k=6)).upper()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        upload_folder = os.path.join(app.static_folder, 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        filename = file.filename
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        file_url = f'/static/uploads/{filename}'
        file_type = 'image' if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')) else 'video'
        
        socketio.emit('media_message', {'url': file_url, 'type': file_type, 'user_id': request.form.get('user_id')})
        return jsonify({'success': True, 'url': file_url})

@socketio.on('connect')
def handle_connect():
    user_id = generate_hex_id()
    users[request.sid] = user_id
    emit('assign_id', {'user_id': user_id})
    emit('system_message', {'msg': f'歡迎使用者 #{user_id} 加入聊天室！'}, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    user_id = users.pop(request.sid, '未知用戶')
    emit('system_message', {'msg': f'使用者 #{user_id} 已離開。'}, broadcast=True)

@socketio.on('chat_message')
def handle_chat_message(json):
    emit('chat_message', {'msg': json['msg'], 'user_id': json['user_id']}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)