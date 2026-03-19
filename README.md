# CRM Chat Service

A real-time chat microservice within the CRM ecosystem that enables direct messaging between CRM users. Built with Socket.IO and MySQL, this service powers internal team communication with support for text messages, file sharing, read receipts, and message management.

## Overview

The CRM Chat Service provides a full-featured real-time messaging system for CRM team members. It uses WebSockets for instant message delivery, persists all conversations in MySQL, and supports file attachments for sharing documents within chat threads. Messages are organized by rooms, enabling structured one-on-one and group conversations.

## Key Features

- **Real-Time Messaging** — Instant message delivery via Socket.IO with room-based communication
- **Message Persistence** — All conversations stored in MySQL for history and audit purposes
- **File Sharing** — Upload and share files within chat conversations (up to 10 MB per file)
- **Read Receipts** — Track message read status for delivery confirmation
- **Message Deletion** — Soft-delete messages (preserves data integrity while hiding from users)
- **Room-Based Conversations** — Users join specific rooms for organized, scoped messaging
- **Message History** — Retrieve full conversation history by room or per-user inbox
- **Static File Serving** — Uploaded files served via static route for easy access

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Real-Time:** Socket.IO
- **Database:** MySQL
- **File Upload:** Multer
- **Environment Config:** dotenv

## API Endpoints

| Method | Endpoint                      | Description                            |
|--------|-------------------------------|----------------------------------------|
| GET    | `/`                           | Health check — confirms service is running |
| GET    | `/get-message/:room_id`       | Get all messages in a specific room    |
| GET    | `/messages/:user_id`          | Get all messages received by a user    |
| GET    | `/delete-message/:id`         | Soft-delete a specific message         |
| POST   | `/message/uploadfile`         | Upload files within a chat conversation|

### WebSocket Events

| Event            | Direction       | Description                                      |
|------------------|-----------------|--------------------------------------------------|
| `join_room`      | Client → Server | Join a specific chat room                        |
| `send_message`   | Client → Server | Send a message to a room                         |
| `receive_message`| Server → Client | Receive a new message in the room                |
| `read_message`   | Client → Server | Mark a message as read                           |
| `delete_message` | Client → Server | Request deletion of a message                    |
| `updated_message`| Server → Client | Receive updated message data after deletion      |

### File Upload Request

**POST `/message/uploadfile`** (multipart/form-data)

| Field        | Type   | Required | Description                |
|--------------|--------|----------|----------------------------|
| `files`      | File[] | Yes      | One or more files to upload|
| `sender_id`  | INT    | Yes      | ID of the sender           |
| `recever_id` | INT    | Yes      | ID of the receiver         |
| `date_time`  | String | Yes      | Message timestamp          |
| `room`       | INT    | Yes      | Room ID for the conversation|

## Prerequisites

- Node.js (v14 or higher)
- MySQL server with a `crm-system` database
- A `crm_conversation` table in the database

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mhmalvi/CRM-Chat-Service.git
   cd CRM-Chat-Service
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Configure environment variables:**

   Copy the example environment file and fill in your values:
   ```bash
   cp example.env .env
   ```

   ```env
   CLIENT_URL=http://your-crm-frontend-url.com
   PORT=5000
   ```

4. **Set up the database:**

   Create the `crm_conversation` table in your MySQL `crm-system` database:
   ```sql
   CREATE TABLE crm_conversation (
     id INT AUTO_INCREMENT PRIMARY KEY,
     sender_id INT,
     sender_name VARCHAR(255),
     receiver_id INT,
     receiver_name VARCHAR(255),
     message TEXT,
     date_time DATETIME,
     status INT DEFAULT 0,
     room INT,
     delete_message INT DEFAULT 0
   );
   ```

5. **Start the service:**

   Production:
   ```bash
   npm start
   ```

   Development (with auto-reload):
   ```bash
   npm run start-dev
   ```

   The service will start on the configured `PORT` (default: **5000**).

## Architecture

This service is part of a larger **CRM microservices architecture**. It provides the internal communication layer for CRM users, operating as an independent service with its own database tables and real-time WebSocket server. It can be deployed and scaled independently based on concurrent user and messaging load.

## License

MIT
