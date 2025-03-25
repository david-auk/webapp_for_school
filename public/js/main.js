// Global settings for pagination and filtering/sorting
let currentPage = 1;
let totalPages = 1;
let currentSortType = 'releaseDate';
let currentSortOrder = 'asc';
let currentFilterMood = 'all';
const itemsPerPage = 5;

// Fetch items from the backend with query parameters
function fetchItems() {
  fetch(`/api/musicItems?sortType=${currentSortType}&sortOrder=${currentSortOrder}&filterMood=${currentFilterMood}&page=${currentPage}&limit=${itemsPerPage}`)
    .then(response => response.json())
    .then(data => {
      totalPages = data.totalPages;
      renderItems(data.items);
      updatePagination();
      updateTitle();
    })
    .catch(err => console.error("Error fetching items:", err));
}

// Render items into the container
function renderItems(items) {
  const container = document.getElementById('items-container');
  container.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    // Format release date (YYYY-MM-DD)
    const dateStr = item.releaseDate.toString();
    const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;

    card.innerHTML = `
      <img src="images/${item.image}" alt="${item.alt}" title="${item.alt}">
      <h3>${item.name}</h3>
      <p>Release Date: ${formattedDate}</p>
      <p>Rating: ${item.rating}</p>
      <p>Mood: ${item.mood.join(', ')}</p>
    `;
    container.appendChild(card);
  });
}

// Update pagination controls
function updatePagination() {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  // Prev button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Prev';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchItems();
    }
  });
  paginationContainer.appendChild(prevButton);

  // Page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.disabled = i === currentPage;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      fetchItems();
    });
    paginationContainer.appendChild(pageButton);
  }

  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchItems();
    }
  });
  paginationContainer.appendChild(nextButton);
}

// Update the browser tab title with the current page number
function updateTitle() {
  document.title = `Music - Page ${currentPage}`;
}

// Update sorting based on dropdown selections
function updateSorting() {
  currentSortType = document.getElementById('sort-type').value;
  currentSortOrder = document.getElementById('sort-order').value;
  currentPage = 1;
  fetchItems();
}

// Event listeners for sorting dropdowns
document.getElementById('sort-type').addEventListener('change', updateSorting);
document.getElementById('sort-order').addEventListener('change', updateSorting);

// Filtering by mood
document.getElementById('filter-mood').addEventListener('change', (e) => {
  currentFilterMood = e.target.value;
  currentPage = 1;
  fetchItems();
});

document.getElementById('add-item-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('name', document.getElementById('item-name').value);
  formData.append('releaseDate', document.getElementById('item-release').value);
  formData.append('rating', document.getElementById('item-rating').value);
  formData.append('mood', document.getElementById('item-mood').value);
  formData.append('image', document.getElementById('item-image').files[0]);
  formData.append('alt', document.getElementById('item-alt').value);

  try {
    const response = await fetch('/api/musicItems', {
      method: 'POST',
      //headers: { 'Content-Type': 'application/json' },
      body: formData
    })

    if (!response.ok) throw new Error('Failed to upload');

    const data = await response.json();
    console.log('Success:', data);
    document.getElementById('add-item-form').reset(); // Reset the form

    fetchItems(); // Refresh the list
  } catch (error) {
    console.error('Error:', error);
  }

  e.target.reset();
});

// Initial fetch on page load
fetchItems();
