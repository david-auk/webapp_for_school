// Variable for items per page
const itemsPerPage = 5;

// Current page initialization
let currentPage = 1;

// Create a working copy of musicItems to allow modifications (sorting/filtering)
let currentItems = [...musicItems];

// Function to render items for the current page
function renderItems() {
  const container = document.getElementById('items-container');
  container.innerHTML = '';

  // Calculate start and end index for pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToShow = currentItems.slice(startIndex, endIndex);

  itemsToShow.forEach(item => {
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

  updatePagination();
  updateTitle();
}

// Function to update pagination controls
function updatePagination() {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(currentItems.length / itemsPerPage);

  // Previous Button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Prev';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderItems();
    }
  });
  paginationContainer.appendChild(prevButton);

  // Page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.disabled = true;
    }
    pageButton.addEventListener('click', () => {
      currentPage = i;
      renderItems();
    });
    paginationContainer.appendChild(pageButton);
  }

  // Next Button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderItems();
    }
  });
  paginationContainer.appendChild(nextButton);
}

// Update the browser tab title with the current page number
function updateTitle() {
  document.title = `Music - Page ${currentPage}`;
}

// Unified sorting function based on selected type and order
function applySorting() {
  const sortType = document.getElementById('sort-type').value;
  const sortOrder = document.getElementById('sort-order').value;

  currentItems.sort((a, b) => {
    let comparison = 0;
    if (sortType === 'releaseDate') {
      comparison = a.releaseDate - b.releaseDate;
    } else if (sortType === 'rating') {
      comparison = a.rating - b.rating;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  currentPage = 1;
  renderItems();
}

// Event listeners for the sorting dropdowns
document.getElementById('sort-type').addEventListener('change', applySorting);
document.getElementById('sort-order').addEventListener('change', applySorting);

// Filtering by Mood
document.getElementById('filter-mood').addEventListener('change', (e) => {
  const selectedMood = e.target.value;
  if (selectedMood === 'all') {
    currentItems = [...musicItems];
  } else {
    currentItems = musicItems.filter(item => item.mood.includes(selectedMood));
  }
  applySorting(); // Apply sorting on the filtered results
});

// Add new item functionality
document.getElementById('add-item-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('item-name').value;
  const releaseDate = parseInt(document.getElementById('item-release').value, 10);
  const rating = parseFloat(document.getElementById('item-rating').value);
  const moodInput = document.getElementById('item-mood').value;
  const mood = moodInput.split(',').map(s => s.trim());
  const image = document.getElementById('item-image').value;
  const alt = document.getElementById('item-alt').value;

  const newItem = { name, releaseDate, rating, mood, image, alt };

  musicItems.push(newItem);
  currentItems = [...musicItems];
  e.target.reset();
  applySorting();
});

// Initial render on page load
renderItems();
applySorting();
