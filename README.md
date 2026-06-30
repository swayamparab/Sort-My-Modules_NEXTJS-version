# Sort My Modules

A personalized academic resource sharing platform built for college students. Users can upload, discover, bookmark, and download study materials tailored to their branch and semester.

## Features

### Authentication

* Secure JWT Authentication
* HttpOnly Cookies
* Protected Routes

### Resources

* Upload PDF Notes
* View Resources
* Download Resources
* Personalized Resource Feed
* Latest Resources
* Top Voted Resources
* Subject-wise Resources
* Search Resources

### User Features

* Bookmark Resources
* Upvote Resources
* Dashboard with Statistics
* View Personal Uploads
* View Saved Bookmarks

### PDF Viewer

* In-browser PDF Viewing
* Zoom In / Zoom Out
* Page Navigation
* Current Page Indicator
* Download Support

## Tech Stack

### Frontend

* Next.js (App Router)
* React
* TypeScript
* CSS

### Backend

* Next.js Route Handlers
* MongoDB
* Mongoose
* JWT Authentication

### Storage

* ImageKit

### Libraries

* React PDF
* Axios
* React Hot Toast
* Next Top Loader

## Project Structure

```
app/
components/
context/
lib/
models/
services/
public/
```

## Architecture

The project follows the App Router architecture.

* Server Components for fetching data
* Client Components for interactive UI
* Service Layer for direct database access
* API Routes for mutations (POST, PATCH, DELETE)

```
Server Component
        ↓
Service
        ↓
MongoDB

Client Component
        ↓
API Route
        ↓
Service
        ↓
MongoDB
```

## Installation

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Create a `.env.local` file and add the required environment variables.

Run the development server

```bash
npm run dev
```

Open

```
http://localhost:3000
```

## Future Improvements

* Admin Panel
* Resource Comments
* Resource Reporting
* Notifications
* Pagination
* Advanced Filtering
* Recommendation System
* Redis Caching
* Cloud Deployment

## License

This project is intended for educational purposes.
