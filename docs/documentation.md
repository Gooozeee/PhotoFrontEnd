# Project Documentation

## Overview

This project is a React application built with Vite. It is a photography portfolio website.

## Components

*   `NavBar`: Navigation bar component with links to different sections of the website.
*   `WelcomeImage`: Component that displays a welcome message and a banner image.
*   `GalleryBanner`: Component that displays a gallery of images with links to individual albums.
*   `GalleryImage`: Component that displays a single image in the gallery.
*   `ImageSwitcher`: Component that switches between multiple images in a slideshow.
*   `DownArrow`: Component that displays a down arrow icon that scrolls the page down.
*   `Footer`: Component that displays the footer with links to social media and copyright information.
*   `SingleAlbumImage`: Component used to display images on the single album page.

## Pages

*   `HomePage`: The main page of the website, displaying the welcome image and the gallery banner.
    *   **Technical Details:** This page imports and renders the `NavBar`, `WelcomeImage`, `GalleryBanner`, `DownArrow`, and `Footer` components. It's a simple composition of these components to create the main landing page.
*   `SingleAlbumPage`: Page that displays a single album of images.
    *   **Technical Details:** This page dynamically loads images based on the `album` query parameter in the URL. It uses `import.meta.glob` to import images from the corresponding album directory (`src/assets/Birds`, `src/assets/Rally`, `src/assets/Cities`, or `src/assets/Landscapes`). The `determineImageOrientation` function determines the orientation of each image and the `optimizeImageLayout` function optimizes the layout of the images in the gallery.
        *   **Image Display Details:**
            *   The `SingleAlbumPage` component fetches images from a specific album based on the URL parameter.
            *   It uses `import.meta.glob` to dynamically import all images from the corresponding directory.
            *   The `determineImageOrientation` function is crucial for determining whether an image is in portrait or landscape mode. This information is then used to apply appropriate styling.
            *   The `optimizeImageLayout` function attempts to optimize the image layout based on the number of images in the album. It adjusts the `size` property of the `ImageInfo` objects to control how wide each image is displayed in the `masonry-grid`. The possible sizes are "normal", "wide", and "full".
            *   The `SingleAlbumImage` component is responsible for rendering each individual image. It receives the `imageSource`, `imageDescription`, `presetOrientation`, and `size` props. It uses these props to determine how to display the image and apply the correct styling.
*   `SoftwareEngineeringPage`: Page that displays information about the user's software engineering skills and projects.
    *   **Technical Details:** This page displays information about the user's software engineering skills and projects. It uses the `WelcomeImage` component to display a welcome message and the `ImageSwitcher` component to display a slideshow of images.
*   `NotFoundPage`: Page that displays a 404 error message.
    *   **Technical Details:** This page is a simple error page that displays a 404 message. It uses the `NavBar`, `WelcomeImage`, and `Footer` components.
*   `UnderConstructionPage`: Page that displays an "Under Construction" message.
    *   **Technical Details:** This page is a placeholder page that displays an "Under Construction" message. It uses the `NavBar`, `WelcomeImage`, and `Footer` components.

## Functionality

*   The website displays a gallery of images organized into albums.
*   Users can navigate to individual album pages to view the images in each album.
*   The website also includes a software engineering page with information about the user's skills and projects.
*   The navigation bar allows users to navigate to different sections of the website.
