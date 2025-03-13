document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker
    const datePicker = flatpickr("#datePicker", {
        dateFormat: "Y-m-d",
        maxDate: "today",
        defaultDate: new Date(),
    });

    // Get DOM elements
    const searchForm = document.getElementById('searchForm');
    const searchQuery = document.getElementById('searchQuery');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const errorMessageElement = document.getElementById('errorMessage');
    const resultsElement = document.getElementById('results');
    
    // Handle form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const query = searchQuery.value.trim();
        const timestamp = datePicker.input.value;
        
        if (!query) {
            showError('Please enter a scholar name');
            return;
        }
        
        // Show loading state
        hideError();
        hideResults();
        showLoading();
        
        // Make API request
        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                timestamp: timestamp
            }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to fetch scholar data');
                });
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            displayResults(data, timestamp);
        })
        .catch(error => {
            hideLoading();
            showError(error.message);
        });
    });
    
    // Function to display the results
    function displayResults(data, timestamp) {
        // Update author info
        document.getElementById('author-name').textContent = data.name || 'Unknown Scholar';
        document.getElementById('author-affiliation').textContent = data.affiliation || '';
        
        // Show author email if available
        if (data.email) {
            const emailElement = document.getElementById('author-email');
            emailElement.textContent = data.email;
            emailElement.classList.remove('hidden');
        }
        
        // Update citation metrics
        document.getElementById('total-citations').textContent = data.citedby || 0;
        document.getElementById('h-index').textContent = calculateHIndex(data.publications) || 0;
        document.getElementById('i10-index').textContent = calculateI10Index(data.publications) || 0;
        
        // Show author photo if available
        if (data.url_picture) {
            const photoElement = document.getElementById('author-photo');
            photoElement.src = data.url_picture;
            photoElement.classList.remove('hidden');
        }
        
        // Update viewing date
        document.getElementById('viewing-date').textContent = formatDate(timestamp);
        
        // Clear previous publications
        const publicationsList = document.getElementById('publications-list');
        publicationsList.innerHTML = '';
        
        // Add publications
        if (data.publications && data.publications.length > 0) {
            // Sort publications by year (descending)
            const sortedPublications = [...data.publications].sort((a, b) => {
                const yearA = a.bib && a.bib.pub_year ? parseInt(a.bib.pub_year) : 0;
                const yearB = b.bib && b.bib.pub_year ? parseInt(b.bib.pub_year) : 0;
                return yearB - yearA;
            });
            
            sortedPublications.forEach(pub => {
                const pubElement = document.createElement('div');
                pubElement.className = 'publication-item';
                
                // Title with link if available
                const titleElement = document.createElement('a');
                titleElement.className = 'publication-title';
                titleElement.textContent = pub.bib && pub.bib.title ? pub.bib.title : 'Untitled';
                
                if (pub.pub_url) {
                    titleElement.href = pub.pub_url;
                    titleElement.target = '_blank';
                } else {
                    titleElement.style.color = '#1a0dab';
                    titleElement.style.textDecoration = 'none';
                    titleElement.style.cursor = 'text';
                }
                
                // Authors
                const authorsElement = document.createElement('p');
                authorsElement.className = 'publication-authors';
                authorsElement.textContent = pub.bib && pub.bib.author ? pub.bib.author : '';
                
                // Venue
                const venueElement = document.createElement('p');
                venueElement.className = 'publication-venue';
                venueElement.textContent = pub.bib && pub.bib.venue ? pub.bib.venue : '';
                
                // Year and citations
                const metaElement = document.createElement('div');
                metaElement.className = 'publication-meta';
                
                const yearElement = document.createElement('span');
                yearElement.className = 'publication-year';
                yearElement.textContent = pub.bib && pub.bib.pub_year ? pub.bib.pub_year : 'Unknown year';
                
                const citationsElement = document.createElement('span');
                citationsElement.className = 'publication-citations';
                citationsElement.textContent = `Cited by ${pub.num_citations || 0}`;
                
                // Append elements
                metaElement.appendChild(yearElement);
                metaElement.appendChild(citationsElement);
                
                pubElement.appendChild(titleElement);
                pubElement.appendChild(authorsElement);
                pubElement.appendChild(venueElement);
                pubElement.appendChild(metaElement);
                
                publicationsList.appendChild(pubElement);
            });
        } else {
            const noPubsElement = document.createElement('p');
            noPubsElement.textContent = 'No publications found for this time period.';
            publicationsList.appendChild(noPubsElement);
        }
        
        // Show results
        showResults();
    }
    
    // Calculate h-index from publications
    function calculateHIndex(publications) {
        if (!publications || publications.length === 0) {
            return 0;
        }
        
        // Get citations counts in descending order
        const citationCounts = publications
            .map(pub => pub.num_citations || 0)
            .sort((a, b) => b - a);
        
        let hIndex = 0;
        for (let i = 0; i < citationCounts.length; i++) {
            if (citationCounts[i] >= i + 1) {
                hIndex = i + 1;
            } else {
                break;
            }
        }
        
        return hIndex;
    }
    
    // Calculate i10-index from publications
    function calculateI10Index(publications) {
        if (!publications || publications.length === 0) {
            return 0;
        }
        
        return publications.filter(pub => (pub.num_citations || 0) >= 10).length;
    }
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) {
            return new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Helper functions for UI state
    function showLoading() {
        loadingElement.classList.remove('hidden');
    }
    
    function hideLoading() {
        loadingElement.classList.add('hidden');
    }
    
    function showError(message) {
        errorMessageElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
    
    function hideError() {
        errorElement.classList.add('hidden');
    }
    
    function showResults() {
        resultsElement.classList.remove('hidden');
    }
    
    function hideResults() {
        resultsElement.classList.add('hidden');
    }
});