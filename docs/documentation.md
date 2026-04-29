# Project Documentation

## Overview

This project is a React application built with Vite. It is a photography portfolio website.

The public gallery reads published albums and photos from the backend API. The admin area uses Supabase GitHub OAuth and sends the session access token to the backend for protected asset-management requests.

## Components

*   `NavBar`: Navigation bar component with links to different sections of the website.
*   `WelcomeImage`: Component that displays a welcome message and a banner image.
*   `GalleryBanner`: Component that displays a gallery of images with links to individual albums.
    *   **Technical Details:** The filter chips are generated from the live published album list instead of hardcoded categories.
*   `GalleryImage`: Component that displays a single image in the gallery.
*   `ImageSwitcher`: Component that switches between multiple images in a slideshow.
*   `DownArrow`: Component that displays a down arrow icon that scrolls the page down.
*   `Footer`: Component that displays the footer with links to social media and copyright information.
*   `SingleAlbumImage`: Component used to display images on the single album page.

## Pages

*   `HomePage`: The main page of the website, displaying the welcome image and the gallery banner.
    *   **Technical Details:** This page renders `WelcomeImage`, `GalleryBanner`, and `Footer`, uses a ref to scroll to the gallery section, and shows an admin status banner when the user is redirected home after an admin auth failure.
*   `SingleAlbumPage`: Page that displays a single album of images.
    *   **Technical Details:** This page loads images through `useImageGallery` using the `album` query parameter, progressively loads later pages from the backend, and only renders visible captions when a photo has an explicit description.
*   `AdminPage`: Admin entry page.
    *   **Technical Details:** This page initializes the Supabase session, redirects authenticated users into `/admin/upload`, and starts GitHub OAuth for signed-out users.
*   `SoftwareEngineeringPage`: Page that displays information about the user's software engineering skills and projects.
    *   **Technical Details:** This page displays information about the user's software engineering skills and projects. It uses the `WelcomeImage` component to display a welcome message and the `ImageSwitcher` component to display a slideshow of images.
*   `NotFoundPage`: Page that displays a 404 error message.
    *   **Technical Details:** This page is a simple error page that displays a 404 message. It uses the `NavBar`, `WelcomeImage`, and `Footer` components.
*   `UnderConstructionPage`: Page that displays an "Under Construction" message.
    *   **Technical Details:** This page is a placeholder page that displays an "Under Construction" message. It uses the `NavBar`, `WelcomeImage`, and `Footer` components.

## Functionality

*   The website displays a gallery of images organized into albums.
*   Users can navigate to individual album pages to view the images in each album.
*   The admin area is protected by Supabase GitHub OAuth on the frontend and by backend allowlist checks on the API.
*   Local frontend Supabase config lives in `.env.local`, but the backend needs its own `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `ADMIN_USER_ID` configuration to validate admin access.
*   Production frontend builds require `VITE_API_BASE_URL`; there is no production fallback to localhost.
*   Azure Static Web Apps serves the SPA with `staticwebapp.config.json` for navigation fallback and baseline security headers.
*   The website also includes a software engineering page with information about the user's skills and projects.
*   The navigation bar allows users to navigate to different sections of the website.
