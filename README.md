# 🎀 Cloudhop - 一個可愛風格的即時群聊網頁應用

Cloudhop 是一個輕量級、匿名的即時群組聊天網頁應用。使用者無需註冊，進入網頁即可獲得一個隨機的六位元十六進制 ID，並立即開始與所有在線使用者進行交流。

## ✨ 主要功能

- **匿名聊天**: 無需註冊或登入，每位使用者都會被分配一個獨特的臨時 ID。
- **即時訊息**: 訊息會即時顯示在所有在線使用者的畫面上。
- **左右佈局**: 使用者自己的訊息顯示在右側，他人訊息顯示在左側，對話流清晰易讀。
- **多媒體支援**: 除了文字，還支援圖片和影片的即時上傳與分享。
- **可愛風格介面**: 採用了美樂蒂的粉色、圓潤、可愛的視覺風格。
- **系統訊息**: 使用者的加入和離開都會有系統訊息提示。
- **在線人數顯示**: 即時顯示當前聊天室的在線人數。

## 🛠️ 技術棧

- **後端**: Python, Flask, Flask-SocketIO
- **前端**: HTML, CSS, JavaScript
- **即時通訊協定**: WebSocket
- **WSGI 伺服器**: Eventlet
- **訊息佇列**: Redis (用於多副本間的訊息同步)

## 🚀 如何在本機運行

請依照以下步驟來設定並運行此專案。

### 1. 前置需求

- Python 3.6+ (建議使用 3.9 或更高版本)
- `pip` (Python 套件安裝器)
- 一個正常的網路連線
- **Redis 伺服器**: 確保您的本機已安裝並運行 Redis 伺服器 (例如透過 `brew install redis` 並 `brew services start redis`)

### 2. 下載或複製專案

將此專案的所有檔案下載到您電腦的某個資料夾中 (例如 `cloudhop`)。

### 3. 建立並啟用虛擬環境

在終端機中，進入您的專案資料夾，然後執行以下指令來建立並啟用 Python 虛擬環境。這能確保專案的相依套件與您的系統環境隔離。

```bash
# 建立名為 venv 的虛擬環境
python3 -m venv venv

# 在 macOS / Linux 上啟用虛擬環境
source venv/bin/activate
```

### 4. 安裝相依套件

啟用虛擬環境後，使用 `pip` 和我們提供的 `requirements.txt` 檔案來安裝所有必要的 Python 套件。

```bash
pip install -r requirements.txt
```

### 5. 啟動聊天室伺服器

一切準備就緒！執行以下指令來啟動後端伺服器。

```bash
python app.py
```

伺服器成功啟動後，您會看到類似以下的訊息，表示它正在 `0.0.0.0:5001` 上運行。

```
(12345) wsgi starting up on http://0.0.0.0:5001
```

### 6. 進入聊天室

打開您的網頁瀏覽器，輸入以下任一網址即可進入您的聊天室：

- `http://127.0.0.1:5001`
- `http://localhost:5001`

## 🐳 部署到 Docker

您可以將應用程式打包成 Docker 映像檔，以便在任何支援 Docker 的環境中運行。

### 1. 前置需求

- Docker Desktop (或 Docker Engine) 已安裝並運行。

### 2. 建置 Docker 映像檔

在專案根目錄下，執行以下命令建置映像檔。請將 `your_dockerhub_username` 替換為您的 Docker Hub 使用者名稱。

```bash
docker build -t your_dockerhub_username/cloudhop:latest .
```

### 3. 推送映像檔到 Docker Hub (可選，但推薦)

如果您希望在其他機器或 Kubernetes 集群中使用此映像檔，建議將其推送到 Docker Hub。

```bash
docker login
docker push your_dockerhub_username/cloudhop:latest
```

### 4. 運行 Docker 容器

確保您的 Redis 伺服器正在運行 (如果是在 Docker 容器中運行，請確保其可被訪問)。然後運行以下命令啟動應用程式容器：

```bash
docker run -p 5001:5001 -e REDIS_URL=redis://host.docker.internal:6379/0 your_dockerhub_username/cloudhop:latest
```

> **注意**: `host.docker.internal` 是一個特殊的 DNS 名稱，允許 Docker 容器訪問主機的服務。如果您的 Redis 運行在主機上，請使用此配置。如果 Redis 運行在另一個 Docker 容器中，您可能需要使用 Docker 網路來連接它們。

## ☸️ 部署到 Kubernetes

將 Cloudhop 部署到 Kubernetes 集群，以實現高可用性、可擴展性和自動化管理。

### 1. 前置需求

- Kubernetes 集群 (例如 Docker Desktop 內建的 Kubernetes 或 Minikube) 已啟動並運行。
- `kubectl` 命令列工具已配置並連接到您的集群。
- 您的 `cloudhop` Docker 映像檔已推送到 Docker Hub (或您的 Kubernetes 集群可以訪問的 Registry)。

### 2. 部署 Redis 服務

Redis 作為訊息佇列，是多副本聊天室應用程式的必要組件。

```bash
kubectl apply -f redis-k8s.yaml
```

### 3. 部署聊天室應用程式

這將部署您的聊天室應用程式的多個副本，並配置其連接到 Redis。

```bash
kubectl apply -f chat-app-k8s.yaml
```

### 4. 檢查部署狀態

您可以檢查 Pod 和服務的狀態，確保它們都已正常運行。

```bash
kubectl get pods
kubectl get services
```

### 5. 訪問應用程式

由於您使用的是 Docker Desktop 內建的 Kubernetes，`LoadBalancer` 類型的服務通常會被映射到 `localhost` 的一個隨機埠。最可靠的訪問方式是使用 `kubectl port-forward`。

首先，確保您的 `chat-app-service` 正在運行：

```bash
kubectl get services
```

然後，將本地埠轉發到服務：

```bash
kubectl port-forward service/chat-app-service 8080:80
```

保持此命令在終端機中運行，然後在您的網頁瀏覽器中訪問：

`http://localhost:8080`

---

希望您玩得愉快！