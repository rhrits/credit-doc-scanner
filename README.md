---
title: Credit-Based Document Scanning System
description: A self-contained document scanning and matching system with a built-in credit system.
---

# Credit-Based Document Scanning System

## Overview
This project is a **Credit-Based Document Scanning System** built using **HTML**, **CSS**, **JavaScript** for the frontend, and **Node.js** with **Express** for the backend. The system allows users to upload plain text documents, scan them for similarity against stored documents, and manage their credits for scanning. Admins can approve or deny credit requests and view analytics.

The system is self-contained and uses **JSON files** for data storage. It includes user authentication, a credit system, document scanning, and an admin dashboard.

---

## Features

### 1. **User Management & Authentication**
- **User Registration & Login**: Users can register and log in using a username and password.
- **User Roles**:
  - **Regular Users**: Can upload documents, view scan results, and request additional credits.
  - **Admins**: Can approve/deny credit requests and view analytics.
- **Profile Section**: Displays user credits, past scans, and requests.

### 2. **Credit System**
- **Daily Free Credits**: Each user gets **20 free scans per day**. Credits reset at midnight.
- **Credit Requests**: Users can request additional credits if they exceed their daily limit.
- **Admin Approval**: Admins can approve or deny credit requests.
- **Credit Deduction**: Each document scan deducts **1 credit** from the user's balance.

### 3. **Document Scanning & Matching**
- **Document Upload**: Users can upload plain text files for scanning.
- **Text Matching**: The system compares the uploaded document against stored documents using a basic text similarity algorithm.
- **AI-Powered Matching (Bonus)**: Not implemented in this version.

### 4. **Smart Analytics Dashboard**
- **Track Scans**: View the number of scans per user per day.
- **Top Users**: Identify top users by scans and credit usage.
- **Credit Usage Statistics**: Admins can view credit usage statistics.

### 5. **API Endpoints**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/auth/register` | User registration |
| POST   | `/auth/login` | User login (Session-based) |
| GET    | `/user/profile` | Get user profile & credits |
| POST   | `/scan` | Upload document for scanning (uses 1 credit) |
| GET    | `/matches/:docId` | Get matching documents |
| POST   | `/credits/request` | Request admin to add credits |
| GET    | `/admin/analytics` | Get analytics for admins |

---

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript (No frameworks)
- **Backend**: Node.js (Express)
- **Database**: JSON files for data storage
- **File Storage**: Documents are stored locally
- **Authentication**: Basic username-password login (hashed passwords)
- **Text Matching**: Custom algorithm using basic text similarity

---

## Setup Instructions

### Prerequisites
1. **Node.js**: Ensure Node.js is installed on your system.
2. **Git**: Optional, for cloning the repository.

### Steps to Run the Project
1. **Clone the Repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd <project-folder>
