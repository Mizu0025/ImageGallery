    let images = [];
    let currentImageIndex = 0;
    let displayedImages = 20;

    // Theme Management
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    }

    function updateThemeButton(theme) {
        const button = document.getElementById('themeToggle');
        button.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Night Mode';
    }

    // Fetch images from server
    async function fetchImages() {
        try {
            const response = await fetch('/gallery/api/images');
            images = await response.json();
            initGallery();
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    }

    // Initialize gallery
    function initGallery() {
        if (images.length > 0) {
            updateMainImage();
            loadThumbnails();
        }
    }

    // Update main image and caption
    function updateMainImage() {
        const mainImage = document.getElementById('mainImage');
        const captionElement = document.getElementById('mainImageCaption');

        mainImage.src = images[currentImageIndex].url;
        mainImage.alt = images[currentImageIndex].alt;
        captionElement.textContent = images[currentImageIndex].caption;

        updateActiveThumbnail();
    }

    // Navigate through images
    function navigateImages(direction) {
        currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
        updateMainImage();
    }

    // Load initial thumbnails
    function loadThumbnails() {
        const container = document.getElementById('thumbnails');
        for (let i = 0; i < Math.min(displayedImages, images.length); i++) {
            const img = createThumbnail(i);
            container.appendChild(img);
        }

        if (displayedImages >= images.length) {
            document.querySelector('.load-more').style.display = 'none';
        }
    }

    // Create thumbnail element
    function createThumbnail(index) {
        const img = document.createElement('img');
        img.src = images[index].thumbnail;
        img.alt = images[index].alt;
        img.className = 'thumbnail';
        img.onclick = () => {
            currentImageIndex = index;
            updateMainImage();
        };
        return img;
    }

    // Update active thumbnail
    function updateActiveThumbnail() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, index) => {
            if (index === currentImageIndex) {
                thumb.classList.add('active-thumbnail');
            } else {
                thumb.classList.remove('active-thumbnail');
            }
        });
    }

    // Load more images
    function loadMoreImages() {
        const container = document.getElementById('thumbnails');
        const nextBatch = Math.min(displayedImages + 20, images.length);

        for (let i = displayedImages; i < nextBatch; i++) {
            const img = createThumbnail(i);
            container.appendChild(img);
        }

        displayedImages = nextBatch;

        if (displayedImages >= images.length) {
            document.querySelector('.load-more').style.display = 'none';
        }
    }

    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    function handleTouchStart(event) {
        touchStartX = event.touches[0].clientX;
    }

    function handleTouchEnd(event) {
        touchEndX = event.changedTouches[0].clientX;
        handleSwipe();
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                navigateImages(-1); // Swipe right, previous image
            } else {
                navigateImages(1);  // Swipe left, next image
            }
        }
    }

    // Event Listeners
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') navigateImages(-1);
        if (e.key === 'ArrowRight') navigateImages(1);
    });

    // Initialize when the page loads
    window.onload = () => {
        initTheme();
        fetchImages();

        // Add event listeners
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);

        // Add touch events for mobile swipe
        const mainImage = document.getElementById('mainImage');
        mainImage.addEventListener('touchstart', handleTouchStart);
        mainImage.addEventListener('touchend', handleTouchEnd);
    };
